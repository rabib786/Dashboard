// Mocking DOM elements since we don't have JSDOM in some environments
class MockElement {
    constructor() {
        this.events = {};
        this.complete = false;
        this.naturalWidth = 0;
    }
    addEventListener(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    }
    dispatchEvent(event) {
        if (this.events[event]) {
            this.events[event].forEach(cb => cb());
        }
    }
}

// Mock triggerMasonryUpdate
let masonryUpdateCalled = 0;
global.triggerMasonryUpdate = () => {
    masonryUpdateCalled++;
};

function testRenderNewsItemsLogic(images) {
    const totalImages = images.length;
    const finishedImages = new Set();
    let masonryTriggered = false;

    const triggerOnce = () => {
        if (masonryTriggered) return;
        masonryTriggered = true;
        global.triggerMasonryUpdate();
    };

    const safetyTimeout = setTimeout(triggerOnce, 2000);

    if (totalImages === 0) {
        clearTimeout(safetyTimeout);
        triggerOnce();
    } else {
        const checkDone = (img) => {
            finishedImages.add(img);
            if (finishedImages.size >= totalImages) {
                clearTimeout(safetyTimeout);
                triggerOnce();
            }
        };

        images.forEach((img) => {
            if (img.complete && img.naturalWidth !== 0) {
                checkDone(img);
            } else {
                img.addEventListener("load", () => checkDone(img));
                img.addEventListener("error", () => checkDone(img));
            }
        });
    }
    return safetyTimeout;
}

async function runTests() {
    console.log("Test 1: No images");
    masonryUpdateCalled = 0;
    testRenderNewsItemsLogic([]);
    if (masonryUpdateCalled !== 1) throw new Error("Should call masonry update immediately if no images");

    console.log("Test 2: Images already complete");
    masonryUpdateCalled = 0;
    const img1 = new MockElement();
    img1.complete = true;
    img1.naturalWidth = 100;
    testRenderNewsItemsLogic([img1]);
    if (masonryUpdateCalled !== 1) throw new Error("Should call masonry update if images are complete");

    console.log("Test 3: Images loading asynchronously");
    masonryUpdateCalled = 0;
    const img2 = new MockElement();
    testRenderNewsItemsLogic([img2]);
    if (masonryUpdateCalled !== 0) throw new Error("Should NOT call masonry update yet");

    img2.dispatchEvent('load');
    if (masonryUpdateCalled !== 1) throw new Error("Should call masonry update after load event");

    console.log("Test 4: One image loads, one errors");
    masonryUpdateCalled = 0;
    const img3 = new MockElement();
    const img4 = new MockElement();
    testRenderNewsItemsLogic([img3, img4]);

    img3.dispatchEvent('load');
    if (masonryUpdateCalled !== 0) throw new Error("Should NOT call masonry update after first image");

    img4.dispatchEvent('error');
    if (masonryUpdateCalled !== 1) throw new Error("Should call masonry update after second image errors");

    console.log("Test 5: Safety timeout");
    masonryUpdateCalled = 0;
    const img5 = new MockElement();
    testRenderNewsItemsLogic([img5]);

    await new Promise(resolve => setTimeout(resolve, 2100));
    if (masonryUpdateCalled !== 1) throw new Error("Should call masonry update after safety timeout");

    console.log("Test 6: Multiple events on same image");
    masonryUpdateCalled = 0;
    const img6 = new MockElement();
    testRenderNewsItemsLogic([img6]);
    img6.dispatchEvent('load');
    img6.dispatchEvent('load'); // Should not cause multiple counts if handled correctly
    if (masonryUpdateCalled !== 1) throw new Error("Should call masonry update once");

    console.log("All news-masonry tests passed! 🎉");
}

runTests().catch(err => {
    console.error(err);
    process.exit(1);
});
