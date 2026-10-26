# Independent BPHS ch.6 varga implementation on Swiss Ephemeris (Lahiri, mean node).
# Usage: venv/bin/python -I shodashvargaSwiss_ref.py out.json <engine-audit dir>. Output = golden/shodashvargaSwiss.json
# Rules re-implemented independently from BPHS ch. 6 (archive.org BrihatParasharaHoraSastra djvu text), not from our TS code.
import json, sys, swisseph as swe
EA=sys.argv[2] if len(sys.argv)>2 else 'engine-audit'  # folder holding the pyswisseph ephe/ files
swe.set_ephe_path(EA+'/ephe'); swe.set_sid_mode(swe.SIDM_LAHIRI)
F=swe.FLG_SWIEPH|swe.FLG_SIDEREAL
RAS=['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena']
CASES=[  # id, UTC y m d h mi, lat, lon  (round2/CONTEXT.md panel)
 ('P1',1996,8,31,7,34,26.8467,80.9462),   # 13:04 IST
 ('P3',1990,1,15,1,0,28.6139,77.2090),    # 06:30 IST
 ('P5',1992,6,10,13,20,51.5074,-0.1278),  # 14:20 BST
 ('P6',2001,12,24,21,0,-33.8688,151.2093),# 08:00 AEDT (+11)
 ('P9',1978,5,13,14,0,32.7266,74.8570),   # 19:30 IST
]
BODIES=dict(Sun=swe.SUN,Moon=swe.MOON,Mars=swe.MARS,Mercury=swe.MERCURY,Jupiter=swe.JUPITER,Venus=swe.VENUS,Saturn=swe.SATURN)
def mod(s): return s%3  # 0 movable,1 fixed,2 dual
def odd(s): return s%2==0
def varga(D,lon):
    s=int(lon//30); d=lon%30
    if D==1: return s
    if D==2: h=d<15; return 4 if (h if odd(s) else not h) else 3
    if D==3: return (s+4*int(d//10))%12
    if D==4: return (s+3*int(d//7.5))%12
    if D==7: return ((s if odd(s) else s+6)+int(d//(30/7)))%12
    if D==9: return ((s,s+8,s+4)[mod(s)]+int(d//(30/9)))%12
    if D==10: return ((s if odd(s) else s+8)+int(d//3))%12
    if D==12: return (s+int(d//2.5))%12
    if D==16: return ((0,4,8)[mod(s)]+int(d//(30/16)))%12
    if D==20: return ((0,8,4)[mod(s)]+int(d//1.5))%12
    if D==24: return ((4 if odd(s) else 3)+int(d//1.25))%12
    if D==27: return ((0,3,6,9)[s%4]+int(d//(30/27)))%12
    if D==30:
        if odd(s):
            for lim,r in ((5,0),(10,10),(18,8),(25,2),(30,6)):
                if d<lim: return r
        else:
            for lim,r in ((5,1),(12,5),(20,11),(25,9),(30,7)):
                if d<lim: return r
    if D==40: return ((0 if odd(s) else 6)+int(d//0.75))%12
    if D==45: return ((0,4,8)[mod(s)]+int(d//(30/45)))%12
    if D==60: return (s+int(d*2)%12)%12
DIVS=[1,2,3,4,7,9,10,12,16,20,24,27,30,40,45,60]
BOUND={1:[30],2:[15],3:[10],4:[7.5],7:[30/7],9:[30/9],10:[3],12:[2.5],16:[30/16],20:[1.5],24:[1.25],27:[30/27],40:[0.75],45:[30/45],60:[0.5]}
def margin(D,lon):
    d=lon%30
    if D==30:
        cuts=[0,5,10,18,25,30] if odd(int(lon//30)) else [0,5,12,20,25,30]
        return min(abs(d-c) for c in cuts)
    w=BOUND[D][0]; r=d%w; return min(r,w-r)
out=[]
for cid,y,m,dd,h,mi,lat,lon in CASES:
    jd=swe.julday(y,m,dd,h+mi/60)
    L={k:swe.calc_ut(jd,b,F)[0][0] for k,b in BODIES.items()}
    L['Rahu']=swe.calc_ut(jd,swe.MEAN_NODE,F)[0][0]; L['Ketu']=(L['Rahu']+180)%360
    L['Lagna']=swe.houses_ex(jd,lat,lon,b'W',F)[1][0]
    rec={'id':cid,'lons':{k:round(v,5) for k,v in L.items()},'vargas':{}}
    for D in DIVS:
        rec['vargas']['D%d'%D]={p:{'sign':RAS[varga(D,v)],'marginDeg':round(margin(D,v),5)} for p,v in L.items()}
    out.append(rec)
json.dump(out,open(sys.argv[1],'w'),indent=1)
print('ok',len(out))
