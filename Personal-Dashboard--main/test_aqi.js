// Mock basic browser globals to allow app.js to be required in Node.js
global.document = {
    addEventListener: () => {},
    getElementById: () => ({ setAttribute: () => {} }),
    querySelectorAll: () => [],
    documentElement: {
        setAttribute: () => {},
        style: {}
    }
};
global.window = {
    addEventListener: () => {},
    localStorage: {
        getItem: () => null,
        setItem: () => null
    },
    location: { reload: () => {} },
    getComputedStyle: () => ({ getPropertyValue: () => '' })
};
global.localStorage = global.window.localStorage;
global.navigator = { userAgent: 'node' };
global.Audio = class {
    constructor() {}
    play() {}
};
global.MutationObserver = class {
    constructor() {}
    observe() {}
};

const { getAqiInfo } = require('./app.js');
const assert = require('assert');

const testCases = [
    { aqi: 0, expected: { l: 'Good', c: '#34c759' } },
    { aqi: 49, expected: { l: 'Good', c: '#34c759' } },
    { aqi: 50, expected: { l: 'Good', c: '#34c759' } },
    { aqi: 51, expected: { l: 'Moderate', c: '#ff9500' } },
    { aqi: 99, expected: { l: 'Moderate', c: '#ff9500' } },
    { aqi: 100, expected: { l: 'Moderate', c: '#ff9500' } },
    { aqi: 101, expected: { l: 'Unhealthy', c: '#ff3b30' } },
    { aqi: 149, expected: { l: 'Unhealthy', c: '#ff3b30' } },
    { aqi: 150, expected: { l: 'Unhealthy', c: '#ff3b30' } },
    { aqi: 151, expected: { l: 'Hazardous', c: '#af52de' } },
    { aqi: 200, expected: { l: 'Hazardous', c: '#af52de' } }
];

console.log('Running AQI boundary tests (using require and comprehensive mocks)...');

let passed = 0;
testCases.forEach(({ aqi, expected }) => {
    const result = getAqiInfo(aqi);
    try {
        assert.deepStrictEqual(result, expected);
        console.log(`✅ Passed: AQI ${aqi} => ${result.l} (${result.c})`);
        passed++;
    } catch (err) {
        console.error(`❌ Failed: AQI ${aqi} | Expected: ${JSON.stringify(expected)} | Got: ${JSON.stringify(result)}`);
    }
});

if (passed === testCases.length) {
    console.log(`\nAll ${passed} tests passed!`);
} else {
    console.error(`\n${testCases.length - passed} tests failed.`);
    process.exit(1);
}
