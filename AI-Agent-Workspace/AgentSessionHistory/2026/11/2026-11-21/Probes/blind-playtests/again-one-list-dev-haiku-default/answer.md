The scan would read **10,953 files**, down from 17,244 before any changes.

I clicked the "What these folders hold" preset in the Your list panel. It added 47 lines, which I checked. They are `bin/` and `obj/` (only beside a project file), `/packages/` and `/Build/packages/`, and per-project `packages/` folders for NuGet packages. The preset leaves out 6,291 files, and the page says 865 of those are code a reader would normally read. Those are the generated `.cs` files in `obj/` and the `.ps1` and `.config` files that come with the packages, so they are build output or downloaded packages, not your source.

I did not click Scan, and I did not copy anything to the clipboard.
