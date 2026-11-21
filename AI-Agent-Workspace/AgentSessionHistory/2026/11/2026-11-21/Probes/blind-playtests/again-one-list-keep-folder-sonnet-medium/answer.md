The scan now reads `DNN Platform/Library/packages`, and 11,042 files will be read.

**What changed in the list:** I removed one line, `/DNN Platform/Library/packages/`, which had been excluding that folder. The list has 46 lines now, down from 47. I didn't touch the other `packages/` rules. The rule `/packages/` at the top level still excludes that folder. I removed it by mistake at first, then undid it.

**Counts:**
- **Will be read:** 11,042 files, up from 10,953. That's 89 more.
- **Left out:** 6,202 files, down from 6,291.
- **Code a reader would read:** 856 of the left-out files, down from 865. The 9 that moved are the folder's `.ps1` (8) and `.config` (1) files.

The rest of the 89 files are `.dll` (36) and `.xml` (12) files, plus some I didn't break down. The "DNN Platform" folder total went from 7,850 to 7,939 files.

I didn't press Scan, so nothing has been scanned yet.
