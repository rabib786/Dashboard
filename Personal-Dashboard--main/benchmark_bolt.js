const { performance } = require('perf_hooks');

// Simulating the DOM NodeList
const mockCards = Array(9).fill({
    id: "mod-test",
    querySelector: () => ({ addEventListener: () => {}, setAttribute: () => {}, classList: { add: () => {}, remove: () => {} }, dataset: {} }),
    addEventListener: () => {}
});

const document = {
    getElementById: () => ({
        children: Array(9).fill({}),
        querySelectorAll: () => mockCards,
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 })
    }),
    querySelectorAll: () => mockCards
};

function runCurrentInit() {
  let count = 0;
  // Simulated initDragAndDrop
  document.querySelectorAll(".card").forEach((card) => {
    count++;
  });
  // Simulated initWidgetDragging
  document.querySelectorAll(".card").forEach((card) => {
    count++;
  });
  // Simulated initResizableCards
  document.querySelectorAll(".card:not(#mod-calculator)").forEach((card) => {
    count++;
  });
  return count;
}

function runOptimizedInit() {
  let count = 0;
  // Optimized combined initialization
  const cards = document.querySelectorAll(".card");
  // Simulated initDragAndDrop
  cards.forEach((card) => {
    count++;
  });
  // Simulated initWidgetDragging
  cards.forEach((card) => {
    count++;
  });
  // Simulated initResizableCards
  cards.forEach((card) => {
    if (card.id === "mod-calculator") return;
    count++;
  });
  return count;
}

function runBenchmark() {
    const ITERATIONS = 10000;

    const startBaseline = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        runCurrentInit();
    }
    const endBaseline = performance.now();
    const baselineMs = endBaseline - startBaseline;

    const startOptimized = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        runOptimizedInit();
    }
    const endOptimized = performance.now();
    const optimizedMs = endOptimized - startOptimized;

    console.log(`Current execution time for ${ITERATIONS} iterations: ${baselineMs.toFixed(2)} ms`);
    console.log(`Optimized execution time for ${ITERATIONS} iterations: ${optimizedMs.toFixed(2)} ms`);

    const improvement = ((baselineMs - optimizedMs) / baselineMs) * 100;
    console.log(`Improvement: ${improvement.toFixed(2)}% faster`);
}

runBenchmark();
