require('dotenv').config({path:'.env.local'});

async function main() {
  const userId = process.env.ASTROLOGYAPI_USER_ID;
  const apiKey = process.env.ASTROLOGYAPI_API_KEY;

  if (!userId || !apiKey) {
    console.log('Missing credentials in .env.local');
    return;
  }

  const authHeader = 'Basic ' + Buffer.from(userId + ':' + apiKey).toString('base64');

  // Test with the planets endpoint for our reference chart
  const url = 'https://json.astrologyapi.com/v1/planets';
  const body = {
    day: 5,
    month: 11,
    year: 1988,
    hour: 12,
    min: 30,
    lat: 28.6139,
    lon: 77.2090,
    tzone: 5.5
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Accept-Language': 'en',
    },
    body: JSON.stringify(body),
  });

  console.log('HTTP status:', res.status);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
main();
