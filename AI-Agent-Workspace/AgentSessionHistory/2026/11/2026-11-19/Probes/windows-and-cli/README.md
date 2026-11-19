# What a stranger on Windows meets before the map: the command line, and how Windows writes text and names files

Current as of November 19, 2026. A builder wrote this for the root, from `2114bff6`, after [the cold run](../cold-run/README.md), on branch `worktree-agent-aabeca6131a64c7b7`. It changed `scripts/live-docs/**`, their tests and Live Docs, the README and two guides, and nothing under `packages/`. No subagent was used.

## In short

Seven things a stranger met at the command line are mended. Each is in a commit of its own, with a test that failed before it:

| What the stranger met | Now | Commit |
| --- | --- | --- |
| A configuration saved by Windows PowerShell 5.1 (with a byte-order mark, or as UTF-16) stopped every command | Read by its mark | `57c4fd5e` |
| "The current directory" in every `--help` was this checkout under `npm run` | The folder the person ran the command in, as npm records it | `1c5794d8` |
| A mistyped `--workspace` reported success over nothing and made the folder | Refused on one line, naming the path looked for | `b203ac34` |
| `inspect --from` found a file only as spelled | Found in any case; two files differing only in case are named back | `6636fd53` |
| Files no reader reads got empty docs silently | Generation ends with `Not read, so their docs hold no symbols or links: 87 .vb, 5 .sln` | `7472cf09` |
| A crash gave no stack | Every command takes `--stack`, and a failure says so | `74c114c7` |
| When git could not be asked, a nested `.gitignore`'s `bin/` got docs silently | `generate` warns, and says what it reads instead | `b074c418`, `214119c5` |

Two of the stranger's crash complaints are not mine to mend: which source file a crash concerns, and the half-written output it leaves. Their cause is in `generator.ts`, which another builder owns. The findings are below, with the smallest input and the mend I would make.

Source text does not reach the readers through one place: every reader reads its own file. So UTF-16 and Windows-1252 are not mended. The seam I would cut, with the list of readers, is below for the root to decide.

The case test could not be run "for real". This repository's folder is no longer on a Windows-backed mount (see below), and mounting a case-folding filesystem needed root, which the permission system refused. I imitated NTFS's lookups inside Node instead. On that imitation, Windows loses a link that Linux keeps.

## Part A: the command line

### 1. A configuration with a byte-order mark: reproduced, mended (`57c4fd5e`)

**Cause.** `readConfiguration` (`scripts/live-docs/cli.ts`) read the file as UTF-8 and parsed it. A UTF-8 mark became U+FEFF before the `{`. UTF-16, which Windows PowerShell 5.1's `Out-File` and `>` write, was not read at all.

**Mend.** `decodeText` decodes by the mark: UTF-8 with or without one, UTF-16 little- or big-endian after one. `scripts/live-docs/cli.test.ts` covers UTF-8 with a mark, UTF-16 both ways, and the file `--config` names. Three of its cases failed before the mend.

**Not mended here, for the history's owner:** `lensConfiguration` in `packages/generator/src/history/computeHistory.ts:579–583` reads the configuration by its own copy of the rule, without the mark. So `live-docs:history` still stops on a configuration with a mark. The smallest input is a `.live-docs.config.json` beginning with the bytes `EF BB BF`. Both readers should call one decoder in the engine (see Part B, item 1).

### 2. "Here": reproduced, decided, mended (`1c5794d8`)

**What I chose.** "Here" is the folder the person ran the command in. Every path they type (`--workspace`, `--config`, `--output`, a board named on the command line) is taken from there, and with no `--workspace` that folder is the one mapped.

**Why.** The CLI reference and the README run every command from the root of this checkout. There, where the person stands and where npm runs the script are the same folder, so nothing changes. They part when the person stands elsewhere: in a subfolder of the checkout, or in their own repository with `npm --prefix <checkout> run …`. There `npm run` puts the script in the checkout and records where the person stood in `INIT_CWD`. Every `--help` already said "the current directory", and a person means their own. It is also what the installable `live-docs` command in direction's item 6 would do. So `npm --prefix` now gives the same behaviour.

**How.** `invocationFolder` (`cli.ts`) takes `INIT_CWD` only when npm started that very script. It checks that `npm_lifecycle_script` names the script this process runs. A process that a test, the pipeline or another command starts inherits npm's variables without npm having started it, and its own working directory is the one meant. The pipeline (`run-all.ts`) now runs its stages from the folder it was run from. It no longer names the configuration to each stage, since each reads it unasked.

**What stays.** The Explorer's default output is this checkout's `dist/explorer`, found by the script's own location. So it does not follow the person: the browser suite and the owner's preview find this repository's Explorer where they always have. Item 4 is the open question of where another folder's map should go.

**Tests.** `generate-cli.test.ts` runs `npm --prefix <checkout> run live-docs:generate` from another folder, with a relative `--workspace` and `--config`, and with neither. Both cases failed before the mend, looking for the configuration in the checkout. They name the configuration first, so that a run which takes its paths from the checkout stops before it writes anything there. `cli.test.ts` covers the rule for `npm_lifecycle_script`.

**One consequence for agents here** (superseded by [the second leg](#second-leg-november-19), which takes the workspace from the nearest folder with a configuration). `npm run live-docs:generate` typed in a subfolder of this checkout that has no `package.json` of its own, such as `scripts/`, now maps that subfolder, not the repository. That is what "the current directory" says. The gate and the e2e bundles run through nested `npm run`, which resets `INIT_CWD` to the checkout, so they are unaffected.

### 3. A mistyped `--workspace`: reproduced, mended (`b203ac34`)

`workspaceFolder` (`cli.ts`), through which every command now takes its workspace, refuses a path that is not a folder:

```
live-docs:generate: There is no folder at C:\work\MyRepoo; --workspace names the folder to work on. Run "npm run live-docs:generate -- --help" to list the options.
```

A file gets "… is a file; --workspace names the folder to work on." The test covers `generate` and `inspect`, and checks that nothing is made at the mistyped path. Before the mend, `generate` reported success and made the folder.

### 4. A second map overwrites the first: reproduced; a fork for the owner, nothing changed

`visualize` writes into this checkout's `dist/explorer/` whichever folder it maps. The guides say so on purpose: the getting-started guide's "Mapping another folder" says "The second builds its Explorer into `dist/explorer/` here". So the documents do not settle what another folder's default should be; they settle today's behaviour. The choices:

1. **As today, and say what was replaced.** One place, as the guides show. The build would print "this replaced the map of `<folder>`", read from the bundle it overwrites. Two maps side by side still need `--output`.
2. **This checkout's `dist/explorer/` for this repository; `dist/maps/<folder name>/` for any other.** Maps sit side by side and nothing more is written into the mapped folder. The build already prints the exact serve command, so the stranger's last line does not change. Two folders with the same name share a place, so the second would need a suffix. The guides' `npx http-server dist/explorer` line would hold only for this repository.
3. **Beside the folder's own docs**, `<folder>/.live-documentation/explorer/`. The map travels with its docs and the index. It adds 10 to 46 MB to the person's repository on top of the docs, which is the owner's open question below.
4. **No default for another folder.** Ask for `--output`. Nothing is overwritten or guessed, at the price of one more thing to type.

My recommendation is 2: it keeps this repository's Explorer where the suite and the owner's preview expect it, and it writes nothing more into a colleague's working copy.

### 5. A crash names the doc, not the source, and gives no stack: reproduced; the stack mended (`74c114c7`); the source file is the generator's

**Mended.** Every command takes `--stack`. `runCommand` lifts it off the command line before the command reads its own options, and on failure prints the stack and each cause's under "Caused by". Without it, a failure ends with "To see where it failed, run the command again with --stack." Before the mend, every command refused `--stack`. On the tSQLt crash it now prints `graphFiles.ts:36` ← `readLiveDocGraph` ← `generateLiveDocs` (`generator.ts:292`) ← `main` (`generate.ts`), which the cold run had to get by writing a driver of its own.

**For the generator's owner.** The message still names `.live-documentation/source/Tests/Run_Methods_Tests.class.sql.md: line 68: …`. The generator writes every doc and only then reads them all back (`generator.ts:271–272`, then `:292`). The first doc its own reader refuses ends the run, and by then the generator no longer knows which source the doc came from. The smallest input is a folder holding `t.sql` (`CREATE TABLE dbo.T (a int);`) and `b.sql`, three lines:

```
CREATE PROC [a'b]
'
x]
```

The run fails with `.live-documentation/source/b.sql.md: line 7: unexpected evidence on the opening entry "- Entry: opening [`a     "`. The mend I would make sits in the per-file loop, before the write at `generator.ts:271`: parse `rendered` with `parseLiveDoc`. On a `LiveDocSyntaxError`, record `{ sourcePath, reason }` and write nothing for that file. After the loop, prune, write the index from what is on disk, and return the failures. The CLI would then print, and exit 1:

```
Could not document 1 file: b.sql (Live Documentation wrote a doc for it that its own reader refuses: line 7: …). The fault is Live Documentation's, not the file's. The rest of the map was written; to leave the file out until it is mended, add "b.sql" to "exclude" in <workspace>\.live-docs.config.json.
```

That also covers the stranger's other complaint: that `exclude` was the only way past a crash, and nothing said so. A file that cannot be opened deserves the same per-file catch around `analyzeSourceFile` (`generator.ts:209`). On Windows that is a file held by an editor or an antivirus scan (`EBUSY`/`EPERM`). Here a file with mode `000` stopped the run with `EACCES: permission denied, open '…/locked.cs'`. The message named the file, but in Node's words, and the run lost every other file. The underlying scanner fault, an apostrophe in a bracketed SQL name, is in `openings.ts` and is already routed.

### 6. A crash leaves half the output: reproduced; the generator's

Reproduced on tSQLt:

1. Run 1 writes 465 docs and no index, then stops.
2. Run 2, unchanged, stops at the same doc.
3. With the five files excluded, run 3 reports `1 created, 0 updated, 460 unchanged, … 5 deleted`.

"460 unchanged" is true of the bytes on disk, but those docs were written by a run that failed and reported nothing. The cause is the same write-as-you-go loop as item 5 (`generator.ts:189–274`). The CLI cannot see it: when the generator throws, the CLI is never told what was written. With item 5's mend, a doc the reader refuses is never written, so the run completes, writes its index and names its failures, and the next run's "unchanged" is honest. Against failures that are not any file's fault (a full disk, a killed process), render every doc first and write afterwards: the window for half an output then shrinks to the writes. Holding DNN's 118 MB of rendered docs in memory would fit 8 GB.

A marker file that tells the next run "the last one did not finish" does not work. The index is never committed, so a fresh clone has docs and no index, and would look unfinished too.

### 7. Kinds of file no reader reads: reproduced, mended (`7472cf09`)

Generation now ends with the kinds no reader reads and their counts. The rule is `noReaderHandles`, the same fact behind each such doc's own note, so no new list was added. Pictures, fonts and recordings are left out, since they hold nothing a reader could find. The extension's case is kept as first seen (`.SqlDataProvider`). A file without an extension counts by its name (`Dockerfile`, `.gitignore`). On tSQLt:

```
[live-docs] Not read, so their docs hold no symbols or links: 37 .sqlpromptsnippet, 11 .txt, 10 .XXXX, 10 .yml, 9 .sqlproj, 4 .bat, 4 .bicep, 4 .cab, 4 .ssmssqlproj, 3 .pfx, 2 .sh, 2 .xslt, 1 .code-workspace, 1 .crt, 1 .doc, 1 .docx, 1 .editorconfig, 1 .gitignore, 1 .key, 1 .mssql2012, 1 .mssql2014, 1 .mssql2016, 1 .mssql2017, 1 .mssql2019, 1 .sln, 1 .ssmssln, 1 .tdf, 1 .xlsx, 1 .XML, 1 CNAME, 1 CODEOWNERS, 1 Dockerfile.
```

On this repository: `5 .yml, 3 .txt, 2 .sh, 1 .env, 1 .gitattributes, 1 .gitignore, 1 .nvmrc, 1 .patch, 1 .sln, 1 .wasm`. The line shows that `noReaderHandles` counts binaries such as `.cab`, `.pfx`, `.docx` and `.xlsx` as "not read" while it counts pictures as having nothing to read. Whether binaries belong with the pictures is the engine's rule, and is noted below.

### 8. `inspect --from` and case: reproduced, mended (`6636fd53`)

`resolveArtifactIdentifier` (`scripts/live-docs/inspect/resolve.ts`) tries the name as written first, then in any case. One file answering is that file; two that differ only in case are named back with both spellings. On tSQLt, `--from SOURCE/tsqlt.assertequalsstring.ssp.sql` and `--from 'source\TSQLT.ASSERTEQUALSSTRING.SSP.SQL'` now give the same 46 paths as the exact spelling. `resolve.test.ts` covers paths, doc paths and symbol references. **Unfinished:** a history question (`--at` with `--from`) still takes the name as written (`codePathOf` in `inspect.ts`). Folding there needs the files at that commit.

### 9. Anything else of the stranger's in `scripts/live-docs/**`

- **PowerShell may eat the `--`.** PowerShell takes `--` as its own end-of-parameters mark when it runs a script, and on Windows `npm` is a script, `npm.ps1`. npm 11's shim (read here, in its `bin/npm.ps1`) re-reads the command as typed to keep the `--`. Whether the npm that Node 22 brings to the owner's machine does the same is the first thing to try under "What only Windows can show". If the `--` is lost, every documented command line misbehaves there. Our `--workspace`, `--include`, `--dry-run`, `--json` and `--version` would then be taken by npm as its own options of those names.
- **`packages/cli/src/index.ts:99` spawns `tsx.cmd` without a shell.** Node has refused that on Windows since its April 2024 security releases (`EINVAL`). The package is not on any documented path, and it is not mine.
- Nothing else in the stranger's list lies in these files. The PowerShell wiring, `.ascx`, designer files and the SQL scanner are adapters', routed already.

## Part B: Windows text and names

### 1. UTF-16 and Windows-1252 source: established; every reader reads for itself, so not cut

I made the same C# class and SQL procedure in five encodings and generated them:

| Encoding | C# symbols | SQL symbols | A non-ASCII word (`café`) in the description |
| --- | --- | --- | --- |
| UTF-8 | 3 | 1 | right |
| UTF-8 with a mark | 3 | 1 | right |
| UTF-16 LE with a mark (SSMS, Visual Studio) | **0** | **0** | n/a |
| UTF-16 BE with a mark | **0** | **0** | n/a |
| Windows-1252 | 3 | 1 | **`caf�`**, with no warning |

UTF-16 files also lose every dependency: the SQL procedure's `dbo.Orders`, for example. Nothing is said.

**How text reaches the readers: each reads its own file** with `fs.readFile(path, "utf8")`:

- **The built-in TypeScript/JavaScript reader:** `sourceAnalysis.ts:89`, `discovery.ts:376` (the symbol-index pass), `dependencies.ts:539` (a re-exporting file) and `heuristics/dom.ts:270` (markup for DOM inference).
- **Adapters, own file:** `csharp.ts:893` and `:1249`, `sql.ts:27`, `aspnet.ts:18`, `dotnetConfig.ts:75`, `project.ts:58`, `json.ts:401`, `html.ts:345`, `css.ts:302`, `java.ts:503`, `go.ts:431`, `gomod.ts:106`, `rust.ts:545`, `c.ts:623` and `:838`, `python.ts:403`, `ruby.ts:53`, `pom.ts:206`, `manifest.ts:55`.
- **Adapters, another file:** `go.ts:501` (`go.mod`), `rust.ts:639` (`Cargo.toml`), `json.ts:166` (`tsconfig` via `ts.sys.readFile`).
- **PowerShell alone decodes by the mark:** `decodeScript`, `powershell.ts:903`. That is why UTF-16 PowerShell works.

**The seam I would cut.** One engine function, `readSourceText(absolutePath)`, returns the text and how it was read:

1. Decode by the mark: UTF-8, UTF-16 LE or BE.
2. Without a mark: UTF-8 when the bytes are valid UTF-8 (`TextDecoder("utf-8", { fatal: true })`).
3. Otherwise Windows-1252, with a note.

`analyzeSourceFile` and `buildWorkspaceIndexes` call it once per file and hand `content` to `analyzeWithLanguageAdapters`. `LanguageAdapter.analyze` then takes `content` and stops reading: the first line of each adapter changes. The secondary reads call the same function. The generator reports each file's note once, as a warning naming the file. PowerShell's `decodeScript`, the CLI's `decodeText` and the history's `lensConfiguration` then use the one decoder.

**Text that is not valid UTF-8: the choice I would make.** Windows-1252 with a warning that names the file, because:

- **Windows-1252 is the default for the owner's code.** It is what "ANSI" means on a Western Windows, and SSMS's and Notepad's default in such a locale: the owner's SQL, C# and PowerShell.
- **Every byte decodes.** So names and help come out right where today they become U+FFFD.
- **The warning covers other locales.** Elsewhere (Shift-JIS, 1251) the reader learns which file to re-save as UTF-8.

The alternatives:

- **Keep UTF-8 with replacement characters and add the warning.** Least change, but names stay wrong.
- **Read nothing from such a file and say so.** Honest, but it loses symbols that ASCII identifiers would have given.

The smallest inputs for a test are the twins that `make-encoding-twins.py` (kept beside this record) writes. The facts to hold equal: the UTF-16 file's symbols and dependencies equal the UTF-8 twin's, and the Windows-1252 file's description equals it too.

### 2. Case: the mount does not fold case here; by imitation, Windows loses links Linux keeps

**The mount.** `/workspaces/Live-Documentation` is `/dev/sdf`, ext4 (`findmnt`: `/dev/sdf[/home/user/src/Live-Documentation] ext4`), the WSL2 Linux disk. A file made as `Web.config` is not found as `web.config`. No Windows drive is mounted (`/mnt` is empty). AGENTS.md's sentence "The Windows-backed mount is case-insensitive: confirm filename casing through directory listings, not existence checks alone" is out of date for this machine. The guide is the root's. Mounting a case-folding tmpfs needed `sudo mount` and was refused. The scratch workspace could not stay under `AI-Agent-Workspace/tmp/windows-text/` either. That folder lies in a path this repository's git ignores, so `git check-ignore` calls every file in it ignored, and generation found 0 files and said nothing. That is a finding in itself, under "Other findings". The probe ran in my temp folder.

**The project.** A small .NET Framework web project whose references are spelled in another case than its files:

- `Shop.Web/web.config`, read by `ConfigurationManager.ConnectionStrings["ShopDb"]` and `AppSettings["AuditMode"]` in `Shop.Web/Repository.cs`;
- `Pages/Default.aspx` with `CodeBehind="default.aspx.cs"`, beside `Pages/Default.aspx.cs`;
- `Shop.Web.csproj` with `<ProjectReference Include="..\shop.data\shop.data.csproj" />`, beside `Shop.Data/Shop.Data.csproj`;
- `Deploy.ps1` dot-sourcing `common.ps1`, beside `Scripts/Common.ps1`;
- `Vendor/Lib.cs`, with `"exclude": ["vendor/**"]`.

I generated it twice. The first run was plain, on the case-sensitive disk. The second ran with a preload that imitates NTFS: any `stat`, `access`, `readFile` or `open` under the project finds a path in another case and keeps the caller's spelling, while directory listings give names as stored.

| Connection | Linux (case-sensitive) | Windows (imitated) | What should come out |
| --- | --- | --- | --- |
| `Repository.cs` → `web.config` | **linked**, `./web.config.md#symbol-shopdb` | **lost**: written as `./Web.config.md`, which no doc is | linked to `web.config` |
| `Default.aspx` → code-behind | nothing | written as `./default.aspx.cs.md`, dangling | linked to `Default.aspx.cs` |
| `Shop.Web.csproj` → `Shop.Data.csproj` | kept as the name `shop.data` | written as `../shop.data/shop.data.csproj.md`, dangling | linked to `Shop.Data/Shop.Data.csproj` |
| `Deploy.ps1` → `Common.ps1` | linked | linked | linked (PowerShell already folds) |
| `exclude: vendor/**` over `Vendor/Lib.cs` | documented | documented | left out |

In the graph the Windows run keeps none of the three .NET links. Linux keeps one.

**Where the mend lies (all other owners').** Three adapters probe the disk with the spelling they built, and on NTFS the probe succeeds and that spelling becomes the dependency:

- `locateNearestFile` in `csharp.dependencies.ts:165–180`, whose candidates are `["Web.config", "web.config", "App.config", "app.config"]`, in that order, so on NTFS the first always wins;
- `resolveProjectReference` in `project.ts:97–107`, `fileIndex.has` exactly, then `fs.stat`;
- `resolveMarkupRelativePath` in `aspnet.ts:118–145`, `fileExistsSync`.

The single mend is one engine helper that finds a workspace-relative path in the file index. The index holds the names as stored, since discovery lists directories. The helper tries the exact spelling first, then any case where one file answers. Every probe should use it in place of the disk; a probe should never return the spelling it asked for. `exclude` is matched by `matchesPathPattern` (`archetype.ts:174–191`), a case-sensitive regular expression. The same rule reads `entryPoints` and `archetypeOverrides`. Matching it case-insensitively (the `i` flag) is the mend. A repository holding both `Vendor/` and `vendor/` is the only one it would surprise.

### 3. When git cannot be asked: reproduced, said aloud (`b074c418`)

I made a repository whose root `.gitignore` names `*.log`, whose `src/.gitignore` names `bin/`, and whose `.git/info/exclude` names `Scratch/`. With git on the path, `generate --dry-run` documents 3 files. With git off the path, it documents 6: `src/bin/Debug/App.dll.config`, `src/obj/project.assets.json` and `Scratch/Note.cs` join them, and nothing was said.

`generate` now asks first, through `gitIgnoresUnasked` (`cli.ts`). When the folder lies in a repository (a `.git` at it or above) and git cannot answer, it warns:

```
[live-docs] git could not be asked what it ignores in C:\work\Repo, though it lies in the repository at C:\work\Repo: git may not be on the path, or may not trust the folder's owner, which "git status" there will say. So only C:\work\Repo\.gitignore is read, and what another .gitignore, .git/info/exclude or the global excludes hide, such as bin/ and obj/, gets docs; name it in the configuration's exclude, or mend git.
```

Outside any repository it says so in a line. `gitIgnored` does not keep git's own reason, so the warning names the two usual ones and the command that tells which. Keeping the reason would mean changing `gitIgnored`'s return, which discovery and the audits share. I left that alone. The test makes a repository, hides git by putting a folder holding only `node` on `PATH`, and checks both lines and that `bin/` is documented only without git. "Dubious ownership" could not be made here without root, and is in the Windows list.

### 4. Sort order: a path does reach a sort with backslashes

`walk` in `discovery.ts:289` sorts the discovered files by their **absolute** path in the platform's form. On Windows that is `C:\repo\…`, and `\` (0x5C) sorts after the digits, the capitals and `[`, where `/` (0x2F) sorts before them. Checked:

```
Linux  : Data/Order.cs  DataAccess/Order.cs  Shop.Data/Customer.cs  Shop.Data2/Customer.cs  src/a.cs  src0/a.cs
Windows: DataAccess/Order.cs  Data/Order.cs  Shop.Data2/Customer.cs  Shop.Data/Customer.cs  src0/a.cs  src/a.cs
```

That order is the order in which files register their symbols. Where two files declare one name and tie on every rule of `createProximityAwareComparator` (`coreUtils.ts:289–310`, whose last rule returns 0), the stable sort keeps registration order. So `resolveTypeToLiveDoc` (`compose.ts:264–268`) picks a different file on each platform, and the docs differ. The C# adapter is not exposed: given `Shop.Data/Customer.cs` and `Shop.Data2/Customer.cs`, it lists both (checked). The readers that resolve a type by name alone are exposed. `generator.ts:137` also sorts absolute paths with `.sort()`, when `--include` is given. **Mend (other owners'):**

1. Sort by the forward-slash workspace-relative path in `walk` and at `generator.ts:137`.
2. Give the comparator a last rule, `compareText(a.sourcePath, b.sourcePath)`, so that no choice rests on discovery order.

### 5. Long paths

On this disk nothing happens: a source path of 350 characters gets a doc at 380, and `generate` and `inspect` work. Each doc's path is its source's plus about 30 characters (`.live-documentation\source\` and `.md`). On Windows, Node's `fs` hands every absolute path to the system in its long form (`path.win32.toNamespacedPath`: `\\?\C:\…`), so the tool itself should read and write such paths. Git for Windows without `core.longpaths=true`, Explorer and Visual Studio may not handle them. That is in the Windows list.

### 6. Line endings of the tool's own files

- **The configuration:** indifferent. `JSON.parse` takes CRLF; the tests' text has CRLF.
- **`index.json`, `explorer-data.json` and the history's JSON:** indifferent; JSON. The Explorer's content security policy pins no hashes (`script-src 'self'`), so a bundle checked out with CRLF still runs.
- **A `.gitignore` read by the fallback:** indifferent to CRLF and to a mark (the `ignore` package, checked).
- **A board (`board.md`), written by a person: refused with CRLF and with a mark.** `line 1: expected the title, found "# Sample board\r"`, and the same with U+FEFF before `#`. `parseBoard` (`board.ts:175`) reads through document.ts's `Reader` (`document.ts:748`, which splits on `\n`). So **for document.ts's owner:** mend CRLF, and a leading mark, in `Reader`, not in `parseLiveDoc` alone, and the board is covered too. Its other reader is `staticBuilder.ts:123`.
- **A document's links, for `Cited By`:** indifferent to CRLF.

## Forks

**Decided by me:** item A2. "Here" is the folder the person runs the command in; the reasons are above.

**The root's:**

1. Cut the reading seam of Part B, item 1, and decide how text that is not UTF-8 is read: my recommendation is Windows-1252 with a warning.
2. Route the generator's per-file failures (items 5 and 6) together with the SQL scanner's fix.

**The owner's:**

1. Where another folder's Explorer goes (A4): my recommendation is `dist/maps/<folder name>/`.
2. **The docs written inside the mapped repository.** The cold run measured 1,978 files and 15 MB for dbatools, and 10,777 files and 118 MB for DNN. tSQLt today: 462 files, 4.6 MB. Nothing is git-ignored.
   - **What the record intended.** The vision: "It writes one markdown file per source file … Those markdown files are the product." The README: "Commit the Live Docs with the code, and a pull request shows what a change did to the shape of the system." So docs inside the repository, committed, was the design for a person mapping their own code. Derived output already ignores itself: the index is "never committed", and the history's folder "ignores itself".
   - **What a person mapping someone else's repository wants:** to leave the working copy as they found it, with `git status` clean and no 100 MB to remove by hand.
   - **The choices.**
     1. As today, with the README saying so before the first command, and how to add `.live-documentation/` to `.gitignore`.
     2. The docs root ignores itself (a `.gitignore` of `*` written inside it, as the history's folder does) until a team says it commits them, by a setting or by deleting that file. A colleague's working copy stays clean, and adopting the tool to commit docs takes one deliberate step.
     3. The docs outside the repository by default, for a folder that is not this checkout: in `dist/maps/<name>/docs/`, say. Nothing is written into the folder, but relative source links and the "docs live with the code" property are lost for that case.
     4. A line at the end of generation saying how many new files git now sees and how to ignore them. Smallest; it still writes.
3. **A doc for every picture.**
   - **The measure.** DNN's 1,325 PNGs, 671 GIFs and 283 SVGs: about 2,279 of its 10,776 docs, a fifth.
   - **What the record intended.** The default glob documents "every file, anywhere", on the owner's rule of 2026-10-15: "Is there authorial decisionmaking to convey here? If so, there should be a live documentation file for it." Pictures are named apart (`LIVE_DOCUMENTATION_ASSET_EXTENSIONS`) only so that their empty docs need no note.
   - **What a person mapping someone else's repository wants:** to see code first, and a picture only where code uses it.
   - **The choices.**
     1. As today.
     2. A picture gets a doc only when something links to it, from HTML, CSS or markup, or when its doc already holds authored words. It needs the reference index the first pass builds.
     3. Pictures never get docs, and references to them stay named leaves. This loses a place for authored words on an asset.
     4. A setting (`assets: documented | referenced | none`), with the default the owner picks.

   The same question touches binaries counted as "not read" in A7: `.cab`, `.pfx`, `.docx`, `.xlsx`.

## Other findings, for their owners

- **A folder inside another repository's ignored path maps to nothing, silently.** Generating `AI-Agent-Workspace/tmp/windows-text/linux`, which this repository ignores, found 0 files. Git called every file ignored, as the owner's rule says (what git ignores is never part of the map). Nothing said why. `generate` could say "git ignores every file here, as part of the repository at …". It would be one more case in `gitIgnoresUnasked`; I left it for the root, since it rests on the owner's rule.
- **`packages/cli/src/index.ts:99`:** see A9.
- **The history's configuration reader:** see A1.
- **A board with CRLF or a mark:** see B6.

## What only Windows can show, and what to try first

In order, in Windows PowerShell 5.1, in the Live Documentation checkout, after `npm ci` and `npm run build`:

1. **Whether PowerShell passes `--` to npm** (A9).

   ```powershell
   npm run live-docs:generate -- --version
   ```

   `0.0.0` (the generator's version) means `--` passed. npm's own version (`10.x`) means PowerShell ate it. In that case, try `npm run live-docs:generate '--' --version` and `npm.cmd run live-docs:generate -- --version`; whichever prints `0.0.0` is the form every guide needs for Windows PowerShell.
2. **A first map of a real repository, timed, with peak memory:**

   ```powershell
   $env:TSX_TSCONFIG_PATH = 'tsconfig.base.json'
   $p = Start-Process node -ArgumentList '--import','tsx','scripts\live-docs\generate.ts','--workspace','C:\work\TheRepo' -NoNewWindow -PassThru -Wait
   "{0:N0} MB peak, exit {1}" -f ($p.PeakWorkingSet64 / 1MB), $p.ExitCode
   ```

   It runs the generator in one process, so the peak is the generator's. Read the "Not read" line, and look for a git warning.
3. **UTF-16 files in their code**, which today give no symbols:

   ```powershell
   Get-ChildItem C:\work\TheRepo -Recurse -Include *.sql,*.cs,*.ps1 | Where-Object { $s = $_.OpenRead(); $b = New-Object byte[] 2; [void]$s.Read($b, 0, 2); $s.Close(); ($b[0] -eq 0xFF -and $b[1] -eq 0xFE) -or ($b[0] -eq 0xFE -and $b[1] -eq 0xFF) } | Select-Object -ExpandProperty FullName
   ```
4. **Case**: `inspect` with a path typed in another case:

   ```powershell
   npm run live-docs:inspect -- --workspace C:\work\TheRepo --from <a path in other case> --direction inbound
   ```

   Then, on a project whose `Web.config` is spelled `web.config` or whose `CodeBehind` differs in case from the file, check whether the doc's link names the file as stored.
5. **Git's trust and path**: `git -C C:\work\TheRepo status`. If it says "dubious ownership", which is likely on a network share or after cloning as an administrator, `generate` should now warn.
6. **CRLF**: `git config --get core.autocrlf`. If it says `true`, the Live Docs checked out from a commit will have CRLF, which the document.ts builder is mending.
7. **Long paths**:

   ```powershell
   git config --get core.longpaths
   (Get-ChildItem C:\work\TheRepo\.live-documentation -Recurse -File | Where-Object { $_.FullName.Length -gt 259 }).Count
   ```
8. **Files held open**: run `generate` while Visual Studio has the solution open and an antivirus scan is running. Look for `EBUSY` or `EPERM`, which today stop the whole run (A5).
9. **The console**: whether `live-docs:lint — 12 file(s) validated` shows its dash, or `ΓÇö` under the console's OEM code page. Cosmetic.

Not testable here at all: cmd.exe under `npm run`, NTFS itself, drive letters in `INIT_CWD` (handled by comparing case-insensitively on Windows, untested), antivirus, the 8 GB laptop.

## The cold run's steps again, on tSQLt

Done as the stranger did them, from this branch:

1. `npm run live-docs:generate -- --workspace …/tSQLtt` (misspelled) is refused, naming the path, and makes nothing. Before, it reported "processed 0 file(s)" and made the folder.
2. `npm run live-docs:generate -- --workspace …/tSQLt` still fails at `Run_Methods_Tests.class.sql.md: line 68` (the SQL scanner and the generator's, A5 and A6). It now ends "To see where it failed, run the command again with --stack.", and `--stack` gives the trace.
3. With the five files excluded, the run completes. "460 unchanged" is still printed for docs the failed run wrote (A6). It now ends with the 32 kinds of file it did not read.
4. `visualize` builds into this worktree's `dist/explorer` (see Verification).
5. `inspect --from` in another case, and with backslashes in another case, answers as the exact spelling does.
6. Standing in the tSQLt folder, `npm --prefix <checkout> run live-docs:generate -- --dry-run` maps tSQLt with no `--workspace`, and `inspect --groups` answers for it.

## Verification

- **`npm run safe:commit`, without the browser, under a private temp folder: passed.**
  - The Live Docs pipeline: all 1,093 docs unchanged after generation, then lint.
  - ESLint, the build, and the tests' type-check.
  - 198 unit files with 2,248 tests, and 21 integration files with 164 tests.
  - Documentation link enforcement and the three SlopCop audits.
  - The working tree was clean afterwards.
- **Before then, each test was run against the code before its mend, and failed.** The invocation-folder cases (`npm --prefix` from another folder) ran against the old `cli.ts` and `generate.ts` and failed by looking for the configuration in the checkout, writing nothing there. The mistyped-workspace, unread-kinds, git and case cases were each run before their mend and failed. The `--stack` case was not run before its mend. Its failure follows from the old code: every command refused `--stack` as an option it did not know, as the edge tests assert of any unknown option.
- **The browser stage was not run** (no browser, by the brief). This repository's graph changed in ways a picture test can see:
  - new test files `scripts/live-docs/cli.test.ts` and `scripts/live-docs/inspect/resolve.test.ts`, with their docs;
  - `generate.ts` now imports `noReaderHandles` from `liveDocumentationConfig.ts` and `compareText` from `tooling/compareText.ts`;
  - `cli.ts` now imports `gitIgnored`.

  `local-map-simplicity.spec.ts` pins `generator.ts`'s neighbourhood. `generate.ts` and `liveDocumentationConfig.ts` both stand in it, so that picture gains a symbol wire between them. Its comments record that such a change once moved its step counts. The root's gate should run the browser stage before any of this lands.

## Unfinished

- A history question's `--from` in another case (A8).
- Git's own reason in the warning (B3), and a whole folder ignored by an enclosing repository (Other findings).
- Everything routed to other owners above: the generator's per-file failures, the reading seam, the adapters' probes, `exclude`'s case, the sort, the board's line endings, the history's configuration reader.
- Nothing was tried on Windows.

## The probes' scripts, kept beside this record

- `make-encoding-twins.py <folder>`: writes the C# and SQL twins of Part B, item 1.
- `make-case-project.py <folder>`: writes the case project of Part B, item 2.
- `ntfs-lookups.cjs`: the preload that imitates NTFS's lookups under `FOLD_ROOT`. Run it as `FOLD_ROOT=<folder> NODE_OPTIONS="--require <this file>" npm run live-docs:generate -- --workspace <folder>`.
- `links-of.cjs <folder>`: prints each file's dependency lines from its doc.
- `line-endings.ts <index.json>` and `gitignore-endings.cjs`: Part B, item 6, run from this folder with `npx tsx` and `node`.

Everything else was in my private temp folder and was removed with it.

## Second leg, November 19

The root accepted the first leg and ruled on its forks. The rulings are in the root's record; this section says what the second leg changed and found, on top of `dc503fea`.

### "Here", amended: the nearest folder with a configuration

The root changed A2 in one respect. Someone who runs `npm run live-docs:generate` from `scripts/`, or from any folder inside a mapped repository, must get that repository's map, not a new map of the folder. With no `--workspace`, a command now works on the nearest folder that holds a `.live-docs.config.json`, searching from where it was run up to the file system's root, as git finds a repository. When no folder does, it works on the folder it was run from. Relative `--workspace`, `--config` and `--output` are still taken from where the command was run. When the workspace was found above that folder, `generate` says which one it maps: `[live-docs] Mapping C:\work\Repo, the nearest folder above C:\work\Repo\src\deep that holds a .live-docs.config.json.` Every `--help`, the README, the CLI reference and the getting-started guide say the rule, with the example of `scripts/`.

**Tests.** `generate-cli.test.ts` runs five cases through npm:
- this checkout from its root and from `scripts/`, read by `inspect` from its committed docs;
- another repository from its root and from `src/deep`, through `npm --prefix`;
- a folder with no configuration anywhere above it, which is its own workspace.

The two cases run from a subfolder failed against the first leg's rule: `scripts/` found no docs, and `src/deep` was mapped alone. `cli.test.ts` covers `nearestConfiguredFolder`, including a nested configuration and a folder named like the file.

### One parser of the configuration file

The decoding, and the parse with it, moved from `scripts/live-docs/cli.ts` into the engine's configuration module as `parseLiveDocumentationConfigBytes(bytes)`. It decodes by the byte-order mark (UTF-8 with or without one, UTF-16 LE or BE), parses the JSON, and throws `SyntaxError` as `JSON.parse` does. `readConfiguration` in `cli.ts` calls it, and `decodeText` is gone. `cli.test.ts`'s cases for marks and UTF-16 now run through it.

**It takes bytes, not a path.** The Explorer's page bundles this module: three client files (`client/pathfind.ts`, `panels/sources-facts.ts`, `views/localView/card-reading.ts`) import the engine's `pathfind.ts`, which imports it for `noReaderHandles`. I bundled a module that imports `node:fs/promises` exactly as `buildAssets.ts` bundles the client, and esbuild refused it: `Could not resolve "node:fs/promises"`. So the file is read by the caller, which also keeps its own "cannot read the configuration at …" message and its rule for a missing file. The real client, bundled the same way with the change, builds. If the root wants the reading itself in one place too, that needs a Node-only file beside this module, which was not mine to create.

**For the history's owner, exactly.** In `packages/generator/src/history/computeHistory.ts`, `lensConfiguration`, line 583, replace

```ts
input = JSON.parse(await fs.readFile(file, "utf8")) as LiveDocumentationConfigInput;
```

with

```ts
input = parseLiveDocumentationConfigBytes(await fs.readFile(file));
```

and import `parseLiveDocumentationConfigBytes` from the configuration module, as the file imports `normalizeLiveDocumentationConfig` now. The surrounding `try` and its message stay as they are. A test: a `.live-docs.config.json` whose bytes begin `EF BB BF`, or are UTF-16 LE after `FF FE`, gives the same lens as the plain file.

### A history question's file in another case

`inspect --at <commit> --from <file>`, and `--to`, now find the file in any case, as today's questions do. `fileNamedAt` (`scripts/live-docs/inspect/history.ts`) tries the name as spelled, then the one file at that commit whose path differs by case alone. Two such files are named back. A name no file answers to is still said not to have existed. `codePathOf`, which reads a doc's path as its file's, moved beside it and reads the docs folder and suffix in any case. `inspect-cli.test.ts` builds the history's scripted repository at its first commit, writes its history, and asks `--from SRC/App/View.TS`, the doc's path in another case, and `--to` in another case. The first case failed before the mend, and the case of a name no file answers to passed both before and after. `inspect/history.test.ts` covers the two files that differ by case alone.

### The `--stack` case, seen red

The first leg did not run this case before its mend. It has now been run twice against code that should fail it, with only `scripts/live-docs/cli.ts` swapped and then restored:

- **The code before the mend** (`cli.ts` as of `7472cf09`) fails it at the first assertion: a failure printed no line about how to see where it failed. Further on, that code would also refuse `--stack` as an option it does not know.
- **A build that accepts `--stack` and ignores it**: today's `cli.ts` with its stack branch switched off (`withStack && false`). It still lifts `--stack` off the command line and prints the line about it. It fails at the traced assertion: `expected 'live-docs:lint failed: cannot read th…' to contain 'live-docs:lint failed: Error: cannot …'`. So the case fails on its substance, a stack printed, and not only on whether the option is accepted.

With `cli.ts` restored, it passes.

### `packages/cli/src/index.ts`: what it is, and whether it has a purpose

Nothing in it was changed.

**What it is.** It is a dispatcher of 119 lines for a `live-docs` binary. `live-docs generate|lint|inspect|visualize|orphans` spawns `node_modules/.bin/tsx` (`tsx.cmd` on Windows, without a shell) on `scripts/live-docs/<command>.ts`. It finds both by paths relative to its own compiled file (`../../../scripts/live-docs`, `../../../node_modules/.bin/tsx`). Its manifest names `bin: { "live-docs": "./dist/index.js" }`, `files: ["dist"]`, and dependencies on the engine and the Explorer that it does not import.

**Where it came from.** It was added on 2025-12-15 in `7aea17b7`, "feat: pre-publish prep - CLI package, npm metadata, branding updates" ([chat 2025-12-15.2](../../../../../2025/12/2025-12-15/2025-12-15.2.md), Turn 23, as its Live Doc records), to prepare for publishing to npm. Since then only renames, dependency bumps and a build-record change have touched it.

**What uses it: nothing that runs.**
- The root's `build` builds the engine, the Explorer and the generator, not it. So `packages/cli/dist` does not exist, its `bin` has no target, and npm links no `live-docs` into `node_modules/.bin` (checked: absent).
- No code imports it. No guide, script or workflow runs it.
- Its remaining mentions are bookkeeping: the root `package.json`'s `workspaces`, `package-lock.json`, its two Live Docs, and the hand-written entries expectation `tests/integration/live-docs/expected/repository-entries.json` (lines 22–31), which lists its manifest, `tsconfig.json` and `src/index.ts` as entries. [The dead-code sweep of 2026-10-08](../../../../../2026/10/2026-10-08/Probes/dead-code-sweep/candidates.md) found "nothing references it". That is still so.

**Why it could not serve as it stands.**
- Published with `files: ["dist"]`, it would carry neither the scripts nor tsx, which it reaches by paths into this checkout.
- Its command map lacks `history` and `board`. Its Live Doc's Purpose still names `system` and `report`, which are gone.
- On Windows, Node has refused to spawn a `.cmd` without a shell since its April 2024 security releases (`EINVAL`).

**What the record says.**
- The board was re-authored on 2026-10-09: "The CLI shell under `packages/cli` is not the package and is not on the board". The installable `live-docs` is drawn there as imagined, and it is item 6 of direction's Next.
- The [record of that day](../../../../../2026/10/2026-10-09/2026-10-09.1.record.md) ends: "Carried for the owner: the fate of the CLI shell under `packages/cli`, off the board and still in the repository". I found no answer since.
- The [audit of 2026-10-19](../../../../../2026/10/2026-10-19/2026-10-19.1.record.md) says: "The CLI shell dispatches through repository scripts/tsx and omits newer commands. The intended delivery board already calls it a development shell. Choose one real command/config boundary when addressing delivery; do not duplicate command maps or turn that choice into an unapproved packaging rewrite."

**Answer: as code, it has no justified purpose today.** Nothing runs it, it cannot run where it would be needed, and the one thing it holds, the name `live-docs` for a binary, the board already carries as the imagined package. Its fate has been the owner's question since 2026-10-09. My recommendation is to delete it when the owner agrees, or with the packaging round that builds the real `live-docs`.

Deleting it means removing:
- the `workspaces` entry and its lock lines;
- its two Live Docs;
- its three entries in `repository-entries.json`, which is the owner's hand-curated expectation and so wants their nod.

Carry forward the binary's name and the list of commands it meant to dispatch into the package's design. `index.ts` still holds both.

### `live-docs:orphans` reads a doc's source through the grammar

`find-orphans.ts` read a doc's source with a pattern of its own, `^\s*-\s*Code Path:\s*(.+)$`. Under the writer on the other branch, which quotes a value whose plain form would not read back, that pattern would take the quotes as part of the path and report a false orphan. It now reads the source with `parseLiveDoc(text).codePath`, the grammar's own reader, which reads both forms on that branch. A doc the reader refuses, or a file that cannot be opened, is mapped from where it lies, as before.

The new case in `generate-cli.test.ts` writes its docs with the engine's `renderLiveDoc`: an ordinary file, a file whose name begins with `"` (skipped on Windows, which allows no such name), and a source that is gone. It holds each doc's source to what `parseLiveDoc` reads, and the command's output to the one gone file. It passes before and after this mend under today's writer, which writes the name plainly, so it could not be seen red here. It is the case that would turn red with the old pattern once the two branches are joined. `npm run live-docs:orphans` over this repository still finds none.

One thing it shows, left as it was: a doc the reader refuses is mapped by the `.md` suffix alone. With this repository's `.mdmd.md` suffix that mapping would expect a source ending in `.mdmd`. The command reads no configuration by its own Notes, so the suffix is not known to it. Only a doc that is broken anyway reaches that mapping.

### The second leg's verification

All runs used a private TMPDIR. The machine's load average was 21 to 29 throughout, from other builders.

**`npm run safe:commit` without the browser**, run twice. Each time, the Live Docs pipeline (1,094 docs unchanged, lint), ESLint, the build and the tests' type-check passed. Each time, one suite then overran its five-second deadline under that load:
- `generatorIdentity.test.ts`'s lens-key case, at 5.8 s;
- in the second run, `sequence.test.ts`'s keyframe case, at 6.2 s. That suite already stands in the serial project for this reason.

Neither touches this leg's files. Each passed when run alone: the first three times, the second once. The gate stopped at that stage, so the stages after it were run by hand:
- the unit suite again: 199 files, 2,253 tests, all passing;
- integration: 21 files, 169 tests;
- documentation link enforcement and the three SlopCop audits.

All passed, and the tree was clean.

**Other checks.**
- The Explorer's client, bundled for the browser as `buildAssets.ts` bundles it, builds with the configuration module's new function.
- `npm run live-docs:orphans` over this repository finds no orphan.
- The browser stage was not run.

**Unfinished, or another's.**
- `computeHistory.ts` is to call `parseLiveDocumentationConfigBytes`. The exact swap is above.
- The reading seam waits for the adapters' builders, as the root ruled.
- The orphans case turns red only once the writer's quoted form is joined.
- The fate of `packages/cli` is the owner's.

## Third leg, November 19

The root ruled the reading seam in, once the SQL and PowerShell readers' builders had handed back. It added the generator finishing a run that meets a file it cannot map, `exclude` following git's `core.ignorecase`, and a check on how refusals are printed. This section says what the third leg built, on top of `17532f56`.

### One reading step for every language reader

`packages/engine/src/tooling/sourceText.ts` holds `decodeSourceText(bytes)` and `readSourceText(path)`. The rule, in order:

1. A byte-order mark decides: UTF-8, UTF-16 LE, UTF-16 BE. The mark is not part of the text.
2. UTF-16 without a mark is taken only where it is certain. That means an even number of bytes, in which every pair is one zero byte and one that is not, with the zero always on the same side. In other words, every character lies between U+0001 and U+00FF. No text in a one-byte encoding holds a zero byte in every other place. **Refused as a guess:** UTF-16 without a mark that holds any character above U+00FF. Telling it apart would mean weighing how often zero bytes occur, and a wrong guess reads a file as nonsense. Such a file holds zero bytes, so it falls to rule 5.
3. Bytes that are valid UTF-8 and hold no zero byte are UTF-8.
4. Bytes that are not UTF-8, hold no zero byte, and hold no control character other than tab, line feed, vertical tab, form feed, carriage return and 0x1A are read as Windows-1252.
5. Anything else is not read. The reader gets empty text, the file is named, and the run goes on.

The decoders are the platform's own `TextDecoder`. `sourceText.test.ts` checks real bytes for each rule and each refusal. Where PowerShell 7 is installed (it is here, 7.7.0), it also checks each readable case against `Get-Content -Raw -Encoding` with the encoding Windows would use: `utf8NoBOM`, `utf8`, `Unicode`, `BigEndianUnicode` and `1252`. All agree, code unit for code unit.

**The readers this leg moved onto the step** (each `fs.readFile(x, "utf8")` became `readSourceText(x)`):
- the TypeScript/JavaScript reader (`sourceAnalysis.ts`, and the symbol-index pass in `discovery.ts`), the re-export follower (`dependencies.ts`) and the DOM heuristic (`heuristics/dom.ts`);
- the adapters for Java, Go and `go.mod`, Rust and `Cargo.toml`, C and C++, Python, Ruby, JSON, HTML, CSS, `pom.xml`, and the TOML manifests.

`json.ts:166` reads a `tsconfig` through TypeScript's own `ts.sys.readFile`, which already decodes by the mark, and stays.

`sourceEncodings.test.ts` saves one file per language as UTF-16 LE and BE with a mark, and as Windows-1252, each with a non-ASCII word in what the reader reports. It holds each one's symbols, descriptions and dependency lines to its UTF-8 twin. All 21 cases failed before the change.

**How a run says which rule read its files.** The generator classifies each file a reader reads with `decodeSourceText` and returns the files read as UTF-16, as Windows-1252, and not read as text. `generate` prints a line for each, for example `[live-docs] 1 file read as Windows-1252, since it is not UTF-8: src/ansi.py.` A file that is no text is named on stderr with the reason. The generator reads each such file's bytes a second time to classify them; the readers still open the file themselves.

**The simplest correct form.** The generator reads each file's bytes once, decodes them with `decodeSourceText`, counts the rule, and hands the text to `analyzeSourceFile`. That function passes it to `analyzeWithLanguageAdapters` as `content`, and no reader opens its own file. The step was built for either form: `decodeSourceText` takes bytes, `readSourceText` a path. That form would change:
- `analyzeSourceFile` and `buildWorkspaceIndexes`, to take or read the text once;
- `LanguageAdapter.analyze`'s input, to carry `content`;
- the first line of each adapter.

The secondary reads (`go.mod`, `Cargo.toml`, a re-exporting file, DOM markup) would keep `readSourceText`. This leg did not change any signature.

**The history's tree writer.** It already writes each commit's files as git stores them, byte for byte (`git` blobs written to the scratch tree without decoding), so the history's regeneration reads them through the same step with no change. I confirmed this by reading the tree writer's use of the blob bytes, not by a run.

### The generator finishes a run that meets a file it cannot map

`generator.ts` now wraps each file's work in one `try`, from the binary sniff to the write. Before writing, it reads the doc back with `parseLiveDoc`. A file that cannot be read, or whose doc the reader refuses, is skipped and recorded in `failed` with its source path and the reason. The run goes on to write every other doc, prune, and write the index over what it could map. `generate` then prints, on stderr:

```
[live-docs] Could not map 1 file; the rest of the map was written. The fault is Live Documentation's, not the file's; to leave a file out until it is mended, name it in the configuration's "exclude".
  src/hostile.ts: Live Documentation wrote a doc for it that its own reader refuses: line 19: expected a symbol heading, found "not a line of the grammar"
```

It then exits 1. A failed file's old doc is removed only when the reader refuses it and it holds no authored words: that is the leftover of an earlier run that stopped on the file.

**The test.** `generator.unmappable.test.ts` wraps the writer so that one file of three gets a doc the reader refuses, and makes a second workspace with a file that cannot be opened. Both cases failed before the change, the first with `.live-documentation/source/src/hostile.ts.md: line 19: …` as the cold run met it. The CLI's lines for the reading rules are covered in `generate-cli.test.ts`.

**What I changed in `generator.ts`,** away from the ordering near line 137 and from `classifyChange`:
- imports: `hasReader`, and `decodeSourceText, type SourceTextReading`;
- the result's `failed` and `readings` fields, and the `SourceReadings` type;
- two arrays beside `results`;
- in the loop, `try {` before the binary sniff, the reading count, the read-back before `results.push`, and the `catch` after the write that records the failure and calls `removeRefusedDoc`;
- the two fields in the return;
- `noteReading` and `removeRefusedDoc` after `generateLiveDocs`.

The loop's body inside the new `try` is left at its old indentation so that the join with the other branch's changes to this file stays small. Indent it at the join.
