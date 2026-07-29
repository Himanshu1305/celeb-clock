import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RAZORPAY_KEY_ID     = Deno.env.get('RAZORPAY_KEY_ID') ?? ''
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? ''

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

    // ── Step 8: confirmation emails (Bug 5) — one to the user, one internal ────
    // Both non-fatal: an email failure must never undo a successful deletion.
    if (userEmail) {
      const baseUrl = Deno.env.get('SITE_URL') || 'https://bornclock.com'
      try {
        await fetch(`${baseUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'account_deleted', to: userEmail, name: userName }),
        })
      } catch (e) {
        console.error('User deletion confirmation email error', e)
      }
      try {
        await fetch(`${baseUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'data_deletion_request',
            to: 'hello@bornclock.com',
            name: 'BornClock',
            userEmail,
            userId,
            requestedAt: new Date().toISOString(),
          }),
        })
      } catch (e) {
        console.error('Internal deletion record email error', e)
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: corsHeaders })
  }
})
