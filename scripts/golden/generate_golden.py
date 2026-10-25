#!/usr/bin/env python3
"""
Golden-chart reference generator (BornClock accuracy safeguard, Oct 2026).

Produces src/lib/vedic/__tests__/golden/goldenCharts.json — the stored reference
that the golden vitest suite (src/lib/vedic/__tests__/goldenCharts.test.ts) and the
weekly drift check (scripts/golden/driftCheck.ts) compare BornClock against.

INDEPENDENT of the TypeScript engine: every position here comes from the Swiss
Ephemeris (pyswisseph, ephemeris files sepl_18/semo_18/seas_18), never from
BornClock code. Derived values (houses, D9, Manglik, Kaal Sarp, Vimshottari Dasha,
Sade Sati) are the published rules applied to those Swiss positions; the rule and
its source are recorded in the JSON "sources" block. AstroSage values (Guna Milan
totals, Manglik levels) are the ones recorded by hand on astrosage.com on
17 Oct 2026 in the Round 2 audit — they are copied in, never computed.

Usage:
  python3 scripts/golden/generate_golden.py <path-to-swiss-ephe-dir> > src/lib/vedic/__tests__/golden/goldenCharts.json
Requires: pip install pyswisseph==2.10.03 (Python 3.9+ for zoneinfo).
"""
import datetime as dt
import json
import sys
import zoneinfo

import swisseph as swe

EPHE = sys.argv[1] if len(sys.argv) > 1 else './ephe'
swe.set_ephe_path(EPHE)
swe.set_sid_mode(swe.SIDM_LAHIRI)

REF_DATE = dt.datetime(2026, 10, 24, 0, 0, tzinfo=dt.timezone.utc)

RAS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena']
NAK = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
       'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
       'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada',
       'Uttara Bhadrapada', 'Revati']
BODIES = dict(Sun=swe.SUN, Moon=swe.MOON, Mars=swe.MARS, Mercury=swe.MERCURY, Jupiter=swe.JUPITER,
              Venus=swe.VENUS, Saturn=swe.SATURN, Rahu=swe.MEAN_NODE)
ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']
DASHA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury']
DASHA_YEARS = dict(Ketu=7, Venus=20, Sun=6, Moon=10, Mars=7, Rahu=18, Jupiter=16, Saturn=19, Mercury=17)
YEAR_DAYS = 365.25

# ── Births ──────────────────────────────────────────────────────────────────
# P1–P10: the standard 10-person audit panel (scratchpad round2/CONTEXT.md).
# G11–G20: edge cases chosen for this suite. Boundary cases were found by scanning
# the Swiss Moon/Ascendant for a minute just past a boundary (margins recorded below).
BIRTHS = [
    ('P1', 'Suchit (panel)', '1996-08-31T13:04', 'Asia/Kolkata', 26.8467, 80.9462, 'Lucknow', 'panel'),
    ('P2', 'Sukriti (panel)', '1999-12-03T11:03', 'America/Detroit', 42.6389, -83.2910, 'Pontiac MI', 'panel; US, winter (EST)'),
    ('P3', 'Panel P3', '1990-01-15T06:30', 'Asia/Kolkata', 28.6139, 77.2090, 'New Delhi', 'panel'),
    ('P4', 'Panel P4', '1985-07-20T23:45', 'Asia/Kolkata', 19.0760, 72.8777, 'Mumbai', 'panel; late-night birth'),
    ('P5', 'Panel P5', '1992-06-10T14:20', 'Europe/London', 51.5074, -0.1278, 'London', 'panel; UK summer time (BST)'),
    ('P6', 'Panel P6', '2001-12-25T08:00', 'Australia/Sydney', -33.8688, 151.2093, 'Sydney', 'panel; southern hemisphere, DST (local date ahead of UTC date)'),
    ('P7', 'Panel P7', '2002-05-14T16:45', 'America/New_York', 40.5187, -74.4121, 'Edison NJ', 'panel; US DST (EDT)'),
    ('P8', 'Panel P8', '1995-02-10T21:40', 'Australia/Melbourne', -37.8136, 144.9631, 'Melbourne', 'panel; southern hemisphere, DST'),
    ('P9', 'Founder test chart (panel)', '1978-05-13T19:30', 'Asia/Kolkata', 32.7266, 74.8570, 'Jammu', 'panel'),
    ('P10', 'Child (panel)', '2024-03-10T09:15', 'Asia/Kolkata', 12.9716, 77.5946, 'Bengaluru', 'panel; a child (born 2024)'),
    ('G11', 'Moon just past a sign boundary', '2003-04-10T13:09', 'Asia/Kolkata', 25.5941, 85.1376, 'Patna', 'Moon 0.037° into Karka (≈133″ past the Mithuna/Karka cusp)'),
    ('G12', 'Moon just past a nakshatra boundary', '1987-09-03T10:20', 'Asia/Kolkata', 13.0827, 80.2707, 'Chennai', 'Moon 0.031° into Purva Ashadha pada 1 (≈110″ past the Mula boundary)'),
    ('G13', 'Lagna just past a sign boundary', '1999-11-20T10:33', 'Asia/Kolkata', 17.3850, 78.4867, 'Hyderabad', 'Ascendant 0.25° into Makara (≈1 minute of clock time)'),
    ('G14', 'Southern hemisphere (Africa)', '1988-09-22T05:15', 'Africa/Johannesburg', -26.2041, 28.0473, 'Johannesburg', 'southern hemisphere, pre-dawn'),
    ('G15', 'High latitude (Arctic, polar night)', '1999-12-15T12:00', 'Europe/Oslo', 69.6492, 18.9553, 'Tromsø', 'latitude 69.6°N, above the Arctic Circle'),
    ('G16', 'Pre-1950 India (war-time time)', '1943-08-15T10:00', 'Asia/Kolkata', 22.5726, 88.3639, 'Kolkata', 'pre-1950 India; IANA gives UTC+6:30 (1942–45 war time)'),
    ('G17', 'US summer time (EDT)', '1975-07-04T21:30', 'America/New_York', 40.7128, -74.0060, 'New York', 'US DST (EDT, UTC−4)'),
    ('G18', 'UK British Standard Time (1968–71)', '1970-02-01T08:00', 'Europe/London', 51.5074, -0.1278, 'London', 'UK winter but UTC+1 (British Standard Time experiment)'),
    ('G19', 'US DST start day', '2007-03-11T03:30', 'America/Chicago', 41.8781, -87.6298, 'Chicago', '30 min after the 2007 spring-forward (CDT, UTC−5)'),
    ('G20', 'Child (born 2021)', '2021-06-05T07:10', 'Asia/Kolkata', 17.3850, 78.4867, 'Hyderabad', 'a child (born 2021)'),
]
# Extra births used only by the AstroSage couples (round2/M/run3.mts).
COUPLE_BIRTHS = [
    ('Y1', 'Couple-only: Moon late Sagittarius', '1994-11-08T06:00', 'Asia/Kolkata', 28.6139, 77.2090, 'New Delhi', 'AstroSage couple Y1'),
    ('Y3', 'Couple-only: Moon Scorpio', '1994-11-05T12:00', 'Asia/Kolkata', 28.6139, 77.2090, 'New Delhi', 'AstroSage couple Y3'),
]

# AstroSage Manglik column, recorded on astrosage.com 17 Oct 2026 (round2.txt
# "Manglik: BornClock vs AstroSage"). "No" = not Manglik.
ASTROSAGE_MANGLIK = dict(P1='None', P2='High', P3='High', P4='Low', P6='None', P7='Low', P8='Low', P9='Low', Y1='Low', Y3='Low')

# AstroSage Guna Milan, boy first (round2.txt "Matching and Manglik vs AstroSage",
# entered on astrosage.com 17 Oct 2026). Per-koota values only where the audit wrote them.
COUPLES = [
    ('P1', 'P2', 12.5, dict(vashya=0.5, yoni=1, gana=0)),
    ('P3', 'P4', 30, {}),
    ('P9', 'P3', 17.5, dict(yoni=3, gana=6)),
    ('P7', 'P8', 28, {}),
    ('P6', 'P8', 23.5, dict(yoni=2)),
    ('Y1', 'P3', 17, dict(vashya=0)),
    ('Y3', 'P2', 7.5, dict(yoni=1, gana=0)),
]


def ayan(jd):
    """Site convention: Swiss SIDM_LAHIRI mean (no nutation) + 24.4″ (ayanamsaDrik.test.ts)."""
    return swe.get_ayanamsa_ex_ut(jd, swe.FLG_SWIEPH | swe.FLG_NONUT)[1] + 24.4 / 3600


def jd_of_utc(t):
    return swe.julday(t.year, t.month, t.day, t.hour + t.minute / 60 + t.second / 3600)


def iso_of_jd(jd):
    y, m, d, h = swe.revjul(jd)
    base = dt.datetime(y, m, d, tzinfo=dt.timezone.utc) + dt.timedelta(hours=h)
    return base.replace(microsecond=0).isoformat().replace('+00:00', 'Z')


def sid(jd, body):
    return (swe.calc_ut(jd, body, swe.FLG_SWIEPH)[0][0] - ayan(jd)) % 360


def ascendant(jd, lat, lon):
    return (swe.houses_ex(jd, lat, lon, b'W')[1][0] - ayan(jd)) % 360


def nak_pada(lon):
    span = 360 / 27
    n = int(lon // span)
    return NAK[n], int((lon % span) // (span / 4)) + 1


def navamsa(lon):
    return RAS[int(lon // (30 / 9)) % 12]


def to_boundary_arcsec(lon, step):
    r = lon % step
    return round(min(r, step - r) * 3600, 1)


def vimshottari(jd_birth, moon):
    span = 360 / 27
    n = int(moon // span)
    frac = (moon % span) / span
    li = n % 9
    start = jd_birth - frac * DASHA_YEARS[DASHA_LORDS[li]] * YEAR_DAYS
    mds, cur = [], start
    for i in range(9):
        lord = DASHA_LORDS[(li + i) % 9]
        end = cur + DASHA_YEARS[lord] * YEAR_DAYS
        ads, a = [], cur
        for j in range(9):
            sub = DASHA_LORDS[(DASHA_LORDS.index(lord) + j) % 9]
            ae = a + DASHA_YEARS[lord] * DASHA_YEARS[sub] / 120 * YEAR_DAYS
            ads.append((sub, a, ae))
            a = ae
        mds.append((lord, cur, end, ads))
        cur = end
    return mds


def saturn_sign(jd):
    return int(sid(jd, swe.SATURN) // 30)


def saturn_ingresses(jd_from, jd_to):
    out, step = [], 1.0
    jd, s = jd_from, saturn_sign(jd_from)
    while jd < jd_to:
        nj = jd + step
        ns = saturn_sign(nj)
        if ns != s:
            a, b = jd, nj
            for _ in range(40):
                m = (a + b) / 2
                if saturn_sign(m) == s:
                    a = m
                else:
                    b = m
            out.append(dict(at=iso_of_jd(b), jd=b, fromSign=RAS[s], toSign=RAS[ns], from_i=s, to_i=ns))
            s = ns
        jd = nj
    return out


def sade_sati_cycles(moon_sign, ingresses, sign_at_start):
    """Rule: Sade Sati = Saturn transiting the 12th, 1st or 2nd sign from the natal Moon.
    A cycle runs from first entry into that set to final exit; gaps < 3 years (retrograde
    loops) are pauses inside the cycle (same definition BornClock states on its page)."""
    s12, s1, s2 = (moon_sign + 11) % 12, moon_sign, (moon_sign + 1) % 12
    inset = lambda s: s in (s12, s1, s2)
    stays, open_ = [], (None if not inset(sign_at_start) else 'pre')
    for e in ingresses:
        was, isin = inset(e['from_i']), inset(e['to_i'])
        if not was and isin:
            open_ = e['jd']
        elif was and not isin and open_ is not None:
            if open_ != 'pre':
                stays.append([open_, e['jd']])
            open_ = None
    cycles = []
    for st in stays:
        if cycles and st[0] - cycles[-1]['end'] < 3 * YEAR_DAYS:
            cycles[-1]['pauses'].append([cycles[-1]['end'], st[0]])
            cycles[-1]['end'] = st[1]
        else:
            cycles.append(dict(start=st[0], end=st[1], pauses=[]))
    return [dict(start=iso_of_jd(c['start']), end=iso_of_jd(c['end']),
                 pauses=[dict(start=iso_of_jd(p[0]), end=iso_of_jd(p[1])) for p in c['pauses']]) for c in cycles]


def chart(entry, ref_jd):
    cid, label, local, tz, lat, lon, place, edge = entry
    loc = dt.datetime.fromisoformat(local).replace(tzinfo=zoneinfo.ZoneInfo(tz))
    utc = loc.astimezone(dt.timezone.utc)
    jd = jd_of_utc(utc)
    lons = {k: sid(jd, b) for k, b in BODIES.items()}
    lons['Ketu'] = (lons['Rahu'] + 180) % 360
    asc = ascendant(jd, lat, lon)
    lagna_i = int(asc // 30)
    sign_i = {k: int(v // 30) for k, v in lons.items()}
    moon_nak, moon_pada = nak_pada(lons['Moon'])

    # Manglik — AstroSage convention (founder decision): Mars from Lagna and from Moon, houses 1,4,7,8,12.
    h_l = (sign_i['Mars'] - lagna_i) % 12 + 1
    h_m = (sign_i['Mars'] - sign_i['Moon']) % 12 + 1
    fl, fm = h_l in (1, 4, 7, 8, 12), h_m in (1, 4, 7, 8, 12)
    level = 'High' if fl and fm else 'Low' if (fl or fm) else 'None'

    # Kaal Sarp — FULL only: all 7 classical planets strictly on one side of the Rahu–Ketu axis by degree.
    offs = [(lons[p] - lons['Rahu']) % 360 for p in ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']]
    ksd = all(0 < o < 180 for o in offs) or all(180 < o < 360 for o in offs)
    ksd_margin = min(min(abs(o), abs(o - 180), abs(360 - o)) for o in offs)

    mds = vimshottari(jd, lons['Moon'])
    cur_md = next(m for m in mds if m[1] <= ref_jd < m[2])
    cur_ad = next(a for a in cur_md[3] if a[1] <= ref_jd < a[2])

    sat_ref = saturn_sign(ref_jd)
    house_from_moon = (sat_ref - sign_i['Moon']) % 12 + 1
    phase = {12: 'Rising (12th from Moon)', 1: 'Peak (on Moon sign)', 2: 'Setting (2nd from Moon)'}.get(house_from_moon)

    out = dict(
        id=cid, label=label, edgeCase=edge,
        birth=dict(local=local, tz=tz, lat=lat, lon=lon, place=place),
        utc=utc.isoformat().replace('+00:00', 'Z'),
        expected=dict(
            lagna=RAS[lagna_i],
            moonSign=RAS[sign_i['Moon']],
            nakshatra=moon_nak, pada=moon_pada,
            planets={p: RAS[sign_i[p]] for p in ORDER},
            d9=dict(Lagna=navamsa(asc), **{p: navamsa(lons[p]) for p in ORDER}),
            dashaAtRef=dict(mahadasha=cur_md[0], mahadashaStart=iso_of_jd(cur_md[1]), mahadashaEnd=iso_of_jd(cur_md[2]),
                            antardasha=cur_ad[0], antardashaStart=iso_of_jd(cur_ad[1]), antardashaEnd=iso_of_jd(cur_ad[2])),
            mahadashas=[dict(lord=m[0], start=iso_of_jd(m[1]), end=iso_of_jd(m[2])) for m in mds],
            antardashasOfRefMahadasha=[dict(lord=a[0], start=iso_of_jd(a[1]), end=iso_of_jd(a[2])) for a in cur_md[3]],
            manglik=dict(fromLagna=fl, fromMoon=fm, level=level, marsHouseFromLagna=h_l, marsHouseFromMoon=h_m),
            kaalSarpFull=ksd,
            sadeSatiAtRef=dict(active=phase is not None, phase=phase),
        ),
        swiss=dict(
            ascendant=round(asc, 4),
            longitudes={p: round(lons[p], 4) for p in ORDER},
            margins=dict(
                moonSignArcsec=to_boundary_arcsec(lons['Moon'], 30),
                moonPadaArcsec=to_boundary_arcsec(lons['Moon'], 360 / 108),
                lagnaSignArcsec=to_boundary_arcsec(asc, 30),
                kaalSarpClosestPlanetToAxisDeg=round(ksd_margin, 3),
            ),
        ),
        refs=dict(
            birth='PANEL' if cid.startswith('P') else ('COUPLE_BIRTHS' if cid.startswith('Y') else 'EDGE_BIRTHS'),
            utc='IANA', lagna='SWISS', moonSign='SWISS', nakshatra='SWISS', pada='SWISS', planets='SWISS', d9='SWISS+D9_RULE',
            dashaAtRef='SWISS+VIMSHOTTARI', mahadashas='SWISS+VIMSHOTTARI', antardashasOfRefMahadasha='SWISS+VIMSHOTTARI',
            manglik='SWISS+MANGLIK_RULE', kaalSarpFull='SWISS+KAAL_SARP_RULE', sadeSatiAtRef='SWISS+SADE_SATI_RULE',
        ),
    )
    if cid in ASTROSAGE_MANGLIK:
        out['expected']['manglik']['astrosageLevel'] = ASTROSAGE_MANGLIK[cid]
        out['refs']['manglik.astrosageLevel'] = 'ASTROSAGE_2026_10_17'
    return out


def main():
    ref_jd = jd_of_utc(REF_DATE)
    jd_from, jd_to = swe.julday(1930, 1, 1, 0), swe.julday(2075, 1, 1, 0)
    ings = saturn_ingresses(jd_from, jd_to)
    first_sign = saturn_sign(jd_from)
    cycles = {RAS[m]: sade_sati_cycles(m, ings, first_sign) for m in range(12)}
    charts = [chart(b, ref_jd) for b in BIRTHS]
    couple_charts = [chart(b, ref_jd) for b in COUPLE_BIRTHS]
    disagreements = [c['id'] for c in charts + couple_charts
                     if 'astrosageLevel' in c['expected']['manglik']
                     and c['expected']['manglik']['astrosageLevel'] != c['expected']['manglik']['level']]
    doc = dict(
        _about='Golden reference charts for BornClock. Generated by scripts/golden/generate_golden.py from the Swiss '
               'Ephemeris and hand-recorded AstroSage values — never from BornClock code. Do not edit by hand; '
               're-run the generator. Each chart lists the source of every expected field in "refs" (keys of "sources").',
        generatedWith=f'pyswisseph {swe.version}, ephemeris sepl_18/semo_18/seas_18',
        referenceDate=REF_DATE.isoformat().replace('+00:00', 'Z'),
        sources=dict(
            PANEL='Standard 10-person audit panel (Round 2 audit, scratchpad round2/CONTEXT.md, 17 Oct 2026).',
            EDGE_BIRTHS='Edge-case births chosen for this suite (Oct 2026); boundary times found by scanning the Swiss Ephemeris. Margins to the nearest boundary are in swiss.margins.',
            COUPLE_BIRTHS='Extra births used in the AstroSage couples (Round 2 audit probe round2/M/run3.mts).',
            IANA='Local time → UTC via the IANA tz database (Python zoneinfo), e.g. Asia/Kolkata 1942–45 = UTC+6:30, Europe/London 1968–71 = UTC+1.',
            SWISS='Swiss Ephemeris (pyswisseph 2.10.03, swe.calc_ut apparent geocentric positions; Ascendant from swe.houses_ex). '
                  'Sidereal = tropical − (SIDM_LAHIRI mean ayanamsa, FLG_NONUT, + 24.4″), the Drik Panchang calibration BornClock uses '
                  '(src/lib/vedic/__tests__/ayanamsaDrik.test.ts). Rahu = mean node, Ketu = Rahu + 180°. Whole-sign houses.',
            D9_RULE='Navamsa (D9): sign = floor(sidereal longitude / 3°20′) mod 12 (BPHS Ch. 6; same as Drik/AstroSage).',
            VIMSHOTTARI='Vimshottari Dasha (BPHS Ch. 46): balance from the Moon\'s position in its nakshatra; periods Ke7 Ve20 Su6 Mo10 Ma7 Ra18 Ju16 Sa19 Me17; '
                        'antardasha = MD years × AD years / 120; year = 365.25 days (the year length BornClock uses; AstroSage per-chart dasha dates were not recorded, so these dates are Swiss-derived only).',
            MANGLIK_RULE='Manglik, AstroSage convention (founder decision Oct 2026): Mars in whole-sign house 1, 4, 7, 8 or 12 from the Lagna and, separately, from the Moon; both = High, one = Low, none = None. Cancellations are not applied to the level (AstroSage does not).',
            ASTROSAGE_2026_10_17='Entered by hand on astrosage.com on 17 Oct 2026 and recorded in the Round 2 audit (scratchpad round2.txt, "Matching and Manglik vs AstroSage").',
            KAAL_SARP_RULE='Full Kaal Sarp only (founder decision Oct 2026): all seven planets Sun–Saturn strictly between Rahu and Ketu by longitude, on one side. Partial patterns are not "present".',
            SADE_SATI_RULE='Sade Sati = Saturn transiting the 12th, 1st or 2nd sign from the natal Moon sign (Rising / Peak / Setting). Cycles = first entry to final exit; gaps under 3 years (retrograde loops) are pauses inside one cycle. Saturn ingress moments from the Swiss Ephemeris (saturnIngresses).',
            PANCHANG_TESTS='Panchang and festival dates are checked against Drik Panchang in the existing suites listed in panchangReferences (values fetched from drikpanchang.com, cited in each file).',
        ),
        astrosageManglikDisagreesWithRule=disagreements,
        charts=charts,
        coupleBirths=couple_charts,
        couples=[dict(boy=b, girl=g, astrosageTotal=t, astrosageKootas=k, ref='ASTROSAGE_2026_10_17') for b, g, t, k in COUPLES],
        saturnIngresses=[dict(at=i['at'], fromSign=i['fromSign'], toSign=i['toSign']) for i in ings],
        sadeSatiCyclesByMoonSign=cycles,
        panchangReferences=[
            'src/lib/vedic/__tests__/ayanamsaDrik.test.ts',
            'src/lib/vedic/__tests__/festivals.test.ts',
            'src/lib/vedic/__tests__/panchang.test.ts',
            'src/lib/vedic/__tests__/panchangDay.test.ts',
            'src/lib/vedic/__tests__/sadeSatiEphemeris.test.ts',
        ],
    )
    json.dump(doc, sys.stdout, indent=1, ensure_ascii=False)
    sys.stdout.write('\n')


if __name__ == '__main__':
    main()
