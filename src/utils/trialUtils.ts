export const TRIAL_DAYS = 7;

export function calculateTrialStatus(createdAt: Date): {
  isInTrial: boolean;
  trialDaysRemaining: number;
} {
  const elapsed = new Date().getTime() - createdAt.getTime();
  const elapsedDays = elapsed / (24 * 60 * 60 * 1000);
  const isInTrial = elapsedDays < TRIAL_DAYS;
  return {
    isInTrial,
    trialDaysRemaining: isInTrial ? Math.ceil(TRIAL_DAYS - elapsedDays) : 0,
  };
}
