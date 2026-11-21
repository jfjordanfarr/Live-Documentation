I've set it up, and 10,945 files will be read.

I started with the page's "What these folders hold" list. It excludes `bin/`, `obj/` and the NuGet `packages/` folders, and it took the count from 17,244 to 10,953. Then I clicked "Add them to your list". That added the project's own 25 `.gitignore` files and 15 `.tfignore` files, and the count came to 10,945. I left the list in place, so my choice of those ignore files is also in effect.

I did not press Scan, because you only asked for the count.

One thing to be aware of: the page flags 871 of the files read as code a reader would want. The excluded files are build output, such as `.dll`, `.pdb` and `.xml` in `bin/`, and generated `.cs` and `.json` in `obj/`. The `packages/` folders hold NuGet contents, mostly `.dll`, `.xml` and `.ps1`.

I didn't open the GitHub Visual Studio list, which would leave out slightly more (6,363 files).
