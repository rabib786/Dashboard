// Set globals BEFORE requiring modules
global.SecureStorageAvailable = true;
let mockSecureApiKey = null;
global.SecureStorage = {
  getTornApiKey: function() { return mockSecureApiKey; },
  setTornApiKey: function(key) { mockSecureApiKey = key; }
};

global.localStorage = {
  store: {},
  getItem: function(key) { return this.store[key] || null; },
  setItem: function(key, value) { this.store[key] = value.toString(); },
  removeItem: function(key) { delete this.store[key]; }
};

// Mock DOM
const jsdomMock = `
global.document = {
  createElement: function(tag) {
    if (tag === 'a') {
        return {
            setAttribute: function(){},
            click: function(){},
            remove: function(){}
        };
    }
    return {
      tagName: tag.toUpperCase(),
      className: '',
      id: '',
      innerHTML: '',
      style: { display: '' },
      dataset: {},
      querySelector: function(sel) {
         if (sel === '#torn-widget-list') return {
            addEventListener: function() {},
            querySelectorAll: function() { return []; }
         };
         if (sel === '#torn-api-key') return { value: 'NEW_KEY' };
         if (sel === '#torn-sync-mode') return { value: 'eco' };
         return null;
      },
      querySelectorAll: function(sel) {
         if (sel === '.poll-override') return [{ value: '30', dataset: {id: 'events'} }];
         if (sel === '#torn-widget-list li') return [
             { dataset: {id: 'events'}, querySelector: () => ({ checked: true }) },
             { dataset: {id: 'travel'}, querySelector: () => ({ checked: false }) }
         ];
         return [];
      }
    };
  },
  getElementById: function(id) {
     if (id === 'torn-settings-modal') return null; // Mock not open yet
     return null;
  },
  body: {
    appendChild: function(child) {}
  }
};
global.window = {};
global.TORN_CACHE_KEY = "nexus_torn_cache";
`;

eval(jsdomMock);

const { TornStorage } = require('./torn_engine');
const { TornSettingsUI } = require('./torn_settings');

global.TornStorage = TornStorage;

function testSettings() {
  console.log("Testing Torn Settings UI...");

  TornStorage.saveConfig({ apiKey: "OLD_KEY", syncMode: "standard", widgetOverrides: {} });

  const ui = new TornSettingsUI();
  const el = ui.render();

  console.assert(el.innerHTML.includes('OLD_KEY'), "Should render existing config");

  // Test Save
  // Mock finding the element in the static method
  global.document.getElementById = function(id) {
      if (id === 'torn-settings-modal') return el;
      return null;
  };

  TornSettingsUI.save();

  const newConfig = TornStorage.getConfig();
  console.assert(newConfig.apiKey === 'NEW_KEY', "Should save new API Key");
  console.assert(newConfig.syncMode === 'eco', "Should save new sync mode");
  console.assert(newConfig.widgetOverrides['events'] === 30000, "Should save overrides");

  const newLayout = TornStorage.getLayout();
  console.assert(newLayout.activeWidgets.includes('events') && !newLayout.activeWidgets.includes('travel'), "Should save active widgets");
  console.assert(newLayout.order[0] === 'events' && newLayout.order[1] === 'travel', "Should save widget order");

  console.log("Torn Settings UI tests passed!");
}

testSettings();
