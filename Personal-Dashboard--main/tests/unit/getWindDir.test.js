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

// Import the function to test
const { getWindDir } = require('../../app.js');

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

test('getWindDir returns N for 0 degrees', () => {
    assertStrictEqual(getWindDir(0), 'N');
});

test('getWindDir returns N for 360 degrees', () => {
    assertStrictEqual(getWindDir(360), 'N');
});

test('getWindDir returns NE for 45 degrees', () => {
    assertStrictEqual(getWindDir(45), 'NE');
});

test('getWindDir returns E for 90 degrees', () => {
    assertStrictEqual(getWindDir(90), 'E');
});

test('getWindDir returns SE for 135 degrees', () => {
    assertStrictEqual(getWindDir(135), 'SE');
});

test('getWindDir returns S for 180 degrees', () => {
    assertStrictEqual(getWindDir(180), 'S');
});

test('getWindDir returns SW for 225 degrees', () => {
    assertStrictEqual(getWindDir(225), 'SW');
});

test('getWindDir returns W for 270 degrees', () => {
    assertStrictEqual(getWindDir(270), 'W');
});

test('getWindDir returns NW for 315 degrees', () => {
    assertStrictEqual(getWindDir(315), 'NW');
});

test('getWindDir boundary cases', () => {
    // 0-22.4 -> N
    assertStrictEqual(getWindDir(22), 'N');
    // 22.5-67.4 -> NE
    assertStrictEqual(getWindDir(23), 'NE');
    assertStrictEqual(getWindDir(67), 'NE');
    // 67.5-112.4 -> E
    assertStrictEqual(getWindDir(68), 'E');
    // 337.5 - 360... actually 337.5+ is N again because of % 8
    assertStrictEqual(getWindDir(337), 'NW');
    assertStrictEqual(getWindDir(338), 'N');
});

test('getWindDir handles values over 360', () => {
    assertStrictEqual(getWindDir(405), 'NE'); // 405/45 = 9, 9%8 = 1
    assertStrictEqual(getWindDir(720), 'N');   // 720/45 = 16, 16%8 = 0
});

console.log('\nAll getWindDir tests passed! 🌬️');
