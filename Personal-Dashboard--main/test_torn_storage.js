const { TornStorage } = require('./torn_engine');

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

function testStorage() {
  console.log("Testing TornStorage...");

  // Test Config
  const config = TornStorage.getConfig();
  console.assert(config.syncMode === 'standard', "Default syncMode should be standard");

  config.syncMode = 'aggressive';
  TornStorage.saveConfig(config);

  const updatedConfig = TornStorage.getConfig();
  console.assert(updatedConfig.syncMode === 'aggressive', "syncMode should be updated");

  // Test Cache
  TornStorage.setCache('testKey', { value: 42 }, 1000);
  const cachedData = TornStorage.getCache('testKey');
  console.assert(cachedData && cachedData.value === 42, "Cache should retrieve valid data");

  // Test expired cache
  TornStorage.setCache('testKey', { value: 42 }, -1000); // Expiry in the past
  const expiredData = TornStorage.getCache('testKey');
  console.assert(expiredData === null, "Cache should return null for expired data");

  console.log("TornStorage tests passed!");
}

testStorage();
