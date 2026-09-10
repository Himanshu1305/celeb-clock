require('dotenv').config({path:'.env.local'});
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Delete any cached chart with 0 planets or Unknown nakshatra - these
  // are the corrupted entries from the earlier rate-limited batch run.
  const { data, error } = await sb
    .from('vedic_chart_cache')
    .select('cache_key, chart_data');
  if (error) { console.log('error:', error); return; }

  const badKeys = (data || [])
    .filter(row => (row.chart_data?.planets?.length === 0) || row.chart_data?.nakshatra?.nakshatra === 'Unknown')
    .map(row => row.cache_key);

  console.log('Found', badKeys.length, 'bad cache entries to delete:', badKeys);

  if (badKeys.length > 0) {
    const { error: delError } = await sb.from('vedic_chart_cache').delete().in('cache_key', badKeys);
    console.log('Delete error:', delError);
    console.log('Cleaned up', badKeys.length, 'bad entries.');
  }
}
main();
