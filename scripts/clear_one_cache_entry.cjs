require('dotenv').config({path:'.env.local'});
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const key = '2021-8-10-12-33-43.6532--79.3832--5';
  const { error } = await sb.from('vedic_chart_cache').delete().eq('cache_key', key);
  console.log('Delete error:', error);
  console.log('Deleted cache entry for Toronto test case.');
}
main();
