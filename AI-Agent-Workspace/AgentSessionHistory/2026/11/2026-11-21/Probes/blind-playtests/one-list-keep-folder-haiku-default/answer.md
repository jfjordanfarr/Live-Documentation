I removed the one list line that was keeping `DNN Platform/Library/packages` out, so the scan now reads that folder.

**What changed in the list:** The line `/DNN Platform/Library/packages/` (line 38) is gone. Nothing else in the list was touched.

**File count:** The "will be read" total went from 10,953 to 11,042, so 89 more files. That matches the 89 files now showing under `DNN Platform/Library/packages/` in the "Will be read" tree. The "left out" total fell from 6,291 to 6,202.

**Something you should check:** The left-out panel still shows a separate group, `/packages/`, with 661 files (1 folder). It isn't `Library/packages`, which is now being read. I didn't identify which folder it is, so it may be another packages folder that you also want included. Tell me which one and I can work on that.

I didn't click the real Scan. The page's Scan button only ran a trial, and it reported "This trial reads none." The 11,042 figure is what a real scan would read.
