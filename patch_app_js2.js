const fs = require('fs');
let content = fs.readFileSync('Personal-Dashboard--main/app.js', 'utf8');

// Use a regex to replace all instances
content = content.replace(/document\.head\.appendChild\(script\);/g, "if (typeof document !== 'undefined' && document.head) document.head.appendChild(script);");
content = content.replace(/document\.head\.appendChild\(tornStyles\);/g, "if (typeof document !== 'undefined' && document.head) document.head.appendChild(tornStyles);");
content = content.replace(/document\.head\.appendChild\(settingsStyles\);/g, "if (typeof document !== 'undefined' && document.head) document.head.appendChild(settingsStyles);");
content = content.replace(/document\.querySelector\('script/g, "typeof document !== 'undefined' && document.querySelector && document.querySelector('script");
content = content.replace(/document\.createElement\('script'\)/g, "typeof document !== 'undefined' ? document.createElement('script') : {}");
content = content.replace(/document\.createElement\('style'\)/g, "typeof document !== 'undefined' ? document.createElement('style') : {}");

fs.writeFileSync('Personal-Dashboard--main/app.js', content);
