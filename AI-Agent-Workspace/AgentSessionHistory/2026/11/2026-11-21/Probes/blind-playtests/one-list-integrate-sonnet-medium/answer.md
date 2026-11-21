**About 10,931 files will be read, but treat that as an estimate.** It rests on a rebuilt skip list, not the exact one you were given.

Before I touched anything, the page said 10,953 files would be read and 6,291 left out. That was your existing skip list for build output and downloaded packages. I then clicked "Use" to take in the folder's ignore files (25 `.gitignore` and 15 `.tfignore`). That replaced your list instead of adding to it, and I found no way to undo it. With only the folder's own ignore files, the page showed 15,593 read and 1,651 left out.

To get back to your setup, I retyped three rules at the top of the list: `bin/`, `obj/` and `**/packages/`. I remembered the `bin/` and `obj/` lines from the original list. The original `packages` rules were a long run of specific paths that I couldn't fully see, so `**/packages/` only approximates them. With those three lines plus the folder's ignore files, the page reports 10,931 read and 6,313 left out.

That is only 22 files fewer than your original 10,953, which looks plausible for the extra files the ignore files exclude. The exact figure could be a little higher or lower, depending on how closely my rules match the originals.

I didn't run a scan. The page is still open with the rebuilt list in it.
