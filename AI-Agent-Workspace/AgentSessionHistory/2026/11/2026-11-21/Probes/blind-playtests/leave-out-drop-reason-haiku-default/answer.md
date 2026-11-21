The scan now leaves out `DNN Platform/Tests`, and it will read **10,402 files**. That's 543 fewer than before (10,945), with 6,842 files left out in total.

I added `DNN Platform/Tests/` as a pattern, and it shows under "Left out" as "Your pattern" with 900 files in one folder. The drop is smaller than 900 because some of those test files were already excluded by the build-output rule. I didn't press Scan, so the scan itself hasn't run yet.
