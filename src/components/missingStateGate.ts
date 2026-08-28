// Pure gate for MissingStateModal, kept in its own module so it can be unit-tested
// without importing the component tree (which pulls in the Supabase client and the
// browser-only globals it touches at load).
//
// The one-time GST place-of-supply prompt shows ONLY for a premium user who has no
// buyer_state_code yet. Once the code is set (persisted server-side by
// api/update-buyer-state), this returns false forever.
export function shouldShowMissingStateModal(args: {
  isPremium: boolean;
  buyerStateCode: string | null | undefined;
}): boolean {
  // Hide as soon as a real place-of-supply is on file. `.trim()` so a null,
  // empty, OR whitespace-only value all count as "missing" and still prompt —
  // any genuine non-empty code (e.g. "36") makes this false.
  const code = args.buyerStateCode?.trim();
  return args.isPremium && !code;
}

// Whether the modal should currently be OPEN: the gate says it should show AND the
// user hasn't already completed/dismissed it this session. Split out from the
// component so the close-on-success behaviour is unit-testable without a DOM.
export function isMissingStateModalOpen(args: {
  isPremium: boolean;
  buyerStateCode: string | null | undefined;
  dismissed: boolean;
}): boolean {
  if (args.dismissed) return false;
  return shouldShowMissingStateModal({ isPremium: args.isPremium, buyerStateCode: args.buyerStateCode });
}
