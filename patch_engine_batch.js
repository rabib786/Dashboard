const fs = require('fs');
let content = fs.readFileSync('Personal-Dashboard--main/test_torn_engine.js', 'utf8');

// The sets might order items differently, causing includes to fail or the assertion logic is slightly off
// `selectionString` could be 'events,messages' or 'messages,events'

content = content.replace(
  "console.assert(res1.selections.includes('events') && res1.selections.includes('messages'), \"Request 1 should be batched with req 2\");",
  "console.assert(res1.selections.includes('events') && res1.selections.includes('messages'), 'Request 1 should be batched with req 2. Got: ' + res1.selections);"
).replace(
  "console.assert(res2.selections.includes('events') && res2.selections.includes('messages'), \"Request 2 should be batched with req 1\");",
  "console.assert(res2.selections.includes('events') && res2.selections.includes('messages'), 'Request 2 should be batched with req 1. Got: ' + res2.selections);"
);

fs.writeFileSync('Personal-Dashboard--main/test_torn_engine.js', content);
