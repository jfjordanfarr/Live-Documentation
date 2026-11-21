The scan list now leaves **10,953 files** to be read, down from 17,244. That's 6,291 files left out.

What I did:
1. Opened the page, "What a scan reads," which starts with 17,244 files and an empty exclusion list.
2. Clicked the suggested preset "What these folders hold." It filled "Your list" with 47 lines: `bin/` and `obj/` folders beside project files, `packages/` folders holding NuGet packages, and a few specific paths under `/DNN Platform/`. It left out 207 folders and 6,291 files, mostly `.dll`, `.pdb`, and `.xml`.
3. Expanded the `Build` folder to check it. Its 96 remaining files are build scripts (Tasks, Tools, BuildScripts, Deploy, and so on), so I kept them.

I did not click Scan, so nothing was actually scanned. I also skipped the other preset, "GitHub's Visual Studio list," because the first preset already removed the build and package output.

Things I did not verify: the remaining 1,330 `.js` and 1,325 `.png` files are likely source or assets, but I didn't open them to confirm none are generated or vendored.
