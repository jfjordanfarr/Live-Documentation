A scan will read **10,945 files** and leave out **6,299 files**. I didn't change any settings. I only expanded a few folders in the tree to look.

**Why things are left out:** the "Leave out build output and packages" box is checked. That rule drops build output folders (such as bin and obj) and package folders from the scan.

**Largest things left out:**

1. **`packages` folder: 661 files.** This is the NuGet package cache, excluded as third-party packages. It is the only top-level item whose file count is shown directly.
2. **Build and package folders inside the project tree: about 214 folders in total.** Per top-level folder these are DNN Platform 177, Dnn.AdminExperience 18, DotNetNuke.BulkInstall 6, Build 3, DotNetNuke.Internal.SourceGenerators 2, and some under DNN Platform's sub-folders. Their build output is excluded as build output. The page shows folder counts for these, not file counts, so I can't say exactly how many of the remaining files each one holds.

Most of the 6,299 excluded files (about 5,600) must sit inside those build and package folders, since the packages folder accounts for only 661. I couldn't confirm that per folder from the page.

The kept total includes 21 files in .github, 96 in Build, 7,850 in DNN Platform, 2,901 in Dnn.AdminExperience, 45 in DotNetNuke.BulkInstall, 3 in the SourceGenerators folder, and 29 loose files at the top level.
