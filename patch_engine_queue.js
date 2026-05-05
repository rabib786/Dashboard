const fs = require('fs');
let content = fs.readFileSync('Personal-Dashboard--main/torn_engine.js', 'utf8');

// The issue is processQueue is called immediately when enqueueRequest is called.
// So req1 processes immediately, then req2 is enqueued and processes immediately.
// We need processQueue to be delayed slightly to allow batching of synchronous requests.

content = content.replace(
  "this.processQueue();",
  "setTimeout(() => this.processQueue(), 10);"
);

fs.writeFileSync('Personal-Dashboard--main/torn_engine.js', content);
