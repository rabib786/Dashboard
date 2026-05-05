const fs = require('fs');
const files = ['layout_bug2.png'];
for (const file of files) {
  const data = fs.readFileSync(file);
  console.log(`\n--- ${file} ---`);
  console.log(`![${file}](data:image/png;base64,${data.toString('base64').substring(0, 100)}...)`);
}
