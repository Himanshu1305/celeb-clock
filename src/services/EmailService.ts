const EMAIL_API = '/api/send-email';

async function sendEmail(payload: object): Promise<boolean> {
  try {
    const res = await fetch(EMAIL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const EmailService = {
  sendWelcome: (to: string, name: string, trialDays = 7) =>
    sendEmail({ type: 'welcome', to, name, trialDays }),

  sendTrialExpiry: (to: string, name: string, hoursLeft = 24) =>
    sendEmail({ type: 'trial_expiry', to, name, hoursLeft }),

  sendPaymentConfirmation: (
    to: string,
    name: string,
    plan: string,
    amount: string,
    nextBilling: string
  ) =>
    sendEmail({ type: 'payment_confirmation', to, name, plan, amount, nextBilling }),

  sendCancellation: (to: string, name: string, accessUntil: string) =>
    sendEmail({ type: 'cancellation', to, name, accessUntil }),

  sendFreeNudge: (
    to: string,
    name: string,
    week: number,
    zodiacSign?: string,
    lifePathNumber?: number
  ) =>
    sendEmail({ type: 'nudge_free', to, name, week, zodiacSign, lifePathNumber }),

  sendPremiumNudge: (to: string, name: string, week: number) =>
    sendEmail({ type: 'nudge_premium', to, name, week }),

  sendReportCreated: (to: string, name: string, recipientName: string, reportLink: string) =>
    sendEmail({ type: 'report_created', to, name, recipientName, reportLink }),
};
