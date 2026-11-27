"""B20 — writes the Malayalam review workbook from the rows JSON made by export-ml-review.mts."""
import json, sys
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
rows = json.load(open(sys.argv[1], encoding='utf-8'))
wb = Workbook()
how = wb.active; how.title = 'How to review'
for i, line in enumerate([
    'Thank you for checking BornClock\'s Malayalam pages.',
    'Each sheet lists every Malayalam sentence or label on one group of pages, with what it is meant to say in English.',
    'Please read column C. If it is correct and natural Malayalam, type Y in column F. If not, type N.',
    'For any N, write your better Malayalam in column G, and anything else (tone, a wrong word, a missing idea) in column H.',
    'Text like {1} or {…} is filled in on the page (a name, a date, a number) — please keep it in your version.',
], start=1):
    how.cell(row=i, column=1, value=line).alignment = Alignment(wrap_text=True)
how.column_dimensions['A'].width = 110
head = ['ID', 'Page URL(s)', 'Malayalam (current)', 'English meaning', 'Context', 'Correct? (Y/N)', 'Suggested Malayalam', 'Notes']
keys = ['ID', 'Page', 'Malayalam', 'English', 'Context', 'Correct', 'Suggested', 'Notes']
widths = [30, 28, 60, 60, 18, 12, 50, 30]
fill = PatternFill('solid', fgColor='FFF2CC')
for group in ['Kundali', 'Matching', 'Rashifal', 'Panchang', 'Common']:
    ws = wb.create_sheet(group)
    ws.append(head)
    for c in ws[1]: c.font = Font(bold=True)
    for r in (x for x in rows if x['Group'] == group):
        ws.append([r[k] for k in keys])
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[ws.cell(row=1, column=i).column_letter].width = w
    for row in ws.iter_rows(min_row=2):
        for c in row: c.alignment = Alignment(wrap_text=True, vertical='top')
        for c in row[5:8]: c.fill = fill
    ws.freeze_panes = 'A2'
wb.save(sys.argv[2])
