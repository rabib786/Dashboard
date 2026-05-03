from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('http://127.0.0.1:8000/index.html', wait_until='networkidle')

    # Wait for calculator to be ready
    page.wait_for_selector('#mod-calculator')

    print(f"Slider visible? {page.is_visible('#calc-scale-slider')}")

    # Click settings gear
    page.click('#calc-settings-btn')
    print("Clicked settings gear")

    # Take screenshot before scale
    page.locator('#mod-calculator').screenshot(path="calc_before.png")

    # Evaluate changing the slider
    page.evaluate('''() => {
        const slider = document.getElementById('calc-scale-slider');
        slider.value = 0.6;
        slider.dispatchEvent(new Event('input', {bubbles: true}));
        slider.dispatchEvent(new Event('change', {bubbles: true}));
    }''')

    page.wait_for_timeout(500)

    css_scale = page.evaluate("document.getElementById('mod-calculator').style.getPropertyValue('--calc-scale')")
    print(f"CSS scale updated to: {css_scale}")

    # Take screenshot after scale
    page.locator('#mod-calculator').screenshot(path="calc_after.png")

    browser.close()
