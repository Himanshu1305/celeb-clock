/**
 * Bundled city dataset for birth-city lookup (P5-1 — robust city lookup).
 *
 * Shared by the browser geocoder (`src/services/geocoding.ts`) and the
 * server-side proxy (`api/geocode.ts`) so a city that is in this list resolves
 * instantly, offline, and WITHOUT ever touching the OpenStreetMap Nominatim
 * service — which is what "reduce dependence on the public Nominatim service"
 * means in practice. Anything not here still falls back to Nominatim (proxied
 * + cached), with OpenStreetMap attribution shown wherever that path is used.
 *
 * LICENSING / HONESTY: city coordinates and a city's IANA time zone are factual
 * data (not creative works) and carry no copyright. Time-zone identifiers and
 * offsets come from the IANA time-zone database (public domain). Nothing here is
 * copied from a competitor or from a licence-restricted dataset. India is covered
 * comprehensively (the core audience); a curated set of major world cities is
 * included with their STANDARD (non-DST) UTC offset and IANA zone.
 *
 * NOTE on offsets: `utcOffset` is the standard (winter) offset in hours. India
 * has no DST so IST = +5.5 is exact year-round. For world cities with DST the
 * standard offset is stored and the IANA `timezone` is carried alongside so a
 * future refinement can apply the historical DST rule for the birth date; this
 * is already strictly more accurate than the previous behaviour (which assumed
 * IST for every non-cached city).
 */

export interface CityDef {
  name: string;
  /** State (India) or region/country-subdivision label for disambiguation. */
  state: string;
  country: string;
  lat: number;
  lon: number;
  /** IANA time-zone identifier (public domain). */
  timezone: string;
  /** Standard (non-DST) UTC offset in hours. */
  utcOffset: number;
  aliases?: string[];
}

const IN = (name: string, state: string, lat: number, lon: number, aliases?: string[]): CityDef => ({
  name, state, country: 'India', lat, lon, timezone: 'Asia/Kolkata', utcOffset: 5.5, aliases,
});

// ── India (comprehensive: metros, all state/UT capitals, and major cities) ──
const INDIA: CityDef[] = [
  IN('Delhi', 'Delhi', 28.6139, 77.2090, ['new delhi']),
  IN('Mumbai', 'Maharashtra', 19.0760, 72.8777, ['bombay']),
  IN('Bengaluru', 'Karnataka', 12.9716, 77.5946, ['bangalore']),
  IN('Hyderabad', 'Telangana', 17.3850, 78.4867),
  IN('Chennai', 'Tamil Nadu', 13.0827, 80.2707, ['madras']),
  IN('Kolkata', 'West Bengal', 22.5726, 88.3639, ['calcutta']),
  IN('Pune', 'Maharashtra', 18.5204, 73.8567, ['poona']),
  IN('Ahmedabad', 'Gujarat', 23.0225, 72.5714, ['amdavad']),
  IN('Jaipur', 'Rajasthan', 26.9124, 75.7873),
  IN('Lucknow', 'Uttar Pradesh', 26.8467, 80.9462),
  IN('Nagpur', 'Maharashtra', 21.1458, 79.0882),
  IN('Surat', 'Gujarat', 21.1702, 72.8311),
  IN('Patna', 'Bihar', 25.5941, 85.1376),
  IN('Bhopal', 'Madhya Pradesh', 23.2599, 77.4126),
  IN('Indore', 'Madhya Pradesh', 22.7196, 75.8577),
  IN('Kochi', 'Kerala', 9.9312, 76.2673, ['cochin', 'ernakulam']),
  IN('Chandigarh', 'Chandigarh', 30.7333, 76.7794),
  IN('Gurgaon', 'Haryana', 28.4595, 77.0266, ['gurugram']),
  IN('Noida', 'Uttar Pradesh', 28.5355, 77.3910),
  IN('Vadnagar', 'Gujarat', 23.7867, 72.6367),
  IN('Allahabad', 'Uttar Pradesh', 25.4358, 81.8463, ['prayagraj']),
  IN('Coimbatore', 'Tamil Nadu', 11.0168, 76.9558),
  IN('Kanpur', 'Uttar Pradesh', 26.4499, 80.3319),
  IN('Visakhapatnam', 'Andhra Pradesh', 17.6868, 83.2185, ['vizag']),
  IN('Vijayawada', 'Andhra Pradesh', 16.5062, 80.6480),
  IN('Thiruvananthapuram', 'Kerala', 8.5241, 76.9366, ['trivandrum']),
  IN('Kozhikode', 'Kerala', 11.2588, 75.7804, ['calicut']),
  IN('Thrissur', 'Kerala', 10.5276, 76.2144, ['trichur']),
  IN('Madurai', 'Tamil Nadu', 9.9252, 78.1198),
  IN('Tiruchirappalli', 'Tamil Nadu', 10.7905, 78.7047, ['trichy', 'tiruchirapalli']),
  IN('Salem', 'Tamil Nadu', 11.6643, 78.1460),
  IN('Mysuru', 'Karnataka', 12.2958, 76.6394, ['mysore']),
  IN('Hubli', 'Karnataka', 15.3647, 75.1240, ['hubballi']),
  IN('Mangaluru', 'Karnataka', 12.9141, 74.8560, ['mangalore']),
  IN('Nashik', 'Maharashtra', 19.9975, 73.7898, ['nasik']),
  IN('Aurangabad', 'Maharashtra', 19.8762, 75.3433, ['chhatrapati sambhaji nagar']),
  IN('Solapur', 'Maharashtra', 17.6599, 75.9064),
  IN('Nanded', 'Maharashtra', 19.1383, 77.3210),
  IN('Kolhapur', 'Maharashtra', 16.7050, 74.2433),
  IN('Thane', 'Maharashtra', 19.2183, 72.9781),
  IN('Navi Mumbai', 'Maharashtra', 19.0330, 73.0297),
  IN('Rajkot', 'Gujarat', 22.3039, 70.8022),
  IN('Vadodara', 'Gujarat', 22.3072, 73.1812, ['baroda']),
  IN('Bhavnagar', 'Gujarat', 21.7645, 72.1519),
  IN('Jamnagar', 'Gujarat', 22.4707, 70.0577),
  IN('Gandhinagar', 'Gujarat', 23.2156, 72.6369),
  IN('Jodhpur', 'Rajasthan', 26.2389, 73.0243),
  IN('Udaipur', 'Rajasthan', 24.5854, 73.7125),
  IN('Kota', 'Rajasthan', 25.2138, 75.8648),
  IN('Ajmer', 'Rajasthan', 26.4499, 74.6399),
  IN('Bikaner', 'Rajasthan', 28.0229, 73.3119),
  IN('Agra', 'Uttar Pradesh', 27.1767, 78.0081),
  IN('Varanasi', 'Uttar Pradesh', 25.3176, 82.9739, ['banaras', 'kashi']),
  IN('Meerut', 'Uttar Pradesh', 28.9845, 77.7064),
  IN('Ghaziabad', 'Uttar Pradesh', 28.6692, 77.4538),
  IN('Bareilly', 'Uttar Pradesh', 28.3670, 79.4304),
  IN('Aligarh', 'Uttar Pradesh', 27.8974, 78.0880),
  IN('Moradabad', 'Uttar Pradesh', 28.8386, 78.7733),
  IN('Gorakhpur', 'Uttar Pradesh', 26.7606, 83.3732),
  IN('Jhansi', 'Uttar Pradesh', 25.4484, 78.5685),
  IN('Mathura', 'Uttar Pradesh', 27.4924, 77.6737),
  IN('Ayodhya', 'Uttar Pradesh', 26.7922, 82.1998),
  IN('Gwalior', 'Madhya Pradesh', 26.2183, 78.1828),
  IN('Jabalpur', 'Madhya Pradesh', 23.1815, 79.9864),
  IN('Ujjain', 'Madhya Pradesh', 23.1765, 75.7885),
  IN('Ratlam', 'Madhya Pradesh', 23.3315, 75.0367),
  IN('Raipur', 'Chhattisgarh', 21.2514, 81.6296),
  IN('Bhilai', 'Chhattisgarh', 21.1938, 81.3509),
  IN('Bilaspur', 'Chhattisgarh', 22.0797, 82.1409),
  IN('Ranchi', 'Jharkhand', 23.3441, 85.3096),
  IN('Jamshedpur', 'Jharkhand', 22.8046, 86.2029, ['tatanagar']),
  IN('Dhanbad', 'Jharkhand', 23.7957, 86.4304),
  IN('Bokaro', 'Jharkhand', 23.6693, 86.1511, ['bokaro steel city']),
  IN('Gaya', 'Bihar', 24.7969, 85.0002),
  IN('Bhagalpur', 'Bihar', 25.2425, 86.9842),
  IN('Muzaffarpur', 'Bihar', 26.1209, 85.3647),
  IN('Darbhanga', 'Bihar', 26.1542, 85.8918),
  IN('Howrah', 'West Bengal', 22.5958, 88.2636),
  IN('Durgapur', 'West Bengal', 23.5204, 87.3119),
  IN('Asansol', 'West Bengal', 23.6739, 86.9524),
  IN('Siliguri', 'West Bengal', 26.7271, 88.3953),
  IN('Bhubaneswar', 'Odisha', 20.2961, 85.8245),
  IN('Cuttack', 'Odisha', 20.4625, 85.8828),
  IN('Rourkela', 'Odisha', 22.2604, 84.8536),
  IN('Puri', 'Odisha', 19.8135, 85.8312),
  IN('Guwahati', 'Assam', 26.1445, 91.7362),
  IN('Dibrugarh', 'Assam', 27.4728, 94.9120),
  IN('Silchar', 'Assam', 24.8333, 92.7789),
  IN('Dispur', 'Assam', 26.1433, 91.7898),
  IN('Shillong', 'Meghalaya', 25.5788, 91.8933),
  IN('Imphal', 'Manipur', 24.8170, 93.9368),
  IN('Aizawl', 'Mizoram', 23.7271, 92.7176),
  IN('Agartala', 'Tripura', 23.8315, 91.2868),
  IN('Kohima', 'Nagaland', 25.6751, 94.1086),
  IN('Itanagar', 'Arunachal Pradesh', 27.0844, 93.6053),
  IN('Gangtok', 'Sikkim', 27.3389, 88.6065),
  IN('Patiala', 'Punjab', 30.3398, 76.3869),
  IN('Ludhiana', 'Punjab', 30.9010, 75.8573),
  IN('Amritsar', 'Punjab', 31.6340, 74.8723),
  IN('Jalandhar', 'Punjab', 31.3260, 75.5762),
  IN('Bathinda', 'Punjab', 30.2110, 74.9455),
  IN('Ambala', 'Haryana', 30.3782, 76.7767),
  IN('Panipat', 'Haryana', 29.3909, 76.9635),
  IN('Hisar', 'Haryana', 29.1492, 75.7217),
  IN('Karnal', 'Haryana', 29.6857, 76.9905),
  IN('Faridabad', 'Haryana', 28.4089, 77.3178),
  IN('Rohtak', 'Haryana', 28.8955, 76.6066),
  IN('Dehradun', 'Uttarakhand', 30.3165, 78.0322),
  IN('Haridwar', 'Uttarakhand', 29.9457, 78.1642),
  IN('Rishikesh', 'Uttarakhand', 30.0869, 78.2676),
  IN('Nainital', 'Uttarakhand', 29.3919, 79.4542),
  IN('Haldwani', 'Uttarakhand', 29.2183, 79.5130),
  IN('Shimla', 'Himachal Pradesh', 31.1048, 77.1734),
  IN('Dharamshala', 'Himachal Pradesh', 32.2190, 76.3234),
  IN('Mandi', 'Himachal Pradesh', 31.7080, 76.9319),
  IN('Solan', 'Himachal Pradesh', 30.9045, 77.0967),
  IN('Srinagar', 'Jammu and Kashmir', 34.0837, 74.7973),
  IN('Jammu', 'Jammu and Kashmir', 32.7266, 74.8570),
  IN('Leh', 'Ladakh', 34.1526, 77.5771),
  IN('Panaji', 'Goa', 15.4909, 73.8278, ['panjim']),
  IN('Margao', 'Goa', 15.2832, 73.9862, ['madgaon']),
  IN('Vasco da Gama', 'Goa', 15.3981, 73.8113),
  IN('Puducherry', 'Puducherry', 11.9416, 79.8083, ['pondicherry']),
  IN('Port Blair', 'Andaman and Nicobar Islands', 11.6234, 92.7265),
  IN('Kavaratti', 'Lakshadweep', 10.5593, 72.6358),
  IN('Daman', 'Dadra and Nagar Haveli and Daman and Diu', 20.3974, 72.8328),
  IN('Silvassa', 'Dadra and Nagar Haveli and Daman and Diu', 20.2738, 73.0140),
  IN('Tirupati', 'Andhra Pradesh', 13.6288, 79.4192),
  IN('Guntur', 'Andhra Pradesh', 16.3067, 80.4365),
  IN('Nellore', 'Andhra Pradesh', 14.4426, 79.9865),
  IN('Kurnool', 'Andhra Pradesh', 15.8281, 78.0373),
  IN('Rajahmundry', 'Andhra Pradesh', 17.0005, 81.8040),
  IN('Warangal', 'Telangana', 17.9689, 79.5941),
  IN('Karimnagar', 'Telangana', 18.4386, 79.1288),
  IN('Nizamabad', 'Telangana', 18.6725, 78.0941),
  IN('Belagavi', 'Karnataka', 15.8497, 74.4977, ['belgaum']),
  IN('Davangere', 'Karnataka', 14.4644, 75.9218),
  IN('Ballari', 'Karnataka', 15.1394, 76.9214, ['bellary']),
  IN('Shivamogga', 'Karnataka', 13.9299, 75.5681, ['shimoga']),
  IN('Tumakuru', 'Karnataka', 13.3379, 77.1173, ['tumkur']),
  IN('Udupi', 'Karnataka', 13.3409, 74.7421),
  IN('Vellore', 'Tamil Nadu', 12.9165, 79.1325),
  IN('Erode', 'Tamil Nadu', 11.3410, 77.7172),
  IN('Tirunelveli', 'Tamil Nadu', 8.7139, 77.7567),
  IN('Thanjavur', 'Tamil Nadu', 10.7870, 79.1378, ['tanjore']),
  IN('Tiruppur', 'Tamil Nadu', 11.1085, 77.3411),
  IN('Dindigul', 'Tamil Nadu', 10.3624, 77.9695),
  IN('Kollam', 'Kerala', 8.8932, 76.6141, ['quilon']),
  IN('Kottayam', 'Kerala', 9.5916, 76.5222),
  IN('Alappuzha', 'Kerala', 9.4981, 76.3388, ['alleppey']),
  IN('Palakkad', 'Kerala', 10.7867, 76.6548, ['palghat']),
  IN('Kannur', 'Kerala', 11.8745, 75.3704, ['cannanore']),
  IN('Sangli', 'Maharashtra', 16.8524, 74.5815),
  IN('Jalgaon', 'Maharashtra', 21.0077, 75.5626),
  IN('Akola', 'Maharashtra', 20.7002, 77.0082),
  IN('Amravati', 'Maharashtra', 20.9374, 77.7796),
  IN('Latur', 'Maharashtra', 18.4088, 76.5604),
  IN('Saharanpur', 'Uttar Pradesh', 29.9680, 77.5452),
  IN('Firozabad', 'Uttar Pradesh', 27.1591, 78.3958),
  IN('Muzaffarnagar', 'Uttar Pradesh', 29.4727, 77.7085),
];

const W = (name: string, country: string, lat: number, lon: number, tz: string, utcOffset: number, aliases?: string[]): CityDef => ({
  name, state: country, country, lat, lon, timezone: tz, utcOffset, aliases,
});

// ── Major world cities (curated) — STANDARD offset + IANA zone ──
const WORLD: CityDef[] = [
  // South Asia / neighbours
  W('Kathmandu', 'Nepal', 27.7172, 85.3240, 'Asia/Kathmandu', 5.75),
  W('Colombo', 'Sri Lanka', 6.9271, 79.8612, 'Asia/Colombo', 5.5),
  W('Dhaka', 'Bangladesh', 23.8103, 90.4125, 'Asia/Dhaka', 6),
  W('Karachi', 'Pakistan', 24.8607, 67.0011, 'Asia/Karachi', 5),
  W('Lahore', 'Pakistan', 31.5204, 74.3587, 'Asia/Karachi', 5),
  W('Islamabad', 'Pakistan', 33.6844, 73.0479, 'Asia/Karachi', 5),
  W('Kabul', 'Afghanistan', 34.5553, 69.2075, 'Asia/Kabul', 4.5),
  W('Thimphu', 'Bhutan', 27.4728, 89.6390, 'Asia/Thimphu', 6),
  W('Male', 'Maldives', 4.1755, 73.5093, 'Indian/Maldives', 5),
  // Middle East
  W('Dubai', 'United Arab Emirates', 25.2048, 55.2708, 'Asia/Dubai', 4),
  W('Abu Dhabi', 'United Arab Emirates', 24.4539, 54.3773, 'Asia/Dubai', 4),
  W('Doha', 'Qatar', 25.2854, 51.5310, 'Asia/Qatar', 3),
  W('Riyadh', 'Saudi Arabia', 24.7136, 46.6753, 'Asia/Riyadh', 3),
  W('Jeddah', 'Saudi Arabia', 21.4858, 39.1925, 'Asia/Riyadh', 3),
  W('Kuwait City', 'Kuwait', 29.3759, 47.9774, 'Asia/Kuwait', 3),
  W('Muscat', 'Oman', 23.5880, 58.3829, 'Asia/Muscat', 4),
  W('Manama', 'Bahrain', 26.2285, 50.5860, 'Asia/Bahrain', 3),
  W('Tehran', 'Iran', 35.6892, 51.3890, 'Asia/Tehran', 3.5),
  W('Jerusalem', 'Israel', 31.7683, 35.2137, 'Asia/Jerusalem', 2),
  W('Istanbul', 'Turkey', 41.0082, 28.9784, 'Europe/Istanbul', 3),
  // Europe
  W('London', 'United Kingdom', 51.5074, -0.1278, 'Europe/London', 0),
  W('Manchester', 'United Kingdom', 53.4808, -2.2426, 'Europe/London', 0),
  W('Birmingham', 'United Kingdom', 52.4862, -1.8904, 'Europe/London', 0),
  W('Dublin', 'Ireland', 53.3498, -6.2603, 'Europe/Dublin', 0),
  W('Paris', 'France', 48.8566, 2.3522, 'Europe/Paris', 1),
  W('Berlin', 'Germany', 52.5200, 13.4050, 'Europe/Berlin', 1),
  W('Frankfurt', 'Germany', 50.1109, 8.6821, 'Europe/Berlin', 1),
  W('Munich', 'Germany', 48.1351, 11.5820, 'Europe/Berlin', 1),
  W('Amsterdam', 'Netherlands', 52.3676, 4.9041, 'Europe/Amsterdam', 1),
  W('Brussels', 'Belgium', 50.8503, 4.3517, 'Europe/Brussels', 1),
  W('Zurich', 'Switzerland', 47.3769, 8.5417, 'Europe/Zurich', 1),
  W('Geneva', 'Switzerland', 46.2044, 6.1432, 'Europe/Zurich', 1),
  W('Madrid', 'Spain', 40.4168, -3.7038, 'Europe/Madrid', 1),
  W('Barcelona', 'Spain', 41.3874, 2.1686, 'Europe/Madrid', 1),
  W('Rome', 'Italy', 41.9028, 12.4964, 'Europe/Rome', 1),
  W('Milan', 'Italy', 45.4642, 9.1900, 'Europe/Rome', 1),
  W('Lisbon', 'Portugal', 38.7223, -9.1393, 'Europe/Lisbon', 0),
  W('Vienna', 'Austria', 48.2082, 16.3738, 'Europe/Vienna', 1),
  W('Stockholm', 'Sweden', 59.3293, 18.0686, 'Europe/Stockholm', 1),
  W('Oslo', 'Norway', 59.9139, 10.7522, 'Europe/Oslo', 1),
  W('Copenhagen', 'Denmark', 55.6761, 12.5683, 'Europe/Copenhagen', 1),
  W('Helsinki', 'Finland', 60.1699, 24.9384, 'Europe/Helsinki', 2),
  W('Warsaw', 'Poland', 52.2297, 21.0122, 'Europe/Warsaw', 1),
  W('Prague', 'Czechia', 50.0755, 14.4378, 'Europe/Prague', 1),
  W('Athens', 'Greece', 37.9838, 23.7275, 'Europe/Athens', 2),
  W('Moscow', 'Russia', 55.7558, 37.6173, 'Europe/Moscow', 3),
  // Africa
  W('Cairo', 'Egypt', 30.0444, 31.2357, 'Africa/Cairo', 2),
  W('Nairobi', 'Kenya', -1.2921, 36.8219, 'Africa/Nairobi', 3),
  W('Lagos', 'Nigeria', 6.5244, 3.3792, 'Africa/Lagos', 1),
  W('Johannesburg', 'South Africa', -26.2041, 28.0473, 'Africa/Johannesburg', 2),
  W('Cape Town', 'South Africa', -33.9249, 18.4241, 'Africa/Johannesburg', 2),
  W('Accra', 'Ghana', 5.6037, -0.1870, 'Africa/Accra', 0),
  W('Casablanca', 'Morocco', 33.5731, -7.5898, 'Africa/Casablanca', 1),
  W('Addis Ababa', 'Ethiopia', 9.0300, 38.7400, 'Africa/Addis_Ababa', 3),
  W('Dar es Salaam', 'Tanzania', -6.7924, 39.2083, 'Africa/Dar_es_Salaam', 3),
  W('Port Louis', 'Mauritius', -20.1609, 57.5012, 'Indian/Mauritius', 4),
  // East & Southeast Asia
  W('Singapore', 'Singapore', 1.3521, 103.8198, 'Asia/Singapore', 8),
  W('Kuala Lumpur', 'Malaysia', 3.1390, 101.6869, 'Asia/Kuala_Lumpur', 8),
  W('Bangkok', 'Thailand', 13.7563, 100.5018, 'Asia/Bangkok', 7),
  W('Jakarta', 'Indonesia', -6.2088, 106.8456, 'Asia/Jakarta', 7),
  W('Manila', 'Philippines', 14.5995, 120.9842, 'Asia/Manila', 8),
  W('Hong Kong', 'Hong Kong', 22.3193, 114.1694, 'Asia/Hong_Kong', 8),
  W('Shanghai', 'China', 31.2304, 121.4737, 'Asia/Shanghai', 8),
  W('Beijing', 'China', 39.9042, 116.4074, 'Asia/Shanghai', 8),
  W('Tokyo', 'Japan', 35.6762, 139.6503, 'Asia/Tokyo', 9),
  W('Osaka', 'Japan', 34.6937, 135.5023, 'Asia/Tokyo', 9),
  W('Seoul', 'South Korea', 37.5665, 126.9780, 'Asia/Seoul', 9),
  W('Taipei', 'Taiwan', 25.0330, 121.5654, 'Asia/Taipei', 8),
  W('Ho Chi Minh City', 'Vietnam', 10.8231, 106.6297, 'Asia/Ho_Chi_Minh', 7, ['saigon']),
  W('Hanoi', 'Vietnam', 21.0278, 105.8342, 'Asia/Ho_Chi_Minh', 7),
  // Oceania
  W('Sydney', 'Australia', -33.8688, 151.2093, 'Australia/Sydney', 10),
  W('Melbourne', 'Australia', -37.8136, 144.9631, 'Australia/Melbourne', 10),
  W('Brisbane', 'Australia', -27.4698, 153.0251, 'Australia/Brisbane', 10),
  W('Perth', 'Australia', -31.9505, 115.8605, 'Australia/Perth', 8),
  W('Auckland', 'New Zealand', -36.8509, 174.7645, 'Pacific/Auckland', 12),
  W('Suva', 'Fiji', -18.1248, 178.4501, 'Pacific/Fiji', 12),
  // North America
  W('New York', 'United States', 40.7128, -74.0060, 'America/New_York', -5, ['nyc']),
  W('Washington', 'United States', 38.9072, -77.0369, 'America/New_York', -5, ['washington dc']),
  W('Boston', 'United States', 42.3601, -71.0589, 'America/New_York', -5),
  W('Atlanta', 'United States', 33.7490, -84.3880, 'America/New_York', -5),
  W('Miami', 'United States', 25.7617, -80.1918, 'America/New_York', -5),
  W('Chicago', 'United States', 41.8781, -87.6298, 'America/Chicago', -6),
  W('Houston', 'United States', 29.7604, -95.3698, 'America/Chicago', -6),
  W('Dallas', 'United States', 32.7767, -96.7970, 'America/Chicago', -6),
  W('Denver', 'United States', 39.7392, -104.9903, 'America/Denver', -7),
  W('Phoenix', 'United States', 33.4484, -112.0740, 'America/Phoenix', -7),
  W('Los Angeles', 'United States', 34.0522, -118.2437, 'America/Los_Angeles', -8, ['la']),
  W('San Francisco', 'United States', 37.7749, -122.4194, 'America/Los_Angeles', -8, ['sf']),
  W('Seattle', 'United States', 47.6062, -122.3321, 'America/Los_Angeles', -8),
  W('San Jose', 'United States', 37.3382, -121.8863, 'America/Los_Angeles', -8),
  W('Toronto', 'Canada', 43.6532, -79.3832, 'America/Toronto', -5),
  W('Vancouver', 'Canada', 49.2827, -123.1207, 'America/Vancouver', -8),
  W('Montreal', 'Canada', 45.5017, -73.5673, 'America/Toronto', -5),
  W('Mexico City', 'Mexico', 19.4326, -99.1332, 'America/Mexico_City', -6),
  // South America
  W('Sao Paulo', 'Brazil', -23.5505, -46.6333, 'America/Sao_Paulo', -3),
  W('Rio de Janeiro', 'Brazil', -22.9068, -43.1729, 'America/Sao_Paulo', -3),
  W('Buenos Aires', 'Argentina', -34.6037, -58.3816, 'America/Argentina/Buenos_Aires', -3),
  W('Santiago', 'Chile', -33.4489, -70.6693, 'America/Santiago', -4),
  W('Lima', 'Peru', -12.0464, -77.0428, 'America/Lima', -5),
  W('Bogota', 'Colombia', 4.7110, -74.0721, 'America/Bogota', -5),
];

export const CITY_DATASET: CityDef[] = [...INDIA, ...WORLD];

// Build a lookup: canonical name + aliases → def (lower-cased keys).
export const CITY_LOOKUP = new Map<string, CityDef>();
for (const c of CITY_DATASET) {
  const key = c.name.toLowerCase();
  if (!CITY_LOOKUP.has(key)) CITY_LOOKUP.set(key, c);
  (c.aliases || []).forEach(a => { if (!CITY_LOOKUP.has(a)) CITY_LOOKUP.set(a, c); });
}

/** Exact or alias match (case-insensitive). */
export function lookupCity(query: string): CityDef | undefined {
  return CITY_LOOKUP.get((query || '').trim().toLowerCase());
}

/** Prefix match against bundled names/aliases (for the long-tail before the network). */
export function prefixCities(query: string, limit = 5): CityDef[] {
  const q = (query || '').trim().toLowerCase();
  if (q.length < 2) return [];
  const out: CityDef[] = [];
  const seen = new Set<string>();
  for (const c of CITY_DATASET) {
    const hit = c.name.toLowerCase().startsWith(q) || (c.aliases || []).some(a => a.startsWith(q));
    if (hit && !seen.has(c.name)) { out.push(c); seen.add(c.name); }
    if (out.length >= limit) break;
  }
  return out;
}
