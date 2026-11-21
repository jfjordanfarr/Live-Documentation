A scan would read **10,945 files** and leave out **6,299**. I didn't click anything or change any settings.

The largest exclusions are:

1. **NuGet packages: 4,577 files in 45 folders.** These are left out because of the "Leave out build output and packages" box, which is checked. The page also says .tfignore ignores 15 of those 45 folders.
2. **Build output beside a project: 1,714 files in 162 folders.** This is also left out because of the same checked box. The page says .gitignore ignores 28 of those 162 folders.
3. **`/*/scripts/bundles/*.svg`: 2 files.** Left out because a .gitignore rule matches them.
4. **`/*/css/*.css`: 6 files.** Left out because a .gitignore rule matches them.

I didn't expand the rows, so the page gives the reasons only at this summary level. Each row has a "Keep" button if you want any of these included.
