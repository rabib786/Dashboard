// Minimal mocks for app.js to run in Node without JSDOM
global.window = {
    addEventListener: () => {},
    localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
    },
    navigator: {
        userAgent: 'node',
        clipboard: { writeText: () => Promise.resolve() }
    }
};
global.document = {
    addEventListener: () => {},
    getElementById: () => ({ focus: () => {}, style: {} }),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, classList: { add: () => {} } }),
    body: { classList: { add: () => {}, remove: () => {}, contains: () => false }, appendChild: () => {} }
};
global.localStorage = global.window.localStorage;
Object.defineProperty(global, "navigator", {
  value: global.window.navigator,
  writable: true
});
global.Node = class Node {};
global.Element = class Element extends Node {};
global.MutationObserver = class { observe() {} disconnect() {} };
global.Audio = class { play() {} pause() {} };
global.confirm = () => true;

// Import the functions to test
const { getModuleKeyByCardId, getCardIdByModuleKey } = require('../../app.js');

// Test runner
function test(name, fn) {
    try {
        fn();
        console.log(`✅ PASS: ${name}`);
    } catch (err) {
        console.error(`❌ FAIL: ${name}`);
        console.error(err);
        process.exit(1);
    }
}

function assertStrictEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message || 'Assertion failed'}: expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
    }
}

// --- Test Cases ---

// getModuleKeyByCardId tests
test('getModuleKeyByCardId returns correct module key for valid card id', () => {
    assertStrictEqual(getModuleKeyByCardId('mod-search'), 'search');
    assertStrictEqual(getModuleKeyByCardId('mod-calculator'), 'calculator');
    assertStrictEqual(getModuleKeyByCardId('mod-weather'), 'weather');
});

test('getModuleKeyByCardId returns null for invalid card id', () => {
    assertStrictEqual(getModuleKeyByCardId('non-existent'), null);
});

test('getModuleKeyByCardId returns null for null/undefined input', () => {
    assertStrictEqual(getModuleKeyByCardId(null), null);
    assertStrictEqual(getModuleKeyByCardId(undefined), null);
});

// getCardIdByModuleKey tests
test('getCardIdByModuleKey returns correct card id for valid module key', () => {
    assertStrictEqual(getCardIdByModuleKey('search'), 'mod-search');
    assertStrictEqual(getCardIdByModuleKey('calculator'), 'mod-calculator');
    assertStrictEqual(getCardIdByModuleKey('weather'), 'mod-weather');
});

test('getCardIdByModuleKey returns null for invalid module key', () => {
    assertStrictEqual(getCardIdByModuleKey('non-existent'), null);
});

test('getCardIdByModuleKey returns null for null/undefined input', () => {
    assertStrictEqual(getCardIdByModuleKey(null), null);
    assertStrictEqual(getCardIdByModuleKey(undefined), null);
});

console.log('\nAll moduleMapping tests passed! 🎉');
