"""B20 — read a filled Malayalam review workbook and print the suggested changes. Changes no file.
   python3 scripts/import-ml-review.py docs/review/malayalam-review-filled.xlsx"""
import sys
from openpyxl import load_workbook

def suggestions(path):
    wb = load_workbook(path, read_only=True)
    out = []
    for ws in wb.worksheets:
        if ws.title == 'How to review': continue
        for row in ws.iter_rows(min_row=2, values_only=True):
            if not row or not row[0]: continue
            id_, _page, cur, eng, _ctx, ok, sug, notes = (list(row) + [None] * 8)[:8]
            ok = (ok or '').strip().upper() if isinstance(ok, str) else ok
            if (ok == 'N') or (sug and str(sug).strip() and str(sug).strip() != (cur or '').strip()) or (notes and str(notes).strip()):
                out.append({'id': id_, 'sheet': ws.title, 'current': cur, 'english': eng, 'correct': ok, 'suggested': sug, 'notes': notes})
    return out

if __name__ == '__main__':
    s = suggestions(sys.argv[1])
    for x in s:
        print(f"[{x['sheet']}] {x['id']}\n  now:  {x['current']}\n  new:  {x['suggested'] or '(none given)'}\n  note: {x['notes'] or ''}\n")
    print(f"{len(s)} change(s) suggested.")
