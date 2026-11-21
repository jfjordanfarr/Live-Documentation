The scan will read **10,945 files** and leave out **6,299 files**. I didn't change anything. I only expanded one list on the page to see more detail, and I didn't start the scan.

What it leaves out, largest first:

1. **NuGet packages: 4,577 files in 45 folders.** These are downloaded third-party packages, not the project's own code. Of the 45 folders, 15 are also ignored by `.tfignore`.
2. **Build output beside a project: 1,714 files in 162 folders.** This is compiled output such as `bin` and `obj` folders next to a project. Most of these folders are in DNN Platform (134), then Dnn.AdminExperience (18) and DotNetNuke.BulkInstall (6). Two folders each are in DotNetNuke.Internal.SourceGenerators and Build. Of the 162 folders, 28 are also ignored by `.gitignore`.
3. **`.gitignore` rule `/*/css/*.css`: 6 files.** These are generated CSS files.
4. **`.gitignore` rule `/*/scripts/bundles/*.svg`: 2 files.** These are generated SVG bundle files.

The first two are left out because the "Leave out build output and packages" box is ticked. The last two are left out because of `.gitignore` rules. Each group has a "Keep" button if you want it read after all.

The files that will be read are mostly `.cs` (3,973), `.js` (1,330) and `.png` (1,325). About 7,850 of them are in DNN Platform and 2,901 are in Dnn.AdminExperience.
