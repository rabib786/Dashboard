const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080');

  // Wait for the settings button to be available
  await page.waitForSelector('#open-settings-btn');
  await page.click('#open-settings-btn');
  await page.waitForSelector('#settings-modal.active', { state: 'visible' });

  // Toggle compact mode
  const isChecked = await page.$eval('#set-compact', el => el.checked);
  if (!isChecked) {
      await page.click('#set-compact');
  }

  // Save settings
  await page.click('#settings-save-btn');

  // Wait for the modal to close by checking the class directly
  await page.waitForFunction(() => !document.getElementById('settings-modal').classList.contains('active'));

  // Take screenshot
  await page.screenshot({ path: 'compact_mode.png', fullPage: true });

  await browser.close();
})();
