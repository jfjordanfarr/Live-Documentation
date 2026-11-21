I removed the one line that was excluding the folder. The scan now reads 11,042 files, up from 10,953, which is 89 more.

**What changed in the list:** Line 38, `/DNN Platform/Library/packages/`, was the entry leaving that folder out. I deleted it, so the list is now 46 lines instead of 47. Nothing else in the list was touched. The scan figures update as you edit, so no separate run was needed. The page only holds this change in the browser; I didn't save or export anything.

**Files:** 11,042 will be read and 6,202 are left out. Of the files that will be read, 856 are code a reader would read, down from 865 before the change. The DNN Platform group went from 7,850 to 7,939 files, which accounts for the 89 new ones.
