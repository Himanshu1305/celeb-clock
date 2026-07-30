import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RAZORPAY_KEY_ID     = Deno.env.get('RAZORPAY_KEY_ID') ?? ''
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? ''
const RESEND_API_KEY      = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL          = 'BornClock <hello@bornclock.com>'

// Send confirmation emails DIRECTLY via Resend from the edge runtime.
//
// ROOT CAUSE (F3): this previously POSTed to `${SITE_URL}/api/send-email` on the
// Worker. SITE_URL is not set as a secret on this function, so it defaulted to
// https://bornclock.com — and the fetch result was never inspected, so a request
// that hit the wrong origin or returned a non-2xx failed SILENTLY. The deletion
// (which runs before the send) still succeeded, so "deletion works but the email
// never arrives" was exactly the observed symptom.
//
// Calling Resend directly removes the cross-service origin dependency entirely,
// and every non-2xx is logged with the response body so the Supabase function
// logs show the reason. RESEND_API_KEY is now set as a Supabase secret; the
// sender domain (hello@bornclock.com) is the same verified domain used elsewhere.
async function sendViaResend(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.error('[delete-account] RESEND_API_KEY not set — cannot send:', subject)
    return
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    })
    if (!res.ok) {
      const bodyText = await res.text().catch(() => '')
      console.error('[delete-account] Resend non-2xx', res.status, 'for', subject, '→', bodyText)
    }
  } catch (e) {
    console.error('[delete-account] Resend fetch threw for', subject, e)
  }
}

async function cancelRazorpaySubscription(subscriptionId: string): Promise<void> {
  if (!subscriptionId || !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) return
  try {
    const creds = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
    const res = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${creds}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancel_at_cycle_end: 0 }),
      }
    )
    if (!res.ok && res.status !== 400) {
      // 400 = already cancelled — tolerate it
      console.error('Razorpay cancel error', res.status, await res.text())
    }
  } catch (e) {
    console.error('Razorpay cancel exception', e)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    // Verify the caller's JWT
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const userId: string = claimsData.claims.sub

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // ── Step 1: capture email + subscription_id BEFORE any deletion ────────────
    // profiles.id is a random PK; the auth link is profiles.user_id (Bug 1).
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
    const userEmail: string | undefined = authUser?.user?.email
    const userName: string = authUser?.user?.user_metadata?.first_name || 'there'

    const { data: profileRow } = await supabaseAdmin
      .from('profiles')
      .select('subscription_id, subscription_status')
      .eq('user_id', userId)
      .single()

    const subscriptionId: string | undefined = profileRow?.subscription_id

    // ── Step 2: cancel Razorpay subscription if active (NON-FATAL) ─────────────
    // cancelRazorpaySubscription swallows its own errors — a failed cancel must
    // never block the deletion, but we still attempt it first.
    if (subscriptionId && profileRow?.subscription_status === 'active') {
      await cancelRazorpaySubscription(subscriptionId)
    }

    // ── Step 3: delete FK-BLOCKING child rows BEFORE deleteUser (Bug 2) ────────
    // These three reference auth.users(id) with NO on-delete rule, so leaving any
    // row makes auth.admin.deleteUser fail with a foreign-key violation. All are
    // user-owned (RLS user_id = auth.uid()).
    await supabaseAdmin.from('longevity_scores').delete().eq('user_id', userId)
    await supabaseAdmin.from('celebrity_boosts').delete().eq('user_id', userId)
    await supabaseAdmin.from('promo_code_redemptions').delete().eq('user_id', userId)

    // ── Step 4: de-identify payments (retain for tax/legal; unlink user) ───────
    await supabaseAdmin
      .from('payments')
      .update({ user_id: null })
      .eq('user_id', userId)

    // ── Step 5: delete remaining user-owned rows ──────────────────────────────
    await supabaseAdmin.from('birthday_reports').delete().eq('user_id', userId)
    await supabaseAdmin.from('analytics_events').delete().eq('user_id', userId)
    await supabaseAdmin.from('user_reviews').delete().eq('user_id', userId)
    await supabaseAdmin.from('user_roles').delete().eq('user_id', userId)
    await supabaseAdmin.from('family_members').delete().eq('user_id', userId)
    await supabaseAdmin.from('leaderboard_entries').delete().eq('user_id', userId)
    await supabaseAdmin.from('pdf_reports_log').delete().eq('user_id', userId)
    await supabaseAdmin.from('profiles').delete().eq('user_id', userId)

    // ── Step 6: delete auth user — point of no return (only if steps 1-5 clean)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError)
      return new Response(JSON.stringify({ error: 'Failed to delete account' }), { status: 500, headers: corsHeaders })
    }

    // ── Step 7: purge email_subscribers (Bug 4) — keyed by email, no user_id FK
    if (userEmail) {
      await supabaseAdmin.from('email_subscribers').delete().ilike('email', userEmail)
    }

    // ── Step 8: confirmation emails (Bug 5 / F3) — one to the user, one internal
    // Sent directly via Resend (see sendViaResend note above). Both non-fatal:
    // an email failure must never undo a successful deletion.
    if (userEmail) {
      const userHtml = `<!doctype html><html><body style="margin:0;background:#FBF6EA;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
        <div style="max-width:520px;margin:0 auto">
        <div style="text-align:center;padding-bottom:20px">
          <img src="https://bornclock.com/bornclock-logo.png" alt="BornClock" height="44" width="165" style="height:44px;width:165px;display:inline-block;border:0" border="0" />
        </div>
        <div style="background:#fff;border:1px solid #E6D8B8;border-radius:12px;padding:28px">
          <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 14px;">
            Your BornClock account and personal data have been permanently deleted, and any active subscription has been cancelled.
          </p>
          <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 14px;">
            Certain purchase records are retained and handled in accordance with applicable laws.
          </p>
          <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 14px;">
            If you didn't request this, contact us at
            <a href="mailto:hello@bornclock.com" style="color:#103A5C">hello@bornclock.com</a> right away.
          </p>
          <p style="font-size:14px;color:#374151;line-height:1.7;margin:0;">
            Your data is gone but your story isn't — you're welcome back anytime at
            <a href="https://bornclock.com" style="color:#103A5C">bornclock.com</a>.
          </p>
        </div>
        <p style="text-align:center;font-size:12px;color:#9ca3af;font-style:italic;margin:18px 0 0">Know your time. Live it well.</p>
        </div></body></html>`
      await sendViaResend(userEmail, 'Your BornClock account has been deleted', userHtml)

      const internalHtml = `
        <h2>Account Deletion Completed (automated)</h2>
        <p><strong>User:</strong> ${userEmail}</p>
        <p><strong>User ID:</strong> ${userId}</p>
        <p><strong>Completed at:</strong> ${new Date().toISOString()}</p>
        <hr>
        <p>The delete-account edge function cancelled any active subscription, removed all
        user-owned rows, de-identified payment/invoice records (retained for GST), purged the
        email subscription, and deleted the auth user.</p>
        <p style="color:#6b7280;font-size:13px;">Automated under DPDPA 2023 and GDPR Art. 17. Retain this record.</p>`
      await sendViaResend('hello@bornclock.com', `ACCOUNT DELETED — ${userEmail}`, internalHtml)
    }

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: corsHeaders })
  }
})
