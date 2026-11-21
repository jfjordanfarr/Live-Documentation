---
kind: issue
state: open
milestone: december-showing
order: 20
opened: 2026-11-20
---
# A scan leaves no trace in the repository it maps

**For the owner.** Today a scan writes its docs inside the folder it maps, with nothing ignored: 10,777 files and 118 MB on the largest test codebase. On a repository at your work that is thousands of files your version control would show, your worry of 2026-10-03 in your own words ("3K+ UNCOMMITTED FILES"). The store's change will end it properly; the showing cannot wait for that.

**Done when.** After a scan of each test repository, its version control reports nothing new, and the scan's last line says where its output went and how to remove it.

**Rests on.** The scan writing its docs into the folder it maps. A page that scans keeps a scan's facts in the page and writes nothing beside the code; the owner's answer of 2026-11-21 is that the page and the command line both come, from one engine ([the issue](tool-arrives-on-windows.md)), so the command line still needs the first task and both need the second and third.

**Waiting on the owner.** Nothing. Answered 2026-11-21 ([their words](../AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-1)): both, two git repositories and the rest under TFS, "basically anything that talks to anything on-prem". Read in the code the same day: without git, discovery leaves out only `.git`, `node_modules`, the docs root, lock files and documents; it reads no `.tfignore`; a .NET solution's `bin`, `obj` and `packages` would be mapped, every assembly as an asset. And the same day ([their words](../AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-3)): "I do have some project specific .tfignore files specifically because of how sick I was of churn in the packages folders (which should never ever have made it into TFS in the first place - bah!), but not all"; "This would then behoove us to ensure that the user, either via CLI or the page, has a good solid way to create ignore patterns on what they scan, before they scan it."; "there's over 100k files in just the portion of TFS I have cloned. But tens of thousands of code files sounds reasonable depending on what does and does not get counted as a code file."

## Tasks

### Where a scan's output goes
- state: open
- holds: not begun
- evidence:

Two candidates, to be chosen by trying both on three public repositories: a folder inside the mapped one that ignores itself, or a folder outside it. The several-folders run found each sibling repository left with an untracked `.live-documentation/` and the parent's configuration deciding where every sibling's docs are sought ([its record](../AgentSessionHistory/2026/11/2026-11-19/Probes/many-scans/README.md)). The proof is a test: version control's own status before and after.

### A starting configuration where there is no git to ask
- state: open
- holds: not begun
- evidence:

Offered and never imposed, by the owner's word that what a scan takes is theirs to configure: the build and package folders of .NET and the usual editor folders left out, said in the scan's closing line with their counts so that nothing is left out in silence. To be measured before it is designed, on a public .NET Framework solution with its build outputs and restored packages in place: what today's scan makes of it, what a `.tfignore` would say where one exists, and what TFS leaves in a mapped folder (its `$tf` folder).

### Choosing what a scan leaves out, before it scans, on either surface
- state: active
- holds: the function that decides is on the day branch since 2026-11-21 (`3bc49c6b4`, [`leaveOut.ts`](../../packages/engine/src/tooling/leaveOut.ts), nothing calling it yet); its builder is on a second leg (a folder of the owner's shape, the listing a person would be shown, five starting lists measured); how a person sees and changes the choice is not designed
- evidence:

The owner's ask of 2026-11-21. A scan in two steps: the folder is listed and nothing is read; the person sees what would be scanned, by folder and by kind with counts, and what is left out and by which rule (the folder's own `.gitignore` or `.tfignore`, the starting configuration above, a pattern of their own); they change it; then the scan reads only what is left. The same listing and the same patterns on the command line and in the page, the patterns kept where the next scan finds them. With over a hundred thousand files in a TFS clone, most of them packages, a page must not read a file's bytes before this choice is made. To be designed with pictures and tried by strangers before it is built in.

What a `.tfignore` says, read from [Microsoft's page on it](https://learn.microsoft.com/en-us/azure/devops/repos/tfvc/add-files-server?view=azure-devops) on 2026-11-21, since it is close to a `.gitignore` and not the same: `#` begins a comment; `*` and `?` are wildcards; "A filespec is recursive unless prefixed by the `\` character", so `*.xml` reaches every subfolder and `\*.txt` only its own; `!` negates, "so files that match the pattern aren't ignored"; a folder is written with backslashes (`ProjA\*.cpp`, `\Temp`); the file may stand in any folder, and "`.tfignore` files in subfolders override `.tfignore` files in parent folders". The page does not say whether a subfolder's file replaces its parent's rules or adds to them, whether case matters, or whether a later line overrides an earlier one, and it gives no list of what TFVC leaves out by default beyond "certain types of files, such as *.dll files". Those three are to be found by trying, not guessed.

**Found on 2026-11-21, from Microsoft's own code** ([the record](../AgentSessionHistory/2026/11/2026-11-21/Probes/leave-out/README.md)). Microsoft published its cross-platform TFVC client, Team Explorer Everywhere, as open source; its matching classes were compiled unchanged and run as an oracle, and 468 verdicts recorded from it are a committed test. The three answers: a subfolder's `.tfignore` adds to its parent's rules (the deepest file with an opinion decides, and one with none passes the question up); the name is compared without regard to case; within one file the last matching line wins. Also found there: TFVC's change scanner looks inside an excluded folder, so `out` followed by `!out\keep.dll` keeps that file, while `tf add /recursive` does not look inside; `!bin` re-includes the folder and not the files in it; and where a collection sends no list of its own the client leaves out 56 names by default (`bin`, `obj`, `Debug`, `Release`, `TestResults`, `*.dll`, `*.pdb`, `*.user` and their like, and not `packages`). Microsoft's NuGet page for TFVC recommends a `.tfignore` of `*.nupkg`, `packages`, `project.lock.json`, `project.assets.json` and `*.nuget.props`, where `packages` with no leading `\` leaves out a folder of that name at any depth.

**Ruled by root the same day:** a left-out folder is left out whole under either syntax (`tf add`'s reading, and git's), so that packages are never listed, and a `!` line that could have named something inside one is said, not looked for; the folder the tool writes to is never scanned; the starting list and a person's own patterns match without regard to case.

**Measured so far on DNN with its ignore files taken away, as a TFS folder would be:** GitHub's standard Visual Studio ignore list leaves out 60 real source files (its `[Ll]og/` and `**/[Pp]ackages/*` lines catch DNN's `Services/Installer/Log` and `Services/Installer/Packages`), so a starting list by folder name alone is not safe. Five candidates are being measured on a folder of over a hundred thousand files: a small fixed list, that standard list, TFVC's own 56 defaults, nothing, and by evidence (a `packages` folder whose children are NuGet's, `bin` and `obj` beside a project file).
