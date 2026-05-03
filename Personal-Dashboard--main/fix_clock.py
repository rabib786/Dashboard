import re

with open('app.js', 'r') as f:
    content = f.read()

content = re.sub(
    r'const now = new Date\(\); const hour = now\.getHours\(\); const min = now\.getMinutes\(\);            topTimeEl\.textContent = `\$\{dayStr\} \$\{tHr\}:\$\{tMin\} \$\{dashSettings\.clock24Enabled \? \'\' : ampm\}`;\n        \}',
    'const now = new Date(); const hour = now.getHours(); const min = now.getMinutes();',
    content
)

with open('app.js', 'w') as f:
    f.write(content)
