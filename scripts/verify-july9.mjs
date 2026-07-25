#!/usr/bin/env node
/** READ-ONLY verification for the July-9 Indian-celebrity fix. No writes. */
import { createClient } from '@supabase/supabase-js';
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const total = (await s.from('celebrity_sitelinks').select('*',{count:'exact',head:true})).count;
console.log('TOTAL rows in celebrity_sitelinks:', total);

const { data: top } = await s.from('celebrity_sitelinks')
  .select('name,birth_date,death_date,nationality_code,sitelinks,occupation')
  .eq('birth_month_day','07-09').order('sitelinks',{ascending:false}).limit(15);
console.log('\n=== July 9 (07-09) TOP 15 by sitelinks ===');
top?.forEach((c,i)=>console.log(`${String(i+1).padStart(2)}. sl=${String(c.sitelinks).padStart(3)}  nat=${c.nationality_code??'NULL'}  ${c.birth_date}${c.death_date?(' d.'+c.death_date):''}  ${c.name}`));

const { data: inSet } = await s.from('celebrity_sitelinks')
  .select('name,birth_date,death_date,nationality_code,sitelinks,wikidata_id')
  .eq('birth_month_day','07-09').eq('nationality_code','IN').order('sitelinks',{ascending:false});
console.log('\n=== July 9 nationality_code=IN set ('+(inSet?.length??0)+') ===');
console.log(JSON.stringify(inSet,null,2));
console.log('Sanjeev Kumar in IN set:', inSet?.some(r=>r.name.toLowerCase().includes('sanjeev kumar')) ? 'YES' : 'NO');

const { count: gd } = await s.from('celebrity_sitelinks')
  .select('*',{count:'exact',head:true}).ilike('name','guru dutt');
console.log('\nGuru Dutt row count (expect exactly 1):', gd);

// Dup guard: any QID appearing more than once? (spot count for Sanjeev)
const { count: skCount } = await s.from('celebrity_sitelinks')
  .select('*',{count:'exact',head:true}).ilike('name','sanjeev kumar');
console.log('Sanjeev Kumar row count:', skCount);
