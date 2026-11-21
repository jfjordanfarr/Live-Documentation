Yes. In GitHub's Visual Studio list, line 48, `[Ll]og/`, leaves out real source code. It hides 22 `.cs` files in 3 folders:

- `DNN Platform/Library/Services/Log/` (17 files)
- `DNN Platform/Library/Services/Installer/Log/` (3 files)
- `Dnn.AdminExperience/Dnn.PersonaBar.Extensions/Components/Servers/Log/` (2 files)

These are the project's own logging and installer-log classes. The list meant to skip log output, but it matches any folder named "Log".

Applying the list leaves out 6,363 files in all. Most of those are things you'd expect it to skip:
- Line 232, `**/[Pp]ackages/*`, hides restored NuGet packages (468 code files), which are third-party.
- Line 46, `[Oo]bj/`, hides generated `.cs` files (163 of its 244 code files).
- Line 52, `**/[Bb]in/*`, hides build output. Its 164 code files are `.config` files.

One borderline case is line 22, `[Dd]ebug/`. It hides 29 files in `DNN Platform/Website/js/Debug/`, 27 of them `.js`. These look like unminified script copies, and I didn't open them, so I can't say whether anyone here wrote them.

I only read the page. I didn't copy anything to the clipboard.
