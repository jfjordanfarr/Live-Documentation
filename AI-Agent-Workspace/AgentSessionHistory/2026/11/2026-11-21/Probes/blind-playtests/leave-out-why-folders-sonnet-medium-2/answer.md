No, the scan won't read that folder as things stand.

I expanded the tree to `Dnn.AdminExperience` → `EditBar` → `Dnn.EditBar.UI`. The `bin` folder there is unchecked and marked "14 files left out — Build output beside a project." The reason is the "Leave out build output and packages" option, which is ticked. It skips `bin` because the folder sits next to a project, which is what build output looks like. The sibling `obj` folder is skipped for the same reason.

I only expanded folders to look. I didn't change any checkbox or setting, and I didn't run the scan.
