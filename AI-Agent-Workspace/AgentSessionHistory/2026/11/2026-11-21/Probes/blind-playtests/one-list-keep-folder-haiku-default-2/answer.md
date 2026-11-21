I removed the line `/DNN Platform/Library/packages/` from "Your list" on the scan page. That line was excluding your Library packages folder, which is code your team wrote.

- **Files that will be read:** went from 10,953 to **11,042**, so 89 more files.
- **Files left out:** went from 6,291 to 6,202.
- **Where it shows up:** under DNN Platform → Library/, there is now a `packages/` entry with 89 files in "Will be read."

I didn't press **Scan**, since you only asked for the list to change. The other `packages/` lines are still in the list. Those cover NuGet-style packages folders, so I left them alone. The root `/packages/` line is still there too.
