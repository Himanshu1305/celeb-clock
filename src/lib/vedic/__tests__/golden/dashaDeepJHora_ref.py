# Deep Vimshottari Dasha reference from PyJHora (open-source Jyotish library on Swiss Ephemeris).
# Usage: <venv with PyJHora 5.0.6>/bin/python -I dashaDeepJHora_ref.py goldenCharts.json out.json
#
# For each of the 22 golden births, PyJHora (Lahiri) gives the Mahadasha sequence. We take the
# Mahadasha running at the golden reference date and ask PyJHora for its nine children, then the
# children of the child running at the reference date, and so on down to Prana (level 5).
# Recorded: every child (lord, start, end) at levels 2-5 = 36 periods per birth, plus PyJHora's
# Mahadasha lords + starts (UTC) so the engine's own Mahadasha timeline can be compared too.
import json, sys
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
import swisseph as swe
from jhora.panchanga import drik
from jhora.horoscope.dhasa.graha import vimsottari as v
from jhora import utils, const

LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']
drik.set_ayanamsa_mode('LAHIRI')
# PyJHora's default dasha year is the TRUE tropical year (periods follow the Sun's real motion, so
# sub-periods are not exact fractions of the parent). The classical rule — and BornClock's — is a
# fixed year with each sub-period an exact fraction (years/120) of its parent: MEAN_SIDEREAL_YEAR.
YEAR = const.DHASA_YEAR_DURATION.MEAN_SIDEREAL_YEAR
const.dhasa_year_duration_default = YEAR
golden = json.load(open(sys.argv[1]))
ref_utc = datetime.fromisoformat(golden['referenceDate'].replace('Z', '+00:00'))


def jd_of(dt):  # dt naive local
    return swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute / 60 + dt.second / 3600)


def iso(jd_local, tz_hours):  # PyJHora works in local-time JD; convert to UTC ISO (to the second)
    y, m, d, h = swe.revjul(jd_local - tz_hours / 24)
    sec = round(h * 3600)
    base = datetime(y, m, d, tzinfo=timezone.utc).timestamp() + sec
    return datetime.fromtimestamp(base, timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')


out = []
for g in golden['charts'] + golden['coupleBirths']:
    b = g['birth']
    local = datetime.fromisoformat(b['local'])
    tzh = ZoneInfo(b['tz']).utcoffset(local).total_seconds() / 3600
    # PyJHora also computes a Placidus ascendant, which Swiss Ephemeris cannot do above the polar
    # circle (G15 Tromsø). The Dasha depends only on the (geocentric) Moon, so latitude is capped.
    place = drik.Place(b.get('place', g['id']), max(-66.0, min(66.0, b['lat'])), b['lon'], tzh)
    jd = jd_of(local)
    ref_local = jd_of(ref_utc.astimezone(ZoneInfo(b['tz'])).replace(tzinfo=None))
    mahas = list(v.vimsottari_mahadasa(jd, place).items())
    # the Mahadasha running at the reference date
    i = max(k for k, (_, s) in enumerate(mahas) if s <= ref_local)
    lord, s = mahas[i]
    e = mahas[i + 1][1]
    rec = {'id': g['id'], 'tzHours': tzh,
           'mahas': [[LORDS[l], iso(sj, tzh)] for l, sj in mahas],
           'path': [{'lord': LORDS[lord], 'start': iso(s, tzh), 'end': iso(e, tzh)}], 'levels': []}
    parent, ps, pe = lord, utils.jd_to_gregorian(s), utils.jd_to_gregorian(e)
    for level in range(2, 6):
        kids = v.get_immediate_children(parent, ps, parent_end=pe, place=place, jd_at_dob=jd, dhasa_duration_type=YEAR)
        rows = [[LORDS[k[0][-1]], iso(utils._tuple_to_jd(k[1]), tzh), iso(utils._tuple_to_jd(k[2]), tzh)] for k in kids]
        rec['levels'].append(rows)
        run = next(k for k in kids if utils._tuple_to_jd(k[1]) <= ref_local < utils._tuple_to_jd(k[2]))
        parent, ps, pe = run[0], run[1], run[2]
        rec['path'].append({'lord': LORDS[run[0][-1]], 'start': iso(utils._tuple_to_jd(run[1]), tzh), 'end': iso(utils._tuple_to_jd(run[2]), tzh)})
    out.append(rec)

json.dump({'source': 'PyJHora 5.0.6 (Lahiri, Swiss Ephemeris, mean sidereal year), vimsottari.get_immediate_children',
           'referenceDate': golden['referenceDate'], 'births': out}, open(sys.argv[2], 'w'), indent=1)
print(len(out), 'births;', sum(len(l) for r in out for l in r['levels']), 'periods')
