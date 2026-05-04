const fs = require('fs');
const file = 'Personal-Dashboard--main/app.js';
let content = fs.readFileSync(file, 'utf8');

const search = `  } else if (type === "op") {
    if (calcCurrent === "") {
      if (calcPrevious !== "") {
        calcOperation = val;
      }
      return;
    }
    if (calcPrevious !== "") {
      calcCompute(false);
    }
    calcOperation = val;
    calcPrevious = calcCurrent;
    calcCurrent = "";
    calcResultShown = false;
  } else if (type === "percent") {`;

const replace = `  } else if (type === "op") {
    if (calcCurrent === "") {
      if (calcPrevious !== "") {
        calcOperation = val;
      } else {
        return;
      }
    } else {
      if (calcPrevious !== "") {
        calcCompute(false);
      }
      calcOperation = val;
      calcPrevious = calcCurrent;
      calcCurrent = "";
      calcResultShown = false;
    }
  } else if (type === "percent") {`;

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync(file, content);
  console.log("Patched successfully");
} else {
  console.log("Search string not found!");
}
