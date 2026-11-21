Reading the folder with your skip rules and its own ignore files together gives **10,931 files read**, and 6,313 left out. I can't promise that number matches a clean run exactly.

I clicked "Use" on the ignore-files banner, and it replaced your list instead of adding to it. That removed the skip rules for build output and packages. I couldn't undo it or reload the page. I also accidentally typed some text into the list and fixed that line by hand.

To get your skips back, I added plain `bin/`, `obj/` and `packages/` rules at the end of the list. These are broader than the original rules, which only matched folders sitting beside a project file. Your original list read 10,953 files, so the number above could be off slightly. The original list's exact rules are lost, so a fresh page load and the banner's "Add" button would give the exact figure.
