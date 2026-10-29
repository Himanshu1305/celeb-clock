# PyJHora 4.8.7 Chara Dasha, K.N. Rao method, Lahiri ayanamsa, mean nodes — panel charts (local birth time + offset).
import sys, json; sys.path.insert(0, sys.argv[1])
from jhora import const, utils
const.set_node_mode(False)
from jhora.panchanga import drik
drik.set_ayanamsa_mode('LAHIRI')
from jhora.horoscope.dhasa.raasi import chara
from jhora.horoscope.chart import charts
C = {'P1':((1996,8,31),(13,4,0),26.8467,80.9462,5.5),'P2':((1999,12,3),(11,3,0),42.6389,-83.2910,-5.0),'P3':((1990,1,15),(6,30,0),28.6139,77.2090,5.5),
 'P4':((1985,7,20),(23,45,0),19.0760,72.8777,5.5),'P5':((1992,6,10),(14,20,0),51.5074,-0.1278,1.0),'P6':((2001,12,25),(8,0,0),-33.8688,151.2093,11.0),
 'P7':((2002,5,14),(16,45,0),40.5187,-74.4121,-4.0),'P8':((1995,2,10),(21,40,0),-37.8136,144.9631,11.0),'P9':((1978,5,13),(19,30,0),32.7266,74.8570,5.5),
 'P10':((2024,3,10),(9,15,0),12.9716,77.5946,5.5),'CH':((1996,12,7),(10,34,0),13.0878,80.2785,5.5)}
out = {}
for k,(dob,tob,lat,lon,tz) in C.items():
    place = drik.Place(k,lat,lon,tz)
    yd = chara.get_dhasa_antardhasa(dob,tob,place,dhasa_level_index=const.MAHA_DHASA_DEPTH.MAHA_DHASA_ONLY,chara_method=const.CHARA_TYPE.KN_RAO)
    out[k] = [(r[0][0], r[2], '%04d-%02d-%02d' % r[1][:3]) for r in yd]
    jd = utils.julian_day_number(dob,tob)
    pp = charts.divisional_chart(jd, place)[:10]
    out[k+'_signs'] = [(str(p), h, round(l,3)) for p,(h,l) in pp]
    print(k, ' '.join(f'{s}:{int(y)}' for s,y,_ in out[k]))
json.dump(out, open(sys.argv[2],'w'), indent=0)
