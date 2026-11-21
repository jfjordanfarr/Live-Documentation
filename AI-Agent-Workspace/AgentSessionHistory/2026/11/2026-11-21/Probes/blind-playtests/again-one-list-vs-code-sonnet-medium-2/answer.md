I'm checking which of the standard Visual Studio ignore lines leave out hand-written code. Here is what I found.

Yes. The line is `[Ll]og/` (line 48 of the list). It leaves out 22 `.cs` files, spread over three folders named `Log`:

- `DNN Platform/Library/Services/Log/` has 17 files.
- `DNN Platform/Library/Services/Installer/Log/` has 3 files.
- `Dnn.AdminExperience/Dnn.PersonaBar.Extensions/Components/Servers/Log/` has 2 files.

These are C# source folders for logging features, not log output. The ignore line is meant to catch log files, so it catches them by mistake.

Other lines also drop code, but I judged it to be generated or vendored rather than written here:

- `[Oo]bj/`: 244 files.
- `**/[Bb]in/*`: 164 files.
- `**/[Pp]ackages/*`: 468 files.
- `[Dd]ebug/`: 29 files, all in `DNN Platform/Website/js/Debug/`. I didn't open this folder, so I'm assuming it holds copies of third-party scripts. That's the line I'm least sure about.
