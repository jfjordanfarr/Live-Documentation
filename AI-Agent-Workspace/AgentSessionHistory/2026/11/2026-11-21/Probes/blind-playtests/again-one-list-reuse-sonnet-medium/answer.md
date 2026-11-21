I set up the skip list and copied it to your clipboard. The page showed "Copied" when I did.

The list came from the page's "What these folders hold" starter, which has 47 lines. It skips `bin/` and `obj/` build folders, plus a set of `packages/` folders holding downloaded NuGet packages. Those are written as specific paths, such as `/DNN Platform/Modules/Journal/packages/`. It will fit this folder but won't match other layouts.

With the list applied, 10,953 files will be read and 6,291 are left out.

865 of the skipped files are code, which is worth a look before you rely on it. They are mostly `.ps1` (412), `.config` (209), `.cs` (163) and `.json` (81). They sit inside the skipped folders, so they may be package contents, but I didn't open them to check. The other skipped files are mostly `.dll`.

The page also found 25 `.gitignore` and 15 `.tfignore` files. I left those out of the list rather than merging them in. I didn't run the scan.

To reuse the list next time, paste it into the list box. The page also has a download button that saves it as a file. I didn't use it.
