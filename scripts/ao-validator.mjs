const B='https://f537587c-bornclock.usdvisionai.workers.dev';
const routes=['/','/compatibility/aries/leo/','/life-expectancy/','/kundali/'];
for(const r of routes){
  const html=await (await fetch(B+r)).text();
  const res=await fetch('https://validator.schema.org/validate',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({html})});
  let txt=await res.text(); txt=txt.replace(/^\)\]\}'\n?/,'');
  let errs='?',types='?';
  try{const j=JSON.parse(txt); const ts=j.tripleGroups||[]; types=ts.map(g=>g.nodeType||g['@type']).filter(Boolean).join(',')||(j.totalNumErrors!=null?('objs:'+(j.numObjects||'?')):''); errs=j.totalNumErrors??j.numErrors??'?'; types=(j.numObjects!=null?j.numObjects+' objs':types);}catch(e){errs='parse:'+txt.slice(0,40)}
  console.log(`${r} → errors=${errs} ${types}`);
}
