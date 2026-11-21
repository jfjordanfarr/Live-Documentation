The scan now reads `DNN Platform/Library/packages`. I removed the one rule that was leaving it out, and nothing else in the list changed.

- **What changed in the list:** The line `/DNN Platform/Library/packages/` is gone. It was one of the per-project "packages/" rules, and the rule count in the list dropped by one. The Library `packages` folder no longer appears under "Left out".
- **How many files will be read:** 11,042 files will be read. That is up from 10,953, so 89 more files. The left-out count fell from 6,291 to 6,202, which is the same 89 files.

I didn't click Scan, so the scan itself hasn't been run.
