"""
Independent reference calculator for birth-timezone accuracy tests.

Deliberately shares NO code with the BornClock TypeScript engine:
  * local time -> UTC uses Python's zoneinfo + the PyPI `tzdata` package (IANA tz
    database), not the browser/Node ICU data the site uses;
  * Lahiri (Chitrapaksha) ayanamsa uses the exact Swiss-Ephemeris definition
    (SE_SIDM_LAHIRI: t0 = JD 2435553.5 TT, ayanamsa(t0) = 23.250182778 - 0.004658035 deg)
    carried forward with the IAU 2006 general precession in longitude p_A, and
    the TRUE ayanamsa (mean + nutation in longitude) subtracted from apparent
    (true-equinox-of-date) longitudes;
  * Ascendant from GAST + true obliquity (own implementation);
  * Rahu = mean lunar node (Meeus 47.7), Ketu = Rahu + 180;
  * Vimshottari Dasha from the Moon's nakshatra fraction, 365.25-day years.
Only the planetary ephemeris (VSOP87 / ELP via the pure-Python `astronomy-engine`
package) is shared in kind with the site, as requested.

Ambiguous / non-existent local times use the RFC 5545 / Temporal "compatible"
rule: an ambiguous (fall-back) time takes the EARLIER offset (fold=0) and a
non-existent (spring-forward) time is read with the pre-transition offset, i.e.
shifted forward by the gap.

Usage:  python -I scripts/verify/independent_reference.py  > <out.json>
"""
import json
import math
import sys
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import astronomy as A

RASHI = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika',
         'Dhanu', 'Makara', 'Kumbha', 'Meena']
NAK = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya',
       'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
       'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana',
       'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati']
LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
YEARS = {'Ketu': 7, 'Venus': 20, 'Sun': 6, 'Moon': 10, 'Mars': 7, 'Rahu': 18, 'Jupiter': 16, 'Saturn': 19, 'Mercury': 17}
NSPAN = 360.0 / 27.0


def n360(x):
    return x % 360.0


def local_to_utc(iana, y, mo, d, h, mi):
    """Returns (utc datetime, offset hours, flags)."""
    z = ZoneInfo(iana)
    naive = datetime(y, mo, d, h, mi)
    a0 = naive.replace(tzinfo=z, fold=0)
    a1 = naive.replace(tzinfo=z, fold=1)
    ambiguous = nonexistent = False
    if a0.utcoffset() != a1.utcoffset():
        # Round-trip test distinguishes a gap (non-existent) from an overlap (ambiguous).
        rt = a0.astimezone(timezone.utc).astimezone(z).replace(tzinfo=None)
        if rt == naive:
            ambiguous = True
        else:
            nonexistent = True
    utc = a0.astimezone(timezone.utc)
    off = a0.utcoffset().total_seconds() / 3600.0
    return utc, off, {'ambiguous': ambiguous, 'nonexistent': nonexistent}


def T_of(t):
    return t.tt / 36525.0


def nutation(T):
    """Meeus ch.22 low-precision nutation (accurate to ~0.5")."""
    om = math.radians(125.04452 - 1934.136261 * T)
    L = math.radians(280.4665 + 36000.7698 * T)
    Lp = math.radians(218.3165 + 481267.8813 * T)
    dpsi = (-17.20 * math.sin(om) - 1.32 * math.sin(2 * L) - 0.23 * math.sin(2 * Lp) + 0.21 * math.sin(2 * om)) / 3600.0
    deps = (9.20 * math.cos(om) + 0.57 * math.cos(2 * L) + 0.10 * math.cos(2 * Lp) - 0.09 * math.cos(2 * om)) / 3600.0
    return dpsi, deps


def p_A(T):
    """IAU 2006 general precession in longitude, arcsec."""
    return 5028.796195 * T + 1.1054348 * T ** 2 + 0.00007964 * T ** 3 - 0.000023857 * T ** 4 - 0.0000000383 * T ** 5


LAHIRI_T0 = (2435553.5 - 2451545.0) / 36525.0
LAHIRI_A0 = 23.250182778 - 0.004658035


def ayanamsa_mean(T):
    return LAHIRI_A0 + (p_A(T) - p_A(LAHIRI_T0)) / 3600.0


def sidereal_from_apparent(lon_true, T):
    dpsi, _ = nutation(T)
    return n360(lon_true - (ayanamsa_mean(T) + dpsi))


def breakdown(lon):
    r = int(lon // 30)
    k = int(lon // NSPAN)
    pada = int((lon % NSPAN) // (NSPAN / 4)) + 1
    in_sign = lon % 30
    in_nak = lon % NSPAN
    return {
        'longitude': round(lon, 4), 'rashi': RASHI[r], 'rashiIndex': r, 'degreeInSign': round(in_sign, 4),
        'nakshatra': NAK[k], 'nakshatraIndex': k, 'pada': pada,
        'distSignBoundary': round(min(in_sign, 30 - in_sign), 4),
        'distNakBoundary': round(min(in_nak, NSPAN - in_nak), 4),
    }


def chart(utc, lat, lon, ref_utc):
    t = A.Time.Make(utc.year, utc.month, utc.day, utc.hour, utc.minute, utc.second + utc.microsecond / 1e6)
    T = T_of(t)
    out = {'ayanamsaMean': round(ayanamsa_mean(T), 6)}
    pl = {}
    pl['Sun'] = A.Ecliptic(A.GeoVector(A.Body.Sun, t, True)).elon
    pl['Moon'] = A.EclipticGeoMoon(t).lon
    for name in ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']:
        pl[name] = A.Ecliptic(A.GeoVector(getattr(A.Body, name), t, True)).elon
    sid = {k: sidereal_from_apparent(v, T) for k, v in pl.items()}
    # Mean node (Meeus 47.7), referred to the mean equinox of date -> subtract MEAN ayanamsa.
    om = 125.0445479 - 1934.1362891 * T + 0.0020754 * T ** 2 + T ** 3 / 467441 - T ** 4 / 60616000
    sid['Rahu'] = n360(om - ayanamsa_mean(T))
    sid['Ketu'] = n360(sid['Rahu'] + 180)
    # Ascendant
    gast = A.SiderealTime(t)  # hours, apparent
    ramc = math.radians(n360(gast * 15 + lon))
    dpsi, deps = nutation(T)
    eps0 = (84381.406 - 46.836769 * T - 0.0001831 * T ** 2 + 0.00200340 * T ** 3) / 3600.0
    eps = math.radians(eps0 + deps)
    phi = math.radians(lat)
    asc = math.degrees(math.atan2(math.cos(ramc), -(math.sin(ramc) * math.cos(eps) + math.tan(phi) * math.sin(eps))))
    asc_sid = n360(n360(asc) - (ayanamsa_mean(T) + dpsi))
    lagna = breakdown(asc_sid)
    out['lagna'] = lagna
    planets = {}
    for k, v in sid.items():
        b = breakdown(v)
        b['house'] = (b['rashiIndex'] - lagna['rashiIndex']) % 12 + 1
        planets[k] = b
    out['planets'] = planets
    out['moon'] = planets['Moon']
    # Vimshottari
    m = sid['Moon']
    k = int(m // NSPAN)
    frac = (m % NSPAN) / NSPAN
    li = k % 9
    yr = 365.25 * 86400
    start = utc - timedelta(seconds=YEARS[LORDS[li]] * frac * yr)
    cur = None
    for i in range(18):
        lord = LORDS[(li + i) % 9]
        end = start + timedelta(seconds=YEARS[lord] * yr)
        if start <= ref_utc < end:
            a_start = start
            for j in range(9):
                al = LORDS[(LORDS.index(lord) + j) % 9]
                a_end = a_start + timedelta(seconds=YEARS[lord] * YEARS[al] / 120 * yr)
                if a_start <= ref_utc < a_end:
                    cur = {'mahadasha': lord, 'mahaStart': start.isoformat(), 'mahaEnd': end.isoformat(),
                           'antardasha': al, 'antarStart': a_start.isoformat(), 'antarEnd': a_end.isoformat()}
                    break
                a_start = a_end
            break
        start = end
    out['dasha'] = cur
    return out


REF = datetime(2026, 10, 16, 0, 0, tzinfo=timezone.utc)

CASES = [
    # id, label, place, lat, lon, iana, y, m, d, h, min
    ('repro-boy', 'Suchit (repro boy)', 'Lucknow, Uttar Pradesh, India', 26.8467, 80.9462, 'Asia/Kolkata', 1996, 8, 31, 13, 4),
    ('repro-girl', 'Sukriti (repro girl)', 'Pontiac, Michigan, USA', 42.6389, -83.2910, 'America/Detroit', 1999, 12, 3, 11, 3),
    ('repro-girl-as-ist', 'Sukriti read as IST (the bug)', 'Pontiac, Michigan, USA', 42.6389, -83.2910, 'Asia/Kolkata', 1999, 12, 3, 11, 3),
    ('new-york-july', 'New York, July (EDT)', 'New York, New York, USA', 40.7128, -74.0060, 'America/New_York', 1990, 7, 15, 8, 30),
    ('chicago-jan', 'Chicago, January (CST)', 'Chicago, Illinois, USA', 41.8781, -87.6298, 'America/Chicago', 1985, 1, 20, 22, 15),
    ('phoenix-july', 'Phoenix, July (no DST)', 'Phoenix, Arizona, USA', 33.4484, -112.0740, 'America/Phoenix', 1995, 7, 4, 14, 0),
    ('toronto-jan', 'Toronto, January (EST)', 'Toronto, Ontario, Canada', 43.6532, -79.3832, 'America/Toronto', 1992, 1, 10, 6, 45),
    ('london-july', 'London, July (BST)', 'London, England, UK', 51.5074, -0.1278, 'Europe/London', 1988, 7, 22, 19, 20),
    ('london-jan', 'London, January (GMT)', 'London, England, UK', 51.5074, -0.1278, 'Europe/London', 1988, 1, 22, 19, 20),
    ('berlin-july', 'Berlin, July (CEST)', 'Berlin, Germany', 52.5200, 13.4050, 'Europe/Berlin', 1993, 7, 8, 3, 10),
    ('sydney-jan', 'Sydney, January (AEDT, DST)', 'Sydney, New South Wales, Australia', -33.8688, 151.2093, 'Australia/Sydney', 1998, 1, 25, 16, 40),
    ('brisbane-jan', 'Brisbane, January (AEST, no DST)', 'Brisbane, Queensland, Australia', -27.4698, 153.0251, 'Australia/Brisbane', 1998, 1, 25, 16, 40),
    ('dubai', 'Dubai', 'Dubai, United Arab Emirates', 25.2048, 55.2708, 'Asia/Dubai', 2001, 3, 14, 9, 0),
    ('singapore', 'Singapore 1979 (+7:30 era)', 'Singapore', 1.3521, 103.8198, 'Asia/Singapore', 1979, 11, 2, 23, 30),
    ('kathmandu', 'Kathmandu (+5:45)', 'Kathmandu, Nepal', 27.7172, 85.3240, 'Asia/Kathmandu', 2003, 5, 5, 5, 5),
    ('mumbai-1943', 'Mumbai 1943 (wartime +6:30)', 'Mumbai, Maharashtra, India', 19.0760, 72.8777, 'Asia/Kolkata', 1943, 3, 10, 11, 0),
    ('ny-dst-ambiguous', 'New York 2021-11-07 01:30 (ambiguous, fall-back)', 'New York, New York, USA', 40.7128, -74.0060, 'America/New_York', 2021, 11, 7, 1, 30),
    ('ny-dst-gap', 'New York 2021-03-14 02:30 (non-existent, spring-forward)', 'New York, New York, USA', 40.7128, -74.0060, 'America/New_York', 2021, 3, 14, 2, 30),
]


def main():
    out = {'_generator': 'scripts/verify/independent_reference.py', 'tzdata': None, 'refDate': REF.isoformat(), 'cases': []}
    try:
        import tzdata
        out['tzdata'] = tzdata.IANA_VERSION
    except Exception:
        pass
    for (cid, label, place, lat, lon, iana, y, mo, d, h, mi) in CASES:
        utc, off, flags = local_to_utc(iana, y, mo, d, h, mi)
        c = chart(utc, lat, lon, REF)
        out['cases'].append({
            'id': cid, 'label': label, 'place': place, 'lat': lat, 'lon': lon, 'timezone': iana,
            'local': {'y': y, 'm': mo, 'd': d, 'h': h, 'min': mi},
            'utcOffsetHours': off, 'utc': utc.isoformat(), **flags, **c,
        })
    json.dump(out, sys.stdout, indent=1)


if __name__ == '__main__':
    main()
