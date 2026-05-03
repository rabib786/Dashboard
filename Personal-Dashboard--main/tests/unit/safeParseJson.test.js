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

// Mock console.warn to verify it's called
let lastWarn = '';
const originalWarn = console.warn;
console.warn = (...args) => {
    lastWarn = args[0];
};

// Import the function to test
const { safeParseJson } = require('../../app.js');

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

function assertDeepEqual(actual, expected, message) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) {
        throw new Error(`${message || 'Assertion failed'}: expected ${e}, but got ${a}`);
    }
}

// --- Test Cases ---

test('safeParseJson parses valid object', () => {
    const input = '{"a": 1, "b": "test"}';
    const fallback = {};
    const result = safeParseJson(input, fallback);
    assertDeepEqual(result, { a: 1, b: "test" });
});

test('safeParseJson parses valid array', () => {
    const input = '[1, 2, 3]';
    const fallback = [];
    const result = safeParseJson(input, fallback);
    assertDeepEqual(result, [1, 2, 3]);
});

test('safeParseJson returns fallback on invalid JSON', () => {
    const input = '{"a": 1,'; // Malformed
    const fallback = { error: true };
    const result = safeParseJson(input, fallback);
    assertDeepEqual(result, fallback);
});

test('safeParseJson returns fallback on null input', () => {
    const result = safeParseJson(null, 'fallback');
    assertStrictEqual(result, 'fallback');
});

test('safeParseJson returns fallback on empty string', () => {
    const result = safeParseJson('', 'fallback');
    assertStrictEqual(result, 'fallback');
});

test('safeParseJson logs warning with custom label on error', () => {
    lastWarn = '';
    const input = 'invalid';
    const fallback = 'default';
    const label = 'test settings';
    safeParseJson(input, fallback, label);
    if (!lastWarn.includes(`Failed to parse ${label}`)) {
        throw new Error(`Expected warning to include "Failed to parse ${label}", but got "${lastWarn}"`);
    }
});

test('safeParseJson returns fallback when JSON.parse returns null', () => {
    const input = 'null';
    const fallback = 'default';
    const result = safeParseJson(input, fallback);
    assertStrictEqual(result, 'default');
});

test('safeParseJson returns 0 when input is "0"', () => {
    const input = '0';
    const fallback = 'default';
    const result = safeParseJson(input, fallback);
    assertStrictEqual(result, 0);
});

test('safeParseJson returns false when input is "false"', () => {
    const input = 'false';
    const fallback = 'default';
    const result = safeParseJson(input, fallback);
    assertStrictEqual(result, false);
});

console.log('\nAll safeParseJson tests passed! 🎉');
