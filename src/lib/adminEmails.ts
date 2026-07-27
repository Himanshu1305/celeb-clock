// Single source of truth for admin emails (who bypasses gating / sees /admin).
// Relocated here when the legacy PDFQuotaService (dead tiered-quota code) was
// removed — that file used to also export ADMIN_EMAILS.
export const ADMIN_EMAILS: string[] = [
  'himanshu1305@gmail.com',
  'hello@bornclock.com',
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
