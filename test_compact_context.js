const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080');

  // Right click to open context menu
  await page.click('body', { button: 'right' });
  await page.waitForSelector('#dashboard-context-menu.active', { state: 'visible' });

  // Take screenshot of context menu
  await page.screenshot({ path: 'context_menu.png' });

  // Click compact mode toggle
  await page.click('button[data-context-action="toggle-compact-mode"]');

  // Take screenshot
  await page.screenshot({ path: 'compact_mode_context.png', fullPage: true });

  await browser.close();
})();
