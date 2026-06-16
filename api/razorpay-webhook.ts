import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const signature = req.headers['x-razorpay-signature'] as string;
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const event = req.body;
  const eventType = event.event;

  try {
    switch (eventType) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const subscription = event.payload.subscription.entity;
        const payment = event.payload.payment?.entity;
        const email = payment?.email || subscription?.notes?.email;

        if (!email) break;

        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const user = usersData?.users?.find((u: any) => u.email === email);
        if (!user) break;

        const endDate = subscription.current_end
          ? new Date(subscription.current_end * 1000)
          : null;

        await supabaseAdmin
          .from('profiles')
          .update({
            premium_status: true,
            subscription_id: subscription.id,
            subscription_plan: subscription.plan_id,
            subscription_status: 'active',
            premium_until: endDate?.toISOString() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.completed':
      case 'subscription.expired': {
        const subscription = event.payload.subscription.entity;

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('subscription_id', subscription.id)
          .single();

        if (profile) {
          await supabaseAdmin
            .from('profiles')
            .update({
              premium_status: false,
              subscription_status: eventType.split('.')[1],
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);

          if (eventType === 'subscription.cancelled') {
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(profile.id);
            if (userData?.user?.email) {
              const accessUntil = subscription.current_end
                ? new Date(subscription.current_end * 1000).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'end of billing period';
              const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
                ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
                : `https://${process.env.VERCEL_URL || 'bornclock.com'}`;
              await fetch(`${baseUrl}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'cancellation',
                  to: userData.user.email,
                  name: userData.user.user_metadata?.first_name || 'there',
                  accessUntil,
                }),
              });
            }
          }
        }
        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        console.log('Payment failed:', {
          email: payment.email,
          amount: payment.amount,
          error: payment.error_description,
        });
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(200).json({ received: true });
  }
}
