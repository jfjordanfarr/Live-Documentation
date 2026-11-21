No, the scan will not read it. With "Leave out build output and packages" checked, the page puts `Dnn.AdminExperience/EditBar/Dnn.EditBar.UI/bin` under "Left out", in the "Build output beside a project" group. Expanding that group and then Dnn.AdminExperience shows `EditBar/Dnn.EditBar.UI/bin/` with 14 files, so those files are excluded from the 10,945 files that will be read.

The reason is that the folder counts as build output and the checkbox is on. I did not check whether this particular folder is also matched by `.gitignore`. The page only says that 28 of the 162 build-output folders are also gitignored.

I changed nothing. I only expanded two rows in the list to look. If you uncheck the checkbox, the folder would likely be included, but I didn't test that.
