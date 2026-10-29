# Swiss Ephemeris reference for the "Planets today", combustion, retrograde-station and
# Moon-phase pages (Batch 10). Independent of our TS code: pyswisseph only.
# Usage: venv/bin/python -I skySwiss_ref.py skySwiss.json <engine-audit dir>
#
# Convention (same as src/lib/vedic/__tests__/ayanamsaDrik.test.ts): sidereal longitude =
# Swiss apparent tropical longitude - (Swiss SIDM_LAHIRI MEAN ayanamsa (FLG_NONUT) + 24.4"),
# the calibrated offset BornClock uses (Drik convention) — so the JSON longitudes are directly
# comparable with getSiderealLongitude. Rahu = mean node.
import json, sys, swisseph as swe
EA = sys.argv[2] if len(sys.argv) > 2 else 'engine-audit'
swe.set_ephe_path(EA + '/ephe'); swe.set_sid_mode(swe.SIDM_LAHIRI)
OFF = 24.4 / 3600
B = dict(Sun=swe.SUN, Moon=swe.MOON, Mars=swe.MARS, Mercury=swe.MERCURY, Jupiter=swe.JUPITER,
         Venus=swe.VENUS, Saturn=swe.SATURN, Rahu=swe.MEAN_NODE)

def jd_of(iso):  # 'YYYY-MM-DDTHH:MM' UTC
    d, t = iso.split('T'); y, m, dd = map(int, d.split('-')); h, mi = map(int, t.split(':'))
    return swe.julday(y, m, dd, h + mi / 60)

def iso_of(jd):
    y, m, d, h = swe.revjul(jd); tot = round(h * 60)
    if tot >= 1440:
        y, m, d, _ = swe.revjul(jd + 0.5 / 1440); tot = 0 if tot == 1440 else tot
    return f"{y:04d}-{m:02d}-{d:02d}T{tot // 60:02d}:{tot % 60:02d}Z"

def ayan(jd): return swe.get_ayanamsa_ex_ut(jd, swe.FLG_SWIEPH | swe.FLG_NONUT)[1] + OFF

def trop(jd, p):
    r = swe.calc_ut(jd, B[p], swe.FLG_SWIEPH | swe.FLG_SPEED)[0]
    return r[0], r[3]

def sid(jd, p): return (trop(jd, p)[0] - ayan(jd)) % 360

def bisect(f, a, b, n=40):
    fa = f(a)
    for _ in range(n):
        m = (a + b) / 2
        if (f(m) > 0) == (fa > 0): a, fa = m, f(m)
        else: b = m
    return (a + b) / 2

out = {'convention': 'Swiss apparent tropical - (SIDM_LAHIRI mean ayanamsa + 24.4") ; mean node', 'positions': [], 'ingress': [], 'stations': [], 'combust': [], 'moon': {}}

# 1) Positions at 12:00 IST (06:30 UTC) on 5 dates + next sign change after that instant.
DATES = ['2026-10-29', '2027-01-14', '2027-06-21', '2028-03-15', '2030-12-01']
for d in DATES:
    jd = jd_of(d + 'T06:30')
    row = {'date': d, 'lon': {}, 'speed': {}}
    for p in B:
        row['lon'][p] = round(sid(jd, p), 5)
        row['speed'][p] = round(trop(jd, p)[1], 5)
    out['positions'].append(row)
    for p in B:
        s0 = int(sid(jd, p) // 30); step = 0.05 if p == 'Moon' else 0.5
        t = jd
        while True:
            t2 = t + step
            if int(sid(t2, p) // 30) != s0:
                x = bisect(lambda y: 1 if int(sid(y, p) // 30) != s0 else -1, t, t2)
                out['ingress'].append({'date': d, 'planet': p, 'at': iso_of(x), 'to': int(sid(x + 1e-4, p) // 30)})
                break
            t = t2
            if t - jd > 1300: break

# 2) Retrograde / direct stations 2026–2027 (sign change of the apparent tropical speed).
for p in ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']:
    t = swe.julday(2026, 1, 1, 0); end = swe.julday(2028, 1, 1, 0)
    v0 = trop(t, p)[1]
    while t < end:
        t2 = t + 1; v1 = trop(t2, p)[1]
        if (v0 < 0) != (v1 < 0):
            x = bisect(lambda y: trop(y, p)[1], t, t2)
            out['stations'].append({'planet': p, 'kind': 'retrograde' if v1 < 0 else 'direct', 'at': iso_of(x)})
        t, v0 = t2, v1

# 3) Combustion periods in 2026 (longitude distance from the Sun within the Surya Siddhanta
#    orb as cited by Drik Panchang; Mercury 14/12 retro, Venus 10/8 retro, Mars 17, Jupiter 11, Saturn 15).
ORB = dict(Mercury=(14, 12), Venus=(10, 8), Mars=(17, 17), Jupiter=(11, 11), Saturn=(15, 15))
def comb(jd, p):
    lon, sp = trop(jd, p); sun = trop(jd, 'Sun')[0]
    dist = abs((lon - sun + 180) % 360 - 180)
    orb = ORB[p][1] if sp < 0 else ORB[p][0]
    return dist - orb  # < 0 = combust
for p in ORB:
    t = swe.julday(2025, 12, 1, 0); end = swe.julday(2027, 2, 1, 0)
    c0 = comb(t, p) < 0; start = None
    if c0: start = 'before'
    while t < end:
        t2 = t + 0.25; c1 = comb(t2, p) < 0
        if c1 != c0:
            x = bisect(lambda y: comb(y, p), t, t2)
            if c1: start = iso_of(x)
            else: out['combust'].append({'planet': p, 'start': start, 'end': iso_of(x)}); start = None
        t, c0 = t2, c1

# 4) Moon: phase (illuminated fraction) at 06:30 UTC on the same 5 dates, and every new /
#    full Moon of 2026–2027 (apparent tropical elongation 0 / 180).
out['moon']['illum'] = {d: round(swe.pheno_ut(jd_of(d + 'T06:30'), swe.MOON, swe.FLG_SWIEPH)[1], 5) for d in DATES}
def elong(jd): return (trop(jd, 'Moon')[0] - trop(jd, 'Sun')[0]) % 360
ev = []
t = swe.julday(2026, 1, 1, 0); end = swe.julday(2028, 1, 1, 0)
while t < end:
    t2 = t + 0.25; e0, e1 = elong(t), elong(t2)
    if e1 < e0:  # wrapped past 0 → new moon
        ev.append(('new', iso_of(bisect(lambda y: (elong(y) + 180) % 360 - 180, t, t2))))
    if e0 < 180 <= e1:
        ev.append(('full', iso_of(bisect(lambda y: elong(y) - 180, t, t2))))
    t = t2
out['moon']['events'] = [{'kind': k, 'at': a} for k, a in ev]

json.dump(out, open(sys.argv[1], 'w'), indent=1)
print('positions', len(out['positions']), 'ingress', len(out['ingress']), 'stations', len(out['stations']), 'combust', len(out['combust']), 'moon events', len(ev))
