# B21 — Raman, Krishnamurti (KP) and tropical (Sayana) positions from the Swiss Ephemeris for the 22
# golden births: Sun … Saturn, Rahu (mean node) and the Ascendant, as BornClock's natal chart computes
# them (apparent geocentric longitude − the chosen ayanamsa incl. nutation; Ascendant from houses_ex).
# Usage: python3 -I ayanamsaSwiss_ref.py <ephe dir> goldenCharts.json out.json   (pyswisseph 2.10.03)
import json, sys
from datetime import datetime
from zoneinfo import ZoneInfo
import swisseph as swe
swe.set_ephe_path(sys.argv[1])
golden = json.load(open(sys.argv[2]))
BODIES = dict(Sun=swe.SUN, Moon=swe.MOON, Mars=swe.MARS, Mercury=swe.MERCURY, Jupiter=swe.JUPITER, Venus=swe.VENUS, Saturn=swe.SATURN, Rahu=swe.MEAN_NODE)
MODES = {'raman': swe.SIDM_RAMAN, 'kp': swe.SIDM_KRISHNAMURTI, 'tropical': None}
out = []
for g in golden['charts'] + golden['coupleBirths']:
    b = g['birth']
    local = datetime.fromisoformat(b['local']).replace(tzinfo=ZoneInfo(b['tz']))
    u = local.astimezone(ZoneInfo('UTC'))
    jd = swe.julday(u.year, u.month, u.day, u.hour + u.minute / 60 + u.second / 3600)
    rec = {'id': g['id'], 'utc': u.strftime('%Y-%m-%dT%H:%M:%SZ'), 'lat': b['lat'], 'lon': b['lon']}
    for mode, sid in MODES.items():
        if sid is None:
            ay = 0.0
        else:
            swe.set_sid_mode(sid)
            ay = swe.get_ayanamsa_ex_ut(jd, swe.FLG_SWIEPH)[1]
        pos = {k: (swe.calc_ut(jd, v, swe.FLG_SWIEPH)[0][0] - ay) % 360 for k, v in BODIES.items()}
        pos['Lagna'] = (swe.houses_ex(jd, max(-66.0, min(66.0, b['lat'])), b['lon'], b'W')[1][0] - ay) % 360
        rec[mode] = {k: round(v, 6) for k, v in pos.items()}
        rec[mode + 'Ayanamsa'] = round(ay, 6)
    out.append(rec)
json.dump({'source': f'pyswisseph {swe.version}', 'births': out}, open(sys.argv[3], 'w'), indent=0)
print(len(out))
