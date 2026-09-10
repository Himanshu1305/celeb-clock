const Astronomy = require('astronomy-engine');
const { getChestaBala } = require('./chestaBala.cjs');

const birthUTC = new Date('1988-11-05T07:00:00.000Z');
const time = Astronomy.MakeTime(birthUTC);

for (const p of ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']) {
  const vec = Astronomy.GeoVector(p, time, true);
  const trueLon = Astronomy.Ecliptic(vec).elon;
  const chesta = getChestaBala(p, trueLon, birthUTC);
  console.log(p + ': trueLon=' + trueLon.toFixed(2) + ' ChestaBala=' + chesta.toFixed(2));
}
