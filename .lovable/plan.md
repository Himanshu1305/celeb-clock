

## GDPR Compliance: Subscription Management & Account Deletion

### Current State
- Profile page has blog subscription and email notification toggles — but they save silently without clear GDPR framing
- Privacy page mentions account deletion only via email to support — no self-service option
- No "Download My Data" or "Delete Account" functionality exists
- No explicit consent management section on the Profile page

### Changes

**1. Add "Privacy & Data" section to Profile page** (`src/pages/Profile.tsx`)
- New card titled "Privacy & Data Management" with:
  - **Subscription Controls** (already exist, but reframed with GDPR language): Blog subscription toggle with clear description ("You can opt out at any time"), Email notifications toggle with clear description
  - **Download My Data** button — exports user's profile data as JSON (name, email, country, subscription preferences, account creation date). No health data is stored so this covers everything.
  - **Delete My Account** button (destructive) — opens a confirmation dialog explaining what will be deleted, requires typing "DELETE" to confirm, calls a Supabase Edge Function that deletes the user's profile row and then deletes the auth user via admin API

**2. Create Edge Function `delete-account`** (`supabase/functions/delete-account/index.ts`)
- Authenticates the requesting user via JWT
- Deletes their profile from `profiles` table
- Deletes their reviews from `user_reviews` table  
- Deletes their analytics events from `analytics_events` table
- Deletes the auth user via `supabase.auth.admin.deleteUser()`
- Returns success, frontend then signs out and redirects to home

**3. Update Privacy Policy** (`src/pages/Privacy.tsx`)
- Update the "User Rights" section to mention self-service account deletion from the Profile page, data export capability, and subscription opt-out controls

### Files

| File | Change |
|------|--------|
| `src/pages/Profile.tsx` | Add Privacy & Data Management card with download data, delete account |
| `src/hooks/useAuth.ts` | Add `deleteAccount` function that calls the edge function |
| `supabase/functions/delete-account/index.ts` | New edge function for server-side account deletion |
| `supabase/config.toml` | Add `[functions.delete-account]` with `verify_jwt = false` |
| `src/pages/Privacy.tsx` | Update User Rights section with self-service options |

