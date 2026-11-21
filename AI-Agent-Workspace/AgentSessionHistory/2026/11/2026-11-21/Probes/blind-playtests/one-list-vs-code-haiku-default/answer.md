The line that leaves out real source is **`[Ll]og/`**, which is the 48th line of the standard Visual Studio list. It removes **22 `.cs` files**, all of them hand-written DNN code:

- `DNN Platform/Library/Services/Log/`: 17 files
- `DNN Platform/Library/Services/Installer/Log/`: 3 files
- `Dnn.AdminExperience/Dnn.PersonaBar.Extensions/Components/Servers/Log/`: 2 files

A second line also drops real source, though not C#. **`[Dd]ebug/`** (line 22) removes 29 files in `DNN Platform/Website/js/Debug/`: 27 `.js`, 1 `.config`, and 1 `.htm`. I only saw the folder path and the file-type counts, not the file contents, so the `.js` files are probably hand-written but I haven't confirmed that.

The `[Oo]bj/` line also removes 163 `.cs` files, but those are in build output folders and are almost certainly generated, so I left them out of the count.

I didn't copy anything to the clipboard.
