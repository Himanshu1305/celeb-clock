import 'dotenv/config';
import { config } from 'dotenv';
config({ path: '.env.local', override: true });

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO = 'himanshu1305@gmail.com';
const FROM = 'BornClock <hello@bornclock.com>';
const BASE_URL = 'https://bornclock.com';
const LOGO_URL = 'https://bornclock.com/bornclock-logo.png';

if (!RESEND_API_KEY) {
  console.error('❌ ERROR: RESEND_API_KEY not found. Add it to .env.local');
  process.exit(1);
}

async function sendEmail(subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to: [TO], subject: `[TEST] ${subject}`, html }),
  });
  const data = await res.json();
  if (data.id) {
    console.log(`✅ Sent: ${subject} → ID: ${data.id}`);
  } else {
    console.error(`❌ Failed: ${subject}`, JSON.stringify(data));
  }
}

const logo = `<div style="text-align:center;padding:24px 0 16px;">
  <a href="${BASE_URL}"><img src="${LOGO_URL}" alt="BornClock" height="48" width="180" border="0" style="height:48px;width:180px;display:block;margin:0 auto;" /></a>
</div>`;

const footer = `<div style="text-align:center;padding:20px 0;font-size:12px;color:#9ca3af;">
  <em>Know your time. Live it well.</em><br>
  BornClock · <a href="${BASE_URL}/privacy" style="color:#9ca3af;">Privacy</a> · <a href="${BASE_URL}/contact" style="color:#9ca3af;">Contact</a>
</div>`;

const card = (content) => `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td>${logo}</td></tr>
<tr><td style="background:#fff;border-radius:16px;border:1px solid #e5e7eb;padding:40px 36px;">${content}</td></tr>
<tr><td>${footer}</td></tr>
</table></td></tr></table></body></html>`;

const emails = [
  {
    subject: 'Welcome to BornClock, Himanshu 🎂',
    html: card(`<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">You're in, Himanshu. 🎂</h1>
<p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">Most people live their whole life without knowing this stuff. BornClock turns your date of birth into your biological age, life expectancy forecast, and longevity roadmap.</p>
<div style="text-align:center;"><a href="${BASE_URL}/life-expectancy" style="display:inline-block;background:#4F46E5;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;margin:24px 0;">Start My Life Expectancy →</a></div>
<p style="margin:16px 0 0;font-size:13px;color:#9ca3af;text-align:center;">7-day premium trial · No credit card needed yet</p>`),
  },
  {
    subject: 'Himanshu, 24 hours left on your premium trial',
    html: card(`<div style="background:#fef3c7;border-radius:10px;padding:16px 20px;margin-bottom:24px;"><p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">⏰ 24 hours left on your premium trial</p></div>
<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">You've seen what's possible.<br>Don't go back to guessing.</h1>
<p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">Tomorrow your trial ends. The What-If Simulator, AI Coach, and Birthday Reports will lock.</p>
<div style="text-align:center;"><a href="${BASE_URL}/upgrade" style="display:inline-block;background:#4F46E5;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;margin:24px 0;">Keep My Premium Access →</a></div>`),
  },
  {
    subject: 'Payment confirmed — welcome to the inner circle, Himanshu 🎉',
    html: card(`<div style="text-align:center;margin-bottom:28px;"><div style="font-size:52px;margin-bottom:12px;">🎉</div>
<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">You're premium, Himanshu.</h1>
<p style="margin:0;font-size:15px;color:#6b7280;">The full picture of your health and longevity is now unlocked.</p></div>
<div style="background:#f0fdf4;border-radius:10px;padding:20px;margin-bottom:24px;">
<table width="100%"><tr><td style="font-size:13px;color:#6b7280;">Plan</td><td style="font-size:14px;color:#111827;font-weight:600;text-align:right;">BornClock Premium Monthly</td></tr>
<tr><td style="font-size:13px;color:#6b7280;">Amount</td><td style="font-size:14px;color:#111827;font-weight:600;text-align:right;">₹299</td></tr>
<tr><td style="font-size:13px;color:#6b7280;">Next billing</td><td style="font-size:14px;color:#111827;font-weight:600;text-align:right;">17 July 2026</td></tr></table></div>
<div style="text-align:center;"><a href="${BASE_URL}/life-expectancy" style="display:inline-block;background:#4F46E5;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">Explore Premium Now →</a></div>`),
  },
  {
    subject: "Cancelled, Himanshu. Here's what you still have.",
    html: card(`<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">Cancelled. No hard feelings, Himanshu.</h1>
<p style="margin:0 0 24px;font-size:15px;color:#6b7280;">Your cancellation is confirmed.</p>
<div style="background:#f9fafb;border-radius:10px;padding:20px;margin-bottom:24px;">
<p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Premium access continues until</p>
<p style="margin:0;font-size:20px;font-weight:700;color:#111827;">17 July 2026</p>
<p style="margin:8px 0 0;font-size:13px;color:#6b7280;">Use everything until then — it's all still yours.</p></div>
<p style="margin:0;font-size:14px;color:#6b7280;">Changed your mind? <a href="${BASE_URL}/upgrade" style="color:#4F46E5;font-weight:600;">Resubscribe anytime →</a></p>`),
  },
  {
    subject: 'Himanshu, your biological age might not be what you think',
    html: card(`<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">Biological Age Test</h1>
<p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">Most people assume their biological age matches their birthday. Science disagrees — they can differ by 10+ years in either direction. Your choices <em>right now</em> are actively moving this number. Which way?</p>
<div style="background:#f0f9ff;border-left:4px solid #4F46E5;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
<p style="margin:0;font-size:14px;color:#1e40af;line-height:1.6;">🔬 A 2024 Nature Communications study showed biological age can be <strong>reduced by 2.5 years in just 3 months</strong> through targeted dietary changes.</p></div>
<div style="text-align:center;"><a href="${BASE_URL}/biological-age" style="display:inline-block;background:#4F46E5;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">Test My Biological Age →</a></div>
<div style="background:#faf5ff;border-radius:10px;padding:16px 20px;margin-top:24px;">
<p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#7c3aed;">✨ Want the full picture?</p>
<p style="margin:0 0 10px;font-size:13px;color:#6b7280;">Upgrade to Premium from ₹299/month.</p>
<a href="${BASE_URL}/upgrade" style="font-size:13px;color:#7c3aed;font-weight:600;text-decoration:none;">See what's included →</a></div>`),
  },
  {
    subject: 'Himanshu, one slider in this tool could add years to your life',
    html: card(`<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">Hey Himanshu 👋</h1>
<p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">The What-If Simulator is the most powerful feature on BornClock — and the most underused. Move a single slider. Watch your life expectancy change in real time. Sleep from 6 to 8 hours adds more years than most people expect.</p>
<div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
<p style="margin:0;font-size:14px;color:#166534;line-height:1.6;">Try this: set sleep to 8 hours, diet to Mediterranean, stress to low. Then look at the number. That gap between where you are now and that number? That's what's on the table.</p></div>
<div style="text-align:center;"><a href="${BASE_URL}/life-expectancy" style="display:inline-block;background:#4F46E5;color:#fff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">Open What-If Simulator →</a></div>`),
  },
];

(async () => {
  console.log(`\nSending ${emails.length} test emails to ${TO}...\n`);
  for (const email of emails) {
    await sendEmail(email.subject, email.html);
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('\nDone. Check your inbox at himanshu1305@gmail.com\n');
})();
