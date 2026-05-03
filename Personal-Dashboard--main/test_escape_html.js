// Mock basic browser globals to allow app.js to be required in Node.js
global.document = {
    addEventListener: () => {},
    getElementById: () => ({ setAttribute: () => {}, style: {} }),
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

const { escapeHtml } = require('./app.js');
const assert = require('assert');

const testCases = [
    { name: 'Ampersand', input: '&', expected: '&amp;' },
    { name: 'Less than', input: '<', expected: '&lt;' },
    { name: 'Greater than', input: '>', expected: '&gt;' },
    { name: 'Double quote', input: '"', expected: '&quot;' },
    { name: 'Single quote', input: "'", expected: '&#039;' },
    { name: 'Normal string', input: 'Hello World', expected: 'Hello World' },
    { name: 'Mixed string', input: '<b>"Fish & Chips"</b>', expected: '&lt;b&gt;&quot;Fish &amp; Chips&quot;&lt;/b&gt;' },
    { name: 'Empty string', input: '', expected: '' },
    { name: 'Null input', input: null, expected: '' },
    { name: 'Undefined input', input: undefined, expected: '' },
    { name: 'Multiple occurrences', input: '<<<<', expected: '&lt;&lt;&lt;&lt;' },
    { name: 'All special characters', input: '&<>"\'', expected: '&amp;&lt;&gt;&quot;&#039;' },
    { name: 'Multi-line string', input: 'Line 1\n<br>\nLine 2', expected: 'Line 1\n&lt;br&gt;\nLine 2' },
    { name: 'Number input', input: 123, expected: '123' },
    { name: 'Number zero', input: 0, expected: '0' },
    { name: 'Boolean false', input: false, expected: 'false' },
    { name: 'Array input', input: ['<script>'], expected: '&lt;script&gt;' },

];

console.log('Running escapeHtml utility tests...');

let passed = 0;
testCases.forEach(({ name, input, expected }) => {
    const result = escapeHtml(input);
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
