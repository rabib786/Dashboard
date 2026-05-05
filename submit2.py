import urllib.request
import json
import os

data = {
    "branch_name": "fix/torn-module-initialization-errors",
    "pr_title": "🪲 Jules: [Bug Fix] - Fix Torn tracker initialization logic errors and race conditions",
    "pr_body": """**💡 The Objective:** This resolves a critical initialization bug causing ReferenceErrors and crashing the new Torn City Tracker module.

**⚙️ Fixes Applied:**
- Fixed dynamic script loading logic for `torn_engine.js`, `torn_widgets.js`, and `torn_settings.js` at the bottom of `app.js`. The condition `!typeof document !== 'undefined'` was evaluating to false in browsers and preventing script injection. Also fixed `querySelector` checking for presence instead of absence of scripts before attempting to inject them.
- Re-scoped `tornConfig` from `let` to `var` to ensure it is properly hoisted and accessible globally.
- Added a fallback in `safeParseJson` assignment and `saveTornConfig` to ensure `tornConfig` is always a valid object (`|| { key: '' }`). This prevents `ReferenceError: Cannot access 'tornConfig' before initialization` and `Cannot set properties of undefined (setting 'key')` errors when inline HTML attributes or timeout callbacks attempt to access/modify the configuration.

**🧪 Verification:**
Verified all unit tests pass, and executed JSDOM tests to explicitly confirm `tornConfig` initializes correctly, scripts inject properly based on conditions, and `saveTornConfig` handles defaults without throwing exceptions."""
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
