# Independent Swiss Ephemeris reference for Batch 10 Chalit / KP / Jaimini.
# pyswisseph 2.10.03, ephe files from engine-audit/ephe. Written from definitions, NOT from the TS code.
import json, sys, swisseph as swe
swe.set_ephe_path(sys.argv[1])
OUT = sys.argv[2]
CASES = {
 'P1': (1996,8,31,7,34, 26.8467, 80.9462),
 'P2': (1999,12,3,16,3, 42.6389, -83.2910),
 'P3': (1990,1,15,1,0, 28.6139, 77.2090),
 'P4': (1985,7,20,18,15, 19.0760, 72.8777),
 'P5': (1992,6,10,13,20, 51.5074, -0.1278),
 'P6': (2001,12,24,21,0, -33.8688, 151.2093),
 'P7': (2002,5,14,20,45, 40.5187, -74.4121),
 'P8': (1995,2,10,10,40, -37.8136, 144.9631),
 'P9': (1978,5,13,14,0, 32.7266, 74.8570),
 'P10': (2024,3,10,3,45, 12.9716, 77.5946),
 'CH': (1996,12,7,5,4, 13.0878, 80.2785),
}
PL = [('Sun',swe.SUN),('Moon',swe.MOON),('Mars',swe.MARS),('Mercury',swe.MERCURY),('Jupiter',swe.JUPITER),('Venus',swe.VENUS),('Saturn',swe.SATURN),('Rahu',swe.MEAN_NODE)]
LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury']
YRS = dict(Ketu=7,Venus=20,Sun=6,Moon=10,Mars=7,Rahu=18,Jupiter=16,Saturn=19,Mercury=17)
SIGN_LORD = ['Mars','Venus','Mercury','Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn','Saturn','Jupiter']
NAK = 360/27
def kp_lords(lon):
    n = int(lon // NAK); start = n*NAK; star = LORDS[n % 9]
    i0 = n % 9; cur = start
    for k in range(9):
        L = LORDS[(i0+k) % 9]; span = NAK*YRS[L]/120
        if lon < cur + span or k == 8:
            j0 = LORDS.index(L); c2 = cur
            for m in range(9):
                L2 = LORDS[(j0+m) % 9]; s2 = span*YRS[L2]/120
                if lon < c2 + s2 or m == 8:
                    return dict(sign=SIGN_LORD[int(lon//30)], star=star, sub=L, subsub=L2)
                c2 += s2
        cur += span
def positions(jd, mode):
    swe.set_sid_mode(mode)
    F = swe.FLG_SWIEPH | swe.FLG_SIDEREAL
    d = {n: swe.calc_ut(jd, b, F)[0][0] for n, b in PL}
    d['Ketu'] = (d['Rahu'] + 180) % 360
    return d
def in_arc(x, a, b):
    return (x - a) % 360 < (b - a) % 360
res = {}
for cid, (y,m,dd,h,mi,lat,lon) in CASES.items():
    jd = swe.julday(y,m,dd,h+mi/60)
    r = {}
    # --- Bhava Chalit (Sripati): Porphyry cusps = bhava madhya, Swiss 'S' = bhava sandhi (start)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    O = list(swe.houses_ex(jd, lat, lon, b'O', swe.FLG_SIDEREAL)[0])
    S = list(swe.houses_ex(jd, lat, lon, b'S', swe.FLG_SIDEREAL)[0])
    lah = positions(jd, swe.SIDM_LAHIRI)
    asc = O[0]
    bh = {}
    for n, L in lah.items():
        for i in range(12):
            if in_arc(L, S[i], S[(i+1) % 12]): bh[n] = i+1
    rasi_house = {n: ((int(L//30) - int(asc//30)) % 12) + 1 for n, L in lah.items()}
    r['chalit'] = dict(madhya=O, sandhi=S, bhava=bh, rasiHouse=rasi_house)
    r['lahiri'] = lah
    # --- KP: Placidus, SIDM_KRISHNAMURTI
    swe.set_sid_mode(swe.SIDM_KRISHNAMURTI)
    P = list(swe.houses_ex(jd, lat, lon, b'P', swe.FLG_SIDEREAL)[0])
    kp = positions(jd, swe.SIDM_KRISHNAMURTI)
    occ = {}
    for n, L in kp.items():
        for i in range(12):
            if in_arc(L, P[i], P[(i+1) % 12]): occ[n] = i+1
    # 4-level significators per house (KP standard)
    star_of = {n: kp_lords(L)['star'] for n, L in kp.items()}
    sig = {}
    for hno in range(1, 13):
        occupants = [n for n in kp if occ[n] == hno]
        owner = SIGN_LORD[int(P[hno-1]//30)]
        l1 = [n for n in kp if star_of[n] in occupants]
        l3 = [n for n in kp if star_of[n] == owner]
        sig[hno] = dict(L1=sorted(l1), L2=sorted(occupants), L3=sorted(l3), L4=[owner])
    r['kp'] = dict(cusps=P, cuspLords=[kp_lords(c) for c in P], planets=kp, planetLords={n: kp_lords(L) for n, L in kp.items()}, occupancy=occ, significators=sig,
                   ayanamsaKP=swe.get_ayanamsa_ex_ut(jd, swe.FLG_SWIEPH | swe.FLG_NONUT)[1])
    # --- Jaimini 7 chara karakas (Sun..Saturn, Rahu excluded), by degree within sign, Lahiri
    seven = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']
    order = sorted(seven, key=lambda n: lah[n] % 30, reverse=True)
    names = ['AK','AmK','BK','MK','PK','GK','DK']
    ak = order[0]; L = lah[ak]; si = int(L//30); part = int((L % 30)//(30/9))
    start = [0,9,6,3][si % 4]  # movable from itself, fixed from 9th, dual from 5th (= Aries/Capricorn/Libra/Cancer cycle)
    r['jaimini'] = dict(karakas=dict(zip(names, order)), degInSign={n: lah[n] % 30 for n in seven}, karakamshaSign=(start + part) % 12)
    res[cid] = r
json.dump(res, open(OUT, 'w'), indent=1)
# KP 249 table: boundaries where sign, star or sub changes
pts = set([i*30 for i in range(12)])
for n in range(27):
    cur = n*NAK; i0 = n % 9
    for k in range(9):
        pts.add(round(cur, 10)); cur += NAK*YRS[LORDS[(i0+k) % 9]]/120
pts = sorted(p for p in pts if p < 360 - 1e-9)
table = []
for p in pts:
    l = kp_lords(p + 1e-7)
    table.append(dict(start=p, sign=l['sign'], star=l['star'], sub=l['sub']))
json.dump(table, open(OUT.replace('.json', '-249.json'), 'w'), indent=0)
print('cases', len(res), 'kp table rows', len(table))
