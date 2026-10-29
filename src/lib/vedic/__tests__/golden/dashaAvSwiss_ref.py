# Batch 10 — INDEPENDENT reference for Yogini Dasha + Ashtakavarga on Swiss Ephemeris.
# Usage: <engine-audit>/venv/bin/python -I dashaAvSwiss_ref.py out.json <engine-audit dir>
# Swiss Ephemeris (pyswisseph), SIDM_LAHIRI. Convention = BornClock's documented Drik convention
# (__tests__/ayanamsaDrik.test.ts): apparent tropical longitude minus (SE Lahiri MEAN ayanamsa + 24.4").
# Ascendant from houses_ex (tropical) with the same ayanamsa.
# Rules written from the classical statements, NOT from our TypeScript:
#  Yogini: nakshatra number n (Ashwini=1) -> (n+3) mod 8, 0 -> Sankata (vedicmarga.com/yogini-dasha,
#  satyori.com). Balance = (1 - part of nakshatra crossed) x years. Antardasha = maha x antar / 36,
#  starting with the maha's own Yogini. One dasha year = 365.25 days (our Vimshottari convention).
#  Ashtakavarga: BPHS ch.66 bindu places (tempora.ltd/findings/*-ashtakavarga; astrobix.com 361 rules).
import json, sys, swisseph as swe
EA = sys.argv[2]
swe.set_ephe_path(EA + '/ephe'); swe.set_sid_mode(swe.SIDM_LAHIRI)
F = swe.FLG_SWIEPH | swe.FLG_SIDEREAL
CASES = [  # id, UTC y m d h mi, lat, lon  (round2/CONTEXT.md panel)
 ('P1',1996,8,31,7,34,26.8467,80.9462),    # 13:04 IST Lucknow
 ('P2',1999,12,3,16,3,42.6389,-83.2910),   # 11:03 EST Pontiac
 ('P3',1990,1,15,1,0,28.6139,77.2090),     # 06:30 IST New Delhi
 ('P4',1985,7,20,18,15,19.0760,72.8777),   # 23:45 IST Mumbai
 ('P5',1992,6,10,13,20,51.5074,-0.1278),   # 14:20 BST London
 ('P6',2001,12,24,21,0,-33.8688,151.2093), # 08:00 AEDT Sydney
 ('P7',2002,5,14,20,45,40.5187,-74.4121),  # 16:45 EDT Edison
 ('P8',1995,2,10,10,40,-37.8136,144.9631), # 21:40 AEDT Melbourne
 ('P9',1978,5,13,14,0,32.7266,74.8570),    # 19:30 IST Jammu
 ('P10',2024,3,10,3,45,12.9716,77.5946),   # 09:15 IST Bengaluru
]
YOG = [('Mangala',1),('Pingala',2),('Dhanya',3),('Bhramari',4),('Bhadrika',5),('Ulka',6),('Siddha',7),('Sankata',8)]
YEAR = 365.25
def iso(jd):
    y,m,d,h = swe.revjul(jd); hh=int(h); mm=int(round((h-hh)*60))
    if mm==60: hh+=1; mm=0
    return f"{y:04d}-{m:02d}-{d:02d}T{hh:02d}:{mm:02d}Z"
def yogini(jd_birth, moon):
    span = 360/27
    n = int(moon // span) + 1
    part = (moon - (n-1)*span) / span
    r = (n + 3) % 8
    k = 7 if r == 0 else r - 1
    yrs = YOG[k][1]
    start = jd_birth - part*yrs*YEAR
    mahas = []
    cur = start
    i = 0
    while cur < jd_birth + 120*YEAR:
        name, y = YOG[(k+i) % 8]
        antars = []
        a = cur
        for j in range(8):
            an, ay = YOG[(k+i+j) % 8]
            ae = a + y*ay/36*YEAR
            antars.append([an, iso(a), iso(ae)])
            a = ae
        rec = {'yogini': name, 'start': iso(cur), 'end': iso(cur+y*YEAR)}
        if i < 5: rec['antar'] = antars   # keep the golden file small: Antardashas of the first 5 Mahadashas
        mahas.append(rec)
        cur += y*YEAR; i += 1
    return {'nakshatra': n, 'start': YOG[k][0], 'part': part, 'balanceYears': (1-part)*yrs, 'mahas': mahas}

# BPHS ch.66 — places counted from each contributor (Sun,Moon,Mars,Mercury,Jupiter,Venus,Saturn,Lagna)
AV = {
 'Sun':     ['1 2 4 7 8 9 10 11','3 6 10 11','1 2 4 7 8 9 10 11','3 5 6 9 10 11 12','5 6 9 11','6 7 12','1 2 4 7 8 9 10 11','3 4 6 10 11 12'],
 'Moon':    ['3 6 7 8 10 11','1 3 6 7 10 11','2 3 5 6 9 10 11','1 3 4 5 7 8 10 11','1 4 7 8 10 11 12','3 4 5 7 9 10 11','3 5 6 11','3 6 10 11'],
 'Mars':    ['3 5 6 10 11','3 6 11','1 2 4 7 8 10 11','3 5 6 11','6 10 11 12','6 8 11 12','1 4 7 8 9 10 11','1 3 6 10 11'],
 'Mercury': ['5 6 9 11 12','2 4 6 8 10 11','1 2 4 7 8 9 10 11','1 3 5 6 9 10 11 12','6 8 11 12','1 2 3 4 5 8 9 11','1 2 4 7 8 9 10 11','1 2 4 6 8 10 11'],
 'Jupiter': ['1 2 3 4 7 8 9 10 11','2 5 7 9 11','1 2 4 7 8 10 11','1 2 4 5 6 9 10 11','1 2 3 4 7 8 10 11','2 5 6 9 10 11','3 5 6 12','1 2 4 5 6 7 9 10 11'],
 'Venus':   ['8 11 12','1 2 3 4 5 8 9 11 12','3 5 6 9 11 12','3 5 6 9 11','5 8 9 10 11','1 2 3 4 5 8 9 10 11','3 4 5 8 9 10 11','1 2 3 4 5 8 9 11'],
 'Saturn':  ['1 2 4 7 8 10 11','3 6 11','3 5 6 10 11 12','6 8 9 10 11 12','5 6 11 12','6 11 12','3 5 6 11','1 3 4 6 10 11'],
}
SRC = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Lagna']
def ashtaka(signs):
    bav = {}
    for p, rows in AV.items():
        b = [0]*12
        for src, row in zip(SRC, rows):
            for h in map(int, row.split()):
                b[(signs[src] + h - 1) % 12] += 1
        bav[p] = b
    sav = [sum(bav[p][s] for p in bav) for s in range(12)]
    return bav, sav

BODIES = dict(Sun=swe.SUN,Moon=swe.MOON,Mars=swe.MARS,Mercury=swe.MERCURY,Jupiter=swe.JUPITER,Venus=swe.VENUS,Saturn=swe.SATURN)
out = []
for cid, y, m, d, h, mi, lat, lon in CASES:
    jd = swe.julday(y, m, d, h + mi/60)
    ay = swe.get_ayanamsa_ex_ut(jd, swe.FLG_SWIEPH | swe.FLG_NONUT)[1] + 24.4/3600
    lons = {k: (swe.calc_ut(jd, b, swe.FLG_SWIEPH)[0][0] - ay) % 360 for k, b in BODIES.items()}
    lons['Lagna'] = (swe.houses_ex(jd, lat, lon, b'P', swe.FLG_SWIEPH)[1][0] - ay) % 360
    signs = {k: int(v // 30) for k, v in lons.items()}
    margin = {k: min(v % 30, 30 - v % 30) for k, v in lons.items()}
    bav, sav = ashtaka(signs)
    out.append({'id': cid, 'moon': round(lons['Moon'], 6), 'signs': signs, 'signMarginDeg': {k: round(v, 4) for k, v in margin.items()},
                'yogini': yogini(jd, lons['Moon']), 'bav': bav, 'sav': sav})
    yg = out[-1]['yogini']
    print(cid, 'nak', yg['nakshatra'], 'start', yg['start'], 'bal %.4f' % yg['balanceYears'], 'SAV', sav, sum(sav), {p: sum(b) for p, b in bav.items()})
json.dump(out, open(sys.argv[1], 'w'), separators=(',', ':'))
