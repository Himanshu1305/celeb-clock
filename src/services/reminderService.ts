import { supabase } from '@/integrations/supabase/client';

export interface BirthdayReminder {
  id?: string;
  friend_name: string;
  friend_dob: string; // YYYY-MM-DD
  relationship?: string;
  remind_days_before?: number;
  notify_email?: string;
}

const LOCAL_KEY = 'bornclock_reminders';

function loadLocal(): BirthdayReminder[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); } catch { return []; }
}
function saveLocal(list: BirthdayReminder[]) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

/**
 * Save a reminder on the server WITH the address to email (audit T5): signed-in users
 * get it at their account email; guests must give an email and tick the consent box.
 * Always mirrored locally so the list shows on this device. Throws with a readable
 * message when the server refuses or is unreachable.
 */
export async function addReminder(
  r: BirthdayReminder,
  opts: { email?: string; consent?: boolean } = {},
): Promise<BirthdayReminder> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  } catch { /* guest */ }

  let res: Response;
  try {
    res = await fetch('/api/reminders', {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...r, email: opts.email, consent: opts.consent === true }),
    });
  } catch {
    throw new Error('Could not reach BornClock. Please check your connection and try again.');
  }
  const body = await res.json().catch(() => ({} as any));
  if (!res.ok || !body?.ok) throw new Error(body?.error || 'Could not save the reminder. Please try again.');

  const saved: BirthdayReminder = { ...r, id: body.id ?? undefined, notify_email: body.notify_email ?? opts.email };
  saveLocal([...loadLocal(), saved]);
  return saved;
}

export async function listReminders(userId?: string): Promise<BirthdayReminder[]> {
  if (userId) {
    try {
      const { data, error } = await supabase.from('birthday_reminders').select('*').eq('user_id', userId);
      if (!error && data) return data as BirthdayReminder[];
    } catch { /* fall through to local */ }
  }
  return loadLocal();
}

export async function removeReminder(id: string, userId?: string): Promise<void> {
  const local = loadLocal().filter(r => r.id !== id);
  saveLocal(local);
  if (userId) { try { await supabase.from('birthday_reminders').delete().eq('id', id); } catch { /* ignore */ } }
}
