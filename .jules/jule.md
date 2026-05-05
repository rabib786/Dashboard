# Performance improvement in benchmark.js
Extracted `new Date(displayedYear, displayedMonth + 1, 0).getDate()` to a variable named `daysInMonth` outside the core logic loop in both `renderCalendarBaseline` and `renderCalendarOptimized` functions in `Personal-Dashboard--main/benchmark.js`.
This improves performance by reducing the number of unnecessary `Date` instantiations from every loop iteration to just once before the loop.
# Performance improvement in benchmark.js
Extracted `new Date(displayedYear, displayedMonth + 1, 0).getDate()` to a variable named `daysInMonth` outside the core logic loop in both `renderCalendarBaseline` and `renderCalendarOptimized` functions in `Personal-Dashboard--main/benchmark.js`.
This improves performance by reducing the number of unnecessary `Date` instantiations from every loop iteration to just once before the loop.

## Logic Flaw: Calculator operator change bug
**Description**: The calculator module in `app.js` contained a logic flaw where an early return was triggered if `calcCurrent` was empty while an operator button was pressed. This prevented the user from changing operators without first inputting a number.
**Root Cause**: When a user inputs a number then an operator (e.g., `5` then `+`), `calcCurrent` becomes empty and `calcPrevious` stores the value `5`. If the user immediately clicks another operator (e.g., `-`), `calcCurrent` is evaluated as empty (`""`), triggering `if (calcCurrent === "") { ... } else { return; }` when actually if it was an empty current value but had a previous value, we should update `calcOperation` and return instead of falling back to default return logic that prevented operation switching.
**The Fix**: Fixed logic flow inside `calcAction` on `type === "op"` and `calcCurrent === ""`. Changed it from an if-else structure to returning early after updating the operation.
