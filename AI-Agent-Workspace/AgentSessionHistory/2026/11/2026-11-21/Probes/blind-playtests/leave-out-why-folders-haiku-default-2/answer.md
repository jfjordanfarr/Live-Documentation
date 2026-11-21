No, the scan will not read `Dnn.AdminExperience/EditBar/Dnn.EditBar.UI/bin`. The page shows it unchecked, with "14 files left out" and the label "Build output beside a project."

The reason is the "Leave out build output and packages" checkbox at the top, which is on. With it on, the scan skips build output folders like `bin` and `obj`. The `obj` folder next to it is also excluded for the same reason.

I only expanded folders in the tree to look and didn't change any settings. Unchecking "Leave out build output and packages" would include `bin` again, but I didn't do that.
