const { TornStorage } = require('./torn_engine');
const { TornEngine } = require('./torn_engine');
const { EventsWidget, TravelWidget, BarsWidget } = require('./torn_widgets');

// Mock DOM

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


// Mock globals needed by widgets
global.triggerMasonryUpdate = function() {};
global.TornStorage = TornStorage;
global.TornEngine = TornEngine;

// Mock localStorage
global.localStorage = {
  store: {},
  getItem: function(key) {
    return this.store[key] || null;
  },
  setItem: function(key, value) {
    this.store[key] = value.toString();
  },
  removeItem: function(key) {
    delete this.store[key];
  }
};

async function testWidgets() {
  console.log("Testing Torn Widgets...");

  TornStorage.saveConfig({ apiKey: "TEST_KEY", syncMode: "standard", widgetOverrides: {} });

  const container = document.getElementById('torn-dashboard');

  const evWidget = new EventsWidget();
  container.appendChild(evWidget.render());

  // Test initial render
  let html = evWidget.container.innerHTML;
  console.assert(html.includes('Live Events'), "Should render title");
  console.assert(html.includes('Loading...'), "Should render initial loading state");

  // Test update
  await evWidget.update();
  html = evWidget.container.innerHTML;
  console.assert(html.includes('Mocked Events Data'), "Should render mocked data");

  const travelWidget = new TravelWidget();
  container.appendChild(travelWidget.render());
  await travelWidget.update();
  html = travelWidget.container.innerHTML;
  console.assert(html.includes('Mocked Travel Data'), "Travel should render mocked data");

  const barsWidget = new BarsWidget();
  container.appendChild(barsWidget.render());
  await barsWidget.update();
  html = barsWidget.container.innerHTML;
  console.assert(html.includes('Mocked Bars Data'), "Bars should render mocked data");

  console.log("Torn Widgets tests passed!");
}

testWidgets();
