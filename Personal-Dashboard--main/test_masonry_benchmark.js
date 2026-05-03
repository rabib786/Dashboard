const { performance } = require('perf_hooks');

// Mock DOM
class MockElement {
    constructor(id) {
        this.id = id;
        this.style = {};
        this._height = 100;
        this._display = 'block';
    }
    getBoundingClientRect() {
        // Simulate forced reflow cost if style was changed since last read
        if (global.styleDirty) {
            for (let i=0; i<1000; i++) {} // Simulate reflow cost
            global.styleDirty = false;
        }
        return { height: this._height };
    }
}

global.styleDirty = false;

const getComputedStyleMock = (el) => {
    return { display: el._display };
};

const cachedMasonryCards = Array.from({length: 20}, (_, i) => new MockElement(i));

function triggerMasonryUpdateBaseline() {
    for (let i = 0; i < cachedMasonryCards.length; i++) {
        const card = cachedMasonryCards[i];
        if(getComputedStyleMock(card).display === 'none') continue;
        const h = card.getBoundingClientRect().height;
        card.style.gridRowEnd = `span ${Math.ceil(h) + 20}`;
        global.styleDirty = true; // Writing style dirties layout
    }
}

function triggerMasonryUpdateOptimized() {
    const updates = [];
    for (let i = 0; i < cachedMasonryCards.length; i++) {
        const card = cachedMasonryCards[i];
        if(getComputedStyleMock(card).display === 'none') continue;
        const h = card.getBoundingClientRect().height;
        updates.push({ card, span: `span ${Math.ceil(h) + 20}` });
    }
    for (let i = 0; i < updates.length; i++) {
        updates[i].card.style.gridRowEnd = updates[i].span;
        global.styleDirty = true;
    }
}

function runBenchmark() {
    const ITERATIONS = 10000;

    const startBaseline = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        triggerMasonryUpdateBaseline();
    }
    const endBaseline = performance.now();
    const baselineMs = endBaseline - startBaseline;

    const startOptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        triggerMasonryUpdateOptimized();
    }
    const endOptimized = performance.now();
    const optimizedMs = endOptimized - startOptimized;

    console.log(`Baseline execution time: ${baselineMs.toFixed(2)} ms`);
    console.log(`Optimized execution time: ${optimizedMs.toFixed(2)} ms`);

    const improvement = ((baselineMs - optimizedMs) / baselineMs) * 100;
    console.log(`Improvement: ${improvement.toFixed(2)}% faster`);
}

runBenchmark();
