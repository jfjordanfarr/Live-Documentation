I set up the skip list for this folder and copied it to your clipboard. It's the "What these folders hold" list the page generated from the folder's own contents.

- **What it skips:** `bin/` and `obj/` build output, plus the `packages/` folders that hold downloaded NuGet packages. The `packages/` entries are written out as one line per location, such as `/DNN Platform/Modules/Journal/packages/`.
- **Effect on this folder:** 6,291 files are left out and 10,953 will still be read.
- **Code files left out:** 865 of the skipped files are code, mostly `.ps1`, `.config`, `.cs` and `.json`. They sit under those build and package folders, so skipping them looks right. I didn't open them to check.
- **Existing ignore files:** The page found 25 `.gitignore` and 15 `.tfignore` files. I chose "Leave your list alone", so none of them were merged in.
- **Not run yet:** I haven't pressed Scan.

The clipboard holds the list as plain text in `.gitignore` format. Paste it into a file to reuse it next time, or paste it into the list box on the page. The `packages/` lines are specific to this folder's layout. A different folder will probably need its own generated list. The generic `bin/` and `obj/` lines will carry over unchanged.
