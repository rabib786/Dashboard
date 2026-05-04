## Workspace State Refactoring

In order to allow users to save and configure their layouts properly, I abstracted the `PROFILE_PRESETS` list out of the hardcoded `app.js` file and moved it into the dynamic `dashSettings.workspaces` JSON object.

I also built an auto-switch scheduler by using a `setInterval` loop in `updateTime` to check `dashSettings.workspaceSchedules` and invoke `applyWorkspace()` when the correct minute and hour is triggered.
