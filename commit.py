import urllib.request
import json
import os

data = {
    "branch_name": "fix/compact-mode-layout-breakage",
    "pr_title": "🎨 Jules: [UI/Customization] - Fix layout breakage when saving settings",
    "pr_body": """**💡 The Objective:** This was a bug fix. Toggling "Compact Workspace Mode" or "Compact Calculator Keypad" and saving the settings would break the masonry and freeform layouts.

**👁️ Visual Changes:** The layout no longer breaks or miscalculates dimensions when settings are saved. The UI gracefully recalculates and applies the requested layout density instantly.

**⚙️ Customization Added/Fixed:** The "Compact Workspace Mode" and "Compact Calculator Keypad" toggles have had their layout sequencing repaired. Previously, their body classes were being manipulated mid-layout calculation, causing race conditions. The class toggles have been pulled out of the layout visibility function and explicitly sequenced in `saveSettings()` and `applyWorkspace()` before recalculations happen.

**🧪 Verification:** Verified via Playwright screenshots that the freeform layout correctly recalculates after settings are saved, and ensured via `test_compact.js` and other tests that no regressions occurred."""
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
