const results = JSON.parse(require('fs').readFileSync('/tmp/astrologyapi-batch-25.json', 'utf8'));
results.forEach((r, i) => {
  if (!Array.isArray(r.planets)) {
    console.log('Chart', i, 'id=' + r.id, '- planets is NOT an array:', JSON.stringify(r.planets).slice(0, 300));
  }
});
console.log('Check complete.');
