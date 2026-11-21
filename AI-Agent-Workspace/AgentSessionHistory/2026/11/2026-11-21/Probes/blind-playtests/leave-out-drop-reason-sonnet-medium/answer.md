I added `DNN Platform/Tests/` as a pattern, and the scan will now read **10,402 files**. That's down from 10,945. The pattern leaves out 900 files in one folder, and 6,842 files are left out in total.

The drop is only 543 rather than 900 because some files under `DNN Platform/Tests` were already being skipped as build output. I didn't click Scan. I only changed the patterns.
