// ES module — run with:
// RESEND_API_KEY=your_key node scripts/send-test-emails.mjs

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TEST_EMAIL = 'himanshu1305@gmail.com';
const TEST_NAME = 'Himanshu';
const LOGO_URL = 'https://bornclock.com/bornclock-logo.png';
const BASE_URL = 'https://bornclock.com';
const FROM = 'BornClock <hello@bornclock.com>';

if (!RESEND_API_KEY) {
  console.error(
    '❌ RESEND_API_KEY not set.\n' +
    'Run: RESEND_API_KEY=re_xxx node scripts/send-test-emails.mjs'
  );
  process.exit(1);
}

async function sendEmail(subject, html, label) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [TEST_EMAIL],
        subject: `[TEST] ${subject}`,
        html,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`✅ ${label} — sent (id: ${data.id})`);
    } else {
      console.log(`❌ ${label} — failed:`, data);
    }
  } catch (err) {
    console.log(`❌ ${label} — error:`, err.message);
  }
  await new Promise(r => setTimeout(r, 500));
}

function wrap(content) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

  <tr><td align="center" style="padding-bottom:24px;">
    <a href="${BASE_URL}" style="text-decoration:none;">
      <img src="${LOGO_URL}" alt="BornClock" height="56"
        style="height:56px;width:auto;display:block;margin:0 auto;border:0;" />
    </a>
  </td></tr>

  <tr><td style="background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;padding:40px 36px;">
    ${content}
  </td></tr>

  <tr><td style="padding:24px 0 8px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.8;">
      <strong style="color:#6b7280;">BornClock</strong> · Know your time. Live it well.<br>
      <a href="${BASE_URL}/privacy" style="color:#9ca3af;text-decoration:none;">Privacy Policy</a> ·
      <a href="${BASE_URL}/contact" style="color:#9ca3af;text-decoration:none;">Contact</a> ·
      <a href="${BASE_URL}" style="color:#9ca3af;text-decoration:none;">Unsubscribe</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function btn(text, url) {
  return `
<div style="text-align:center;margin:28px 0;">
  <a href="${url}"
    style="display:inline-block;background:#4F46E5;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.01em;">
    ${text}
  </a>
</div>`;
}

function feature(emoji, text) {
  return `
<tr>
  <td style="padding:7px 0;font-size:14px;color:#374151;">
    <span style="font-size:17px;margin-right:10px;">${emoji}</span>
    ${text}
  </td>
</tr>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0;">`;
}

// EMAIL 1 — WELCOME
await sendEmail(
  'Welcome to BornClock 🎂',
  wrap(`
<h1 style="margin:0 0 6px;font-size:26px;font-weight:700;color:#111827;letter-spacing:-0.02em;">
  Welcome to BornClock 🎂
</h1>
<p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
  Your birthday intelligence platform is ready.
</p>

<p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.75;">
  Hi ${TEST_NAME} — we're genuinely delighted you're here. BornClock exists to help you
  understand your time: where you've been, how you're aging biologically, and what
  science says about how long and how well you might live. It all starts with your
  date of birth.
</p>

<p style="margin:0 0 14px;font-size:15px;font-weight:600;color:#111827;">
  Your 7-day premium trial is active. Start here:
</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0">
  ${feature('🔬', '<strong>Life Expectancy Calculator</strong> — your personalized longevity forecast')}
  ${feature('🧬', '<strong>Biological Age Test</strong> — 12 WHO-validated biomarkers')}
  ${feature('🤖', '<strong>AI Longevity Coach</strong> — personalized science-backed advice')}
  ${feature('🪐', '<strong>Planetary Age</strong> — how old you are on every planet')}
  ${feature('🌟', '<strong>Celebrity Birthday Twins</strong> — who shares your birthday')}
</table>

${btn('Start with Life Expectancy →', BASE_URL + '/life-expectancy')}

${divider()}

<p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.6;">
  No credit card required during your trial.<br>
  Questions? Reply to this email — we read every one.
</p>
`),
  'EMAIL 1: Welcome'
);

// EMAIL 2 — TRIAL EXPIRY
await sendEmail(
  'Your BornClock trial ends tomorrow ⏰',
  wrap(`
<div style="background:#fef9ec;border:1px solid #fcd34d;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
  <p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">
    ⏰ Your free trial ends in 24 hours
  </p>
</div>

<h1 style="margin:0 0 8px;font-size:23px;font-weight:700;color:#111827;letter-spacing:-0.02em;">
  Keep your premium access, ${TEST_NAME}
</h1>

<p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.75;">
  You've had 7 days to explore BornClock premium.
  Tomorrow, these features will require a subscription:
</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0">
  ${feature('🔬', 'What-If Simulator — adjust 25+ lifestyle factors')}
  ${feature('🤖', 'AI Longevity Coach — unlimited conversations')}
  ${feature('👨‍👩‍👧', 'Family Dashboard — track 10 family members')}
  ${feature('📄', 'Birthday Reports — 3 premium reports/month')}
  ${feature('🌍', 'Country Comparison — 57 countries')}
</table>

${divider()}

<div style="background:#f9fafb;border-radius:10px;padding:18px 20px;margin-bottom:8px;">
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Premium subscription from</p>
  <p style="margin:0;font-size:26px;font-weight:700;color:#4F46E5;letter-spacing:-0.02em;">
    ₹299<span style="font-size:15px;font-weight:400;color:#9ca3af;">/month</span>
  </p>
  <p style="margin:6px 0 0;font-size:13px;color:#6b7280;">
    or ₹2,499/year — save ₹1,089 · 7-day money-back guarantee
  </p>
</div>

${btn('Keep My Premium Access →', BASE_URL + '/upgrade')}
`),
  'EMAIL 2: Trial Expiry'
);

// EMAIL 3 — PAYMENT CONFIRMATION
await sendEmail(
  "You're officially premium, Himanshu 🎉",
  wrap(`
<div style="text-align:center;margin-bottom:28px;">
  <div style="font-size:52px;margin-bottom:12px;line-height:1;">🎉</div>
  <h1 style="margin:0;font-size:26px;font-weight:700;color:#111827;letter-spacing:-0.02em;">
    You're Premium, ${TEST_NAME}!
  </h1>
  <p style="margin:8px 0 0;font-size:15px;color:#6b7280;">Your premium access is now active.</p>
</div>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="font-size:13px;color:#6b7280;padding:5px 0;">Plan</td>
      <td style="font-size:14px;color:#111827;font-weight:600;text-align:right;padding:5px 0;">BornClock Premium Monthly</td>
    </tr>
    <tr>
      <td style="font-size:13px;color:#6b7280;padding:5px 0;">Amount charged</td>
      <td style="font-size:14px;color:#111827;font-weight:600;text-align:right;padding:5px 0;">₹299</td>
    </tr>
    <tr>
      <td style="font-size:13px;color:#6b7280;padding:5px 0;">Next billing date</td>
      <td style="font-size:14px;color:#111827;font-weight:600;text-align:right;padding:5px 0;">July 16, 2026</td>
    </tr>
  </table>
</div>

<p style="margin:0 0 14px;font-size:15px;font-weight:600;color:#111827;">Explore your premium features:</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0">
  ${feature('🔬', '<strong>What-If Simulator</strong> — see which habits add the most years')}
  ${feature('🤖', '<strong>AI Longevity Coach</strong> — ask anything about your data')}
  ${feature('🧬', '<strong>Biological Blueprint</strong> — your complete 3-pillar report')}
  ${feature('📄', '<strong>Birthday Reports</strong> — generate gifts for friends and family')}
  ${feature('👨‍👩‍👧', '<strong>Family Dashboard</strong> — compare forecasts with loved ones')}
</table>

${btn('Start Exploring Premium →', BASE_URL + '/life-expectancy')}

${divider()}

<p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.6;">
  7-day money-back guarantee · Cancel anytime<br>
  Questions? hello@bornclock.com
</p>
`),
  'EMAIL 3: Payment Confirmation'
);

// EMAIL 4 — CANCELLATION
await sendEmail(
  'Your BornClock subscription has been cancelled',
  wrap(`
<h1 style="margin:0 0 8px;font-size:23px;font-weight:700;color:#111827;letter-spacing:-0.02em;">
  Subscription cancelled
</h1>
<p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
  Hi ${TEST_NAME} — your cancellation is confirmed. No further charges.
</p>

<div style="background:#f9fafb;border-radius:12px;padding:18px 22px;margin-bottom:24px;">
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Premium access continues until</p>
  <p style="margin:0;font-size:22px;font-weight:700;color:#111827;">July 16, 2026</p>
  <p style="margin:6px 0 0;font-size:13px;color:#6b7280;">After this date you'll return to the free plan.</p>
</div>

<p style="margin:0 0 14px;font-size:15px;font-weight:600;color:#111827;">You'll still have free access to:</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0">
  ${feature('🌟', 'Celebrity birthday twins')}
  ${feature('♈', 'Zodiac, birthstone and numerology')}
  ${feature('🪐', 'Planetary age calculator')}
  ${feature('📅', "Today's birthdays")}
</table>

${divider()}

<p style="margin:0 0 12px;font-size:14px;color:#6b7280;line-height:1.7;">
  Changed your mind? You can resubscribe anytime — your data is always saved.
</p>

<p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
  If there was something we could have done better, we'd genuinely love to know.
  <a href="${BASE_URL}/contact" style="color:#4F46E5;text-decoration:none;font-weight:500;">Tell us here →</a>
</p>
`),
  'EMAIL 4: Cancellation'
);

// EMAIL 5 — FREE USER NUDGE
await sendEmail(
  'Did you know your biological age might surprise you?',
  wrap(`
<h1 style="margin:0 0 8px;font-size:23px;font-weight:700;color:#111827;letter-spacing:-0.02em;">
  Your biological age might not be what you think
</h1>

<p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.75;">
  Hi ${TEST_NAME} — most people assume their biological age matches their birthday.
  Research shows they can differ by 10+ years in either direction. Your lifestyle choices
  right now are actively moving this number — for better or worse.
</p>

<div style="background:#eff6ff;border-left:4px solid #4F46E5;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:24px;">
  <p style="margin:0;font-size:14px;color:#1e40af;line-height:1.65;">
    🔬 <strong>Research finding:</strong>
    A 2024 study in Nature Communications showed biological age can be reduced
    by 2.5 years in just 3 months through targeted dietary intervention —
    independent of weight loss.
    <br><em style="font-size:12px;color:#3b82f6;">[Longo et al., Nature Communications, 2024]</em>
  </p>
</div>

<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#111827;">Biological Age Test on BornClock:</p>
<p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
  12 WHO-validated biomarkers. Takes 3 minutes. Free to use. Shows your result across
  5 categories: exceptional, younger, aligned, older, significantly older.
</p>

${btn('Test My Biological Age →', BASE_URL + '/biological-age')}

${divider()}

<div style="background:#faf5ff;border-radius:10px;padding:16px 20px;">
  <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#7c3aed;">✨ Unlock the full picture with Premium</p>
  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
    What-If Simulator, AI Longevity Coach, Family Dashboard, Birthday Reports.
    From ₹299/month — 7-day money-back guarantee.
  </p>
  <a href="${BASE_URL}/upgrade"
    style="display:inline-block;margin-top:10px;font-size:13px;color:#7c3aed;font-weight:600;text-decoration:none;">
    See Premium Features →
  </a>
</div>
`),
  'EMAIL 5: Free User Nudge'
);

// EMAIL 6 — PREMIUM NUDGE
await sendEmail(
  `Your What-If Simulator is waiting, ${TEST_NAME}`,
  wrap(`
<h1 style="margin:0 0 8px;font-size:23px;font-weight:700;color:#111827;letter-spacing:-0.02em;">
  Hi ${TEST_NAME} — we miss you 👋
</h1>

<p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.75;">
  The most powerful feature on BornClock is the one most members explore last. The
  What-If Simulator lets you adjust 25+ lifestyle factors — sleep quality, diet
  pattern, exercise frequency, smoking, stress levels — and watch your longevity
  forecast update in real time.
</p>

<div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:24px;">
  <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#166534;">What members say after trying it:</p>
  <p style="margin:0;font-size:14px;color:#166534;line-height:1.65;font-style:italic;">
    "I had no idea sleep was worth that many years. Seeing the number change in real
    time made it feel real for the first time."
  </p>
</div>

<p style="margin:0 0 8px;font-size:14px;color:#6b7280;line-height:1.6;">
  Try adjusting just one factor — sleep from 6 hours to 8 hours — and see what happens
  to your forecast. Most people are surprised by the result.
</p>

${btn('Open What-If Simulator →', BASE_URL + '/life-expectancy')}

${divider()}

<p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#111827;">Other premium features you haven't tried yet:</p>

<table width="100%" cellpadding="0" cellspacing="0" border="0">
  ${feature('🤖', '<strong>AI Longevity Coach</strong> — ask it anything about your health data')}
  ${feature('👨‍👩‍👧', '<strong>Family Dashboard</strong> — add family members and compare forecasts')}
  ${feature('📄', '<strong>Birthday Reports</strong> — generate a gift report for someone you love')}
</table>

<p style="margin:20px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
  You're a premium member — everything above is included in your plan.
</p>
`),
  'EMAIL 6: Premium Nudge'
);

console.log('\n✅ All 6 test emails sent to:', TEST_EMAIL);
console.log('Subject lines prefixed with [TEST]');
console.log('Check inbox at himanshu1305@gmail.com');
