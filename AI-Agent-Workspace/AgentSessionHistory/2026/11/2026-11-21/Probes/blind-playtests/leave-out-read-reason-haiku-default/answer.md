A scan would read **10,945 files** and leave out **6,299**. I didn't click anything; this is from the page as it stands.

The largest exclusions, all because of the "Leave out build output and packages" box, which is checked:

1. **NuGet packages: 4,577 files in 45 folders.** These are package downloads. The page also notes that .tfignore already excludes 15 of the 45 folders.
2. **Build output beside a project: 1,714 files in 162 folders.** These are compiled outputs. The page also notes that .gitignore already excludes 28 of the 162 folders.
3. **Ignored by .gitignore (`/*/css/*.css`): 6 files.**
4. **Ignored by .gitignore (`/*/scripts/bundles/*.svg`): 2 files.**

The four rows add up to the 6,299 left out. Each row has a "Keep" button if you want any of them included, and there's a patterns box for custom include or exclude rules.
