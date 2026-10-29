# Cross-check with PyJHora (published open-source JHora port): Yogini dasha + Ashtakavarga on the panel.
import sys, json
sys.path.insert(0, sys.argv[1])
from jhora import const, utils
from jhora.panchanga import drik
from jhora.horoscope.chart import charts, ashtakavarga
from jhora.horoscope.dhasa.graha import yogini
drik.set_ayanamsa_mode('LAHIRI')
const.dhasa_year_duration_default = const.DHASA_YEAR_DURATION.MEAN_SIDEREAL_YEAR
PANEL = [('P1',(1996,8,31),(13,4,0),26.8467,80.9462,5.5),('P2',(1999,12,3),(11,3,0),42.6389,-83.2910,-5),
 ('P3',(1990,1,15),(6,30,0),28.6139,77.2090,5.5),('P4',(1985,7,20),(23,45,0),19.0760,72.8777,5.5),
 ('P5',(1992,6,10),(14,20,0),51.5074,-0.1278,1),('P6',(2001,12,25),(8,0,0),-33.8688,151.2093,11),
 ('P7',(2002,5,14),(16,45,0),40.5187,-74.4121,-4),('P8',(1995,2,10),(21,40,0),-37.8136,144.9631,11),
 ('P9',(1978,5,13),(19,30,0),32.7266,74.8570,5.5),('P10',(2024,3,10),(9,15,0),12.9716,77.5946,5.5)]
ref = {r['id']: r for r in json.load(open(sys.argv[2]))}
NAMES = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']
YN = {1:'Mangala',0:'Pingala',4:'Dhanya',2:'Bhramari',3:'Bhadrika',6:'Ulka',5:'Siddha',7:'Sankata'}
out = {}
for cid, dob, tob, lat, lon, tz in PANEL:
    place = drik.Place(cid, lat, lon, tz)
    yd = yogini.get_dhasa_bhukthi(dob, tob, place, dhasa_level_index=const.MAHA_DHASA_DEPTH.MAHA_DHASA_ONLY, round_duration=False)
    first = yd[0]; y, m, d, fh = first[1]
    # signs from my Swiss reference -> PyJHora chart list
    r = ref[cid]; h2p = ['' for _ in range(12)]
    for i, n in enumerate(NAMES):
        s = r['signs'][n]; h2p[s] = (h2p[s] + '/' if h2p[s] else '') + str(i)
    s = r['signs']['Lagna']; h2p[s] = (h2p[s] + '/' if h2p[s] else '') + 'L'
    bav_p, sav_p, _ = ashtakavarga.get_ashtaka_varga(h2p, moon_benefic_9_from_moon=False, moon_malefic_9_from_mars=False,
        moon_benefic_2_from_jupiter=False, moon_malefic_12_from_jupiter=False, venus_benefic_4_from_mars=False, venus_malefic_5_from_mars=False)
    bav_v, sav_v, _ = ashtakavarga.get_ashtaka_varga(h2p)
    out[cid] = {'firstYogini': YN[first[0][0]], 'firstStartLocal': '%04d-%02d-%02d %.4fh' % (y, m, d, fh),
                'mahaStarts': [(YN[x[0][0]], '%04d-%02d-%02d' % x[1][:3]) for x in yd[:6]],
                'bavParashara': {n: bav_p[i] for i, n in enumerate(NAMES)}, 'savParashara': sav_p,
                'bavVarahamihiraDefault': {n: bav_v[i] for i, n in enumerate(NAMES)}, 'savVarahamihiraDefault': sav_v}
    ok_av = all(bav_p[i] == r['bav'][n] for i, n in enumerate(NAMES)) and sav_p == r['sav']
    print(cid, 'PyJHora first', out[cid]['firstYogini'], out[cid]['firstStartLocal'], '| mine', r['yogini']['start'], r['yogini']['mahas'][0]['start'], '| AV(Parashara) equal:', ok_av)
json.dump(out, open(sys.argv[3], 'w'), indent=1)
