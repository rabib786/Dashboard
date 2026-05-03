import re

with open('index.html', 'r') as f:
    content = f.read()

# Remove Enable OS Theme Engine and the whole OS Theme Selector div
content = re.sub(
    r'\s*<div class="form-group toggle-row" style="margin-bottom: 15px;">\s*'
    r'<label class="toggle-label" for="set-os-theme-toggle">Enable OS Theme Engine</label>\s*'
    r'<input type="checkbox" id="set-os-theme-toggle" onchange="toggleOsThemeVisibility\(\)" style="width: 20px; height: 20px; accent-color: var\(--accent\);">\s*'
    r'</div>\s*'
    r'<div id="os-theme-selector"[\s\S]*?</div>\s*</div>',
    '', content
)

# Remove MACOS NATIVE TOP BAR section
content = re.sub(
    r'\s*<!-- MACOS NATIVE TOP BAR -->\s*'
    r'<div id="macos-top-bar" class="macos-top-bar">\s*'
    r'<div class="left">\s*'
    r'<span class="apple-icon"><i class="ph-fill ph-apple-logo"></i></span>\s*'
    r'<span style="font-weight: 700;">Dashboard</span>\s*'
    r'<span>File</span>\s*'
    r'<span>Edit</span>\s*'
    r'<span>View</span>\s*'
    r'<span>Window</span>\s*'
    r'<span>Help</span>\s*'
    r'</div>\s*'
    r'<div class="right">\s*'
    r'<span><i class="ph ph-wifi-high"></i></span>\s*'
    r'<span><i class="ph ph-battery-full"></i></span>\s*'
    r'<span class="time" id="macos-top-time"></span>\s*'
    r'</div>\s*'
    r'</div>',
    '', content
)

# Remove macOS context menu
content = re.sub(
    r'\s*<!-- MACOS CONTEXT MENU -->\s*'
    r'<div id="macos-context-menu" class="macos-context-menu">\s*'
    r'<div class="menu-item" onclick="openSettings\(\)">System Settings\.\.\.</div>\s*'
    r'<div class="menu-item" onclick="triggerMissionControl\(\)">Mission Control</div>\s*'
    r'<div class="menu-item" onclick="triggerAutoAlign\(\)">Snap Windows to Grid</div>\s*'
    r'<div class="menu-divider"></div>\s*'
    r'<div class="menu-item" onclick="window\.location\.reload\(\)">Restart Dashboard</div>\s*'
    r'</div>',
    '', content
)

# Remove the Dock
content = re.sub(
    r'\s*<!-- MACOS DOCK -->\s*'
    r'<div id="macos-dock-container" class="macos-dock-container">\s*'
    r'<div class="macos-dock" id="macos-dock">\s*'
    r'<div class="dock-item" onclick="toggleTheme\(\)" title="Theme Toggle">\s*'
    r'<div class="dock-icon" style="background: linear-gradient\(135deg, #1d976c, #93f9b9\);"><i class="ph ph-moon"></i></div>\s*'
    r'</div>\s*'
    r'<div class="dock-item" onclick="openSettings\(\)" title="System Preferences">\s*'
    r'<div class="dock-icon" style="background: linear-gradient\(135deg, #4A00E0, #8E2DE2\);"><i class="ph ph-gear"></i></div>\s*'
    r'</div>\s*'
    r'<div class="dock-divider"></div>\s*'
    r'<div class="dock-item" onclick="window\.open\(\'https://github\.com/\', \'_blank\', \'noopener,noreferrer\'\)" title="GitHub">\s*'
    r'<div class="dock-icon" style="background: #333;"><i class="ph ph-github-logo"></i></div>\s*'
    r'</div>\s*'
    r'</div>\s*'
    r'</div>',
    '', content
)

with open('index.html', 'w') as f:
    f.write(content)
