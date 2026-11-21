The scan will read 10,945 files and leave out 6,299. I didn't change anything. I only expanded one folder to look. The scan has not been started.

**Why files are left out:** the "Leave out build output and packages" box is ticked. It skips build-output folders and package folders.

**Largest things left out:**
- **`packages` folder, top level:** 661 files. It is unticked and labelled "NuGet packages", so it is skipped as a package folder. This is the only left-out item the page gives a file count for.
- **DNN Platform:** 177 build or package folders. This is the largest group by folder count. Almost every subproject in it has 3 skipped build or package folders. Connectors has 12.
- **Dnn.AdminExperience:** 18 build or package folders and 8 individual files. Its folder is partly ticked because of this. The page doesn't say why those 8 files are skipped.
- **DotNetNuke.BulkInstall:** 6 build or package folders.
- **Build:** 3 build or package folders.
- **DotNetNuke.Internal.SourceGenerators:** 2 build or package folders.

The page doesn't show file counts for the skipped build folders. Those counts, plus the 661 in `packages`, make up the 6,299 total. I can't say how the rest is split between them.
