import { createClient } from '@supabase/supabase-js';
import { sendEmailDirect } from './_email.js';
import { verifyHmacSha256 } from './_crypto.js';

// Web API handler — no Vercel bodyParser config needed; raw Request is passed as-is.

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function sendEmail(payload: Record<string, unknown>) {
  try {
    await sendEmailDirect(payload);
  } catch (e) {
    console.error('[webhook] send-email error', e);
  }
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[webhook] RAZORPAY_WEBHOOK_SECRET not configured');
    return json({ error: 'Webhook not configured' }, 500);
  }

  // Read raw body ONCE — ArrayBuffer is plain memory; safe to use for both
  // HMAC verification and JSON parsing without consuming a stream twice.
  const rawBody = await request.arrayBuffer();
  const signature = request.headers.get('x-razorpay-signature') ?? '';

  const valid = await verifyHmacSha256(webhookSecret, rawBody, signature);
  if (!valid) {
    console.error('[webhook] INVALID SIGNATURE — possible replay or misconfigured secret');
    return json({ error: 'Invalid signature' }, 403);
  }

  let event: any;
  try {
    event = JSON.parse(new TextDecoder().decode(rawBody));
  } catch {
    return json({ error: 'Malformed JSON body' }, 400);
  }

  const eventId: string = event.id;
  const eventType: string = event.event;

  if (!eventId) {
    console.error('[webhook] event missing .id field');
    return json({ error: 'Missing event id' }, 400);
  }

  const db = serviceClient();

  // ── Idempotency: record this event; skip if already processed ───────────────
  const { error: insertErr } = await db.from('webhook_events').insert({
    event_id: eventId,
    event_type: eventType,
    payload: event,
  });

  if (insertErr) {
    if (insertErr.code === '23505') {
      // Already processed — return 200 so Razorpay stops retrying
      console.log('[webhook] duplicate event ignored', eventId);
      return json({ received: true, duplicate: true });
    }
    console.error('[webhook] failed to record event', insertErr);
    // Proceed anyway — better to process twice than drop
  }

  try {
    switch (eventType) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const subscription = event.payload?.subscription?.entity;
        const payment = event.payload?.payment?.entity;
        if (!subscription) break;

        // Prefer userId from notes (set at checkout); fall back to email scan
        const notesUserId: string | undefined = subscription.notes?.userId || payment?.notes?.userId;
        let userId: string | undefined;

        if (notesUserId) {
          userId = notesUserId;
        } else {
          const email = payment?.email || subscription?.notes?.email;
          if (email) {
            const { data: usersData } = await db.auth.admin.listUsers();
            userId = usersData?.users?.find((u: any) => u.email === email)?.id;
          }
        }

        if (!userId) {
          console.error('[webhook] could not resolve user for', eventType, subscription.id);
          break;
        }

        const endDate = subscription.current_end
          ? new Date(subscription.current_end * 1000)
          : null;

        await db.from('profiles').update({
          premium_status: true,
          subscription_id: subscription.id,
          subscription_plan: subscription.plan_id,
          subscription_status: 'active',
          premium_until: endDate?.toISOString() ?? null,
          updated_at: new Date().toISOString(),
        }).eq('id', userId);

        // Record payment row (amount in paise → store as-is)
        if (payment?.id) {
          await db.from('payments').upsert({
            user_id: userId,
            razorpay_payment_id: payment.id,
            razorpay_subscription_id: subscription.id,
            amount: payment.amount ?? 0,
            currency: payment.currency ?? 'INR',
            status: payment.status ?? 'captured',
            product: 'subscription',
          }, { onConflict: 'razorpay_payment_id', ignoreDuplicates: true });
        }

        // Send premium-activated email on first activation
        if (eventType === 'subscription.activated') {
          const { data: userData } = await db.auth.admin.getUserById(userId);
          const email = userData?.user?.email;
          const name = userData?.user?.user_metadata?.full_name || 'there';
          if (email) {
            await sendEmail({ type: 'premium_activated', to: email, name });
          }
        }
        break;
      }

      case 'subscription.cancelled': {
        // User cancelled voluntarily — they have paid through current_end.
        // Keep premium_status=true so access continues; premium_until marks the expiry.
        // The client derives isPremium=false once premium_until passes (useAuth.ts).
        const subscription = event.payload?.subscription?.entity;
        if (!subscription) break;

        const { data: profile } = await db
          .from('profiles')
          .select('id')
          .eq('subscription_id', subscription.id)
          .single();

        if (!profile) {
          console.warn('[webhook] no profile for subscription_id', subscription.id);
          break;
        }

        const endDate = subscription.current_end
          ? new Date(subscription.current_end * 1000)
          : null;

        await db.from('profiles').update({
          premium_status: true,
          subscription_status: 'cancelled',
          premium_until: endDate?.toISOString() ?? null,
          updated_at: new Date().toISOString(),
        }).eq('id', profile.id);

        const { data: userData } = await db.auth.admin.getUserById(profile.id);
        const email = userData?.user?.email;
        if (email) {
          const accessUntil = endDate
            ? endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
            : 'end of billing period';
          const name = userData?.user?.user_metadata?.first_name || 'there';
          await sendEmail({ type: 'cancellation', to: email, name, accessUntil });
        }
        break;
      }

      // subscription.halted: payment failed — revoke immediately, no grace period.
      // No cancellation email: the template is for voluntary cancellation (shows an
      // access-until date); halted users get Razorpay's own payment failure notification.
      case 'subscription.completed':
      case 'subscription.expired':
      case 'subscription.halted':
      case 'subscription.paused': {
        const subscription = event.payload?.subscription?.entity;
        if (!subscription) break;

        const newStatus = eventType.split('.')[1]; // 'completed'|'expired'|'halted'|'paused'

        const { data: profile } = await db
          .from('profiles')
          .select('id')
          .eq('subscription_id', subscription.id)
          .single();

        if (!profile) {
          console.warn('[webhook] no profile for subscription_id', subscription.id);
          break;
        }

        await db.from('profiles').update({
          premium_status: false,
          subscription_status: newStatus,
          updated_at: new Date().toISOString(),
        }).eq('id', profile.id);
        break;
      }

      case 'payment.failed': {
        const payment = event.payload?.payment?.entity;
        console.log('[webhook] payment.failed', {
          email: payment?.email,
          amount: payment?.amount,
          error: payment?.error_description,
        });
        break;
      }

      default:
        console.log('[webhook] unhandled event type', eventType);
    }

    return json({ received: true });
  } catch (err) {
    console.error('[webhook] processing error', err);
    // Always 200 — Razorpay retries on non-2xx which could cause duplicate processing
    return json({ received: true });
  }
}

// export const POST triggers @vercel/node's Web API handler path (raw Request/Response).
export const POST = handler;
