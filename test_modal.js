const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080');

  // Wait for the settings button to be available
  await page.waitForSelector('#open-settings-btn');

  // Click the settings button
  await page.click('#open-settings-btn');

  // Wait for modal to be visible
  await page.waitForSelector('#settings-modal.active', { state: 'visible' });

  // Take a screenshot
  await page.screenshot({ path: 'settings_modal.png' });

  await browser.close();
})();
