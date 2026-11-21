I couldn't get the list back, so the page is now in a state you didn't ask for.

**What happened:** The panel listed 25 `.gitignore` and 15 `.tfignore` files, all checked. I clicked "Use," which replaced your list with only those ignore-file rules. That dropped the skip rules you already had (the `bin/`, `obj/`, and `packages/` lines). The count went from 10,953 to **15,593 files to be read**, with 1,651 left out. Ctrl+Z and F5 didn't restore your original list.

**What I'd expect the right number to be:** Your original list had the build and package skips, and the ignore files should be added to it, not substituted for it. Those two together give a different count from either 10,953 or 15,593, and I can't tell you what it is from the page as it stands.

**To fix it:** Reload the page from a fresh tab, or re-enter your original list, then click "Add" (not "Use") on the ignore-files panel. That keeps your skips and adds the ignore rules. I can do that if you paste back the original list, or if you tell me to leave it as is.
