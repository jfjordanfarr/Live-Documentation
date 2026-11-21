---
kind: issue
state: waiting
milestone: december-showing
order: 20
opened: 2026-11-20
---
# A scan leaves no trace in the repository it maps

**For the owner.** Today a scan writes its docs inside the folder it maps, with nothing ignored: 10,777 files and 118 MB on the largest test codebase. On a repository at your work that is thousands of files your version control would show, your worry of 2026-10-03 in your own words ("3K+ UNCOMMITTED FILES"). The store's change will end it properly; the showing cannot wait for that.

**Done when.** After a scan of each test repository, its version control reports nothing new, and the scan's last line says where its output went and how to remove it.

**Rests on.** The scan writing its docs into the folder it maps. A page that scans keeps a scan's facts in the page and writes nothing beside the code, so if the page comes first this issue shrinks to its second task.

**Waiting on the owner.** Nothing. Answered 2026-11-21 ([their words](../AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-1)): both, two git repositories and the rest under TFS, "basically anything that talks to anything on-prem". Read in the code the same day: without git, discovery leaves out only `.git`, `node_modules`, the docs root, lock files and documents; it reads no `.tfignore`; a .NET solution's `bin`, `obj` and `packages` would be mapped, every assembly as an asset.

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
