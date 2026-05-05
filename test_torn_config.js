const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

let html = fs.readFileSync('Personal-Dashboard--main/index.html', 'utf8');
let js = fs.readFileSync('Personal-Dashboard--main/app.js', 'utf8');

// replace saveTornConfig to mock out DOM manipulation and just test tornConfig assignment
js = js.replace(/function saveTornConfig\(\) \{[\s\S]*?\n\}/g, `function saveTornConfig() {
  if (!tornConfig || typeof tornConfig !== 'object') tornConfig = { key: '' };
  tornConfig.key = document.getElementById("torn-cfg-key").value.trim();
  localStorage.setItem("dashboardTornTracker", JSON.stringify(tornConfig));
}`);

html = html.replace('<script src="app.js"></script>', `<script>${js}</script>`);

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  url: "http://localhost/"
});

dom.window.addEventListener('load', () => {
    console.log("Window loaded");
    dom.window.document.getElementById('torn-cfg-key').value = "TEST_KEY_123456789";
    try {
        dom.window.saveTornConfig();
        console.log("saveTornConfig success");
        const tornConfig = JSON.parse(dom.window.localStorage.getItem('dashboardTornTracker'));
        console.log("tornConfig in localStorage:", tornConfig);
    } catch(e) {
        console.error("saveTornConfig error:", e.message);
    }
});
