I set the scan to leave out `DNN Platform/Tests`. The scan will now read **10,402 files**, and 6,842 files are left out. Before the change it was 10,945 read and 6,299 left out.

I did this by unchecking the `Tests` folder under `DNN Platform`. That added the pattern `/DNN Platform/Tests/` to your patterns list. I didn't click Scan.
