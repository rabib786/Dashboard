from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        page.goto("http://127.0.0.1:8000")

        # Take an initial screenshot of the calculator
        calc_card = page.locator('#mod-calculator')
        calc_card.screenshot(path="calculator_initial.png")

        # Do some calculations to build the history tape
        page.locator('button', has_text="1").first.click()
        page.locator('button', has_text="0").first.click()
        page.locator('button', has_text="0").first.click()
        page.locator('button[onclick="calcAction(\'op\', \'-\')"]').first.click()
        page.locator('button', has_text="7").first.click()
        page.locator('button', has_text="0").first.click()
        page.locator('button[onclick="calcAction(\'equals\')"]').first.click()

        page.locator('button', has_text="5").first.click()
        page.locator('button', has_text="0").first.click()
        page.locator('button[onclick="calcAction(\'op\', \'+\')"]').first.click()
        page.locator('button', has_text="2").first.click()
        page.locator('button', has_text="0").first.click()
        page.locator('button[onclick="calcAction(\'equals\')"]').first.click()

        # Take a screenshot with history
        calc_card.screenshot(path="calculator_history.png")

        print("Screenshots taken.")
        browser.close()

if __name__ == "__main__":
    run()
