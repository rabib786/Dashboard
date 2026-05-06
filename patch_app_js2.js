const fs = require('fs');

let appJs = fs.readFileSync('Personal-Dashboard--main/app.js', 'utf8');

appJs = appJs.replace(
  'return `<div class="calc-history-item">${item}</div>`;',
  'return `<div class="calc-history-item">${escapeHtml(item)}</div>`;'
);

appJs = appJs.replace(
  'return `<div class="calc-history-item">${item.equation}${hasResult ? ` = ${formatCalcValue(item.result)}` : ""}</div>`;',
  'return `<div class="calc-history-item">${escapeHtml(item.equation)}${hasResult ? ` = ${escapeHtml(formatCalcValue(item.result))}` : ""}</div>`;'
);

fs.writeFileSync('Personal-Dashboard--main/app.js', appJs);
console.log('Patched app.js');
