const fs = require('fs');
let content = fs.readFileSync('Personal-Dashboard--main/test_torn_settings.js', 'utf8');

const storageMock = `
global.localStorage = {
  store: {},
  getItem: function(key) { return this.store[key] || null; },
  setItem: function(key, value) { this.store[key] = value.toString(); },
  removeItem: function(key) { delete this.store[key]; }
};
`;

content = content.replace("global.TornStorage = TornStorage;", storageMock + "\nglobal.TornStorage = TornStorage;");

fs.writeFileSync('Personal-Dashboard--main/test_torn_settings.js', content);
