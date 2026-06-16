import type { VercelRequest, VercelResponse } from '@vercel/node';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'BornClock <hello@bornclock.com>';
const LOGO_URL = 'https://bornclock.com/bornclock-logo.png';
const BASE_URL = 'https://bornclock.com';

// Base email template wrapper
function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BornClock</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

  <!-- Logo header -->
  <tr><td align="center" style="padding-bottom:24px;">
    <a href="${BASE_URL}">
      <img src="${LOGO_URL}" alt="BornClock" height="48"
        style="height:48px;width:auto;display:block;margin:0 auto;" />
    </a>
  </td></tr>

  <!-- Email card -->
  <tr><td style="background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;padding:40px 36px;">
    ${content}
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 0;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
      BornClock · Your Birthday Intelligence Platform<br>
      <a href="${BASE_URL}/privacy" style="color:#9ca3af;">Privacy Policy</a> ·
      <a href="${BASE_URL}/contact" style="color:#9ca3af;">Contact</a> ·
      <a href="{{unsubscribe_url}}" style="color:#9ca3af;">Unsubscribe</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// Helper: primary button
function primaryButton(text: string, url: string): string {
  return `
<a href="${url}"
  style="display:inline-block;background:#4F46E5;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;margin:24px 0;">
  ${text}
</a>`;
}

// Helper: feature list item
function featureItem(emoji: string, text: string): string {
  return `
<tr>
  <td style="padding:6px 0;">
    <span style="font-size:16px;">${emoji}</span>
    <span style="font-size:14px;color:#374151;margin-left:8px;">${text}</span>
  </td>
</tr>`;
}

// Helper: section divider
function divider(): string {
  return `<hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0;">`;
}

// ==========================================
// EMAIL 1 — WELCOME
// ==========================================
function welcomeEmail(
  name: string,
  trialDays: number = 7
): { subject: string; html: string } {
  const subjects = [
    `Welcome to BornClock, ${name} 🎂`,
    `Your birthday intelligence is ready, ${name}`,
    `${name}, your cosmic profile awaits 🌟`,
    `BornClock is ready for you, ${name}`,
  ];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];

  const html = baseTemplate(`
<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">
  Welcome to BornClock 🎂
</h1>
<p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
  Your birthday intelligence platform is ready.
</p>

<p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
  Hi ${name}, we're genuinely delighted you're here. BornClock exists to help you understand
  your time — where you've been, how you're aging, and what science says about how long and
  how well you might live. It starts with something as simple as your date of birth.
</p>

<p style="font-size:15px;font-weight:600;color:#111827;margin:0 0 12px;">
  Start exploring your ${trialDays}-day free trial:
</p>

<table width="100%" cellpadding="0" cellspacing="0">
  ${featureItem('🔬', 'Life Expectancy Calculator — your personalized forecast')}
  ${featureItem('🧬', 'Biological Age Test — 12 WHO-validated biomarkers')}
  ${featureItem('🤖', 'AI Longevity Coach — personalized science-backed advice')}
  ${featureItem('🪐', 'Planetary Age — how old you are on every planet')}
  ${featureItem('🌟', 'Celebrity Birthday Twins — who shares your birthday')}
</table>

${divider()}

<div style="text-align:center;">
  ${primaryButton('Start with Life Expectancy →', `${BASE_URL}/life-expectancy`)}
</div>

<p style="margin:16px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
  Your ${trialDays}-day premium trial is active. No credit card required yet.
</p>
`);

  return { subject, html };
}

// ==========================================
// EMAIL 2 — TRIAL DAY 6 WARNING
// ==========================================
function trialExpiryEmail(
  name: string,
  hoursLeft: number = 24
): { subject: string; html: string } {
  const subjects = [
    `Your BornClock trial ends tomorrow, ${name}`,
    `${name}, 24 hours left on your premium trial`,
    `Don't lose your longevity data, ${name}`,
    `Your premium access expires soon, ${name}`,
  ];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];

  const html = baseTemplate(`
<div style="background:#fef3c7;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
  <p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">
    ⏰ Your free trial ends in ${hoursLeft} hours
  </p>
</div>

<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
  Keep your premium access, ${name}
</h1>

<p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
  You've had 7 days to explore BornClock premium. Tomorrow, access to these features
  will end unless you upgrade:
</p>

<table width="100%" cellpadding="0" cellspacing="0">
  ${featureItem('🔬', 'What-If Simulator — 25+ lifestyle factors')}
  ${featureItem('🤖', 'AI Longevity Coach — unlimited conversations')}
  ${featureItem('👨‍👩‍👧', 'Family Dashboard — track 10 family members')}
  ${featureItem('📄', 'Birthday Reports — 3 premium reports/month')}
  ${featureItem('🌍', 'Country Comparison — 57 countries')}
</table>

${divider()}

<div style="background:#f9fafb;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Premium subscription</p>
  <p style="margin:0;font-size:22px;font-weight:700;color:#4F46E5;">₹299/month</p>
  <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">or ₹2,499/year — save ₹1,089</p>
</div>

<p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-align:center;">
  7-day money-back guarantee · Cancel anytime
</p>

<div style="text-align:center;">
  ${primaryButton('Keep My Premium Access →', `${BASE_URL}/upgrade`)}
</div>
`);

  return { subject, html };
}

// ==========================================
// EMAIL 3 — PAYMENT CONFIRMATION
// ==========================================
function paymentConfirmationEmail(
  name: string,
  plan: string,
  amount: string,
  nextBilling: string
): { subject: string; html: string } {
  const subjects = [
    `You're officially premium, ${name} 🎉`,
    `Welcome to BornClock Premium, ${name}`,
    `Payment confirmed — premium is active, ${name}`,
    `${name}, your premium journey starts now 🚀`,
  ];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];

  const html = baseTemplate(`
<div style="text-align:center;margin-bottom:28px;">
  <div style="font-size:48px;margin-bottom:8px;">🎉</div>
  <h1 style="margin:0;font-size:24px;font-weight:700;color:#111827;">
    You're Premium, ${name}!
  </h1>
</div>

<div style="background:#f0fdf4;border-radius:10px;padding:20px;margin-bottom:24px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="font-size:13px;color:#6b7280;padding:4px 0;">Plan</td>
      <td style="font-size:14px;color:#111827;font-weight:600;text-align:right;padding:4px 0;">${plan}</td>
    </tr>
    <tr>
      <td style="font-size:13px;color:#6b7280;padding:4px 0;">Amount charged</td>
      <td style="font-size:14px;color:#111827;font-weight:600;text-align:right;padding:4px 0;">${amount}</td>
    </tr>
    <tr>
      <td style="font-size:13px;color:#6b7280;padding:4px 0;">Next billing</td>
      <td style="font-size:14px;color:#111827;font-weight:600;text-align:right;padding:4px 0;">${nextBilling}</td>
    </tr>
  </table>
</div>

<p style="font-size:15px;font-weight:600;color:#111827;margin:0 0 12px;">
  Start with these premium features:
</p>

<table width="100%" cellpadding="0" cellspacing="0">
  ${featureItem('🔬', 'What-If Simulator — see exactly which habits add years')}
  ${featureItem('🤖', 'AI Longevity Coach — ask anything about your health')}
  ${featureItem('🧬', 'Biological Blueprint — your complete 3-pillar report')}
  ${featureItem('📄', 'Birthday Reports — generate gifts for friends and family')}
</table>

${divider()}

<div style="text-align:center;">
  ${primaryButton('Explore Premium Now →', `${BASE_URL}/life-expectancy`)}
</div>

<p style="margin:16px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
  Questions? Reply to this email or contact hello@bornclock.com
</p>
`);

  return { subject, html };
}

// ==========================================
// EMAIL 4 — SUBSCRIPTION CANCELLED
// ==========================================
function cancellationEmail(
  name: string,
  accessUntil: string
): { subject: string; html: string } {
  const subjects = [
    `Your BornClock premium has been cancelled`,
    `Cancellation confirmed, ${name}`,
    `We've cancelled your BornClock subscription`,
    `Your premium access ends on ${accessUntil}`,
  ];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];

  const html = baseTemplate(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
  Subscription cancelled
</h1>
<p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
  Hi ${name}, your cancellation is confirmed.
</p>

<div style="background:#f9fafb;border-radius:10px;padding:20px;margin-bottom:24px;">
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Premium access continues until</p>
  <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">${accessUntil}</p>
</div>

<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
  After that, you'll return to the free plan. You'll keep access to:
</p>

<table width="100%" cellpadding="0" cellspacing="0">
  ${featureItem('🌟', 'Celebrity birthday twins')}
  ${featureItem('♈', 'Zodiac, birthstone and numerology')}
  ${featureItem('🪐', 'Planetary age calculator')}
  ${featureItem('📅', "Today's birthdays")}
</table>

${divider()}

<p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.7;">
  Changed your mind? You can resubscribe anytime from your profile — your data is always saved.
</p>

<p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
  If there was something we could have done better, we'd genuinely love to know.
  <a href="${BASE_URL}/contact" style="color:#4F46E5;">Tell us here →</a>
</p>
`);

  return { subject, html };
}

// ==========================================
// EMAIL 5 — WEEKLY NUDGE: FREE USERS
// ==========================================
function freeUserNudgeEmail(
  name: string,
  week: number,
  zodiacSign?: string,
  lifePathNumber?: number
): { subject: string; html: string } {
  const variants = [
    {
      subject: `Did you know your biological age might surprise you, ${name}?`,
      hook: `Most people assume their biological age matches their birthday. Research shows they can differ by 10+ years — in either direction. Your lifestyle choices right now are actively moving this number.`,
      feature: 'Biological Age Test',
      featureDesc: 'Take 12 questions. See how your body is actually aging compared to your calendar age.',
      cta: 'Test My Biological Age →',
      ctaUrl: `${BASE_URL}/biological-age`,
      fact: '🔬 A 2024 Nature Communications study showed biological age can be reduced by 2.5 years in just 3 months through targeted dietary changes.',
    },
    {
      subject: `${name}, how old are you on Mars? (Probably younger than you think)`,
      hook: `A year is just how long it takes your planet to orbit the Sun. On Mars, a year is 687 Earth days — so a 30-year-old on Earth is only 15.9 on Mars. On Mercury, that same person is 124 years old.`,
      feature: 'Planetary Age Calculator',
      featureDesc: 'Calculate your age across all 8 planets using real NASA orbital data. Shareable and genuinely mind-bending.',
      cta: 'Calculate My Cosmic Age →',
      ctaUrl: `${BASE_URL}/planetary-age`,
      fact: '🪐 On Neptune, no human in history has ever lived long enough to celebrate their first birthday. Neptune takes 165 Earth years to orbit the Sun.',
    },
    {
      subject: zodiacSign
        ? `Your ${zodiacSign} profile has something you haven't seen yet, ${name}`
        : `Your zodiac profile has something you haven't seen, ${name}`,
      hook: zodiacSign
        ? `BornClock's ${zodiacSign} profile goes deeper than any other zodiac resource — covering your Vedic Rashi, Chinese zodiac animal, and numerology Life Path all from the same birth date.`
        : `BornClock's zodiac profiles go deeper than any other resource — Western, Chinese, and Indian (Vedic) zodiac all from the same birth date.`,
      feature: 'Three Zodiac Systems',
      featureDesc: 'Most people only know their Western zodiac. Your Vedic Rashi and Chinese zodiac animal reveal a completely different perspective on your personality.',
      cta: 'Explore My Zodiac Profile →',
      ctaUrl: `${BASE_URL}/`,
      fact: "🔯 In Vedic astrology, most people have a different zodiac sign than in Western astrology — the two systems are shifted by ~24 degrees due to precession of Earth's axis.",
    },
    {
      subject: `A question only your birthday can answer, ${name}`,
      hook: lifePathNumber
        ? `Your Life Path ${lifePathNumber} in numerology describes your core purpose and the challenges you're here to master. 2026 is your Personal Year — and the meaning of that number changes everything about how to approach this year.`
        : `Your Life Path number in numerology describes your core purpose. And 2026 has a specific Personal Year number that shapes what this year means for you specifically.`,
      feature: 'Numerology Blueprint',
      featureDesc: 'Your Life Path number, what it means for love and career, and your Personal Year 2026 forecast.',
      cta: 'Discover My Numerology →',
      ctaUrl: `${BASE_URL}/numerology`,
      fact: '🔢 Numerology has been practiced since ancient Greece — Pythagoras believed numbers were the foundation of all reality, not just mathematics.',
    },
  ];

  const variant = variants[(week - 1) % 4];

  const html = baseTemplate(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
  ${variant.feature}
</h1>

<p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
  Hi ${name} — ${variant.hook}
</p>

<div style="background:#f0f9ff;border-left:4px solid #4F46E5;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
  <p style="margin:0;font-size:14px;color:#1e40af;line-height:1.6;">
    ${variant.fact}
  </p>
</div>

<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#111827;">
  ${variant.feature} on BornClock:
</p>
<p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
  ${variant.featureDesc}
</p>

<div style="text-align:center;">
  ${primaryButton(variant.cta, variant.ctaUrl)}
</div>

${divider()}

<div style="background:#faf5ff;border-radius:10px;padding:16px 20px;">
  <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#7c3aed;">
    ✨ Upgrade to Premium
  </p>
  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
    Unlock the What-If Simulator, AI Longevity Coach, Family Dashboard, and Birthday Reports.
    From ₹299/month.
  </p>
  <a href="${BASE_URL}/upgrade"
    style="display:inline-block;margin-top:10px;font-size:13px;color:#7c3aed;font-weight:600;text-decoration:none;">
    See Premium Features →
  </a>
</div>
`);

  return { subject: variant.subject, html };
}

// ==========================================
// EMAIL 6 — WEEKLY NUDGE: PREMIUM USERS
// ==========================================
function premiumUserNudgeEmail(
  name: string,
  week: number
): { subject: string; html: string } {
  const variants = [
    {
      subject: `Your What-If Simulator is waiting, ${name}`,
      hook: 'The most powerful feature on BornClock is the one most people explore last. The What-If Simulator lets you adjust 25+ lifestyle factors — sleep, diet, exercise, smoking, stress — and watch your longevity forecast update in real time.',
      highlight: 'Most members who try the What-If Simulator spend 20+ minutes running scenarios. The most common reaction: "I had no idea sleep was worth that many years."',
      cta: 'Open What-If Simulator →',
      ctaUrl: `${BASE_URL}/life-expectancy`,
    },
    {
      subject: `${name}, your AI Longevity Coach has been waiting`,
      hook: 'Your AI Longevity Coach knows your exact health profile, your biological age results, and your longevity forecast. It can answer specific questions about your data — not generic health advice, but advice calibrated to your numbers.',
      highlight: 'Try asking: "What is the single highest-impact change I can make based on my biological age results?" or "How does my country affect my forecast compared to Japan?"',
      cta: 'Chat with My Coach →',
      ctaUrl: `${BASE_URL}/life-expectancy`,
    },
    {
      subject: `Have you added your family yet, ${name}?`,
      hook: 'The Family Dashboard lets you add up to 10 family members and compare longevity forecasts side by side. Members who use this feature describe it as "the health conversation our family needed to have."',
      highlight: 'Adding a parent or sibling takes 2 minutes. The comparison often reveals surprising differences — and opens conversations about lifestyle habits that matter.',
      cta: 'Open Family Dashboard →',
      ctaUrl: `${BASE_URL}/family`,
    },
    {
      subject: `Generate a birthday report for someone you love, ${name}`,
      hook: "Birthday Reports are included in your premium plan — 3 per month. Each report is a complete 11-section birthday intelligence profile: celebrity twins, three zodiac systems, numerology, planetary ages, and a 2026 personal year forecast.",
      highlight: "Members describe Birthday Reports as \"the most personal gift I've ever given.\" Share as a link or download as PDF. Takes 30 seconds to generate.",
      cta: 'Generate a Birthday Report →',
      ctaUrl: `${BASE_URL}/birthday-report`,
    },
  ];

  const variant = variants[(week - 1) % 4];

  const html = baseTemplate(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
  Hi ${name} — we miss you 👋
</h1>

<p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
  ${variant.hook}
</p>

<div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
  <p style="margin:0;font-size:14px;color:#166534;line-height:1.6;font-style:italic;">
    "${variant.highlight}"
  </p>
</div>

<div style="text-align:center;">
  ${primaryButton(variant.cta, variant.ctaUrl)}
</div>

${divider()}

<p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.6;">
  You're a premium member — all features are waiting for you at bornclock.com
</p>
`);

  return { subject: variant.subject, html };
}

// ==========================================
// MAIN HANDLER
// ==========================================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const {
    type,
    to,
    name,
    trialDays,
    hoursLeft,
    plan,
    amount,
    nextBilling,
    accessUntil,
    week,
    zodiacSign,
    lifePathNumber,
  } = req.body;

  if (!type || !to || !name) {
    return res.status(400).json({ error: 'Missing required fields: type, to, name' });
  }

  let emailContent: { subject: string; html: string } | null = null;

  switch (type) {
    case 'welcome':
      emailContent = welcomeEmail(name, trialDays);
      break;
    case 'trial_expiry':
      emailContent = trialExpiryEmail(name, hoursLeft);
      break;
    case 'payment_confirmation':
      emailContent = paymentConfirmationEmail(name, plan, amount, nextBilling);
      break;
    case 'cancellation':
      emailContent = cancellationEmail(name, accessUntil);
      break;
    case 'nudge_free':
      emailContent = freeUserNudgeEmail(name, week || 1, zodiacSign, lifePathNumber);
      break;
    case 'nudge_premium':
      emailContent = premiumUserNudgeEmail(name, week || 1);
      break;
    default:
      return res.status(400).json({ error: `Unknown email type: ${type}` });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email', details: error });
    }

    const result = await response.json();
    return res.status(200).json({ success: true, id: result.id });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
