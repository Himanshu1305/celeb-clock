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
  return args.isPremium && !args.buyerStateCode;
}
