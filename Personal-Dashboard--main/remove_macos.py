import re

with open('app.js', 'r') as f:
    content = f.read()

# 1. Remove macOS theme settings from saveSettings
content = re.sub(
    r'\s*// OS Theme\s*'
    r'dashSettings\.osThemeEnabled = [^\n]*\n'
    r'\s*dashSettings\.osTheme = [^\n]*\n'
    r'\s*dashSettings\.dockHoverEffect = [^\n]*\n'
    r'\s*dashSettings\.dockBaseSize = [^\n]*\n'
    r'\s*dashSettings\.dockMagnificationScale = [^\n]*\n'
    r'\s*dashSettings\.dockAppBounce = [^\n]*\n',
    '', content
)

# 2. Remove the minimized windows reset logic
content = re.sub(
    r'\s*// When settings save, restore all minimized windows to clear state\n'
    r'\s*// to prevent getting stuck if OS theme is toggled off\n'
    r'\s*if \(!dashSettings\.osThemeEnabled\) \{\n'
    r'\s*dashSettings\.minimizedModules = \[\];\n'
    r'\s*\}\n',
    '', content
)

# 3. Remove macOS init and save positions logic
content = re.sub(
    r'// --- MACOS WINDOW ENGINE ---[\s\S]*?function saveMacosPositions\(\) \{[\s\S]*?\}\n',
    '', content
)

# 4. Remove macOS check in initDragAndDrop
content = re.sub(
    r'\s*// If macOS theme, initialize windows instead and return early to disable grid D&D\n'
    r'\s*if \(dashSettings\.osThemeEnabled && dashSettings\.osTheme === \'macos\'\) \{\n'
    r'\s*initMacosWindows\(\);\n'
    r'\s*return;\n'
    r'\s*\}\n',
    '', content
)

# 5. Remove topTime update logic
content = re.sub(
    r'\s*// Update MacOS top bar clock\n'
    r'\s*const topTimeEl = document\.getElementById\(\'macos-top-time\'\);\n'
    r'\s*if \(topTimeEl && dashSettings\.osThemeEnabled && dashSettings\.osTheme === \'macos\'\) \{[\s\S]*?\}\n',
    '', content
)

# 6. Remove macOS Context Menu and Mission Control
content = re.sub(
    r'// macOS Context Menu Logic[\s\S]*?(?=if \(typeof module !== \'undefined\')',
    '\n', content
)

# 7. Explicitly replace triggerAutoAlign since it calls saveMacosPositions
content = re.sub(
    r'function triggerAutoAlign\(\) \{[\s\S]*?saveMacosPositions\(\);\n\}\n',
    '', content
)

with open('app.js', 'w') as f:
    f.write(content)
