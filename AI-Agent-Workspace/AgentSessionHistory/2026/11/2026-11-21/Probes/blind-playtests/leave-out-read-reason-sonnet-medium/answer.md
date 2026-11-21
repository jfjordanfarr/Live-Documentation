The scan will read **10,945 files** and leave out **6,299**. I didn't change anything. I only expanded the lists to read them.

**What's left out, largest first:**

1. **NuGet packages: 4,577 files in 45 folders.** These are downloaded third-party packages, not the project's own code. Most are under DNN Platform (43 folders). The rest are `packages/` (661 files) and `Build/packages/` (89 files). 15 of the 45 folders are also ignored by `.tfignore`.
2. **Build output beside a project: 1,714 files in 162 folders.** This is generated output, not source. Most of it is in DNN Platform (134 folders). The rest is in Dnn.AdminExperience (18), DotNetNuke.BulkInstall (6), DotNetNuke.Internal.SourceGenerators (2) and Build (2). 28 of the 162 folders are also ignored by `.gitignore`.
3. **`.gitignore` rule `/*/css/*.css`: 6 files.** These are most likely CSS files compiled from source.
4. **`.gitignore` rule `/*/scripts/bundles/*.svg`: 2 files.** These are most likely generated bundle files.

The first two groups are left out because the "Leave out build output and packages" box is ticked. The last two are left out because of `.gitignore` rules. Each group has a "Keep" button if you want any of it included.
