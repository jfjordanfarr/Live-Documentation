I changed the list so the scan now reads `DNN Platform/Library/packages`. I didn't press Scan.

- **What changed in the list:** I removed the line `/DNN Platform/Library/packages/` from the ignore list. It was one of the 51 per-folder `packages/` lines, so 50 of those remain. Every other rule is unchanged.
- **How many files will be read:** 11,042. It was 10,953, so 89 more files are now read. The left-out count went from 6,291 to 6,202. That folder held 36 .dll, 12 .xml and 12 .pdb files among its 89, and the page's top-line total showed the 89 difference.

I didn't copy anything to the clipboard.
