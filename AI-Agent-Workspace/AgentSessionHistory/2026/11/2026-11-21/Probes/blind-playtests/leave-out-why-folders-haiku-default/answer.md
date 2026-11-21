No, the scan won't read that folder under the current settings.

In the tree, `Dnn.AdminExperience > EditBar > Dnn.EditBar.UI > bin` is unchecked and labeled "Build output beside a project," with 14 files left out. The cause is the "Leave out build output and packages" box, which is checked. That option excludes build output such as `bin` and `obj` folders that sit beside a project.

I only expanded tree nodes to find it. I didn't change any checkboxes, patterns, or settings, and I didn't press Scan. If you wanted `bin` included, you'd need to uncheck that option or add a keep pattern such as `!bin/` in "Your patterns."
