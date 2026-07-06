import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Disable Vercel's body parser so we receive the raw bytes for HMAC verification.
// Razorpay signs the raw body; JSON.stringify(parsed body) ≠ original bytes.
export const config = { api: { bodyParser: false } };

function serviceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function baseUrl(): string {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return `https://${process.env.VERCEL_URL || 'bornclock.com'}`;
}

async function sendEmail(payload: Record<string, unknown>) {
  try {
    await fetch(`${baseUrl()}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('[webhook] send-email error', e);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[webhook] RAZORPAY_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  // ── Read raw body ───────────────────────────────────────────────────────────
  const rawBody = await readRawBody(req);
  const signature = req.headers['x-razorpay-signature'] as string;

  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (!signature || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    console.error('[webhook] INVALID SIGNATURE — possible replay or misconfigured secret');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Malformed JSON body' });
  }

  const eventId: string = event.id;
  const eventType: string = event.event;

  if (!eventId) {
    console.error('[webhook] event missing .id field');
    return res.status(400).json({ error: 'Missing event id' });
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
      return res.status(200).json({ received: true, duplicate: true });
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
          await db.from('payments').insert({
            user_id: userId,
            razorpay_payment_id: payment.id,
            razorpay_subscription_id: subscription.id,
            amount: payment.amount ?? 0,
            currency: payment.currency ?? 'INR',
            status: payment.status ?? 'captured',
            product: 'subscription',
          }).onConflict('razorpay_payment_id').ignore();
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

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[webhook] processing error', err);
    // Always 200 — Razorpay retries on non-2xx which could cause duplicate processing
    return res.status(200).json({ received: true });
  }
}
