const fs = require('fs');
let content = fs.readFileSync('Personal-Dashboard--main/test_torn_widgets.js', 'utf8');

// Replace JSDOM with a simple mock
const jsdomMock = `
global.document = {
  createElement: function(tag) {
    return {
      tagName: tag.toUpperCase(),
      className: '',
      id: '',
      innerHTML: '',
      querySelector: function(sel) {
         if (sel === '.widget-status') return { innerText: '' };
         if (sel.startsWith('#content')) return this;
         return null;
      }
    };
  },
  getElementById: function(id) {
    return {
      appendChild: function(child) {}
    };
  }
};
global.window = {};
`;

content = content.replace("const jsdom = require(\"jsdom\");\nconst { JSDOM } = jsdom;\nconst dom = new JSDOM(`<!DOCTYPE html><html><body><div id=\"torn-dashboard\"></div></body></html>`);\nglobal.document = dom.window.document;\nglobal.window = dom.window;", jsdomMock);

fs.writeFileSync('Personal-Dashboard--main/test_torn_widgets.js', content);
