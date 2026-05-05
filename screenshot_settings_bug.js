const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:8080/index.html');
  await page.waitForTimeout(1000);

  // Click settings to open modal
  await page.click('#open-settings-btn');
  await page.waitForTimeout(500);

  // Click "Compact Workspace Mode" toggle
  await page.click('label[for="set-compact"]');
  await page.waitForTimeout(200);

  // Click Save
  await page.click('#settings-save-btn');

  // Take screenshot after save to see if the UI breaks
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'dashboard_after_save.png', fullPage: true });

  await browser.close();
})();
