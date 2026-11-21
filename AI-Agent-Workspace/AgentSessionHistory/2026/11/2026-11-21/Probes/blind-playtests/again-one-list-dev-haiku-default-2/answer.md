The scan now reads **10,953 files**, down from 17,244. That's 6,291 left out, and 865 of the remaining files are code a reader would read.

What I did:
1. Looked at the page. It's a scan-scope tool with a `.gitignore`-style list, and at first it reads all 17,244 files.
2. Clicked the preset "What these folders hold." It filled "Your list" with 47 lines: `bin/`, `obj/`, `packages/`, and specific package folders. That took the count to 10,953. It removed about 2,586 `.dll` files, the `packages` folders, and the `bin`/`obj` output.
3. Expanded the "Will be read" tree to check what remains. DNN Platform is 7,850 files and Dnn.AdminExperience is 2,909. The rest is small: Build 96, DotNetNuke.BulkInstall 45, .github 21, and a few others.
4. Accidentally focused the list text box when I tried to click the GitHub Visual Studio preset, which shifted the layout. I typed nothing there, and I didn't apply that preset.

I did not click Scan, so nothing has been read yet.

Caveats:
- I didn't open the `Build/` folder (96 files) to confirm it holds scripts rather than output.
- The remaining 1,330 `.js` files weren't checked for minified or generated bundles.
- The GitHub Visual Studio preset (234 lines) is still available if you want a broader exclusion, but I didn't apply it.
