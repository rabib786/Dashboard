const fs = require('fs');

let appJs = fs.readFileSync('Personal-Dashboard--main/app.js', 'utf8');

// Replace document.createElement('style') : {} with a safer check
appJs = appJs.replace(
  "const tornStyles = typeof document !== 'undefined' ? document.createElement('style') : {};",
  "const tornStyles = (typeof document !== 'undefined' && document.createElement) ? document.createElement('style') : {};"
);

appJs = appJs.replace(
  "const script = typeof document !== 'undefined' ? document.createElement('script') : {};",
  "const script = (typeof document !== 'undefined' && document.createElement) ? document.createElement('script') : {};"
);

appJs = appJs.replace(
  "const settingsStyles = typeof document !== 'undefined' ? document.createElement('style') : {};",
  "const settingsStyles = (typeof document !== 'undefined' && document.createElement) ? document.createElement('style') : {};"
);


fs.writeFileSync('Personal-Dashboard--main/app.js', appJs);
console.log('Patched app.js');
