"""INDEPENDENT reference for Varshphal (B18, Nov 2026) on Swiss Ephemeris.

Writes varshphalSwiss.json, read by src/lib/vedic/__tests__/varshphal.test.ts.
Run (from this folder, -I keeps the folder off sys.path):
    pip install --break-system-packages pyswisseph==2.10.03
    python3 -I varshphal_ref.py <ephe dir or ''> > varshphalSwiss.json

Written from the classical statements, NOT from our TypeScript:
  Dr. S.P. Gour, "Varshaphal (Annual Prediction)", AIFAS
  (https://ia800104.us.archive.org/22/items/AIFASBooks/Varshphal%20Eng%20AIFAS.pdf):
   * Varsha Pravesh = the moment the sidereal Sun returns to its natal longitude.
   * Muntha rashi = (completed years + janma Lagna rashi) mod 12.
   * Mudda (Vimshottari) dasha: (completed years + janma nakshatra - 2) / 9, remainder counted
     from the Sun (Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury, Ketu, Venus);
     days Sun 18, Moon 30, Mars 21, Rahu 54, Jupiter 48, Saturn 57, Mercury 51, Ketu 21,
     Venus 60 (360); balance from the Moon's place in the birth nakshatra at the start, the
     elapsed part at the end. The 360 nominal days are spread over the real year, as in
     astrologyapi.com's varshaphal_mudda_dasha reference output.
   * Sahams (day; A and B swap at night except Vivaha): Punya Moon-Sun+Lagna, Vidya
     Sun-Moon+Lagna, Yasha Jupiter-Punya+Lagna, Mitra Jupiter-Punya+Venus, Mahatmya
     Punya-Mars+Lagna, Vivaha Venus-Saturn+Lagna, Karyasiddhi Saturn-Sun+lord of the Sun's
     sign (night Saturn-Moon+lord of the Moon's sign); add one sign (30 deg) when the third
     (added) point is not between the subtracted and the first point.
  Day/night: Sun between sunrise and sunset (swe.rise_trans, upper limb with refraction).
  Positions: Swiss SIDM_LAHIRI with nutation (true Lahiri = AstroSage), Ascendant from
  swe.houses_ex with FLG_SIDEREAL.
"""
import json, sys
import swisseph as swe

if len(sys.argv) > 1 and sys.argv[1]:
    swe.set_ephe_path(sys.argv[1])
    BASE = swe.FLG_SWIEPH
else:
    BASE = swe.FLG_MOSEPH
swe.set_sid_mode(swe.SIDM_LAHIRI)
F = BASE | swe.FLG_SIDEREAL

# id, birth UTC (y, m, d, h, mi), birth lat, lon, [optional Varshphal place lat, lon]
CHARTS = [
    ('P1', (1996, 8, 31, 7, 34), 26.8467, 80.9462),     # 13:04 IST Lucknow
    ('P2', (1999, 12, 3, 16, 3), 42.6389, -83.2910),    # 11:03 EST Pontiac
    ('P3', (1990, 1, 15, 1, 0), 28.6139, 77.2090),      # 06:30 IST New Delhi
    ('P4', (1985, 7, 20, 18, 15), 19.0760, 72.8777),    # 23:45 IST Mumbai
    ('P5', (1992, 6, 10, 13, 20), 51.5074, -0.1278),    # 14:20 BST London
    ('P6', (2001, 12, 24, 21, 0), -33.8688, 151.2093),  # 08:00 AEDT Sydney
    ('P7', (2002, 5, 14, 20, 45), 40.5187, -74.4121),   # 16:45 EDT Edison
    ('P8', (1995, 2, 10, 10, 40), -37.8136, 144.9631),  # 21:40 AEDT Melbourne
    ('JAMMU', (1978, 5, 13, 14, 0), 32.7266, 74.8570),  # 1978-05-13 19:30 IST Jammu
    ('PATNA', (1981, 7, 8, 23, 0), 25.5941, 85.1376),   # 1981-07-09 04:30 IST Patna
    ('P10', (2024, 3, 10, 3, 45), 12.9716, 77.5946),    # 09:15 IST Bengaluru
    ('GIRL', (1982, 10, 20, 12, 35), 28.65, 77.22),     # 18:05 IST Delhi (AIFAS example)
    ('SON', (1973, 7, 31, 14, 45), 28.65, 77.22),       # 20:15 IST Delhi (AIFAS example)
    ('PATNA_BLR', (1981, 7, 8, 23, 0), 25.5941, 85.1376, 12.9716, 77.5946),  # cast for Bengaluru
]
# B20: also every golden test birth not already above (goldenCharts.json G11–G20, Swiss-made).
import os
_G = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'golden', 'goldenCharts.json')))
for _c in _G['charts']:
    if _c['id'].startswith('G'):
        _u = _c['utc']
        CHARTS.append((_c['id'], (int(_u[0:4]), int(_u[5:7]), int(_u[8:10]), int(_u[11:13]), int(_u[14:16])), _c['birth']['lat'], _c['birth']['lon']))
YEARS = [2026, 2027]
ORDER = ['Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus']
DAYS = {'Sun': 18, 'Moon': 30, 'Mars': 21, 'Rahu': 54, 'Jupiter': 48, 'Saturn': 57, 'Mercury': 51, 'Ketu': 21, 'Venus': 60}
LORD = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter']
BODY = {'Sun': swe.SUN, 'Moon': swe.MOON, 'Mars': swe.MARS, 'Mercury': swe.MERCURY, 'Jupiter': swe.JUPITER, 'Venus': swe.VENUS, 'Saturn': swe.SATURN}


def lon(jd, name):
    return swe.calc_ut(jd, BODY[name], F)[0][0]


def asc(jd, lat, lng):
    return swe.houses_ex(jd, lat, lng, b'W', F)[1][0]


def d180(x):
    return (x + 540.0) % 360.0 - 180.0


def iso(jd):
    y, m, d, h = swe.revjul(jd)
    s = round(h * 3600)
    return '%04d-%02d-%02dT%02d:%02d:%02dZ' % (y, m, d, s // 3600, (s // 60) % 60, s % 60)


def sun_return(target, jd_guess):
    lo, hi = jd_guess - 3, jd_guess + 3
    # Bisection on the signed difference (Sun moves ~1 deg/day, monotonic over 6 days).
    for _ in range(60):
        mid = (lo + hi) / 2
        if d180(lon(mid, 'Sun') - target) < 0:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def is_day(jd, lat, lng):
    geo = (lng, lat, 0)
    nxt_rise = swe.rise_trans(jd, swe.SUN, swe.CALC_RISE, geo, 1013.25, 15, BASE)[1][0]
    nxt_set = swe.rise_trans(jd, swe.SUN, swe.CALC_SET, geo, 1013.25, 15, BASE)[1][0]
    return nxt_set < nxt_rise


def saham(a, b, c):
    s = (a - b + c) % 360
    span = (a - b) % 360
    pos = (c - b) % 360
    if not (0 < pos < span):
        s = (s + 30) % 360
    return s


rows = []
for ch in CHARTS:
    cid, (y, m, d, h, mi), blat, blon = ch[:4]
    plat, plon = (ch[4], ch[5]) if len(ch) > 4 else (blat, blon)
    jdb = swe.julday(y, m, d, h + mi / 60)
    nsun = lon(jdb, 'Sun')
    nasc = asc(jdb, blat, blon)
    nmoon = lon(jdb, 'Moon')
    span = 360 / 27
    nak = int(nmoon // span) + 1
    frac = (nmoon - (nak - 1) * span) / span
    for Y in YEARS:
        n = Y - y
        vp = sun_return(nsun, jdb + n * 365.25636)
        vpn = sun_return(nsun, jdb + (n + 1) * 365.25636)
        day = is_day(vp, plat, plon)
        L = {p: lon(vp, p) for p in BODY}
        A = asc(vp, plat, plon)
        lsign = int(A // 30)
        # Sahams
        if day:
            punya = saham(L['Moon'], L['Sun'], A)
            sah = {
                'punya': punya,
                'vidya': saham(L['Sun'], L['Moon'], A),
                'yasha': saham(L['Jupiter'], punya, A),
                'mitra': saham(L['Jupiter'], punya, L['Venus']),
                'mahatmya': saham(punya, L['Mars'], A),
                'karyasiddhi': saham(L['Saturn'], L['Sun'], L[LORD[int(L['Sun'] // 30)]]),
            }
        else:
            punya = saham(L['Sun'], L['Moon'], A)
            sah = {
                'punya': punya,
                'vidya': saham(L['Moon'], L['Sun'], A),
                'yasha': saham(punya, L['Jupiter'], A),
                'mitra': saham(punya, L['Jupiter'], L['Venus']),
                'mahatmya': saham(L['Mars'], punya, A),
                'karyasiddhi': saham(L['Saturn'], L['Moon'], L[LORD[int(L['Moon'] // 30)]]),
            }
        sah['vivaha'] = saham(L['Venus'], L['Saturn'], A)
        # Mudda dasha
        r = (n + nak - 2) % 9
        i0 = (r - 1) % 9
        unit = (vpn - vp) / 360
        cur = vp - frac * DAYS[ORDER[i0]] * unit
        mudda = []
        k = 0
        while cur < vpn - 1e-9:
            lord = ORDER[(i0 + k) % 9]
            e = cur + DAYS[lord] * unit
            mudda.append([lord, iso(max(cur, vp)), iso(min(e, vpn))])
            cur = e
            k += 1
        rows.append({
            'id': cid, 'year': Y, 'birthUTC': iso(jdb), 'birthLat': blat, 'birthLon': blon, 'lat': plat, 'lon': plon,
            'completedYears': n, 'varshaPravesh': iso(vp), 'nextVarshaPravesh': iso(vpn), 'isDay': day,
            'lagna': round(A, 5), 'lagnaSign': lsign, 'munthaSign': (int(nasc // 30) + n) % 12,
            'planets': {p: round(v, 5) for p, v in L.items()},
            'sahams': {k2: round(v, 5) for k2, v in sah.items()}, 'mudda': mudda,
        })

print(json.dumps({'source': 'pyswisseph %s, SIDM_LAHIRI (true), %s' % (swe.version, 'SWIEPH' if BASE == swe.FLG_SWIEPH else 'MOSEPH'), 'rows': rows}, indent=1))
