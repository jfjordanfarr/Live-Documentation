No, the scan won't read it. `Dnn.AdminExperience/EditBar/Dnn.EditBar.UI/bin` is in the "Left out" list under "Build output beside a project", with 14 files.

The reason is the "Leave out build output and packages" checkbox, which is checked. The scan treats `bin` folders that sit beside a project as build output and skips them. The same group also lists the `obj` folder next to it (7 files).

I expanded the list to check this but changed nothing. The page also has a "Keep" button for that group and a patterns box where a `!` rule could bring the folder back in. Unchecking the box or using either would make the scan read those 14 files.
