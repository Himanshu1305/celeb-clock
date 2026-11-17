"""Reference values for swissTrueLahiri.json (B14, Nov 2026).

Swiss Ephemeris TRUE Lahiri (SIDM_LAHIRI, nutation included = what AstroSage uses)
and MEAN Lahiri (FLG_NONUT) at fixed UTC instants. Run:
    pip install pyswisseph==2.10.03
    python3 swissTrueLahiri_ref.py > swissTrueLahiri.json
"""
import json
import swisseph as swe

swe.set_sid_mode(swe.SIDM_LAHIRI)
INSTANTS = [
    '1900-01-01T00:00:00Z', '1942-10-11T10:30:00Z', '1950-01-01T00:00:00Z',
    '1965-11-02T21:00:00Z', '1978-05-13T14:00:00Z', '1981-07-08T23:00:00Z',
    '1990-03-14T05:00:00Z', '2000-01-01T12:00:00Z', '2026-11-17T06:00:00Z',
    '2050-01-01T00:00:00Z',
]
rows = []
for iso in INSTANTS:
    y, m, d = int(iso[0:4]), int(iso[5:7]), int(iso[8:10])
    h = int(iso[11:13]) + int(iso[14:16]) / 60
    jd = swe.julday(y, m, d, h)
    true = swe.get_ayanamsa_ex_ut(jd, swe.FLG_MOSEPH)[1]
    mean = swe.get_ayanamsa_ex_ut(jd, swe.FLG_MOSEPH | swe.FLG_NONUT)[1]
    rows.append({'utc': iso, 'true': round(true, 7), 'mean': round(mean, 7)})
print(json.dumps({'source': 'pyswisseph %s, SIDM_LAHIRI, get_ayanamsa_ex_ut (true = default, mean = FLG_NONUT)' % swe.version, 'rows': rows}, indent=1))
