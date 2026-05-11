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
const { isValidHexColor } = require('../../app.js');

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

test('isValidHexColor validates 3-digit hex codes', () => {
    assertStrictEqual(isValidHexColor('#000'), true);
    assertStrictEqual(isValidHexColor('#FFF'), true);
    assertStrictEqual(isValidHexColor('#abc'), true);
    assertStrictEqual(isValidHexColor('#123'), true);
});

test('isValidHexColor validates 6-digit hex codes', () => {
    assertStrictEqual(isValidHexColor('#000000'), true);
    assertStrictEqual(isValidHexColor('#FFFFFF'), true);
    assertStrictEqual(isValidHexColor('#1a2b3c'), true);
    assertStrictEqual(isValidHexColor('#ff00ff'), true);
});

test('isValidHexColor is case-insensitive', () => {
    assertStrictEqual(isValidHexColor('#AbC'), true);
    assertStrictEqual(isValidHexColor('#a1B2c3'), true);
    assertStrictEqual(isValidHexColor('#fFfFFF'), true);
});

test('isValidHexColor trims whitespace', () => {
    assertStrictEqual(isValidHexColor('  #abc  '), true);
    assertStrictEqual(isValidHexColor('\n#000000\t'), true);
});

test('isValidHexColor rejects invalid lengths', () => {
    assertStrictEqual(isValidHexColor('#abcd'), false);
    assertStrictEqual(isValidHexColor('#12345'), false);
    assertStrictEqual(isValidHexColor('#1234567'), false);
    assertStrictEqual(isValidHexColor('#12'), false);
    assertStrictEqual(isValidHexColor('#1'), false);
});

test('isValidHexColor rejects invalid characters', () => {
    assertStrictEqual(isValidHexColor('#ggg'), false);
    assertStrictEqual(isValidHexColor('#12z'), false);
    assertStrictEqual(isValidHexColor('#-12345'), false);
    assertStrictEqual(isValidHexColor('#!@#$%^'), false);
});

test('isValidHexColor rejects missing hash', () => {
    assertStrictEqual(isValidHexColor('abc'), false);
    assertStrictEqual(isValidHexColor('000000'), false);
});

test('isValidHexColor handles null, undefined and empty string', () => {
    assertStrictEqual(isValidHexColor(''), false);
    assertStrictEqual(isValidHexColor(null), false);
    assertStrictEqual(isValidHexColor(undefined), false);
});

console.log('\nAll isValidHexColor tests passed! 🎨');
