I set up the skip list on the page and copied it to your clipboard. I didn't run a scan.

I used the page's "What these folders hold" option. It has 47 lines:
- **bin/ and obj/:** these are skipped where they sit beside a project file.
- **packages/ folders:** it skips the ones holding NuGet packages. These are listed by path, for example `/DNN Platform/Modules/Journal/packages/`.

With it applied, the page shows 10,953 files will be read and 6,291 left out, across 207 folders. About 2,586 of the left-out files are .dll, 864 are .pdb and 782 are .xml. Before, 17,244 files would have been read.

To reuse it, paste the clipboard text into the "write lines" box next time, in the same format as a .gitignore. The page also has a download button next to the copy button if you'd rather keep it as a file. I didn't use that, so no file was saved.

The packages/ lines are specific to this folder. In a different folder you'd probably need to regenerate them with the same option rather than paste them as they are. The bin/ and obj/ lines are generic and should carry over.

I didn't use the "GitHub's Visual Studio list" option (234 lines, 6,363 files left out). The page also found .gitignore and .tfignore files in 3 top folders, and I left those unused.
