The scan will read 10,945 files and leave out 6,299. It won't look inside 0 folders. I changed nothing and didn't press Scan.

The largest things left out, by file count:

1. **NuGet packages:** 3,242 files in 30 folders. These are downloaded third-party packages, not the project's own code. They are skipped because the "Leave out build output and packages" option is checked.
2. **Build output beside a project:** 1,420 files in 134 folders. These are generated build folders next to a project. They are skipped for the same reason, the build output and packages option.
3. **`.tfignore: packages`:** 1,335 files in 15 folders. The folder's `.tfignore` file (Team Foundation's ignore list) excludes the `packages` folders.
4. **`.gitignore: [Bb]in`:** 126 files in 9 folders, excluded by a `.gitignore` rule for `bin` folders.
5. **`.gitignore: [Oo]bj`:** 63 files in 9 folders, excluded by a `.gitignore` rule for `obj` folders.

Smaller `.gitignore` exclusions cover the rest:
- `obj/` removes 35 files.
- `bin/` removes 70 files.
- `/*/css/*.css` removes 6 files.
- `/*/scripts/bundles/*.svg` removes 2 files.

Each exclusion has a "Keep" button, which would put those files back in the scan.
