require('dotenv').config({path:'.env.local'});

async function main() {
  const userId = process.env.ASTROLOGYAPI_USER_ID;
  const apiKey = process.env.ASTROLOGYAPI_API_KEY;
  const authHeader = 'Basic ' + Buffer.from(userId + ':' + apiKey).toString('base64');
  const body = { day: 5, month: 11, year: 1988, hour: 12, min: 30, lat: 28.6139, lon: 77.2090, tzone: 5.5 };
  const res = await fetch('https://json.astrologyapi.com/v1/shadbala', {
    method: 'POST',
    headers: { 'Authorization': authHeader, 'Content-Type': 'application/json', 'Accept-Language': 'en' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
main();
