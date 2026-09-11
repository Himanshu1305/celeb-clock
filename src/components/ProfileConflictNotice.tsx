/**
 * Profile conflict notice (Part L, Item 1).
 *
 * When a logged-in user's DEVICE profile differs from the profile already synced to
 * their ACCOUNT, the account copy takes precedence (the cross-device source of truth)
 * — but that decision is surfaced here, never silent. The user can keep the account
 * copy (dismiss) or switch to the details entered on this device (one tap), which then
 * re-syncs to the account. Mounted once globally; renders nothing unless there's a
 * genuine conflict (so it's invisible for the overwhelming common case).
 */
import { useSavedProfile } from '@/hooks/useSavedProfile';

function fmt(p: { dob: string; time?: string; city?: { name: string } }) {
  return [p.dob, p.time, p.city?.name].filter(Boolean).join(', ');
}

export function ProfileConflictNotice() {
  const { conflict, resolveConflict } = useSavedProfile();
  if (!conflict) return null;
  return (
    <div data-testid="profile-conflict-notice" role="status"
         className="fixed inset-x-0 top-0 z-[60] mx-auto max-w-3xl m-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 shadow">
      <p className="font-semibold mb-1">We loaded your saved birth details from your account.</p>
      <p className="mb-2">
        Using your account details (<strong>{fmt(conflict.account)}</strong>). This device had
        different details saved (<strong>{fmt(conflict.device)}</strong>).
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" data-testid="conflict-keep-account" onClick={() => resolveConflict('account')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700">
          Keep my account details
        </button>
        <button type="button" data-testid="conflict-use-device" onClick={() => resolveConflict('device')}
                className="px-3 py-1.5 rounded-lg border border-amber-400 text-amber-800 hover:bg-amber-100">
          Use this device’s details instead
        </button>
      </div>
    </div>
  );
}

export default ProfileConflictNotice;
