const fs = require('fs');
let content = fs.readFileSync('Personal-Dashboard--main/app.js', 'utf8');

content = content.replace(
  "document.head.appendChild(script);",
  "if (typeof document !== 'undefined' && document.head) document.head.appendChild(script);"
).replace(
  "document.head.appendChild(tornStyles);",
  "if (typeof document !== 'undefined' && document.head) document.head.appendChild(tornStyles);"
).replace(
  "document.head.appendChild(settingsStyles);",
  "if (typeof document !== 'undefined' && document.head) document.head.appendChild(settingsStyles);"
).replace(
  "document.head.appendChild(script);",
  "if (typeof document !== 'undefined' && document.head) document.head.appendChild(script);"
);

fs.writeFileSync('Personal-Dashboard--main/app.js', content);
