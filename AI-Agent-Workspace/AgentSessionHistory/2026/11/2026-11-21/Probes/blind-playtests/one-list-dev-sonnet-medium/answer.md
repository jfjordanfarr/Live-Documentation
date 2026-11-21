With the starter list applied, **10,881 files will be read**. That's down from 17,244, and 6,363 files are left out.

I picked the "GitHub's Visual Studio list" starter, a ready-made set of ignore rules for Visual Studio projects. It left out the build output, including about 2,586 `.dll` files and 865 `.pdb` files. The 661 files in the `packages` folder dropped out of the list as well. I didn't scan anything, and I didn't use the page's offer to load the project's own `.gitignore` files.

- **Not fully clean:** the page warns that 3 lines in the list start with `!`, and those lines can't keep files inside a folder the list already leaves out. I opened the warning but didn't check which lines they are. I also didn't confirm that every downloaded-package folder is gone.
- **Non-code files:** images such as `.png` (1,325) and `.gif` (671) are still counted, so the number is higher than a code-only scan would be.
