const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:8080');

  // Right click anywhere on body to open context menu
  await page.evaluate(() => {
    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100
    });
    document.dispatchEvent(event);
  });

  await page.waitForSelector('#dashboard-context-menu.active', { state: 'visible' });

  // Toggle compact mode
  await page.click('button[data-context-action="toggle-compact-mode"]');

  // Wait a bit
  await page.waitForTimeout(500);

  // Check the classes on body and document element
  const bodyClasses = await page.evaluate(() => document.body.className);
  const rootClasses = await page.evaluate(() => document.documentElement.className);
  const layoutClasses = await page.evaluate(() => document.getElementById('dashboard-grid').className);

  console.log('Body classes:', bodyClasses);
  console.log('Root classes:', rootClasses);
  console.log('Dashboard classes:', layoutClasses);

  await page.screenshot({ path: 'compact_toggled.png', fullPage: true });

  await browser.close();
})();
