require('dotenv').config({path:'.env.local'});
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await sb
    .from('vedic_chart_cache')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);
  console.log('error:', error);
  console.log('Recent cache entries:');
  (data || []).forEach(row => {
    console.log('---');
    console.log('key:', row.cache_key);
    console.log('created:', row.created_at);
    console.log('planets count:', row.chart_data?.planets?.length);
    console.log('nakshatra:', row.chart_data?.nakshatra?.nakshatra);
  });
}
main();
