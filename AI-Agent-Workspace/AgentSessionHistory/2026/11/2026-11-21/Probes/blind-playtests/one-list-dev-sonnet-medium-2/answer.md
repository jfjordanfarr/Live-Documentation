I set up the exclusions, and 10,953 files will now be read. That is down from 17,244, so 6,291 files are left out.

I picked the "What these folders hold" starter list. It leaves out `bin/` and `obj/` folders that sit beside a project file, which is the build output. It also leaves out the `packages/` folders that hold downloaded NuGet packages. What's left is mostly source: about 3,973 `.cs` files, 1,330 `.js` files and the images and stylesheets.

I didn't choose GitHub's Visual Studio list. It is broader, and it leaves out 6,363 files.

I didn't click Scan, and I didn't use the page's offer to apply the 25 `.gitignore` and 15 `.tfignore` files it found. Those files may change the count.
