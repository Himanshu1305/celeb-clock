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
  // userId lets the server atomically claim the send (profiles.welcomed_at), the
  // authoritative once-per-user guard that survives the two-tab confirmation race.
  sendWelcome: (to: string, name: string, trialDays = 7, userId?: string) =>
    sendEmail({ type: 'welcome', to, name, trialDays, userId }),

  sendTrialExpiry: (to: string, name: string, hoursLeft = 24) =>
    sendEmail({ type: 'trial_expiry', to, name, hoursLeft }),

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

  sendReportLocked: (to: string, name: string, recipientName: string, reportLink: string) =>
    sendEmail({ type: 'report_locked', to, name, recipientName, reportLink }),

  sendReportCreated: (to: string, name: string, recipientName: string, reportLink: string) =>
    sendEmail({ type: 'report_created', to, name, recipientName, reportLink }),
};
