The scan will now read `DNN Platform/Library/packages`, and the page says **11,034 files will be read**, with 6,210 left out.

That folder was being skipped by the "Leave out build output and packages" rule, which treated it as downloaded NuGet packages. I ticked its checkbox in the folder tree, which added its 89 files. The count went up from 10,945 to 11,034.

I left the "Leave out build output and packages" option on, so the other `packages` folders and build output are still excluded. I didn't click Scan. The selection is set, but the scan hasn't been run.
