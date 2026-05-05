const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('Personal-Dashboard--main/index.html', 'utf8');
const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'file://' + __dirname + '/Personal-Dashboard--main/index.html'
});

dom.window.addEventListener('load', () => {
    console.log("Window loaded");
    dom.window.document.getElementById('torn-cfg-key').value = "TEST_KEY_123456789";
    try {
        dom.window.saveTornConfig();
        console.log("saveTornConfig success");
    } catch(e) {
        console.error("saveTornConfig error:", e.message);
    }
});
