# B20 — Swiss Ephemeris reference for the daily Panchang, New Delhi, every day of 2027.
# Independent of our TS code: pyswisseph only.
#   python3 -I panchangSwiss_ref.py <ephe dir> > panchangSwiss2027.json
#
# Conventions (stated, matched to BornClock's Panchang):
#  - Sidereal longitude = Swiss apparent tropical - (SIDM_LAHIRI mean ayanamsa (FLG_NONUT) + 24.4"),
#    the Drik Panchang convention (same as skySwiss_ref.py).
#  - Tithi = (Moon - Sun) / 12 deg; Karana = (Moon - Sun) / 6 deg; Nakshatra = Moon / 13 deg 20';
#    Yoga = (Sun + Moon) / 13 deg 20'. The "end" of each is the first boundary after sunrise.
#  - Sunrise / sunset: swe.rise_trans, upper limb with standard refraction, sea level.
#  - Times are IST (UTC+5:30), rounded to the minute; "+1" marks the next calendar day.
import json, sys, swisseph as swe
EPHE = sys.argv[1] if len(sys.argv) > 1 else ''
if EPHE: swe.set_ephe_path(EPHE)
swe.set_sid_mode(swe.SIDM_LAHIRI)
FL = swe.FLG_SWIEPH if EPHE else swe.FLG_MOSEPH
LAT, LON = 28.6139, 77.2090
OFF = 24.4 / 3600

def ayan(jd): return swe.get_ayanamsa_ex_ut(jd, FL | swe.FLG_NONUT)[1] + OFF
def trop(jd, b): return swe.calc_ut(jd, b, FL)[0][0]
def sun(jd): return (trop(jd, swe.SUN) - ayan(jd)) % 360
def moon(jd): return (trop(jd, swe.MOON) - ayan(jd)) % 360
LIMB = {
    'tithi': (lambda jd: (moon(jd) - sun(jd)) % 360, 12.0),
    'karana': (lambda jd: (moon(jd) - sun(jd)) % 360, 6.0),
    'nakshatra': (lambda jd: moon(jd), 360 / 27),
    'yoga': (lambda jd: (sun(jd) + moon(jd)) % 360, 360 / 27),
}
def idx(k, jd): f, u = LIMB[k]; return int(f(jd) // u)
def end_after(k, jd0):
    cur = idx(k, jd0); jd = jd0
    while idx(k, jd + 1 / 24) == cur: jd += 1 / 24
    lo, hi = jd, jd + 1 / 24
    for _ in range(40):
        m = (lo + hi) / 2
        if idx(k, m) == cur: lo = m
        else: hi = m
    return hi

def rise_set(jd_start, flag):
    r = swe.rise_trans(jd_start, swe.SUN, flag, (LON, LAT, 0), 1013.25, 15, FL)
    return r[1][0]

def ist(jd, day0):
    y, m, d, h = swe.revjul(jd + 5.5 / 24)
    tot = round(h * 60)
    if tot >= 1440: y, m, d, _ = swe.revjul(jd + 5.5 / 24 + 1 / 1440); tot -= 1440
    plus = (swe.julday(y, m, d, 0) - day0)
    return f"{tot // 60:02d}:{tot % 60:02d}" + (f" +{int(plus)}" if plus >= 1 else '')

out = {'source': 'pyswisseph %s, %s; New Delhi %.4f, %.4f; sidereal = tropical - (SIDM_LAHIRI mean + 24.4"); sunrise/sunset = upper limb with refraction' % (swe.version, 'SWIEPH' if EPHE else 'MOSEPH', LAT, LON), 'days': {}}
day0 = swe.julday(2027, 1, 1, 0)
for i in range(365):
    d0 = day0 + i
    local_midnight_ut = d0 - 5.5 / 24
    rise = rise_set(local_midnight_ut, swe.CALC_RISE)
    sset = rise_set(rise, swe.CALC_SET)
    y, m, d, _ = swe.revjul(d0)
    row = {'sunrise': ist(rise, d0), 'sunset': ist(sset, d0)}
    for k in ('tithi', 'nakshatra', 'yoga', 'karana'):
        row[k] = ist(end_after(k, rise), d0)
    out['days'][f"{y:04d}-{m:02d}-{d:02d}"] = row
json.dump(out, sys.stdout, indent=0)
