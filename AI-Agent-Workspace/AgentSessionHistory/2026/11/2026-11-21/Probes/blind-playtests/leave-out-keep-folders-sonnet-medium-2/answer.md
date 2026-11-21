I changed the scan to read `DNN Platform/Library/packages`, and it will now read **11,034 files**. That's 89 more than the 10,945 it read before, and 6,210 files are still left out.

I did this by ticking the `packages` folder inside `DNN Platform/Library`. The scan had been skipping it as downloaded NuGet packages. All 89 files in it now show as kept.

I didn't press Scan, so nothing has been scanned yet. The other `packages` folder, at the top level, is still left out (661 files), since you only named the one under `Library`.
