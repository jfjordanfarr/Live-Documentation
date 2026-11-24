# Live Documentation

**Live Documentation turns a folder of source files into a map you can look at.**

It reads every file as text and records what that file offers to the rest of the code and what it uses. Those facts are the product. The Explorer, a static site you can host or hand to a colleague, and the command line both read them and nothing else. It runs offline, calls no model and makes no network request.

![One file of a sample program drawn as a card in the Local Map: its public symbols listed with their descriptions and its tests named beneath them, wires arriving at green pins on its left from the files it uses and leaving from blue pins on its right to the files that use it](AI-Agent-Workspace/Gallery/readme/card-at-reading-size.png)

A file of the TypeScript sample as the Local Map draws it: what it uses arrives on the left in green, and what it offers leaves on the right in blue.

**[Open the live demo](https://jfjordanfarr.github.io/Live-Documentation/)**, which is this repository mapped by itself.

## Why it exists

Two things its author wanted, in their words:

> We want to be able to look at directories and understand their contents well, especially if those contents have interconnectivity of some kind.

> I just want to be able to show non-software people what I do and they can _see it_ the way I understand it. I don't want to keep drawing bespoke diagrams.

So the map is made from the code, not drawn by hand. It is regenerated when the code changes, and a view of it is a link you can send.

## Map your own repository

Live Documentation is not yet published to npm. Run it from a clone, with Node.js 26 or newer, and point it at your folder:

```bash
git clone https://github.com/jfjordanfarr/Live-Documentation.git
cd Live-Documentation
npm install
npm run build

npm run live-docs:generate -- --workspace <folder>
npm run live-docs:visualize -- --workspace <folder>
npx http-server dist/explorer -a 127.0.0.1 -p 8766 -c-1
```

Then open `http://127.0.0.1:8766/`.

- `generate` writes the markdown into `<folder>/.live-documentation/source/`, one file per source file. Add `--dry-run` to see what it would write first. This repository's thousand files take a few minutes.
- `visualize` builds the Explorer into `dist/explorer/` in this checkout. Copy that folder to any static host to share it.
- The Explorer has to be served, as the last line does. A browser will not let a page opened as a file read the data beside it, and the page says so if you try.
- In a git repository, files that git ignores are left out. Elsewhere, name build output to leave out in the [configuration](#configuration). If git cannot be asked, because it is not on the path or does not trust the folder's owner, `generate` says so: only the folder's own `.gitignore` is then read.
- Every command prints its options with `--help`, for example `npm run live-docs:generate -- --help`.
- A path you give, `<folder>` among them, is taken from the folder you run the command in. With no `--workspace`, a command works on the nearest folder, from there up, that holds a `.live-docs.config.json`, else on the folder itself: run from `scripts/` here, `npm run live-docs:generate` still maps this whole checkout. Standing in your own folder, `npm --prefix <path to this checkout> run live-docs:generate` maps it.

To try it without a repository of your own, leave out `--workspace`: the same three commands map this one.

## What you can ask it

In the Explorer:

- **What does this file offer, and who uses it?** The Local Map draws a file as a card: what it offers on its right edge in blue, what it uses on its left in green, and wires to the files on either side. Pin the files you care about and the picture keeps them.
- **What is in this directory?** Open a directory on the Local Map to see its files side by side, or switch to 3D to see the same files as a graph you can turn.
- **How does this reach that?** Search for a file, then choose **Path to** another, and the map shows the shortest route between them.
- **Which files matter most?** Knowledge Sources lists the most used files, the files that use the most, where the program starts and what nothing reaches.
- **How do our systems talk to each other?** The World Map shows several systems as pieces on a board, with a door wherever one offers or uses an address, and wires between the doors. You describe the board in one markdown file; the doors and wires come from the code.
- **How did it get this way?** Run `npm run live-docs:history` before building, and the Local Map, in 2D or in 3D, can step through the repository's commits as changes to the picture.

Whatever you are looking at is in the address bar. Send the link, and a colleague with the same build sees the same thing.

At the command line, the same questions, here asked of this repository:

```bash
# What depends on this file?
npm run live-docs:inspect -- --from packages/generator/src/generator.ts --direction inbound

# How does one file reach another?
npm run live-docs:inspect -- --from scripts/live-docs/generate.ts --to packages/engine/src/live-docs/core.ts

# Where does the program start, and what does nothing reach?
npm run live-docs:inspect -- --reachable
```

Add `--workspace <folder>` to ask them of your own, and `--json` for output a script can read.

## How the facts are kept

Today a scan writes one markdown file for every source file, a Live Doc. Headings are the file's public symbols and links are its dependencies, so the facts can be read, searched and diffed like any other text. Shortened, one looks like this:

```markdown
# packages/explorer/src/client/errors.ts

## Authored
### Purpose
What the Explorer says when it cannot start, or stops.

## Generated
### Public Symbols
#### `reportFatalExplorerError`
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/errors.ts#L59)

### Dependencies
- [`template.detail-panel`](../shared/template.html.mdmd.md#symbol-detail-panel)
```

The generated sections are rewritten on every run. The authored section is yours: say what the file is for, and the Explorer shows your words on its card.

This store is on trial. A scan of a large repository leaves thousands of files beside the code it maps, and the direction is one compact file, with markdown written out only when you ask for it, so that a scan leaves nothing in your folder. [The format](.mdmd/layer-3/stored-form.mdmd.md) exists as a module with a specification; nothing in the product uses it yet.

## Languages

Each picture is the Explorer's Local Map of one file, as a first visit leaves it: the file outlined in blue, the files it uses on its left and the files that use it on its right. Nine of the rows are one small program written in nine languages, with the same file as the subject of each, so the shapes can be compared. C#, Python, Java, Go, Rust, C and C++ are parsed with tree-sitter and resolved by each language's own rules for namespaces, packages, modules and includes.

| Language or framework | The Explorer drawing it |
| --- | --- |
| **TypeScript**, resolved by the TypeScript compiler. | <img src="AI-Agent-Workspace/Gallery/readme/typescript.png" width="500" alt="The Local Map of the TypeScript sample: processor.ts between the type, model and helper files it uses, on its left, and its tests and main.ts, which use it, on its right"> |
| **JavaScript**, resolved by the TypeScript compiler. | <img src="AI-Agent-Workspace/Gallery/readme/javascript.png" width="500" alt="The Local Map of a .NET estate's portal.js, wired to the routes of a C# controller and to the form elements of an ASP.NET page"> |
| **C#**, measured against its compiler. | <img src="AI-Agent-Workspace/Gallery/readme/csharp.png" width="500" alt="The Local Map of the C# sample: Processor.cs between the type, model and helper files it uses, on its left, and the tests and Main.cs, which use it, on its right, each in its directory"> |
| **Python**, measured against its compiler. | <img src="AI-Agent-Workspace/Gallery/readme/python.png" width="500" alt="The Local Map of the Python sample: processor.py between the type, model and helper files it uses, on its left, and its tests and main.py on its right"> |
| **Java**, measured against its compiler. | <img src="AI-Agent-Workspace/Gallery/readme/java.png" width="500" alt="The Local Map of the Java sample: Processor.java between the type, model and helper classes it uses, on its left, and the tests and Main.java on its right, each in its package's directory"> |
| **Go**, measured against its compiler. | <img src="AI-Agent-Workspace/Gallery/readme/go.png" width="500" alt="The Local Map of the Go sample: processor.go between the type, model and helper packages it uses, on its left, and its tests and main.go on its right"> |
| **Rust**, measured against its compiler. | <img src="AI-Agent-Workspace/Gallery/readme/rust.png" width="500" alt="The Local Map of the Rust sample: processor.rs between the type, model and helper modules it uses, on its left, and main.rs and the tests on its right"> |
| **C**, measured against its compiler. | <img src="AI-Agent-Workspace/Gallery/readme/c.png" width="500" alt="The Local Map of the C sample: the header processor.h between the headers it includes, on its left, and the C files that include it, on its right"> |
| **C++**, measured against its compiler. | <img src="AI-Agent-Workspace/Gallery/readme/cpp.png" width="500" alt="The Local Map of the C++ sample: the header processor.hpp between the headers it includes, on its left, and the C++ files that include it, on its right"> |
| **Ruby**, for symbols and requires. | <img src="AI-Agent-Workspace/Gallery/readme/ruby.png" width="500" alt="The Local Map of the Ruby sample: processor.rb between the files it requires, on its left, and main.rb and the specs that require it, on its right, wired file to file"> |
| **PowerShell**, including modules, dot-sourcing and manifests. No PowerShell installation is needed. Pictured in this repository's own map, where the program is a test fixture. | <img src="AI-Agent-Workspace/Gallery/readme/powershell.png" width="500" alt="The Local Map of a PowerShell script, Invoke-Rollout.ps1, with the scripts, module and module manifest it uses on its left and, on its right, the fixture's list of expected connections, which names it; one module card runs past the bottom of the frame"> |
| **ASP.NET markup** (`.aspx`, `.ascx`, `.cshtml`, `.razor`), connected to its code-behind. Pictured: an `.aspx` page. | <img src="AI-Agent-Workspace/Gallery/readme/aspnet-markup.png" width="500" alt="The Local Map of an ASP.NET page, Default.aspx, with its code-behind file on its left and the script that uses its form elements on its right"> |
| **.NET configuration**: the addresses and connection strings in `web.config` and `app.config`. | <img src="AI-Agent-Workspace/Gallery/readme/dotnet-configuration.png" width="500" alt="The Local Map of an App.config whose rows are the addresses and services it declares: on its left the C# contracts and service and the other configuration file it refers to, on its right a Web.config that uses its address"> |
| **SQL**: the procedures, tables and views in `.sql` files. | <img src="AI-Agent-Workspace/Gallery/readme/sql.png" width="500" alt="The Local Map of a stored procedure's .sql file, with the tables it uses on its left and the C# data context that uses it on its right"> |
| **Solutions and project manifests**: `.sln` and `.slnx`, `.csproj`, `.vbproj` and `.fsproj`, `packages.config`, `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, `pom.xml` and `.psd1`. Pictured: a solution and its projects. | <img src="AI-Agent-Workspace/Gallery/readme/solutions-and-manifests.png" width="500" alt="The Local Map of a solution file, Estate.sln, with the project files it names on its left, each in its own directory"> |
| **HTML**, for the files it references. Pictured in this repository's own map. | <img src="AI-Agent-Workspace/Gallery/readme/html.png" width="500" alt="The Local Map of a web page, index.html: its stylesheet on its left, and on its right the TypeScript files that use its elements"> |
| **CSS**, for the files it references. Pictured in this repository's own map. | <img src="AI-Agent-Workspace/Gallery/readme/css.png" width="500" alt="The Local Map of a stylesheet, main.css, with the page that uses it on its right; its other connections are folded into a count on its card"> |
| **JSON**, for the files it references. | <img src="AI-Agent-Workspace/Gallery/readme/json.png" width="500" alt="The Local Map of a JSON file, compile_commands.json, with the C files it names in a column on its left that runs past the top and bottom of the frame"> |

Support is deeper in some languages than in others; every one of them lands in the same markdown.

## Configuration

None is required. To change where the Live Docs go, what is left out or which board the World Map draws, put a `.live-docs.config.json` at the root of the folder being mapped:

```json
{
  "root": ".live-documentation",
  "baseLayer": "source",
  "extension": ".md",
  "exclude": ["**/obj/**", "**/bin/**"],
  "board": "board.md"
}
```

[Getting started](.mdmd/layer-1/guides/getting-started.mdmd.md) lists every setting.

## Privacy

- The generator, the commands and the Explorer build make no network request and send no telemetry.
- The Explorer page reads only the site that serves it, and its content security policy refuses anything else.
- Live Documentation's own packages run nothing at install time. Three of the packages they depend on do, when you install from a clone as above. `esbuild`, the one the product itself needs, checks in its `postinstall` that its binary for your platform is present, and fetches it from the npm registry if not. Two are development tools that a clone brings with it: `tree-sitter-cli` downloads its binary from the tree-sitter project's releases on GitHub, and is used only to rebuild the PowerShell grammar this repository commits; `unrs-resolver`, part of the linter, checks that its native binding is present. `npm ci --ignore-scripts` skips all three.

[SECURITY.md](SECURITY.md) says how to check each of these yourself.

## Why this one

A map of code is an old idea, and many tools draw one. Google CodeWiki, Windsurf Codemaps and GitLab Knowledge Graph answer related questions from a hosted service or inside an editor. This one runs on your machine, under an MIT licence, and is held to five things.

- **Its reading is measured against the compiler's, and its misses are listed.** Twenty-seven sample programs in nine languages carry the answer of a tool built on each language's own compiler, analyser or parser, and [a test](tests/integration/live-docs/oracle.test.ts) fails on any difference that is not [registered with its cause](tests/integration/programs/compiler-differences.json), and on a registered one that has stopped happening. On real code the agreement is not complete, and the numbers are kept: on DNN Platform's C#, the reader draws 20,971 uses between files where the compiler binds 24,837, with 20,392 in common ([the record](AI-Agent-Workspace/Work/readers-on-main.md)).
- **Where it cannot know, it says so and draws nothing.** A file no reader handles is listed as not read, never as unused. A type name that several projects declare is left unlinked and counted, 874 of them on mojoPortal, where a guess would have drawn a line. A connection between systems says whether it was read from a contract, read from configuration or declared by a person. No model writes any of it.
- **It is made for someone who does not read code.** The picture is the interface: blue is what a file offers, green is what uses it, and almost no words of ours stand on the screen. It is tested the way a stranger would meet it: in over two hundred runs a model shown only the screen, with a keyboard and a mouse and nothing of the code, was given a visitor's task, and [what it stumbled on](AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/blind-playtests/README.md) is written down.
- **It reads the code most tools pass over, and the connections between systems.** ASP.NET markup and its code-behind, WCF endpoints and connection strings in `web.config`, SQL scripts, PowerShell, .NET Framework projects and solutions; and from those, which system calls which, on one board. [A sample estate](tests/integration/programs/csharp/estate/README.md), one payment chain from a web portal to two databases, is mapped in every test run.
- **It is yours.** Your code is read as text and never built or run. Nothing is sent anywhere, the page refuses every site but its own, and [SECURITY.md](SECURITY.md) says how to check each of these yourself.

## Guides

- [Getting started](.mdmd/layer-1/guides/getting-started.mdmd.md): installation, configuration and a first session.
- [Tracing impact](.mdmd/layer-1/guides/tracing-impact.mdmd.md): what a change will touch, and how one file reaches another.
- [Visualizing your codebase](.mdmd/layer-1/guides/visualizing-codebase.mdmd.md): the Explorer's views, sharing and hosting.
- [CLI reference](.mdmd/layer-1/guides/cli-reference.mdmd.md): every command and option.

## Where it stands

The map of a single repository is what works today, and it is still changing week to week. The World Map, which draws several systems on one board, is younger. What is not there yet:

- **The readers differ in depth.** Ruby is not yet measured against anything. C and C++ do not yet connect a call to the file that implements it. SQL scripts are read as if a folder were one database, and Oracle PL/SQL is read poorly.
- **Real code has been one-off runs.** DNN Platform, mojoPortal, dbatools, tSQLt and others were each mapped once, inside an investigation. [A standing run](AI-Agent-Workspace/Work/proven-on-real-repositories.md) over real repositories, and a run on Windows, are not in place.
- **The 3D view is slow on a large picture.** It takes a while to settle on a repository of a thousand files.
- **You need a command line today.** A single page that maps a folder you pick, with nothing to install, is being designed and is not built.

[The vision](.mdmd/layer-1/vision.mdmd.md) says where it is going.

This repository is built by one person working with AI coding agents, and the whole record of that work is kept in [AI-Agent-Workspace](AI-Agent-Workspace/README.md). It is not open to contributions yet.

## License

MIT.
