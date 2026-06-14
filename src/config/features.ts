// Feature flags — set to true to activate features
export const FEATURES = {
  BIRTHDAY_DISCOUNT: false,  // Activate when Razorpay is live
  EMAIL_REMINDERS: false,    // Activate when email provider is set up
  CELEBRITY_BOOST: false,    // Activate when voting system is built
} as const;
