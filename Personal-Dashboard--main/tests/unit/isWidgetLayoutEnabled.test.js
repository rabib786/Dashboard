// Minimal mocks for app.js to run in Node
global.window = {
    innerWidth: 1024,
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

// Import the function and settings to test
const { isWidgetLayoutEnabled, dashSettings } = require('../../app.js');

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

const DESKTOP_WIDGET_MIN_WIDTH = 980;

// --- Test Cases ---

test('isWidgetLayoutEnabled returns true when layoutMode is freeform and width >= 980', () => {
    dashSettings.layoutMode = 'freeform';
    global.window.innerWidth = 980;
    assertStrictEqual(isWidgetLayoutEnabled(), true, 'Should be enabled at exactly 980px');

    global.window.innerWidth = 1200;
    assertStrictEqual(isWidgetLayoutEnabled(), true, 'Should be enabled above 980px');
});

test('isWidgetLayoutEnabled returns false when width < 980', () => {
    dashSettings.layoutMode = 'freeform';
    global.window.innerWidth = 979;
    assertStrictEqual(isWidgetLayoutEnabled(), false, 'Should be disabled below 980px');

    global.window.innerWidth = 500;
    assertStrictEqual(isWidgetLayoutEnabled(), false, 'Should be disabled on mobile');
});

test('isWidgetLayoutEnabled returns false when layoutMode is NOT freeform', () => {
    dashSettings.layoutMode = 'grid';
    global.window.innerWidth = 1024;
    assertStrictEqual(isWidgetLayoutEnabled(), false, 'Should be disabled in grid mode even on desktop');

    dashSettings.layoutMode = 'something-else';
    assertStrictEqual(isWidgetLayoutEnabled(), false, 'Should be disabled in unknown mode');
});

console.log('\nAll isWidgetLayoutEnabled tests passed! 🎉');
