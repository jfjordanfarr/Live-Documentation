No, the scan won't read that folder, as things stand now.

`Dnn.AdminExperience/EditBar/Dnn.EditBar.UI/bin` is listed under "Left out" in the "Build output beside a project" group. It shows 14 files there. The option "Leave out build output and packages" is checked, and that is what excludes it. A `bin/` folder next to a project is treated as build output. The folder's `obj/` sibling is left out for the same reason.

The page also shows a "Keep" button for that folder. Clicking it would put the folder back into the scan. I didn't click it, so nothing has changed.
