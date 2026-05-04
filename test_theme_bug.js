const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set theme to light in localStorage before loading
  await page.addInitScript(() => {
    localStorage.setItem("dashboardTheme", "light");
  });

  await page.goto('http://localhost:8080');

  // Take screenshot immediately after load
  await page.screenshot({ path: 'theme_initial.png' });

  await browser.close();
})();
