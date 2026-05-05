const fs = require('fs');
let code = fs.readFileSync('Personal-Dashboard--main/app.js', 'utf8');

// Replace `let tornConfig` with `var tornConfig` to properly hoist it and avoid reference errors
code = code.replace(
  /let tornConfig = safeParseJson\([\s\S]*?"dashboardTornTracker",\n\);/g,
  "var tornConfig = safeParseJson(\n  localStorage.getItem(\"dashboardTornTracker\"),\n  { key: \"\" },\n  \"dashboardTornTracker\",\n);\nif (!tornConfig || typeof tornConfig !== 'object') tornConfig = { key: '' };"
);

// Add fallback inside `saveTornConfig`
code = code.replace(
  /function saveTornConfig\(\) {/g,
  "function saveTornConfig() {\n  if (!tornConfig || typeof tornConfig !== 'object') tornConfig = { key: '' };"
);

fs.writeFileSync('Personal-Dashboard--main/app.js', code);
console.log("Fixed tornConfig initialization in app.js");
