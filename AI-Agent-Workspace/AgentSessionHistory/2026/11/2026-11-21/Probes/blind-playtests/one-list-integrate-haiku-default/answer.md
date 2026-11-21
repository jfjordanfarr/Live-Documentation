I couldn't get you a trustworthy number, and I made the list worse, so please don't use the current count.

**What I found:** Before I touched anything, the page said **10,953 files will be read** and 6,291 were left out. That count used your existing skip list (bin/, obj/, and the packages/ entries) without the ignore files. The page found 25 .gitignore and 15 .tfignore files in 3 top folders.

**What I did wrong:** The ignore-file panel had Use, Add, and Ignore buttons. I clicked **Use**, expecting it to apply the ignore rules alongside your list. Instead it replaced your list with the ignore-file rules. The count went up to **15,593 files will be read**, and build output and packages folders now show up in "Will be read." Ctrl+Z and a page reload didn't bring the original list back.

**Current state:** The list is now only the ignore-file rules (about 353 lines). Your original list is gone from the page. I only saw its first 22 lines, so I can't rebuild it exactly.

**To fix it:** Re-paste your original skip list into "Your list" from your own copy. The page should then return to about 10,953 files. If you want the ignore-file rules included too, use **Add** rather than **Use** so they're merged in. I haven't clicked Add or Ignore, so the ignore files are not yet combined with your list.
