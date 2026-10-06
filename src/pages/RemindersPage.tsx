import { useEffect, useState } from 'react';
import { ToolLayout } from '@/components/central';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { addReminder, listReminders, type BirthdayReminder } from '@/services/reminderService';

const RELATIONSHIPS = ['Friend', 'Family', 'Partner', 'Colleague', 'Other'];

export default function RemindersPage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [relationship, setRelationship] = useState('Friend');
  const [daysBefore, setDaysBefore] = useState(3);
  const [list, setList] = useState<BirthdayReminder[]>([]);

  useEffect(() => { listReminders(user?.id).then(setList).catch(() => {}); }, [user?.id]);

  const canAdd = name.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(dob);

  const add = async () => {
    if (!canAdd) return;
    const r: BirthdayReminder = { friend_name: name.trim(), friend_dob: dob, relationship, remind_days_before: daysBefore };
    await addReminder(r, user?.id);
    setList(prev => [...prev, r]);
    setName(''); setDob('');
  };

  return (
    <ToolLayout
      theme="neutral"
      testId="reminders-page"
      seo={(
        <SEO
          title="Birthday Reminders — Never Miss a Birthday | BornClock"
          description="Save your friends' and family's birthdays and get a reminder a few days before — so you never miss a birthday again. Free."
          canonicalUrl="/reminders"
          ogType="website"
        />
      )}
      breadcrumb={{ current: 'Reminders' }}
      h1="Birthday Reminders"
      lead={<>Save birthdays and we'll remind you before the big day.</>}
    >
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="rounded-xl border border-border p-5 space-y-4 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1" htmlFor="remind-name">Friend's name</label>
              <input id="remind-name" data-testid="remind-friend-name" value={name}
                     onChange={e => setName(e.target.value)} placeholder="e.g. Priya"
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1" htmlFor="remind-dob">Their birthday</label>
              <input id="remind-dob" data-testid="remind-friend-dob" type="date" value={dob}
                     onChange={e => setDob(e.target.value)}
                     className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground" />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1" htmlFor="remind-rel">Relationship</label>
              <select id="remind-rel" data-testid="remind-relationship" value={relationship}
                      onChange={e => setRelationship(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1" htmlFor="remind-days">Remind me (days before)</label>
              <select id="remind-days" data-testid="remind-days-before" value={daysBefore}
                      onChange={e => setDaysBefore(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground">
                {[1, 3, 7, 14].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <button data-testid="remind-add-btn" onClick={add} disabled={!canAdd}
                  className="w-full py-2.5 rounded-lg bg-[#0E2238] text-white font-semibold hover:bg-[#0E2238] disabled:opacity-50">
            Add reminder
          </button>
          {!user && <p className="text-xs text-muted-foreground">Sign in to sync reminders across devices — they're saved on this device for now.</p>}
        </div>

        {list.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-semibold text-foreground">Your reminders</h2>
            {list.map((r, i) => (
              <div key={r.id || i} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-foreground">{r.friend_name} — {r.friend_dob}</span>
                <span className="text-xs text-muted-foreground">{r.relationship} · {r.remind_days_before}d before</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
