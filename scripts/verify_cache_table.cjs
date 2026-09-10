require('dotenv').config({path:'.env.local'});
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
sb.from('vedic_chart_cache').select('*').limit(1).then(function(result) {
  console.log('error:', result.error);
  console.log('data:', result.data);
});
