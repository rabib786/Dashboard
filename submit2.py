import urllib.request
import json
import os

data = {
    "branch_name": "fix/xss",
    "pr_title": "Fix XSS vulnerability in calculator history rendering",
    "pr_body": "This patch fixes a Cross-Site Scripting (XSS) vulnerability found in the calculator history module where user input expressions and calculation results were rendered directly into the DOM using `innerHTML` without prior sanitization. The data rendered came from the `calcHistory` array which is persisted to LocalStorage, making it a persistent vulnerability vector.\n\nBy modifying the map function within `updateCalcDisplay()` in `app.js`, both the equation strings and the numerical calculation results are now properly processed with the application's native `escapeHtml()` utility before being inserted into the DOM. This neutralizes potential payloads embedded in calculator interactions."
}

req = urllib.request.Request(
    'http://localhost:8000/submit',
    data=json.dumps(data).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except urllib.error.URLError as e:
    print(f"Error: {e}")
