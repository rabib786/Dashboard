const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080');

  // Try to use the keyboard shortcut to test
  await page.keyboard.press('Escape'); // close anything that might be open

  // Right click on the search card, avoiding other elements
  await page.click('#mod-search', { button: 'right' });
  await page.waitForSelector('#dashboard-context-menu.active', { state: 'visible' });

  // Force click the toggle
  await page.click('button[data-context-action="toggle-compact-mode"]', { force: true });

  // Wait a bit
  await page.waitForTimeout(500);

  // Take screenshot after click
  await page.screenshot({ path: 'compact_click_after.png', fullPage: true });

  await browser.close();
})();
