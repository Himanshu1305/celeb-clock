const fs = require('fs');
const charts = [];
let idCounter = 1;
function addChart(label, y, m, d, h, min, lat, lon, tz, category) {
  charts.push({ id: idCounter++, label, y, m, d, h, min, lat, lon, tz, category });
}
addChart('Reference case (manually verified)', 1988, 11, 5, 12, 30, 28.6139, 77.2090, 5.5, 'reference');
addChart('Leap day 2000 (century leap year)', 2000, 2, 29, 6, 0, 28.6139, 77.2090, 5.5, 'edge_leap_day');
addChart('Leap day 1996', 1996, 2, 29, 14, 15, 19.0760, 72.8777, 5.5, 'edge_leap_day');
addChart('Leap day 2024', 2024, 2, 29, 23, 45, 13.0827, 80.2707, 5.5, 'edge_leap_day');
addChart('Day after leap day 2000', 2000, 3, 1, 0, 5, 28.6139, 77.2090, 5.5, 'edge_leap_day');
addChart('Exact midnight IST', 2005, 6, 15, 0, 0, 28.6139, 77.2090, 5.5, 'edge_midnight');
addChart('One minute before midnight', 2005, 6, 15, 23, 59, 28.6139, 77.2090, 5.5, 'edge_midnight');
addChart('One minute after midnight', 2005, 6, 16, 0, 1, 28.6139, 77.2090, 5.5, 'edge_midnight');
addChart('New Year midnight 2000', 2000, 1, 1, 0, 0, 28.6139, 77.2090, 5.5, 'edge_year_boundary');
addChart('New Year eve 23:59 1999', 1999, 12, 31, 23, 59, 28.6139, 77.2090, 5.5, 'edge_year_boundary');
addChart('Early 1900s birth', 1901, 4, 12, 8, 30, 22.5726, 88.3639, 5.5, 'edge_historical');
addChart('1947 Indian Independence year', 1947, 8, 15, 0, 1, 28.6139, 77.2090, 5.5, 'edge_historical');
addChart('1950s birth', 1955, 3, 22, 16, 45, 12.9716, 77.5946, 5.5, 'edge_historical');
addChart('Near Arctic Circle (Reykjavik)', 1990, 6, 21, 12, 0, 64.1466, -21.9426, 0, 'edge_extreme_latitude');
addChart('Near Antarctic (Ushuaia, Argentina)', 1985, 12, 21, 12, 0, -54.8019, -68.3030, -3, 'edge_extreme_latitude');
addChart('High northern latitude (Tromso, Norway)', 1978, 1, 15, 9, 0, 69.6492, 18.9553, 1, 'edge_extreme_latitude');
addChart('US DST spring-forward day 2020', 2020, 3, 8, 2, 30, 40.7128, -74.0060, -5, 'edge_dst');
addChart('EU DST transition day 2019', 2019, 3, 31, 1, 30, 51.5074, -0.1278, 0, 'edge_dst');
addChart('US DST fall-back day 2021', 2021, 11, 7, 1, 30, 34.0522, -118.2437, -8, 'edge_dst');
addChart('Fiji near date line', 2010, 5, 5, 10, 0, -18.1416, 178.4419, 12, 'edge_date_line');
addChart('Samoa near date line', 2015, 7, 20, 14, 0, -13.7590, -172.1046, -11, 'edge_date_line');
addChart('Sydney Australia', 1992, 9, 9, 7, 20, -33.8688, 151.2093, 10, 'edge_southern_hemisphere');
addChart('Johannesburg South Africa', 1988, 2, 14, 19, 5, -26.2041, 28.0473, 2, 'edge_southern_hemisphere');
addChart('Buenos Aires Argentina', 1975, 10, 3, 11, 40, -34.6037, -58.3816, -3, 'edge_southern_hemisphere');
addChart('Boundary probe A - 00:00', 2001, 7, 10, 0, 0, 28.6139, 77.2090, 5.5, 'edge_boundary_probe');
addChart('Boundary probe A - 04:00', 2001, 7, 10, 4, 0, 28.6139, 77.2090, 5.5, 'edge_boundary_probe');
addChart('Boundary probe A - 08:00', 2001, 7, 10, 8, 0, 28.6139, 77.2090, 5.5, 'edge_boundary_probe');
addChart('Boundary probe A - 12:00', 2001, 7, 10, 12, 0, 28.6139, 77.2090, 5.5, 'edge_boundary_probe');
addChart('Boundary probe A - 16:00', 2001, 7, 10, 16, 0, 28.6139, 77.2090, 5.5, 'edge_boundary_probe');
addChart('Boundary probe A - 20:00', 2001, 7, 10, 20, 0, 28.6139, 77.2090, 5.5, 'edge_boundary_probe');
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const rand = seededRandom(42);
const globalCities = [
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, tz: 5.5 },
  { name: 'Delhi', lat: 28.6139, lon: 77.2090, tz: 5.5 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, tz: 5.5 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, tz: 5.5 },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946, tz: 5.5 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, tz: 5.5 },
  { name: 'New York', lat: 40.7128, lon: -74.0060, tz: -5 },
  { name: 'London', lat: 51.5074, lon: -0.1278, tz: 0 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, tz: 9 },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, tz: 4 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 8 },
  { name: 'Toronto', lat: 43.6532, lon: -79.3832, tz: -5 },
  { name: 'Sao Paulo', lat: -23.5505, lon: -46.6333, tz: -3 },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357, tz: 2 },
  { name: 'Moscow', lat: 55.7558, lon: 37.6173, tz: 3 },
];
for (let i = 0; i < 70; i++) {
  const year = 1940 + Math.floor(rand() * (2026 - 1940));
  const month = 1 + Math.floor(rand() * 12);
  const day = 1 + Math.floor(rand() * 28);
  const hour = Math.floor(rand() * 24);
  const minute = Math.floor(rand() * 60);
  const city = globalCities[Math.floor(rand() * globalCities.length)];
  addChart(`Random #${i + 1} (${city.name}, ${year})`, year, month, day, hour, minute, city.lat, city.lon, city.tz, 'random_spread');
}
fs.writeFileSync('/tmp/all-100-charts.json', JSON.stringify(charts));
console.log('Generated', charts.length, 'charts, written to /tmp/all-100-charts.json');
