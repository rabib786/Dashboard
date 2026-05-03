const assert = require('assert');

function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const testCases = [
    { name: 'Ampersand', input: '&', expected: '&amp;' },
    { name: 'Less than', input: '<', expected: '&lt;' },
    { name: 'Greater than', input: '>', expected: '&gt;' },
    { name: 'Double quote', input: '"', expected: '&quot;' },
    { name: 'Single quote', input: "'", expected: '&#039;' },
    { name: 'Normal string', input: 'Hello World', expected: 'Hello World' },
    { name: 'Mixed string', input: '<b>"Fish & Chips"</b>', expected: '&lt;b&gt;&quot;Fish &amp; Chips&quot;&lt;/b&gt;' },
    { name: 'Empty string', input: '', expected: '' },
    { name: 'XSS payload', input: '<script>alert(1)</script>', expected: '&lt;script&gt;alert(1)&lt;/script&gt;' },
    { name: 'XSS in attribute', input: '"><script>alert(1)</script>', expected: '&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;' },
    { name: 'Non-string input', input: 123, expected: 123 }
];

console.log('Running security fix escapeHtml tests...');

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
