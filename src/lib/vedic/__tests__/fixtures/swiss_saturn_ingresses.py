# Swiss Ephemeris (pyswisseph) Saturn sign ingresses in BornClock's documented Lahiri convention
# (src/lib/vedic/engine/vedicEngine.ts, calibrated to Drik Panchang): apparent tropical longitude
# (true equinox of date) minus Swiss SIDM_LAHIRI MEAN ayanamsa (FLG_NONUT) + 24.4".
import swisseph as swe, sys, json
swe.set_ephe_path(sys.argv[1]); swe.set_sid_mode(swe.SIDM_LAHIRI)
def lon(jd):
  trop=swe.calc_ut(jd,swe.SATURN,swe.FLG_SWIEPH)[0][0]
  ay=swe.get_ayanamsa_ex_ut(jd,swe.FLG_SWIEPH|swe.FLG_NONUT)[1]+24.4/3600
  return (trop-ay)%360
def sg(jd): return int(lon(jd)//30)
y0,y1=int(sys.argv[2]),int(sys.argv[3])
jd=swe.julday(y0,1,1); end=swe.julday(y1,1,1); s=sg(jd); out=[]
while jd<end:
  n=jd+0.25; t=sg(n)
  if t!=s:
    a,b=jd,n
    while b-a>1/1440:
      m=(a+b)/2
      if sg(m)==s: a=m
      else: b=m
    Y,M,D,h=swe.revjul(b); secs=round(h*3600); hh,mm=secs//3600,(secs%3600)//60
    out.append({"utc":f"{Y:04d}-{M:02d}-{D:02d}T{hh:02d}:{mm:02d}Z","from":s,"to":t}); s=t
  jd=n
print(json.dumps({"source":"Swiss Ephemeris (pyswisseph "+swe.version+"), Saturn apparent tropical longitude minus SIDM_LAHIRI mean ayanamsa (FLG_NONUT) + 24.4 arcsec (BornClock/Drik Lahiri convention), 6-hour scan refined to 1 minute","range":[y0,y1],"initialSign":sg(swe.julday(y0,1,1)),"ingresses":out}))
