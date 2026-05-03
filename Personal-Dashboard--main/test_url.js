// Mock basic browser globals to allow app.js to be required in Node.js
global.document = {
    addEventListener: () => {},
    getElementById: () => ({ setAttribute: () => {} }),
    querySelectorAll: () => [],
    getElementsByClassName: () => [],
    documentElement: {
        setAttribute: () => {},
        getAttribute: () => null,
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

const { safeUrl, escapeHtml } = require('./app.js');
const assert = require('assert');

const testCases = [
    { name: 'Simple valid URL', input: 'https://google.com', expected: 'https://google.com' },
    { name: 'URL with spaces', input: '  https://google.com  ', expected: 'https://google.com' },
    { name: 'URL with internal whitespace', input: 'https:// google .com', expected: 'https:// google .com' },
    { name: 'URL with HTML characters', input: 'https://example.com?q="test"&a=1', expected: 'https://example.com?q=&quot;test&quot;&amp;a=1' },
    { name: 'JavaScript URL (simple)', input: 'javascript:alert(1)', expected: '#' },
    { name: 'JavaScript URL (case-insensitive)', input: 'JAVASCRIPT:alert(1)', expected: '#' },
    { name: 'JavaScript URL with spaces', input: ' javascript : alert(1) ', expected: '#' },
    { name: 'JavaScript URL with control characters', input: 'j\navascript:alert(1)', expected: '#' },
    { name: 'JavaScript URL with custom fallback', input: 'javascript:alert(1)', fallback: 'https://safe.com', expected: 'https://safe.com' },
    { name: 'Empty input', input: '', expected: '' },
    { name: 'Null input', input: null, expected: '' },
    { name: 'Undefined input', input: undefined, expected: '' },
    { name: 'URL with single quotes', input: "https://example.com?s='test'", expected: 'https://example.com?s=&#039;test&#039;' },
    { name: 'Data URL (should be allowed by current regex)', input: 'data:image/png;base64,123', expected: 'data:image/png;base64,123' }
];

console.log('Running safeUrl utility tests...');

let passed = 0;
testCases.forEach(({ name, input, fallback, expected }) => {
    const result = fallback !== undefined ? safeUrl(input, fallback) : safeUrl(input);
    try {
        assert.strictEqual(result, expected);
        console.log(`✅ Passed: ${name}`);
        passed++;
    } catch (err) {
        console.error(`❌ Failed: ${name} | Expected: "${expected}" | Got: "${result}"`);
    }
});

if (passed === testCases.length) {
    console.log(`\nAll ${passed} tests passed!`);
} else {
    console.error(`\n${testCases.length - passed} tests failed.`);
    process.exit(1);
}
