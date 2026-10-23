// Gift deep-link (?gift=1&to=&from=&note=&dob=YYYY-MM-DD) from the gift page.
// Only when gift=1 is the dob's year real and kept. Lengths match the form caps.
export function parseGiftSeed(sp: URLSearchParams): { to: string; from: string; note: string; year: string } {
  if (sp.get('gift') !== '1') return { to: '', from: '', note: '', year: '' };
  const m = /^(\d{4})-\d{2}-\d{2}$/.exec(sp.get('dob') ?? '');
  return {
    to: (sp.get('to') ?? '').slice(0, 60),
    from: (sp.get('from') ?? '').slice(0, 60),
    note: (sp.get('note') ?? '').slice(0, 200),
    year: m ? m[1] : '',
  };
}
