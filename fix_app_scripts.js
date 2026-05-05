const fs = require('fs');
let code = fs.readFileSync('Personal-Dashboard--main/app.js', 'utf8');

// Fix the torn_engine import condition
code = code.replace(
  /if \(!typeof document !== 'undefined' && document\.querySelector && document\.querySelector\('script\[src="torn_engine\.js"\]'\)\)/g,
  "if (typeof document !== 'undefined' && document.querySelector && !document.querySelector('script[src=\"torn_engine.js\"]'))"
);

// Fix the torn_widgets import condition
code = code.replace(
  /if \(!typeof document !== 'undefined' && document\.querySelector && document\.querySelector\('script\[src="torn_widgets\.js"\]'\)\)/g,
  "if (typeof document !== 'undefined' && document.querySelector && !document.querySelector('script[src=\"torn_widgets.js\"]'))"
);

// Fix the torn_settings import condition
code = code.replace(
  /if \(!typeof document !== 'undefined' && document\.querySelector && document\.querySelector\('script\[src="torn_settings\.js"\]'\)\)/g,
  "if (typeof document !== 'undefined' && document.querySelector && !document.querySelector('script[src=\"torn_settings.js\"]'))"
);

// Double check just in case there are other instances of !typeof document
code = code.replace(/\!typeof document !== 'undefined'/g, "typeof document !== 'undefined'");

fs.writeFileSync('Personal-Dashboard--main/app.js', code);
console.log("Script loading conditions fixed in app.js");
