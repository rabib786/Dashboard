const { test, expect, chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8000/index.html');

  // Wait for the page to load completely
  await page.waitForSelector('#mod-calculator');

  // Verify scale slider exists
  const slider = await page.$('#calc-scale-slider');
  console.log("Slider exists:", !!slider);

  // Click settings gear
  await page.click('#calc-settings-btn');
  console.log("Clicked settings gear");

  // Verify panel is visible
  const panelVisible = await page.evaluate(() => {
      const panel = document.getElementById('calc-settings-panel');
      return panel && panel.style.display === 'block';
  });
  console.log("Panel is visible:", panelVisible);

  // Take a screenshot of the calculator before scale change
  await page.locator('#mod-calculator').screenshot({ path: 'calc_before.png' });

  // Change slider value
  await page.evaluate(() => {
      const slider = document.getElementById('calc-scale-slider');
      slider.value = 0.5;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      slider.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // Wait for UI to update
  await page.waitForTimeout(500);

  // Verify value updated
  const scaleText = await page.evaluate(() => document.getElementById('calc-scale-val').innerText);
  console.log("Scale text value:", scaleText);

  // Verify CSS variable updated
  const cssScale = await page.evaluate(() => {
      return document.getElementById('mod-calculator').style.getPropertyValue('--calc-scale');
  });
  console.log("CSS Scale value:", cssScale);

  // Take screenshot after scale change
  await page.locator('#mod-calculator').screenshot({ path: 'calc_after.png' });

  await browser.close();
})();
