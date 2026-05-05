const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:8080/index.html');
  await page.waitForTimeout(1000);

  // Right click dashboard to show context menu
  await page.click('#dashboard-grid', { button: 'right' });
  await page.waitForTimeout(500);

  // Click "Enable Freeform layout"
  await page.evaluate(() => {
     handleContextMenuAction('toggle-layout-mode');
  });

  await page.waitForTimeout(1000);

  // Open settings
  await page.click('#open-settings-btn');
  await page.waitForTimeout(500);

  // Save settings
  await page.click('#settings-save-btn');

  await page.waitForTimeout(1000);
  await page.screenshot({ path: `layout_bug2.png`, fullPage: true });

  await browser.close();
})();
