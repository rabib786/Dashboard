const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:8080');

  // Try to toggle via evaluate to bypass context menu issues in Playwright
  await page.evaluate(() => {
    dashSettings.compactMode = true;
    persistDashboardSettingsFromContextMenu();
  });

  // Wait a bit
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'compact_click_after_fix.png', fullPage: true });

  await browser.close();
})();
