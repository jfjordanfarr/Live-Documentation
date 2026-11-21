The scan will read 10,945 files and leave out 6,299. I didn't change anything. I only expanded the DNN Platform row to look at it.

The page gives the reason as "build output and packages", and the "Leave out build output and packages" box is ticked. The biggest exclusions:

1. **`packages` folder (top level): 661 files.** The page labels these as NuGet packages. This is the only folder it left out entirely, and its checkbox is unticked.
2. **DNN Platform: 177 build or package folders.** They are spread across its subfolders, which mostly have 3 each. Connectors has 12. The page doesn't say how many files are in them. DNN Platform is the biggest folder, with 7,850 files kept.
3. **Dnn.AdminExperience: 18 build or package folders plus 8 loose files.** This is the only top-level folder whose checkbox is partly ticked, since it is only partly included. 2,901 files are kept.
4. **Smaller exclusions:**
   - DotNetNuke.BulkInstall: 6 folders.
   - Build: 3 folders.
   - DotNetNuke.Internal.SourceGenerators: 2 folders.

Nothing is left out in `.github` (21 files kept) or in the 29 loose files at the top level.

Most of the 6,299 left-out files are inside those build or package folders. Only the `packages` count (661) is shown per folder. The page doesn't give a file count for the other excluded folders, so I can't rank them by size.
