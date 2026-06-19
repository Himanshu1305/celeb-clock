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
    <a href="${BASE_URL}" style="text-decoration:none;">
      <img src="${LOGO_URL}" alt="BornClock" height="48" width="180"
        style="height:48px;width:180px;display:block;margin:0 auto;border:0;outline:none;"
        border="0" />
    </a>
  </td></tr>

  <!-- Email card -->
  <tr><td style="background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;padding:40px 36px;">
    ${content}
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:24px 0;text-align:center;">
    <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;font-style:italic;">
      Know your time. Live it well.
    </p>
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
    `${name}, your birthday just revealed something`,
    `Your clock is ticking, ${name} — in the best way`,
    `BornClock is live for you, ${name} 🌟`,
  ];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];

  const html = baseTemplate(`
<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">
  You're in, ${name}. 🎂
</h1>
<p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
  Most people live their whole life without knowing this stuff.
</p>

<p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
  BornClock turns your date of birth into something you've never seen before — your real biological age, how long you're likely to live, what you could change to add years, and which celebrity shares your exact birthday. It starts with one number. It tells you a lot.
</p>

<p style="font-size:15px;font-weight:600;color:#111827;margin:0 0 12px;">
  Your ${trialDays}-day premium trial is live. Start here:
</p>

<table width="100%" cellpadding="0" cellspacing="0">
  ${featureItem('🔬', '<strong>Life Expectancy Calculator</strong> — your personalized forecast in 8 steps')}
  ${featureItem('🧬', '<strong>Biological Age Test</strong> — are you aging faster or slower than your birthday says?')}
  ${featureItem('🤖', '<strong>AI Longevity Coach</strong> — ask it anything. It knows your data.')}
  ${featureItem('🪐', '<strong>Planetary Age</strong> — you\'re only 15 on Mars. Probably.')}
  ${featureItem('🌟', '<strong>Celebrity Birthday Twins</strong> — who shares your exact birthday?')}
</table>

${divider()}

<div style="background:#faf5ff;border-radius:10px;padding:16px 20px;margin-bottom:8px;">
  <p style="margin:0;font-size:13px;color:#7c3aed;line-height:1.6;">
    💡 <strong>Start with the Life Expectancy Calculator.</strong> It takes 3 minutes and the result will surprise you.
  </p>
</div>

<div style="text-align:center;">
  ${primaryButton('Start My Life Expectancy →', `${BASE_URL}/life-expectancy`)}
</div>

<p style="margin:16px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
  ${trialDays}-day premium trial · No credit card needed yet · Cancel anytime
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
    `${name}, your premium trial ends in ${hoursLeft} hours`,
    `Last call: your BornClock access expires tomorrow`,
    `Don't lose this, ${name} — ${hoursLeft} hours left`,
    `Your longevity data deserves to stay premium, ${name}`,
  ];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];

  const html = baseTemplate(`
<div style="background:#fef3c7;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
  <p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">
    ⏰ ${hoursLeft} hours left on your premium trial
  </p>
</div>

<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">
  You've seen what's possible, ${name}.<br>Don't go back to guessing.
</h1>

<p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
  Tomorrow your trial ends. The What-If Simulator, AI Coach, Family Dashboard, and Birthday Reports will lock. Everything you've explored — gone back to free tier.
</p>

<p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#111827;">What you'd be giving up:</p>

<table width="100%" cellpadding="0" cellspacing="0">
  ${featureItem('🔬', '<strong>What-If Simulator</strong> — 25+ lifestyle factors, real-time forecast changes')}
  ${featureItem('🤖', '<strong>AI Longevity Coach</strong> — personalised to your exact numbers')}
  ${featureItem('👨‍👩‍👧', '<strong>Family Dashboard</strong> — track 10 family members\' forecasts')}
  ${featureItem('📄', '<strong>Birthday Reports</strong> — 11-section intelligence profile to gift anyone')}
  ${featureItem('🌍', '<strong>Country Comparison</strong> — how your forecast stacks up across 57 countries')}
</table>

${divider()}

<div style="background:#f9fafb;border-radius:10px;padding:20px;margin-bottom:16px;text-align:center;">
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Keep everything from</p>
  <p style="margin:0;font-size:28px;font-weight:700;color:#4F46E5;">₹299<span style="font-size:16px;font-weight:400;color:#6b7280;">/month</span></p>
  <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">or ₹2,499/year — that's ₹1,089 saved</p>
</div>

<div style="text-align:center;">
  ${primaryButton('Keep My Premium Access →', `${BASE_URL}/upgrade`)}
</div>

<p style="margin:8px 0 0;font-size:12px;color:#9ca3af;text-align:center;">
  7-day money-back guarantee · Cancel anytime · No questions asked
</p>
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
    `You're in, ${name}. Premium is live. 🎉`,
    `Payment confirmed — welcome to the inner circle, ${name}`,
    `${name}, your longevity journey just levelled up 🚀`,
    `Premium activated, ${name} — let's get to work`,
  ];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];

  const html = baseTemplate(`
<div style="text-align:center;margin-bottom:28px;">
  <div style="font-size:52px;margin-bottom:12px;">🎉</div>
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">
    You're premium, ${name}.
  </h1>
  <p style="margin:0;font-size:15px;color:#6b7280;">
    The full picture of your health and longevity is now unlocked.
  </p>
</div>

<div style="background:#f0fdf4;border-radius:10px;padding:20px;margin-bottom:24px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="font-size:13px;color:#6b7280;padding:5px 0;">Plan</td>
      <td style="font-size:14px;color:#111827;font-weight:600;text-align:right;padding:5px 0;">${plan}</td>
    </tr>
    <tr>
      <td style="font-size:13px;color:#6b7280;padding:5px 0;">Amount charged</td>
      <td style="font-size:14px;color:#111827;font-weight:600;text-align:right;padding:5px 0;">${amount}</td>
    </tr>
    <tr>
      <td style="font-size:13px;color:#6b7280;padding:5px 0;">Next billing</td>
      <td style="font-size:14px;color:#111827;font-weight:600;text-align:right;padding:5px 0;">${nextBilling}</td>
    </tr>
  </table>
</div>

<p style="font-size:14px;font-weight:600;color:#111827;margin:0 0 12px;">
  Three things to do right now:
</p>

<table width="100%" cellpadding="0" cellspacing="0">
  ${featureItem('1️⃣', '<strong>Open the What-If Simulator</strong> — adjust your sleep by 1 hour and watch the forecast change')}
  ${featureItem('2️⃣', '<strong>Ask your AI Longevity Coach</strong> — "What\'s the single biggest change I should make?"')}
  ${featureItem('3️⃣', '<strong>Generate a Birthday Report</strong> — gift one to someone whose birthday is coming up')}
</table>

${divider()}

<div style="text-align:center;">
  ${primaryButton('Explore Premium Now →', `${BASE_URL}/life-expectancy`)}
</div>

<p style="margin:16px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
  Questions? Just reply to this email. We read every one.
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
    `Cancelled, ${name}. Here's what you still have.`,
    `Your BornClock premium ends on ${accessUntil}`,
    `We've processed your cancellation, ${name}`,
    `Subscription cancelled — and the door stays open`,
  ];
  const subject = subjects[Math.floor(Math.random() * subjects.length)];

  const html = baseTemplate(`
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
  Cancelled. No hard feelings, ${name}.
</h1>
<p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
  Your cancellation is confirmed.
</p>

<div style="background:#f9fafb;border-radius:10px;padding:20px;margin-bottom:24px;">
  <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Your premium access continues until</p>
  <p style="margin:0;font-size:20px;font-weight:700;color:#111827;">${accessUntil}</p>
  <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">Use everything until then — it's all still yours.</p>
</div>

<p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#111827;">After that, you'll keep these free features:</p>

<table width="100%" cellpadding="0" cellspacing="0">
  ${featureItem('🌟', 'Celebrity birthday twins')}
  ${featureItem('♈', 'Western, Chinese and Vedic zodiac profiles')}
  ${featureItem('🪐', 'Planetary age calculator')}
  ${featureItem('📅', "Today's birthdays")}
  ${featureItem('🔢', 'Numerology and birthstone finder')}
</table>

${divider()}

<p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.7;">
  If something didn't work, or something could have been better — we genuinely want to know. One reply to this email is enough.
</p>

<p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
  Changed your mind? <a href="${BASE_URL}/upgrade" style="color:#4F46E5;font-weight:600;">Resubscribe anytime →</a> Your data is saved. It picks up exactly where you left off.
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
      subject: `${name}, your biological age might not be what you think`,
      hook: `Most people assume their biological age matches their birthday. Science disagrees. Research shows they can differ by 10+ years — in either direction — and your choices <em>right now</em> are actively moving this number. The question is: which way?`,
      feature: 'Biological Age Test',
      featureDesc: '12 questions. WHO-validated biomarkers. See exactly how your body is aging compared to your calendar age — and what to do about it.',
      cta: 'Test My Biological Age →',
      ctaUrl: `${BASE_URL}/biological-age`,
      fact: '🔬 A 2024 Nature Communications study showed biological age can be <strong>reduced by 2.5 years in just 3 months</strong> through targeted dietary changes.',
    },
    {
      subject: `${name}, how old are you on Mars?`,
      hook: `A year is just how long your planet takes to orbit the Sun. On Mars, a year is 687 Earth days — so if you're 30 on Earth, you're only 15.9 on Mars. On Mercury, that same person is 124. Your birthday means something completely different depending on where you're standing.`,
      feature: 'Planetary Age Calculator',
      featureDesc: 'Your age on all 8 planets — calculated using real NASA orbital data. Genuinely mind-bending. Shareable as a card.',
      cta: 'Calculate My Cosmic Age →',
      ctaUrl: `${BASE_URL}/planetary-age`,
      fact: '🪐 On Neptune, <strong>no human in history has ever lived long enough to celebrate their first birthday.</strong> Neptune takes 165 Earth years to orbit the Sun.',
    },
    {
      subject: zodiacSign
        ? `Your ${zodiacSign} profile goes deeper than you've seen, ${name}`
        : `${name}, there are 3 zodiac signs hidden in your birthday`,
      hook: zodiacSign
        ? `You know you're ${zodiacSign}. But your birthday actually contains three completely different zodiac identities — Western, Vedic (Indian), and Chinese. Most people who check their Vedic Rashi for the first time are surprised: it's often a completely different sign.`
        : `Your birthday contains three completely different zodiac identities — Western, Vedic (Indian), and Chinese. Most people only know one. The other two often tell a more accurate story.`,
      feature: 'Three Zodiac Systems',
      featureDesc: 'Western sun sign, Vedic Rashi, and Chinese zodiac animal — all from the same birth date, all on one page.',
      cta: 'See All 3 of My Zodiacs →',
      ctaUrl: `${BASE_URL}/`,
      fact: "🔯 In Vedic astrology, <strong>most people have a different zodiac sign</strong> than in Western astrology — the two systems are offset by ~24 degrees due to the precession of Earth's axis.",
    },
    {
      subject: `${name}, what does 2026 mean for you personally?`,
      hook: lifePathNumber
        ? `In numerology, your Life Path ${lifePathNumber} describes the core challenge you're here to master. But 2026 also has a Personal Year number specific to your birthday — and it changes what this year means for you in love, work, and decisions. Most people find it uncomfortably accurate.`
        : `In numerology, your Life Path number describes the core challenge you're here to master. And 2026 has a specific Personal Year number tied to your exact birthday — changing what this year means for your career, relationships, and big decisions.`,
      feature: 'Numerology Blueprint',
      featureDesc: 'Your Life Path number, what it means for love and career, and your Personal Year 2026 forecast.',
      cta: 'Discover My Numerology →',
      ctaUrl: `${BASE_URL}/numerology`,
      fact: "🔢 Pythagoras believed numbers were the foundation of all reality — not just mathematics. <strong>Numerology has been practiced for over 2,500 years.</strong>",
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

<p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#111827;">Try it on BornClock:</p>
<p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
  ${variant.featureDesc}
</p>

<div style="text-align:center;">
  ${primaryButton(variant.cta, variant.ctaUrl)}
</div>

${divider()}

<div style="background:#faf5ff;border-radius:10px;padding:16px 20px;">
  <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#7c3aed;">
    ✨ Want the full picture?
  </p>
  <p style="margin:0 0 10px;font-size:13px;color:#6b7280;line-height:1.5;">
    Upgrade to Premium and unlock the What-If Simulator, AI Longevity Coach, Family Dashboard, and Birthday Reports. From ₹299/month.
  </p>
  <a href="${BASE_URL}/upgrade"
    style="display:inline-block;font-size:13px;color:#7c3aed;font-weight:600;text-decoration:none;">
    See what's included →
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
      subject: `${name}, one slider in this tool could add years to your life`,
      hook: "The What-If Simulator is the most powerful feature on BornClock — and the most underused. Move a single slider. Watch your life expectancy forecast change in real time. Sleep from 6 hours to 8 hours adds more years than most people expect. Most members spend 20+ minutes running scenarios once they start.",
      highlight: "Try this: set sleep to 8 hours, diet to Mediterranean, and stress to low. Then look at the number. That gap between where you are now and that number? That's what's on the table.",
      highlightIsQuote: false,
      cta: 'Open What-If Simulator →',
      ctaUrl: `${BASE_URL}/life-expectancy`,
    },
    {
      subject: `${name}, your AI Longevity Coach is sitting idle`,
      hook: "Your AI Longevity Coach knows your biological age results, your life expectancy forecast, and your personal health profile. It's not generic health advice — it's calibrated to your specific numbers. Most members who use it regularly say it's the feature that actually changes their daily habits.",
      highlight: 'Try asking: "What is the single highest-impact habit I can change based on my biological age?" or "How does my forecast compare to someone my age in Japan?"',
      highlightIsQuote: true,
      cta: 'Chat with My Coach →',
      ctaUrl: `${BASE_URL}/life-expectancy`,
    },
    {
      subject: `Have you compared forecasts with your family yet, ${name}?`,
      hook: "The Family Dashboard lets you add up to 10 family members and see their longevity forecasts side by side. It takes 2 minutes to add a parent or sibling. The comparison often starts a conversation — one that most families have never had.",
      highlight: "Members who add a parent often say: \"I had no idea their forecast was that different from mine. We talked about it for an hour.\"",
      highlightIsQuote: true,
      cta: 'Open Family Dashboard →',
      ctaUrl: `${BASE_URL}/family`,
    },
    {
      subject: `${name}, someone's birthday is coming up. Make it unforgettable.`,
      hook: "Birthday Reports are included in your premium plan — 3 per month. Each one is an 11-section deep dive: celebrity birthday twins, all three zodiac systems, numerology life path, planetary ages, historical events from their birth year, and a Personal Year 2026 forecast. Takes 30 seconds to generate. Shareable as a link or downloadable as PDF.",
      highlight: "The most personal gift I've ever given someone. They still bring it up months later.",
      highlightIsQuote: true,
      cta: 'Generate a Birthday Report →',
      ctaUrl: `${BASE_URL}/birthday-report`,
    },
  ];

  const variant = variants[(week - 1) % 4];

  const html = baseTemplate(`
<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">
  Hey ${name} 👋
</h1>

<p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
  ${variant.hook}
</p>

<div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
  <p style="margin:0;font-size:14px;color:#166534;line-height:1.6;${variant.highlightIsQuote ? 'font-style:italic;' : ''}">
    ${variant.highlightIsQuote ? `"${variant.highlight}"` : variant.highlight}
  </p>
</div>

<div style="text-align:center;">
  ${primaryButton(variant.cta, variant.ctaUrl)}
</div>

${divider()}

<p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.6;">
  You're a premium member — everything is waiting at <a href="${BASE_URL}" style="color:#9ca3af;">bornclock.com</a>
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
    userEmail,
    userId,
    requestedAt,
  } = req.body;

  if (!type || !to || !name) {
    return res.status(400).json({ error: 'Missing required fields: type, to, name' });
  }

  let emailContent: { subject: string; html: string } | null = null;
  let sendTo = to;

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
    case 'data_deletion_request':
      sendTo = 'privacy@bornclock.com';
      emailContent = {
        subject: `DATA DELETION REQUEST — ${userEmail}`,
        html: `
          <h2>Data Deletion Request Received</h2>
          <p><strong>User:</strong> ${userEmail}</p>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>Requested at:</strong> ${requestedAt}</p>
          <hr>
          <p><strong>Action required — complete within 30 days:</strong></p>
          <ol>
            <li>Cancel any active Razorpay subscription</li>
            <li>Delete from family_members table where user_id = ${userId}</li>
            <li>Delete from profiles table where user_id = ${userId}</li>
            <li>Delete auth user from Supabase Auth</li>
            <li>Send confirmation email to ${userEmail}</li>
          </ol>
          <p style="color:#6b7280;font-size:13px;">This request was submitted via the BornClock Profile page in compliance with DPDPA 2023 and GDPR Art. 17.</p>
        `,
      };
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
        to: [sendTo],
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
