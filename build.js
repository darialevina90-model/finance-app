const fs = require('fs');

const version = process.env.VERCEL_GIT_COMMIT_SHA || Date.now().toString();
const sw = fs.readFileSync('sw.js', 'utf8');
const updated = sw.replace("self.CACHE_VERSION || Date.now()", `"${version}"`);
fs.writeFileSync('sw.js', updated);

console.log('✅ SW cache version injected:', version);
