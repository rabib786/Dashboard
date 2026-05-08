// Set globals BEFORE requiring the module
global.SecureStorageAvailable = true;
let mockSecureApiKey = null;
global.SecureStorage = {
  getTornApiKey: function() { return mockSecureApiKey; },
  setTornApiKey: function(key) { mockSecureApiKey = key; }
};

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

const { TornStorage } = require('./torn_engine');
const { TornEngine } = require('./torn_engine');

async function testEngine() {
  console.log("Testing TornEngine...");

  // Setup valid config
  TornStorage.saveConfig({ apiKey: "TEST_KEY", syncMode: "standard" });

  const req1 = TornEngine.enqueueRequest('user', ['events']);
  const req2 = TornEngine.enqueueRequest('user', ['messages']);
  const req3 = TornEngine.enqueueRequest('faction', ['basic'], '1234');

  const [res1, res2, res3] = await Promise.all([req1, req2, req3]);

  console.assert(res1._mocked === true, "Request 1 should be mocked");
  console.assert(res1.selections.includes('events') && res1.selections.includes('messages'), 'Request 1 should be batched with req 2. Got: ' + res1.selections);

  console.assert(res2.selections.includes('events') && res2.selections.includes('messages'), 'Request 2 should be batched with req 1. Got: ' + res2.selections);

  console.assert(res3.selections === 'basic', "Request 3 should be separate batch");

  console.log("TornEngine tests passed!");
}

testEngine();
