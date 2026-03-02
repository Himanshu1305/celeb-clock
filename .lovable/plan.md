

## Send Email Templates for Review

To send emails, we need a transactional email service. The project doesn't have one configured yet.

### Options

We need an email-sending service connected to the project. The simplest option is **Resend** — it has a generous free tier (100 emails/day) and a simple API.

### What I'll Build

1. **Connect Resend** — You'll need to provide a Resend API key (free at [resend.com](https://resend.com))
2. **Create an edge function** `send-email` that accepts a template name, recipient, and first name, renders the appropriate template, and sends it via Resend
3. **Trigger it** to send all 4 templates to `himanshu1305@gmail.com`

### Prerequisites from You

Before I can implement this, I need:
- A **Resend API key** (sign up free at resend.com → API Keys → Create)
- Note: On Resend's free tier, you can only send to your own verified email or from `onboarding@resend.dev` domain. To send from a custom domain you'd need to verify it in Resend.

### Files

| File | Change |
|------|--------|
| `supabase/functions/send-email/index.ts` | New edge function that renders + sends email via Resend |

Once you provide the Resend API key, I'll create the function, deploy it, and send all 4 templates immediately.

