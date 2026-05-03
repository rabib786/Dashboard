const { performance } = require('perf_hooks');

const bankAppsArr = Array.from({ length: 50 }, (_, i) => ({
  name: `App ${i}`,
  icon: `icon-${i}`,
  path: `path/to/app-${i}`,
}));

function escapeHtml(unsafe) {
  if (typeof unsafe !== "string") return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeUrl(url) { return url; }

function testConcat() {
  let html = "";
  bankAppsArr.forEach((app, i) => {
    html += `
            <div class="bank-app-wrapper" draggable="true" ondragstart="handleSubDragStart(event, 'bank')" ondragover="handleSubDragOver(event)" ondrop="handleSubDrop(event, 'bank', bankAppsArr, saveBankApps, renderBankApps)" ondragend="handleSubDragEnd(event)">
                <a href="${safeUrl(app.path)}" target="_blank" rel="noopener noreferrer" class="app-tile">
                    <i class="ph-fill ${escapeHtml(app.icon)}" aria-hidden="true"></i>
                    <span>${escapeHtml(app.name)}</span>
                </a>
                <button type="button" class="edit-btn bank-edit-btn" aria-label="Edit Tool Name: ${escapeHtml(app.name)}" onclick="editBankApp(${i}, event)" title="Edit Tool Name"><i class="ph ph-pencil-simple" aria-hidden="true"></i></button>
                <button type="button" class="delete-btn bank-del-btn" aria-label="Remove Tool: ${escapeHtml(app.name)}" onclick="deleteBankApp(${i}, event)" title="Remove Tool">&times;</button>
            </div>`;
  });
  return html;
}

function testMapJoin() {
  const html = bankAppsArr.map((app, i) => `
            <div class="bank-app-wrapper" draggable="true" ondragstart="handleSubDragStart(event, 'bank')" ondragover="handleSubDragOver(event)" ondrop="handleSubDrop(event, 'bank', bankAppsArr, saveBankApps, renderBankApps)" ondragend="handleSubDragEnd(event)">
                <a href="${safeUrl(app.path)}" target="_blank" rel="noopener noreferrer" class="app-tile">
                    <i class="ph-fill ${escapeHtml(app.icon)}" aria-hidden="true"></i>
                    <span>${escapeHtml(app.name)}</span>
                </a>
                <button type="button" class="edit-btn bank-edit-btn" aria-label="Edit Tool Name: ${escapeHtml(app.name)}" onclick="editBankApp(${i}, event)" title="Edit Tool Name"><i class="ph ph-pencil-simple" aria-hidden="true"></i></button>
                <button type="button" class="delete-btn bank-del-btn" aria-label="Remove Tool: ${escapeHtml(app.name)}" onclick="deleteBankApp(${i}, event)" title="Remove Tool">&times;</button>
            </div>`).join('');
  return html;
}

const ITERATIONS = 100000;

const startConcat = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  testConcat();
}
const endConcat = performance.now();
const timeConcat = endConcat - startConcat;

const startMapJoin = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  testMapJoin();
}
const endMapJoin = performance.now();
const timeMapJoin = endMapJoin - startMapJoin;

console.log(`Concat time: ${timeConcat.toFixed(2)} ms`);
console.log(`Map+Join time: ${timeMapJoin.toFixed(2)} ms`);
