# B21 — Prastarashtakavarga (who gives each bindu) from PyJHora, for every chart in dashaAvSwiss.json.
# Usage: <venv with PyJHora 5.0.6>/bin/python -I prastaraJHora_ref.py dashaAvSwiss.json out.json
# Signs come from the Swiss Ephemeris reference (dashaAvSwiss_ref.py). PyJHora's six "Parashara–
# Varahamihira discrepancy" switches are OFF (= BPHS, as BornClock).
import sys, json
from jhora.horoscope.chart import ashtakavarga
NAMES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
CONTRIB = NAMES + ['Lagna']
out = []
for r in json.load(open(sys.argv[1])):
    h2p = ['' for _ in range(12)]
    for i, n in enumerate(NAMES):
        s = r['signs'][n]; h2p[s] = (h2p[s] + '/' if h2p[s] else '') + str(i)
    s = r['signs']['Lagna']; h2p[s] = (h2p[s] + '/' if h2p[s] else '') + 'L'
    _, _, pav = ashtakavarga.get_ashtaka_varga(h2p, moon_benefic_9_from_moon=False, moon_malefic_9_from_mars=False,
        moon_benefic_2_from_jupiter=False, moon_malefic_12_from_jupiter=False, venus_benefic_4_from_mars=False, venus_malefic_5_from_mars=False)
    out.append({'id': r['id'], 'signs': r['signs'],
                'prastara': {p: {c: pav[i][j] for j, c in enumerate(CONTRIB)} for i, p in enumerate(NAMES)}})
json.dump({'source': 'PyJHora 5.0.6 ashtakavarga.get_ashtaka_varga (prastara), BPHS readings', 'charts': out}, open(sys.argv[2], 'w'))
print(len(out), 'charts')
