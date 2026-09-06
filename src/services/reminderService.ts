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

/** Add a reminder. Persists to Supabase when signed in; always mirrors locally. */
export async function addReminder(r: BirthdayReminder, userId?: string): Promise<BirthdayReminder> {
  const local = loadLocal();
  local.push(r);
  saveLocal(local);
  if (userId) {
    try {
      await supabase.from('birthday_reminders').insert({ ...r, user_id: userId });
    } catch { /* offline / table missing — local copy stands */ }
  }
  return r;
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
