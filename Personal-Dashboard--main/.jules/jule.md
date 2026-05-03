# Jule's Journal

## Logic Flaw: Calculator operator change bug
**Date**: $(date)
**Description**: The calculator module in `app.js` contained a logic flaw where an early return was triggered if `calcCurrent` was empty while an operator button was pressed. This prevented the user from changing operators without first inputting a number.
**Root Cause**: When a user inputs a number then an operator (e.g., `5` then `+`), `calcCurrent` becomes empty and `calcPrevious` stores the value `5`. If the user immediately clicks another operator (e.g., `-`), `calcCurrent` is evaluated as empty (`""`), triggering `if (calcCurrent === "") return;` and ignoring the operator change.
**The Fix**: Remove the early return `if (calcCurrent === "") return;` and replace it with a condition that updates `calcOperation = val;` and returns if `calcCurrent === ""` and `calcPrevious !== ""`.
