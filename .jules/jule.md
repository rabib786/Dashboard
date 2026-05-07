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

## Torn Engine Memory Leaks and Storage Crashes
**Description**: The dashboard's Torn widgets and cache module suffered from critical logic flaws. The widgets created Zombie Polling leaks, and the engine's caching system suffered from `QuotaExceededError` crashes and lack of hydration protection.
**Root Cause**:
1. `renderTornDashboard()` in `app.js` continuously instantiated classes and invoked `.start()` (which spawned `setInterval`s) without tracking them or invoking `.stop()` before re-rendering the layout.
2. `TornStorage.setCache` pushed values indiscriminately without clearing expired items.
3. Cache values fetched by `TornStorage` used naked `JSON.parse`, vulnerable to syntax crashes.
4. `localStorage.setItem` for the cache was uncaught, so when the 5MB browser quota was exhausted, it crashed the execution thread.
**The Fix**:
1. Exported widget instances to `window.activeTornWidgets` and iterated them to invoke `w.stop()` before DOM container resets.
2. Wrapped all `JSON.parse` operations inside `try/catch` and returned robust default fallback data structures.
3. Implemented a synchronous eviction loop to delete `item.expiry <= Date.now()` keys before executing `setItem`.
4. Caught `QuotaExceededError` exceptions, and mitigated the crash by hard-resetting the entire `TornStorage` cache to only contain the newest dataset.
