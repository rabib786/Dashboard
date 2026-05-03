const fs = require('fs');
let code = fs.readFileSync('benchmark_bolt.js', 'utf8');
code = code.replace(/const jsdom = require\("jsdom"\);/g, '// const jsdom = require("jsdom");');
code = code.replace(/const { JSDOM } = jsdom;/g, '// const { JSDOM } = jsdom;');
code = code.replace(/const dom = new JSDOM/g, '// const dom = new JSDOM');
fs.writeFileSync('benchmark_bolt.js', code);
