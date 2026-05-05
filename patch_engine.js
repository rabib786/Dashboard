const fs = require('fs');
let content = fs.readFileSync('Personal-Dashboard--main/torn_engine.js', 'utf8');

// The node environment has fetch available in Node 18+, so it's making actual requests to Torn API and failing with "Incorrect key".
// We need to intercept or mock fetch for testing.

content = content.replace(
  "if (typeof fetch !== 'undefined') {",
  "if (typeof process === 'undefined' && typeof fetch !== 'undefined') {"
);

fs.writeFileSync('Personal-Dashboard--main/torn_engine.js', content);
