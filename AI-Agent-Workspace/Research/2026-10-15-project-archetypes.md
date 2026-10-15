# The archetypes of projects: what a folder says it is, and what it says is its source, as of 2026-10-15

_A survey gathered on 2026-10-15 for the question the owner put that night ([Turn 9 of the October 15 session](../ChatHistory/2026/10/2026-10-15.1.record.md#turn-9)) when the shipped defaults came up: "is there not some finite set of heuristics that might decisively and accurately conclude such 'source' versus 'non-source' layouts? What are the archetypes of _projects_ (we have archetypes for files)? What pre-baked shapes might a user reasonably open recursively as a directory and plausibly expect us to connect the dots on which files talk to which other files?" Two subagents with web access gathered the ecosystem sections from official documentation, a source for every claim; the root agent wrote the frame and the judgement. It records what existed on its date and decides nothing._

## Where this starts

- **Files have archetypes; projects do not, yet.** A Live Doc's `Archetype` is `implementation`, `test` or `asset`, decided by naming conventions, the configuration's `sampleRoots` and its `archetypeOverrides` ([archetype.ts](../../.mdmd/layer-4/packages/engine/src/live-docs/archetype.ts.mdmd.md)). What a folder *is* has no such line: the generator takes the configured globs, or the shipped defaults, and the defaults are this repository's own layout in 80 patterns, which is how a cold run over another shape matched 49 of 1,842 files ([the TH04 probe](../Probes/2026-10-15/live-docs-over-th04/README.md)).
- **The product already reads two kinds of project manifest as Live Docs**, `package.json` and `.csproj` with `packages.config`, for what a thing stands on and, since the entry points landed, for the scripts, binaries and main modules a manifest names ([the decisions log](../../.mdmd/layer-3/architectural-decisions.mdmd.md)). A manifest is the marker of a project archetype; today it is read for its contents and not for what it says the project's source is.
- **The person's moment.** The owner's blank Live Documentation file "opens right up to the world map with one node, asking you to point it to a directory to start documenting" (2026-10-03, [direction.md](../Memory/direction.md)); on 2026-10-15 they asked whether, at that moment, the person could not "provide the additionals which nail down such things". In a browser, a directory can be offered to a page in two ways: an `<input type="file" webkitdirectory>` lists "the directory and its entire hierarchy of contents" with each file's `webkitRelativePath`, read-only, Baseline since August 2025 across the latest browsers ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory)); `window.showDirectoryPicker()` returns a handle that can also write, needs a secure context and a user gesture, and has "limited availability", not working "in some of the most widely-used browsers" ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker)). So the blank can list a folder everywhere and write back only where the newer API exists; what it concludes about the folder and what the person adjusts is the same question the headless configuration answers with globs and excludes.

## Part 1: the code ecosystems

_Gathered by a subagent with web access on 2026-10-15 from official documentation; its method note follows. Headings are demoted one level to sit under this survey; nothing else is changed._

A survey gathered on 2026-10-15 for one design question in Live Documentation: when a person points the tool at a directory and says nothing else, which finite set of project archetypes, recognized from marker files, can decisively say what is source, what is not, and how files of that kind reference each other.

Method: every claim below was read from the cited page on 2026-10-15, and quoted text is verbatim from that page. Where a page did not state a point, the section says "silent". Nothing here is a decision; it records what the official documentation says. Pages were read through a fetch tool that returns page text; three GNU make pages that rate-limited the fetch tool were downloaded with curl from the same URLs.

Reading the tables: "Kind" is one of **explicit list** (the manifest names files), **glob** (the manifest holds patterns), or **convention** (the tool decides from the file layout with no manifest entry).

---

### 1. npm / Node

#### (a) Markers

| File | What the docs say | Source |
| --- | --- | --- |
| `package.json` | "A package is a folder tree described by a `package.json` file. The package consists of the folder containing the `package.json` file and all subfolders until the next folder containing another `package.json` file, or a folder named `node_modules`." | https://nodejs.org/api/packages.html |
| `tsconfig.json` | "The presence of a `tsconfig.json` file in a directory indicates that the directory is the root of a TypeScript project." `tsc` with no input files "searches for the `tsconfig.json` file starting in the current directory and continuing up the parent directory chain." | https://www.typescriptlang.org/docs/handbook/tsconfig-json.html |
| `index.html` (Vite) | "index.html is the entry point to your application"; running `vite` uses "the current working directory as root". | https://vite.dev/guide/ |
| `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` | Listed among files that are "always ignored by default" when publishing and "can not be included". Their presence marks which package manager is in use; the npm page does not say that. | https://docs.npmjs.com/cli/v10/configuring-npm/package-json |

#### (b) What the manifest declares

`package.json` does not list source files. It declares entry points, executables, the publish set and workspace locations.

| Field | Kind | Rule and default | Source |
| --- | --- | --- | --- |
| `main` | explicit (one path) | "The main field is a module ID that is the primary entry point to your program." "If `main` is not set, it defaults to `index.js` in the package's root folder." Node: "The `"main"` field defines the entry point of a package when imported by name via a `node_modules` lookup. Its value is a path." The Node page does not state the `index.js` default. | https://docs.npmjs.com/cli/v10/configuring-npm/package-json ; https://nodejs.org/api/packages.html |
| `exports` | explicit (map) | "a modern alternative to `"main"` allowing multiple entry points to be defined, conditional entry resolution support between environments, and preventing any other entry points besides those defined in `"exports"`". "When the `"exports"` field is defined, all subpaths of the package are encapsulated and no longer available to importers." "All paths defined in the `"exports"` must be relative file URLs starting with `./`." "If both `"exports"` and `"main"` are defined, the `"exports"` field takes precedence over `"main"`." The main entry is the `"."` subpath; conditional exports are matched in key order. | https://nodejs.org/api/packages.html |
| `bin` | explicit | Executables "to install into the PATH"; "The file(s) in the "bin" field" are always included when publishing. `directories.bin`: "all the files in that folder will be added"; setting both `bin` and `directories.bin` "is an error." | https://docs.npmjs.com/cli/v10/configuring-npm/package-json |
| `files` | glob (publish set, not compile set) | "The optional `files` field is an array of file patterns that describes the entries to be included"; "Omitting the field will make it default to `["*"]`, which means it will include all files." Always included: `package.json`, `README`, `LICENSE` / `LICENCE`, the `main` file, the `bin` files. Always ignored and not includable: `.git`, `.npmrc`, `node_modules`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`. `.npmignore` "At the root of your package it will not override the "files" field, but in subdirectories it will." "If there is a `.gitignore` file, and `.npmignore` is missing, `.gitignore`'s contents will be used instead." | https://docs.npmjs.com/cli/v10/configuring-npm/package-json |
| `workspaces` | glob or paths | "an array of file patterns that describes locations within the local file system"; "either the direct paths of the folders to be used as workspaces" "or it can define globs that will resolve to these same folders." | https://docs.npmjs.com/cli/v10/configuring-npm/package-json |
| `type` | n/a (format) | "The `"type"` field defines the module format that Node.js uses for all `.js` files that have that `package.json` file as their nearest parent." `.mjs` is always ESM, `.cjs` always CommonJS. | https://nodejs.org/api/packages.html |

`tsconfig.json` does declare the compile set.

| Field | Kind | Rule and default | Source |
| --- | --- | --- | --- |
| `files` | explicit list | "Specifies an allowlist of files to include in the program. An error occurs if any of the files can’t be found." Default `false`. | https://www.typescriptlang.org/tsconfig/ |
| `include` | glob | "Specifies an array of filenames or patterns to include in the program." Default: "`[]` if `files` is specified; `**/*` otherwise." Wildcards: `*`, `?`, `**/`. A pattern whose last segment has no extension or wildcard "is treated as a directory, and files with supported extensions inside that directory are included (e.g. `.ts`, `.tsx`, and `.d.ts` by default, with `.js` and `.jsx` if `allowJs` is set to true)." | https://www.typescriptlang.org/tsconfig/ |
| `exclude` | glob | "Specifies an array of filenames or patterns that should be skipped when resolving `include`." Default: `node_modules`, `bower_components`, `jspm_packages`, `outDir`. "`exclude` _only_ changes which files are included as a result of the `include` setting. A file specified by `exclude` can still become part of your codebase due to an `import` statement in your code, a `types` inclusion, a `/// <reference` directive, or being specified in the `files` list." | https://www.typescriptlang.org/tsconfig/ |
| `rootDir` | n/a (layout) | Default: "The longest common path of all non-declaration input files. If `composite` is set, the default is instead the directory containing the `tsconfig.json` file." "`rootDir` **does not affect which files become part of the compilation**." | https://www.typescriptlang.org/tsconfig/ |
| `outDir` | n/a (output) | "If specified, `.js` (as well as `.d.ts`, `.js.map`, etc.) files will be emitted into this directory." "If not specified, `.js` files will be emitted in the same directory as the `.ts` files they were generated from". | https://www.typescriptlang.org/tsconfig/ |
| `references` + `composite` | explicit (projects) | "The `path` property of each reference can point to a directory containing a `tsconfig.json` file, or to the config file itself (which may have any name)." With `composite`: "All implementation files must be matched by an `include` pattern or listed in the `files` array." | https://www.typescriptlang.org/docs/handbook/project-references.html |

Bundler entry points:

| Tool | Rule | Source |
| --- | --- | --- |
| Vite | Vite "treats index.html as source code and part of the module graph" and "resolves `<script type="module" src="...'>` that references your JavaScript source code." Multi-page: "specify multiple `.html` files as entry points." Library mode: "`entry` defaults to the top-level `input` option, and one of them is required since the library cannot use HTML as entry." "If `build.rolldownOptions.input` is set, it overrides the top-level `input` option for build only." `build.rollupOptions` is a deprecated alias of `build.rolldownOptions`. | https://vite.dev/guide/ ; https://vite.dev/guide/build.html ; https://vite.dev/config/build-options.html |
| webpack | "an entry point tells webpack where to start building its internal dependency graph. Starting from this file, webpack recursively follows all imported modules and assets to determine what should be included in the final bundle." "When running webpack without a configuration file, the entry defaults to `'./src'`, which webpack resolves to `./src/index.js` through `resolve.mainFiles` and `resolve.extensions`." The single-entry string is shorthand for `{ main: ... }`; the object form names several entries. | https://webpack.js.org/concepts/entry-points/ |

#### (c) Non-source by convention

| Path | Why | Source |
| --- | --- | --- |
| `node_modules/` | Dependency folder; ends the package scope; never publishable; the target of bare-specifier resolution. | https://nodejs.org/api/packages.html ; https://docs.npmjs.com/cli/v10/configuring-npm/package-json |
| `dist/` (Vite) | `build.outDir` type `string`, default `dist`; "By default, Vite will empty the `outDir` on build if it is inside project root." | https://vite.dev/config/build-options.html |
| `dist/` (webpack) | `output.path` default `path.join(process.cwd(), 'dist')`: "The output directory as an **absolute** path." | https://webpack.js.org/configuration/output/ |
| `public/` (Vite) | "Assets in this directory will be served at root path `/` during dev, and copied to the root of the dist directory as-is." "The directory defaults to `<root>/public`, but can be configured via the `publicDir` option." | https://vite.dev/guide/assets.html |
| `outDir` (TypeScript) | Excluded from `include` by default (see `exclude` above). | https://www.typescriptlang.org/tsconfig/ |
| Lockfiles, `.git`, `.npmrc` | Always ignored on publish. | https://docs.npmjs.com/cli/v10/configuring-npm/package-json |

#### (d) Edges

| Edge kind | Rule | Source |
| --- | --- | --- |
| CommonJS `require` | "A required module prefixed with `'/'` is an absolute path to the file." "A required module prefixed with `'./'` is relative to the file calling `require()`." "Without a leading `'/'`, `'./'`, or `'../'` to indicate a file, the module must either be a core module or is loaded from a `node_modules` folder." Extensions tried: "`.js`, `.json`, and finally `.node`." Directory: `package.json` `main`, then `index.js`. Bare names: "Node.js starts at the directory of the current module, and adds `/node_modules`" and "moves to the parent directory, and so on, until the root of the file system is reached." Subpaths: `require('example-module/path/to/file')`. | https://nodejs.org/api/modules.html |
| ESM `import` | Three specifier types: relative (`./startup.js`; "The file extension is always necessary for these."), bare (`some-package`, `some-package/shuffle`; "Including the file extension is only necessary for packages without an "exports" field."), absolute (`file:///...`). "Directory indexes (e.g. `'./startup/index.js'`) must also be fully specified." "Bare specifier resolutions are handled by the Node.js module resolution and loading algorithm." | https://nodejs.org/api/esm.html |
| Package self-reference | "Within a package, the values defined in the package's `package.json` `"exports"` field can be referenced via the package's name." "available only if `package.json` has `"exports"`". | https://nodejs.org/api/packages.html |
| TypeScript project reference | "Importing modules from a referenced project will instead load its _output_ declaration file (`.d.ts`)"; `tsc -b` will "Find all referenced projects", "Build out-of-date projects in the correct order". | https://www.typescriptlang.org/docs/handbook/project-references.html |
| HTML to script (Vite) | `index.html` is part of the module graph; `<script type="module" src>` is resolved to source. | https://vite.dev/guide/ |
| Bundle graph (webpack) | Follows "all imported modules and assets" from the entry. | https://webpack.js.org/concepts/entry-points/ |

#### (e) Silences

- The npm `package.json` page has no default for `exports`.
- The Node packages page does not state that `main` defaults to `index.js`; the npm page does.
- Neither Vite nor webpack pages read here name their configuration file; the Vite config page documents options only.

---

### 2. .NET

#### (a) Markers

| File | What the docs say | Source |
| --- | --- | --- |
| `*.csproj`, `*.fsproj` (SDK-style) | "Project files, which have extensions like *.csproj* for C# projects and *.fsproj* for F# projects, are in XML format." "The `Project` element has an optional `Sdk` attribute that specifies which SDK (and version) to use." SDK IDs include `Microsoft.NET.Sdk`, `Microsoft.NET.Sdk.Web`, `Microsoft.NET.Sdk.Razor`, `Microsoft.NET.Sdk.BlazorWebAssembly`, `Microsoft.NET.Sdk.Worker`, `Aspire.AppHost.Sdk`, `MSTest.Sdk`. | https://learn.microsoft.com/en-us/dotnet/core/project-sdk/overview |
| `*.sln` | Text file; header "Microsoft Visual Studio Solution File, Format Version 12.00"; body has `Project("{type GUID}") = "Project1", "Project1.vbproj", "{project GUID}"` ... `EndProject` blocks and `Global` sections. | https://learn.microsoft.com/en-us/visualstudio/extensibility/internals/solution-dot-sln-file |
| `*.slnx` | `dotnet sln` "migrates an *.sln* file to an *.slnx* file"; "In .NET 9 and earlier versions, `dotnet new sln` creates an *.sln* file instead of an *.slnx* file." The format is "a new, XML-based solution file format called SLNX" with a `<Solution>` root and `<Project Path="my-app/my-app.csproj" />` entries; "Starting in .NET SDK 9.0.200, the `dotnet` CLI supports building and interacting with these files". | https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-sln ; https://devblogs.microsoft.com/dotnet/introducing-slnx-support-dotnet-cli/ |
| `*.slnf` | Solution filter; `dotnet sln` accepts "*.sln*, *.slnx*, or *.slnf*". | https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-sln |
| `Directory.Build.props` / `.targets` | "Set default properties for projects" / "Add custom targets and late properties", scope "All projects in folder and subfolders". | https://learn.microsoft.com/en-us/visualstudio/msbuild/customize-by-directory |
| `global.json` | Pins an SDK: "specify the name and version in the *global.json* file." | https://learn.microsoft.com/en-us/dotnet/core/project-sdk/overview |
| `packages.config` vs `PackageReference` | "Package references, using `<PackageReference>` MSBuild items, specify NuGet package dependencies directly within project files, as opposed to having a separate `packages.config` file." ".NET Framework projects support PackageReference, but currently default to `packages.config`." | https://learn.microsoft.com/en-us/nuget/consume-packages/package-references-in-project-files |

#### (b) What the manifest declares

SDK-style projects: **glob**, with these defaults.

| Element | Include glob | Exclude glob | Remove glob |
| --- | --- | --- | --- |
| Compile | `**/*.cs` (or other language extensions) | `**/*.user; **/*.*proj; **/*.sln(x); **/*.vssscc` | N/A |
| EmbeddedResource | `**/*.resx` | `**/*.user; **/*.*proj; **/*.sln(x); **/*.vssscc` | N/A |
| None | `**/*` | `**/*.user; **/*.*proj; **/*.sln(x); **/*.vssscc` | `**/*.cs; **/*.resx` |

Source: https://learn.microsoft.com/en-us/dotnet/core/project-sdk/overview

| Rule | Text | Source |
| --- | --- | --- |
| bin/obj excluded | "The `./bin` and `./obj` folders, which are represented by the `$(BaseOutputPath)` and `$(BaseIntermediateOutputPath)` MSBuild properties, are excluded from the globs by default. Excludes are represented by the DefaultItemExcludes property." | https://learn.microsoft.com/en-us/dotnet/core/project-sdk/overview |
| `DefaultItemExcludes` | "define glob patterns for files and folders that should be excluded from the include, exclude, and remove globs. By default, the *./bin* and *./obj* folders are excluded". | https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props |
| `DefaultItemExcludesInProjectFolder` | "By default, folders that start with a period (`.`), such as *.git* and *.vs*, are excluded from the glob patterns." | https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props |
| `EnableDefaultItems` | "controls whether compile items, embedded resource items, and `None` items are implicitly included in the project. The default value is `true`." | https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props |
| `EnableDefaultCompileItems` | "controls whether compile items are implicitly included in the project. The default value is `true`. Set the `EnableDefaultCompileItems` property to `false` to disable implicit inclusion of \*.cs and other language-extension files." Likewise `EnableDefaultEmbeddedResourceItems`, `EnableDefaultNoneItems` (default `true`). | https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props |
| Duplicates | "Avoid defining `Compile`, `EmbeddedResource`, or `None` items that duplicate the SDK's default `Include` globs." Doing so "results in a NETSDK1022 build error." | https://learn.microsoft.com/en-us/dotnet/core/project-sdk/overview |

Non-SDK (old-style) projects: **explicit list**. "Unlike non-SDK .NET Framework projects, you don't need to specify these items in your project file" (overview). The MSBuild items page shows the form: `<Compile Include = "file1.cs"/>`, or `<Compile Include = "file1.cs;file2.cs"/>`; "The `Include` attribute is a path that is interpreted relative to the project file's folder, `$(MSBuildProjectPath)`"; wildcards `**`, `*`, `?` are allowed in `Include`; `Exclude` "affects only the items that are added by the `Include` attribute in the item element that contains them both"; `Remove` removes items. Sources: https://learn.microsoft.com/en-us/dotnet/core/project-sdk/overview ; https://learn.microsoft.com/en-us/visualstudio/msbuild/msbuild-items

Item meanings: `Compile` "Represents the source files for the compiler."; `EmbeddedResource` "Represents resources to be embedded in the generated assembly."; `Content` "Represents files that aren't compiled into the project, but may be embedded or published together with it."; `None` "Represents files that should have no role in the build process." Source: https://learn.microsoft.com/en-us/visualstudio/msbuild/common-msbuild-project-items

Solution: the `.sln` `Project(...)` line "contains the unique project GUID and the project type GUID. This information is used by the environment to find the project file or files belonging to the solution"; "Ideally, if the solution and projects are under source code control, the path to the project should be relative to the path of the solution." `dotnet sln list` "Lists all projects in a solution file." Sources: https://learn.microsoft.com/en-us/visualstudio/extensibility/internals/solution-dot-sln-file ; https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-sln

`Directory.Build.props`: "MSBuild walks the directory structure upwards from your project location `$(MSBuildProjectFullPath)`, stopping after it locates a *Directory.Build.props* file." "The location of the solution file is irrelevant to *Directory.Build.props*." "once MSBuild finds a *Directory.Build.props* file, it stops further scanning"; chaining needs an explicit `<Import Project="$([MSBuild]::GetPathOfFileAbove(...))">`. Imported "early in *Microsoft.Common.props*"; `Directory.Build.targets` "is imported from *Microsoft.Common.targets* after importing `.targets` files from NuGet packages." Source: https://learn.microsoft.com/en-us/visualstudio/msbuild/customize-by-directory

#### (c) Non-source by convention

| Path | Why | Source |
| --- | --- | --- |
| `bin/`, `obj/` | Output and intermediate output; excluded from default globs. | https://learn.microsoft.com/en-us/dotnet/core/project-sdk/overview |
| `obj/` contents | Restore "writes its results in the `MSBuildProjectExtensionsPath` directory ... Usually this is the `obj` folder of your build" (`project.assets.json`); implicit `global using` directives "are added to a generated file in the project's *obj* directory." | https://learn.microsoft.com/en-us/nuget/consume-packages/package-references-in-project-files ; https://learn.microsoft.com/en-us/dotnet/core/project-sdk/overview |
| Dot-folders (`.git`, `.vs`) | Excluded by `DefaultItemExcludesInProjectFolder`. | https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props |
| NuGet packages | "in PackageReference, the packages are consumed from the *global-packages* folder, which can vary from machine to machine." With `packages.config`, "the packages are installed in a folder relative to the project file." | https://learn.microsoft.com/en-us/nuget/consume-packages/package-references-in-project-files |
| `*.user`, `*.*proj`, `*.sln(x)`, `*.vssscc` | Default exclude globs. | https://learn.microsoft.com/en-us/dotnet/core/project-sdk/overview |

#### (d) Edges

| Edge kind | Rule | Source |
| --- | --- | --- |
| File to assembly | Compile items are "source code files (`*.cs`, `*.vb`, and other language-specific extensions) that get compiled into your assembly." The compile unit is the project; no per-file edge is declared. | https://learn.microsoft.com/en-us/dotnet/core/project-sdk/overview |
| `using` (namespace import, not a file reference) | "The `using` directive enables you to use types defined in a namespace without specifying the fully qualified namespace of that type." "The scope of a `using` directive without the `global` modifier is the file in which it appears." "A `using` directive doesn't give you access to any namespaces that are nested in the namespace you specify." `global using` applies "to all files in the compilation (typically a project)". | https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/using-directive |
| Project to project | `ProjectReference` "Represents a reference to another project. `ProjectReference` items are transformed into Reference items by the `ResolveProjectReferences` target". "in .NET Core (including .NET 5 and later), project references *are* transitive." `ReferenceOutputAssembly=false` keeps build order without a reference. | https://learn.microsoft.com/en-us/visualstudio/msbuild/common-msbuild-project-items |
| Project to package | `<PackageReference Include="Contoso.Utility.UsefulStuff" Version="3.6.0" />`; "the transitive dependency versions are resolved at restore time." | https://learn.microsoft.com/en-us/nuget/consume-packages/package-references-in-project-files |
| Project to assembly | `Reference` "Represents a .NET assembly (managed) reference in the project." with `HintPath`. | https://learn.microsoft.com/en-us/visualstudio/msbuild/common-msbuild-project-items |
| File to resource | `EmbeddedResource` (`*.resx`) embedded in the assembly; `DependentUpon` metadata "Specifies the file this file depends on to compile correctly." | https://learn.microsoft.com/en-us/visualstudio/msbuild/common-msbuild-project-items |
| Solution to project | `Project(...)` blocks and `GlobalSection(ProjectDependencies)`. | https://learn.microsoft.com/en-us/visualstudio/extensibility/internals/solution-dot-sln-file |

#### (e) Silences

- No fetched page states a file-to-file dependency inside a project; C# references types by name within the compilation, and the `using` page says the directive imports a namespace.
- The `.sln` page does not mention `.slnx`; the `.slnx` facts come from the `dotnet sln` page and the Microsoft .NET blog.
- The porting page read for old-style projects (https://learn.microsoft.com/en-us/dotnet/core/porting/project-structure) does not compare item listing styles; the explicit-list claim rests on the overview's sentence and the MSBuild items page.

---

### 3. Java (Maven, Gradle)

#### (a) Markers

| File | What the docs say | Source |
| --- | --- | --- |
| `pom.xml` | "At the top level, files descriptive of the project: a `pom.xml` file." | https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html |
| `settings.gradle(.kts)` | "The project’s settings file where the list of subprojects is defined." "In `settings.gradle(.kts)`, you include subprojects by name using `include()`." | https://docs.gradle.org/current/userguide/directory_layout.html ; https://docs.gradle.org/current/userguide/multi_project_builds.html |
| `build.gradle(.kts)` | "Each subproject has its own Gradle build script." | https://docs.gradle.org/current/userguide/directory_layout.html |
| `gradle/` | "Contains the JAR file and configuration of the Gradle Wrapper." | https://docs.gradle.org/current/userguide/directory_layout.html |

#### (b) What the manifest declares

Both tools use **convention** with overridable directories.

Maven standard layout:

| Path | Description | Source |
| --- | --- | --- |
| `src/main/java` | Application/Library sources | https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html |
| `src/main/resources` | Application/Library resources | same |
| `src/main/filters` | Resource filter files | same |
| `src/main/webapp` | Web application sources | same |
| `src/test/java` | Test sources | same |
| `src/test/resources` | Test resources | same |
| `src/test/filters` | Test resource filter files | same |
| `src/it` | Integration Tests (primarily for plugins) | same |
| `src/assembly` | Assembly descriptors | same |
| `src/site` | Site | same |
| `LICENSE.txt`, `NOTICE.txt`, `README.txt` | Project's license; notices and attributions; readme | same |

POM defaults: "the build directory, which is `target`; the source directory, which is `src/main/java`; the test source directory, which is `src/test/java`". `<build>` `directory` "aptly defaults to `${project.basedir}/target`"; resources: "The default directory for a build is `${project.basedir}/src/main/resources`"; test resources `${project.basedir}/src/test/resources`; the page's example shows `outputDirectory` `${project.basedir}/target/classes` and `testOutputDirectory` `${project.basedir}/target/test-classes`. "All POMs extend the Super POM unless explicitly set". Sources: https://maven.apache.org/guides/introduction/introduction-to-the-pom.html ; https://maven.apache.org/pom.html

Maven multi-module: "Modules are projects that this POM lists, and are executed as a group. A `pom` packaged project may aggregate the build of a set of projects by listing them as modules, which are relative paths to the directories or the POM files of those projects." "The `<packaging>` type is required to be `pom` for _parent_ and _aggregation_ (multi-module) projects." Example: `<module>my-project</module>`, `<module>third-project/pom-example.xml</module>`. "The value of `<module>` is the relative path from the com.mycompany.app:my-app:1 to com.mycompany.app:my-module:1's POM (_by practice, we use the module's artifactId as the module directory's name_)." Sources: https://maven.apache.org/pom.html ; https://maven.apache.org/guides/introduction/introduction-to-the-pom.html

Gradle Java plugin: "The Java plugin assumes the project layout shown below. None of these directories need to exist or have anything in them." Source sets `main` ("Contains the production source code of the project, which is compiled and assembled into a JAR.") and `test`; `java.srcDirs` default `src/$name/java`; `resources.srcDirs` default `[src/$name/resources]`. Source: https://docs.gradle.org/current/userguide/java_plugin.html

Gradle multi-project: "A multi-project build consists of a root project and one or more subprojects"; "By default, a project path corresponds to the relative physical location of the project directory." A descriptor "can change the name, project directory, and build file of a project". Source: https://docs.gradle.org/current/userguide/multi_project_builds.html

#### (c) Non-source by convention

| Path | Why | Source |
| --- | --- | --- |
| `target/` (Maven) | "The `target` directory is used to house all output of the build." | https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html |
| `build/` (Gradle) | "The build directory of this project into which Gradle generates all build artifacts." | https://docs.gradle.org/current/userguide/directory_layout.html |
| `.gradle/` | "Project-specific cache directory generated by Gradle." | https://docs.gradle.org/current/userguide/directory_layout.html |
| Dependencies | Not in the tree: "Maven will first attempt to use a local copy of the specified artifact. If that artifact does not exist in the local repository, it will then attempt to download from a remote repository." | https://maven.apache.org/pom.html |

#### (d) Edges

| Edge kind | Rule | Source |
| --- | --- | --- |
| Package to directory | "an implementation of the Java SE Platform would transform a package name into a pathname by concatenating the components of the package name, placing a file name separator (directory indicator) between adjacent components." `jag.scrabble.board` becomes `jag/scrabble/board`. | https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html |
| Type to file | "the host system may choose to enforce the restriction that it is a compile-time error if a class or interface is not found in a file under a name composed of the class or interface name plus an extension (such as `.java` or `.jav`)" when the type is public or referenced elsewhere; "the source code for a `public` class `wet.sprocket.Toad` would be found in a file `Toad.java` in the directory `wet/sprocket`". | https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html |
| Import (type, not file) | "An _import declaration_ allows a named class, interface, or `static` member to be referred to by a simple name"; four kinds: single-type-import, type-import-on-demand, single-static-import, static-import-on-demand. "A `package` declaration appears within an ordinary compilation unit to indicate the package to which the compilation unit belongs." | https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html |
| Module to module (Maven) | `<dependency>` with `<groupId>`, `<artifactId>`, `<version>` ("This trinity is used to compute the Maven coordinate of a specific project in time"); `<scope>` default `compile`; `<parent>` with optional `<relativePath>` ("a signifier to Maven to first search the path given for this project's parent, before searching the local and then remote repositories"). The reactor orders by "a project dependency on another module in the build", "a plugin declaration where the plugin is another module", "a plugin dependency on another module", "a build extension declaration on another module", then "the order declared in the `<modules>` element (if no other rule applies)". | https://maven.apache.org/pom.html ; https://maven.apache.org/guides/mini/guide-multiple-modules.html |
| Project to project (Gradle) | "You declare these relationships using the project path, which uses colons (`:`) to indicate nesting." "A project dependency affects both the build order and classpath". Configurations: `implementation` "required both at compile time and runtime for the main source set", `compileOnly`, `runtimeOnly`, `testImplementation`. | https://docs.gradle.org/current/userguide/multi_project_builds.html ; https://docs.gradle.org/current/userguide/java_plugin.html |
| Resources | `src/main/resources` are "Application/Library resources"; Gradle `resources.srcDirs`. The pages do not describe how code addresses a resource by path. | https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html ; https://docs.gradle.org/current/userguide/java_plugin.html |

#### (e) Silences

- Neither Maven page states a default for `<relativePath>`; the POM intro says omission works "if the parent project was already installed in our local repository or was in that specific directory structure (parent `pom.xml` is one directory higher than that of the module's `pom.xml`)."
- The Gradle Java plugin page never states in prose that the build directory is `build`; the directory layout page does.
- The Gradle multi-project page never states the default build-file name in prose; it shows `build.gradle(.kts)` in its trees.
- The JLS file-name rule is host-optional ("may choose to enforce").

---

### 4. Go

#### (a) Markers

| File | What the docs say | Source |
| --- | --- | --- |
| `go.mod` | "A module is defined by a UTF-8 encoded text file named `go.mod` in its root directory." "The module root directory is the directory that contains the `go.mod` file." "A `go.mod` file must contain exactly one `module` directive." | https://go.dev/ref/mod |
| `go.work` | "A workspace is defined by a UTF-8 encoded text file named `go.work`." The command "will search the current working directory, and then successive parent directories, for a file `go.work`"; `GOWORK=off` forces single-module context. | https://go.dev/ref/mod |
| `vendor/modules.txt` | "`go mod vendor` also creates the file `vendor/modules.txt` that contains a list of vendored packages and the module versions they were copied from." | https://go.dev/ref/mod |

#### (b) What the manifest declares

**Convention**: the manifest names the module; packages are directories.

| Rule | Text | Source |
| --- | --- | --- |
| Package = directory | "Each package within a module is a collection of source files in the same directory that are compiled together. A package path is the module path joined with the subdirectory containing the package (relative to the module root)." | https://go.dev/ref/mod |
| Same directory | "A set of files sharing the same PackageName form the implementation of a package. An implementation may require that all source files for a package inhabit the same directory." | https://go.dev/ref/spec |
| Which files belong | "In the directory containing the package, .go, .c, .h, and .s files are considered part of the package except for:" "files starting with _ or . (likely editor temporary files)" and files excluded by build constraints. | https://pkg.go.dev/go/build |
| Build constraints | "A build constraint, also known as a build tag, is a condition under which a file should be included in the package." Given by a `//go:build` line comment; "they must appear near the top of the file, preceded only by blank lines and other comments"; "in Go files a build constraint must appear before the package clause." "It is an error for a file to have more than one //go:build line." Filename rule: "If a file's name, after stripping the extension and a possible _test suffix, matches any of the following patterns:" `*_GOOS`, `*_GOARCH`, `*_GOOS_GOARCH`, "then the file is considered to have an implicit build constraint requiring those terms"; "Naming a file dns_windows.go will cause it to be included only when building the package for Windows". | https://pkg.go.dev/cmd/go |
| Test files | "'Go test' recompiles each package along with any files with names matching the file pattern "*_test.go"." "When compiling packages, build ignores files that end in '_test.go'." | https://pkg.go.dev/cmd/go |
| Workspace members | "A `use` adds a module on disk to the set of main modules in a workspace. Its argument is a relative path to the directory containing the module’s `go.mod` file. A `use` directive does not add modules contained in subdirectories of its argument directory." | https://go.dev/ref/mod |

#### (c) Non-source by convention

| Path | Why | Source |
| --- | --- | --- |
| Names starting with `_` or `.` | "Files whose names begin with "_" (including "_test.go") or "." are ignored." Patterns with `...` exclude "Files and directories with names beginning with "_" or "."". | https://pkg.go.dev/cmd/go |
| `testdata/` | "The go tool will ignore a directory named "testdata", making it available to hold ancillary data needed by the tests." | https://pkg.go.dev/cmd/go |
| `vendor/` | "The `go mod vendor` command constructs a directory named `vendor` in the main module’s root directory containing copies of all packages needed to build and test packages in the main module." Used automatically "if the go version in the main module’s `go.mod` file is `1.14` or higher"; "the `go` command ignores vendor directories in locations other than the main module’s root directory." `...` patterns exclude "Directories named "vendor"". | https://go.dev/ref/mod ; https://pkg.go.dev/cmd/go |
| Nested modules | `...` patterns exclude "Directories that contain a go.mod file". | https://pkg.go.dev/cmd/go |

#### (d) Edges

| Edge kind | Rule | Source |
| --- | --- | --- |
| Import (package, not file) | "An import declaration states that the source file containing the declaration depends on functionality of the _imported_ package"; "The import names an identifier (PackageName) to be used for access and an ImportPath that specifies the package to be imported." "The interpretation of the ImportPath is implementation-dependent but it is typically a substring of the full file name of the compiled package". | https://go.dev/ref/spec |
| Import path to directory | "A package path is the module path joined with the subdirectory containing the package"; e.g. module `golang.org/x/net`, directory `html`, path `golang.org/x/net/html`. "An import path is used to uniquely identify and locate a package." | https://go.dev/ref/mod ; https://pkg.go.dev/cmd/go |
| Within a package | Files "together declare constants, types, variables and functions belonging to the package and which are accessible in all files of the same package." No file-to-file edge is declared. | https://go.dev/ref/spec |
| Module to module | `require` "declares a minimum required version of a given module dependency"; `replace` with a local path "is interpreted as the local file path to the replacement module root directory, which must contain a `go.mod` file." | https://go.dev/ref/mod |

#### (e) Silences

- The pages read do not name a build output directory for `go build`.
- The `go/build` page lists only the `source_windows.go` example for filename constraints; the full suffix rule is on the `cmd/go` page.

---

### 5. Rust (Cargo)

#### (a) Markers

| File | What the docs say | Source |
| --- | --- | --- |
| `Cargo.toml`, `Cargo.lock` | "`Cargo.toml` and `Cargo.lock` are stored in the root of your package (_package root_)." | https://doc.rust-lang.org/cargo/guide/project-layout.html |
| `[workspace]` in `Cargo.toml` | "The _workspace root_ is the directory where the workspace's `Cargo.toml` is located." A `Cargo.toml` "with a `[workspace]` section but without a `[package]` section" is "a _virtual manifest_". "Cargo will automatically search the parent directories for a `Cargo.toml` file with a `[workspace]` definition to determine which workspace to use." | https://doc.rust-lang.org/cargo/reference/workspaces.html |
| `build.rs` | "Placing a file named `build.rs` in the root of a package will cause Cargo to compile that script and execute it just before building the package." | https://doc.rust-lang.org/cargo/reference/build-scripts.html |

#### (b) What the manifest declares

**Convention** (target auto-discovery), overridable by explicit target tables.

| Rule | Text | Source |
| --- | --- | --- |
| Auto-discovery | "By default, Cargo automatically determines the targets to build based on the layout of the files on the filesystem. The target configuration tables, such as `[lib]`, `[[bin]]`, `[[test]]`, `[[bench]]`, or `[[example]]`, can be used to add additional targets that don’t follow the standard directory layout." | https://doc.rust-lang.org/cargo/reference/cargo-targets.html |
| Layout | "Source code goes in the `src` directory." "The default library file is `src/lib.rs`." "The default executable file is `src/main.rs`." "Other executables can be placed in `src/bin/`." "Benchmarks go in the `benches` directory." "Examples go in the `examples` directory." "Integration tests go in the `tests` directory." | https://doc.rust-lang.org/cargo/guide/project-layout.html |
| Multi-file targets | "If a binary, example, bench, or integration test consists of multiple source files, place a `main.rs` file along with the extra _modules_ within a subdirectory of the `src/bin`, `examples`, `benches`, or `tests` directory. The name of the executable will be the directory name." | https://doc.rust-lang.org/cargo/guide/project-layout.html |
| Library and binaries | "The filename defaults to `src/lib.rs`, and the name of the library defaults to the name of the package, with any dashes replaced with underscores. A package can have only one library." "A binary’s source can be `src/main.rs` and/or stored in the `src/bin/` directory. For `src/main.rs`, the default binary name is the package name." | https://doc.rust-lang.org/cargo/reference/cargo-targets.html |
| Disabling | "Setting the keys `autolib`, `autobins`, `autoexamples`, `autotests`, or `autobenches` to `false` in the `[package]` section will disable auto-discovery of the corresponding target type." "For packages with the 2015 edition, the default for auto-discovery is `false` if at least one target is manually defined in `Cargo.toml`. Beginning with the 2018 edition, the default is always `true`." | https://doc.rust-lang.org/cargo/reference/cargo-targets.html |
| `path` | "The `path` field specifies where the source for the crate is located, relative to the `Cargo.toml` file." | https://doc.rust-lang.org/cargo/reference/cargo-targets.html |
| Workspace members | "`members` key, which should be an array of strings containing directories with `Cargo.toml` files." "The `members` list also supports globs". "All `path` dependencies residing in the workspace directory automatically become members." `exclude` "can be used to prevent paths from being included in a workspace." `default-members` names what commands act on from the root. | https://doc.rust-lang.org/cargo/reference/workspaces.html |

#### (c) Non-source by convention

| Path | Why | Source |
| --- | --- | --- |
| `target/` | "Cargo stores the output of a build into the "target" and "build" directories. By default, both directories point to a directory named `target` in the root of your workspace." Overridden by `CARGO_TARGET_DIR`, `build.target-dir`, or `--target-dir`. Profiles: `target/debug/`, `target/release/`, `target/<triple>/...`; also `target/doc/`, `target/package/`; build-dir holds `debug/deps/`, `debug/incremental/`, `debug/build/` ("Output from build scripts."). "All packages share a common output directory, which defaults to a directory named `target` in the _workspace root_." | https://doc.rust-lang.org/cargo/reference/build-cache.html ; https://doc.rust-lang.org/cargo/reference/workspaces.html |
| `OUT_DIR` | "Build scripts may save any output files or intermediate artifacts in the directory specified in the `OUT_DIR` environment variable. Scripts should not modify any files outside of that directory." | https://doc.rust-lang.org/cargo/reference/build-scripts.html |
| `Cargo.lock` | Shared: "All packages share a common `Cargo.lock` file which resides in the _workspace root_." | https://doc.rust-lang.org/cargo/reference/workspaces.html |

#### (d) Edges

| Edge kind | Rule | Source |
| --- | --- | --- |
| `mod` to file | "A module without a body is loaded from an external file. When the module does not have a `path` attribute, the path to the file mirrors the logical module path." "Ancestor module path components are directories, and the module's contents are in a file with the name of the module plus the `.rs` extension." Alternatively `util/mod.rs`; "It is not allowed to have both `util.rs` and `util/mod.rs`." `#[path = "foo.rs"]` on a non-inline module: "the file path is relative to the directory the source file is located." | https://doc.rust-lang.org/reference/items/modules.html |
| `use` (path, not file) | "A _use declaration_ creates one or more local name bindings synonymous with some other path." "Beginning with the 2018 edition, `use` declarations can specify an external crate dependency the same way `extern crate` can." | https://doc.rust-lang.org/reference/items/use-declarations.html |
| Crate to crate | "External crates imported with `extern crate` in the root module or provided to the compiler (as with the `--extern` flag with `rustc`) are added to the _extern prelude_." | https://doc.rust-lang.org/reference/names/preludes.html |
| Package to dependency | "Cargo is configured to look for dependencies on crates.io by default. Only the name and a version string are required in this case." Git: "the location of the repository with the `git` key". Path: `hello_utils = { path = "hello_utils" }` means the crate "is found in the `hello_utils` folder, relative to the `Cargo.toml` file it's written in." | https://doc.rust-lang.org/cargo/reference/specifying-dependencies.html |
| Generated code | Build scripts write to `OUT_DIR`; the build-scripts page shows no `include!` example. | https://doc.rust-lang.org/cargo/reference/build-scripts.html |

#### (e) Silences

- The cargo-targets page does not list the `*/main.rs` discovery forms; the layout guide does.
- The modules reference never names `src/`; its table maps `crate` to `lib.rs`.
- The preludes page implies but "never states directly" that Cargo passes dependencies with `--extern`.
- No fetched page names the on-disk location of the registry cache.

---

### 6. Python (pyproject.toml, setuptools)

#### (a) Markers

| File | What the docs say | Source |
| --- | --- | --- |
| `pyproject.toml` | "The `pyproject.toml` file acts as a configuration file for packaging-related tools (as well as other tools)." `[build-system]` with mandatory `requires`; "If the file exists but is lacking the `[build-system]` table then the default values as specified above should be used" (the setuptools example). | https://packaging.python.org/en/latest/specifications/pyproject-toml/ |
| `build-backend` | "`build-backend` is a string naming a Python object that will be used to perform the build". "If the `pyproject.toml` file is absent, or the `build-backend` key is missing, the source tree is not using this specification," "and tools should revert to the legacy behaviour of running `setup.py`" "(either directly, or by implicitly invoking the `setuptools.build_meta:__legacy__` backend)." | https://peps.python.org/pep-0517/ |
| `__init__.py` | "A regular package is typically implemented as a directory containing an `__init__.py` file." | https://docs.python.org/3/reference/import.html |
| `pyvenv.cfg` | `venv` "places a `pyvenv.cfg` file in it with a `home` key pointing to the Python installation from which the command was run." | https://docs.python.org/3/library/venv.html |

#### (b) What the manifest declares

**Convention** (automatic discovery) or **glob** (`packages.find`), or **explicit list** (`packages`).

| Rule | Text | Source |
| --- | --- | --- |
| When auto-discovery runs | "Automatic discovery will only be enabled if you don’t provide any configuration for packages and py_modules." "When both `py-modules` and `packages` are left unspecified, `setuptools` will attempt to perform" automatic discovery. | https://setuptools.pypa.io/en/latest/userguide/package_discovery.html ; https://setuptools.pypa.io/en/latest/userguide/pyproject_config.html |
| src-layout | "The project should contain a `src` directory under the project root" and "all modules and packages meant for distribution are placed inside this directory". | https://setuptools.pypa.io/en/latest/userguide/package_discovery.html |
| flat-layout | "The package folder(s) are placed directly under the project root". Reserved package names excluded: `'ci', 'ci.*', 'bin', 'bin.*', 'debian', 'debian.*', 'doc', 'doc.*', 'docs', 'docs.*', 'documentation', 'documentation.*', 'manpages', 'manpages.*', 'news', 'news.*', 'newsfragments', 'newsfragments.*', 'changelog', 'changelog.*', 'test', 'test.*', 'tests', 'tests.*', 'unit_test', 'unit_test.*', 'unit_tests', 'unit_tests.*', 'example', 'example.*', 'examples', 'examples.*', 'scripts', 'scripts.*', 'tools', 'tools.*', 'util', 'util.*', 'utils', 'utils.*', 'python', 'python.*', 'build', 'build.*', 'dist', 'dist.*', 'venv', 'venv.*', 'env', 'env.*', 'requirements', 'requirements.*', 'tasks', 'tasks.*', 'fabfile', 'fabfile.*', 'site_scons', 'site_scons.*', 'benchmark', 'benchmark.*', 'benchmarks', 'benchmarks.*', 'exercise', 'exercise.*', 'exercises', 'exercises.*', 'htmlcov', 'htmlcov.*', '[._]*', '[._]*.*'`. Reserved top-level module names: `'setup', 'conftest', 'test', 'tests', 'example', 'examples', 'build', 'toxfile', 'noxfile', 'pavement', 'dodo', 'tasks', 'fabfile', '[Ss][Cc]onstruct', 'conanfile', 'manage', 'benchmark', 'benchmarks', 'exercise', 'exercises', '[._]*'`. "If you are using auto-discovery with flat-layout, setuptools will refuse to create distribution archives" "with multiple top-level packages or modules." | https://setuptools.pypa.io/en/latest/userguide/package_discovery.html |
| `packages.find` | `where = ["src"]` ("list of folders that contain the packages (["."] by default)"), `include = ["my_package*"]` ("package names should match these glob patterns (["*"] by default)"), `exclude` ("empty by default"), `namespaces = false` ("to disable scanning PEP 420 namespaces (true by default)"). "the glob patterns in the example above need to be matched by the **entire** package name." | https://setuptools.pypa.io/en/latest/userguide/pyproject_config.html |
| `find_namespace:` | Counts "a directory as a package even if it doesn’t contain" an `__init__.py`. | https://setuptools.pypa.io/en/latest/userguide/package_discovery.html |
| Layout trade-off | "The src layout requires installation of the project to be able to run its code, and the flat layout does not." "the Python interpreter includes the current working directory as the first item on the import path." "The src layout helps prevent accidental usage of the in-development copy of the code." | https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/ |
| Regular vs namespace package | "The `__init__.py` files are required to make Python treat directories containing the file as packages (unless using a namespace package, a relatively advanced feature)." "A namespace package is a composite of various portions, where each portion contributes a subpackage to the parent package. Portions may reside in different locations on the file system." "A subdirectory inside a regular package that does not contain an `__init__.py` file is treated as an implicit namespace package (a "namespace subpackage") rooted in that parent." | https://docs.python.org/3/tutorial/modules.html ; https://docs.python.org/3/reference/import.html |

#### (c) Non-source by convention

| Path | Why | Source |
| --- | --- | --- |
| `__pycache__/` | "Python caches the compiled version of each module in the `__pycache__` directory under the name `module._version_.pyc`". | https://docs.python.org/3/tutorial/modules.html |
| `.venv/`, `venv/` | A virtual environment is "Contained in a directory, conventionally named `.venv` or `venv` in the project directory"; "Not checked into source control systems such as Git."; "Considered as disposable". Layout: `bin` (or `Scripts`) and `lib/pythonX.Y/site-packages`. "Changed in version 3.13: `venv` now creates a `.gitignore` file for Git by default." | https://docs.python.org/3/library/venv.html |
| `build/`, `dist/`, `docs/`, `tests/`, `[._]*` and the rest of the reserved lists | Excluded from flat-layout auto-discovery (a discovery rule, not a statement that they are never source). | https://setuptools.pypa.io/en/latest/userguide/package_discovery.html |

#### (d) Edges

| Edge kind | Rule | Source |
| --- | --- | --- |
| `import` (module path via `sys.path`) | "`sys.path` is initialized from these locations:" "The directory containing the input script (or the current directory when no file is specified)." "`PYTHONPATH`". "The installation-dependent default (by convention including a `site-packages` directory, handled by the `site` module)." Reference: "`sys.path` contains a list of strings providing search locations for modules and packages." | https://docs.python.org/3/tutorial/modules.html ; https://docs.python.org/3/reference/import.html |
| Relative import | "Relative imports use leading dots. A single leading dot indicates a relative import, starting with the current package. Two or more leading dots indicate a relative import to the parent(s) of the current package, one level per dot after the first." Only the `from <> import <>` form. | https://docs.python.org/3/reference/import.html |
| Package init | "Importing `parent.one` will implicitly execute `parent/__init__.py` and `parent/one/__init__.py`." | https://docs.python.org/3/reference/import.html |
| Project to dependency | `[project]` "specifies the project’s core metadata"; `[build-system].requires` lists build dependencies. | https://packaging.python.org/en/latest/specifications/pyproject-toml/ |

#### (e) Silences

- The pyproject.toml specification page (as fetched) describes `requires` and not `build-backend`; PEP 517 documents `build-backend`.
- The `build` front-end page does not state its output directory.
- No fetched page documents how code addresses a non-code resource file.

---

### 7. Ruby (RubyGems, Bundler, Rails)

#### (a) Markers

| File | What the docs say | Source |
| --- | --- | --- |
| `*.gemspec` | Required attributes `name` ("This gem’s name.") and `summary`; the generated gem layout shows `hola.gemspec` at the root. | https://guides.rubygems.org/specification-reference/ ; https://guides.rubygems.org/patterns/ |
| `Gemfile`, `Gemfile.lock` | "A `Gemfile` describes the gem dependencies required to execute associated Ruby code." "you `SHOULD` check your `Gemfile.lock` into version control, in both applications and gems." Rails: "These files allow you to specify what gem dependencies are needed for your Rails application." | https://guides.rubygems.org/gemfile/ ; https://guides.rubygems.org/command-reference/bundle-install/ ; https://guides.rubyonrails.org/getting_started.html |
| Rails tree | `app/`, `bin/` ("Contains the `rails` script that starts your app"), `config/`, `config.ru` ("Rack configuration for Rack-based servers used to start the application."), `db/`, `lib/`, `log/`, `public/`, `Rakefile`, `script/`, `storage/`, `test/`, `tmp/`, `vendor/`, `.ruby-version`. | https://guides.rubyonrails.org/getting_started.html |

#### (b) What the manifest declares

Gems: **explicit list** (`files`) plus **convention** (`lib` on the load path). Rails: **convention** (autoload paths).

| Rule | Text | Source |
| --- | --- | --- |
| `files` | "Files included in this gem. You cannot append to this accessor, you must assign to it." "Only add files you can require to this list, not directories, etc." "Directories are automatically stripped from this list when building a gem, other non-files cause an error." | https://guides.rubygems.org/specification-reference/ |
| `require_paths` | "Paths in the gem to add to `$LOAD_PATH` when this gem is activated." "The default value is `"lib"`". | https://guides.rubygems.org/specification-reference/ |
| `executables`, `bindir` | "all application-style files are expected to be found in bindir"; bindir "Usually ‘exe’". | https://guides.rubygems.org/specification-reference/ |
| `extensions` | "the paths to extconf.rb-style files used to compile extensions." | https://guides.rubygems.org/specification-reference/ |
| Gem layout | Tree: `Gemfile`, `Rakefile`, `exe/hola`, `hola.gemspec`, `lib/hola.rb`, `lib/hola/version.rb`, `test/`. "The executable in `exe` and the primary file in `lib` are named after the gem." "Everything beyond the primary file lives in a directory with the gem’s name." | https://guides.rubygems.org/patterns/ |
| Gemfile `gem` | "For each gem requirement, list a single _gem_ line." Version specifiers optional. `path:` "Relative paths are resolved relative to the directory containing the `Gemfile`." "The path must point to a directory containing the gem's unpacked source code, not to a packaged `.gem` file." `git:` for a repository; `require:` "defaults to the name of the gem." Groups: a gem without a group "is placed in the `default` group." | https://guides.rubygems.org/gemfile/ |
| Gemfile `gemspec` | "use the `gemspec` method to pull in the dependencies listed in the `.gemspec` file." Default search glob `{,*,*/*}.gemspec`. | https://guides.rubygems.org/gemfile/ |
| Rails autoload paths | "By default, the autoload paths of an application consist of all the subdirectories of `app` that exist when the application boots", excluding `assets`, `javascript`, and `views`. "By default, the `lib` directory does not belong to the autoload paths of applications or engines." `config.autoload_lib(ignore: %w(assets tasks))` adds it. "The array of default autoload paths can be extended by pushing to `config.autoload_paths`". | https://guides.rubyonrails.org/autoloading_and_reloading_constants.html |
| Rails naming | "In a Rails application file names have to match the constants they define, with directories acting as namespaces." `app/helpers/users_helper.rb` defines `UsersHelper`; `app/controllers/admin/payments_controller.rb` defines `Admin::PaymentsController`. | https://guides.rubyonrails.org/autoloading_and_reloading_constants.html |

#### (c) Non-source by convention

| Path | Why | Source |
| --- | --- | --- |
| `vendor/bundle` | "when `deployment` is configured, `bundle install` installs gems to the `vendor/bundle` directory in the application." "Gems are installed to `vendor/bundle` not your default system location." | https://guides.rubygems.org/command-reference/bundle-install/ |
| `vendor/` (Rails) | "A place for all third-party code. In a typical Rails application this includes vendored gems." | https://guides.rubyonrails.org/getting_started.html |
| `log/`, `tmp/`, `storage/`, `public/` | "Application log files."; "Temporary files (like cache and pid files)."; "Contains SQLite databases and Active Storage files for Disk Service."; "Contains static files and compiled assets. When your app is running, this directory will be exposed as-is." | https://guides.rubyonrails.org/getting_started.html |
| `db/` | "Contains your current database schema, as well as the database migrations." (The guide does not call this non-source.) | https://guides.rubyonrails.org/getting_started.html |

#### (d) Edges

| Edge kind | Rule | Source |
| --- | --- | --- |
| `require` (load path) | "If the filename neither resolves to an absolute path nor starts with ‘./’ or ‘../’, the file will be searched for in the library directories listed in `$LOAD_PATH` (`$:`)." "If the filename has the extension “.rb”, it is loaded as a source file;" "Otherwise, Ruby tries adding “.rb”, “.so”, and so on to the name until found." "The absolute path of the loaded file is added to `$LOADED_FEATURES` (`$"`)." | https://docs.ruby-lang.org/en/master/Kernel.html |
| `require_relative` | "Ruby tries to load the library named _string_ relative to the directory containing the requiring file." | https://docs.ruby-lang.org/en/master/Kernel.html |
| `load` | Absolute path loads directly; "Otherwise, the file will be searched for in the library directories listed in `$LOAD_PATH` (`$:`)." | https://docs.ruby-lang.org/en/master/Kernel.html |
| Gem activation | "When RubyGems activates a gem, it adds your package’s `lib` folder to the `$LOAD_PATH` ready to be required normally." "Gems should not have to use `__FILE__` to bring in other Ruby files in your gem."; "just require the file relative to the load path." | https://guides.rubygems.org/patterns/ |
| Rails constant to file | "application classes and modules are just available everywhere without `require` calls"; the file-name-to-constant rule above is the edge. | https://guides.rubyonrails.org/autoloading_and_reloading_constants.html |
| Gemfile to gem | `gem` lines with `path:`, `git:`, or the declared `source`. | https://guides.rubygems.org/gemfile/ |

#### (e) Silences

- The bundle-install page does not state the default system install location outright and does not mention `.bundle/config`; it says deployment installs to `vendor/bundle` and "This may be overridden using the `path` setting."
- The specification reference does not state a default for `bindir` ("Usually ‘exe’") and does not cover `test_files`.
- The Rails directory table does not mention `node_modules`.
- The Gemfile page does not say the `.gemspec` must sit beside the Gemfile; its default glob covers the Gemfile's directory and one or two levels below.

---

### 8. PHP (Composer)

#### (a) Markers

| File | What the docs say | Source |
| --- | --- | --- |
| `composer.json` | "This file describes the dependencies of your project and may contain other metadata as well." | https://getcomposer.org/doc/01-basic-usage.md |
| `composer.lock` | "You should commit the `composer.lock` file to your project repo". | https://getcomposer.org/doc/01-basic-usage.md |
| `vendor/autoload.php` | "For libraries that specify autoload information, Composer generates a `vendor/autoload.php` file." | https://getcomposer.org/doc/01-basic-usage.md |

#### (b) What the manifest declares

**Explicit mapping** from namespaces to directories (PSR-4/PSR-0), **directory scan** (classmap), and **explicit list** (files).

| Key | Text | Source |
| --- | --- | --- |
| `autoload.psr-4` | "Under the `psr-4` key you define a mapping from namespaces to paths, relative to the package root." Multiple directories: "you can specify them as an array"; fallback: "you can use an empty prefix". | https://getcomposer.org/doc/04-schema.md |
| `autoload.psr-0` | "Under the `psr-0` key you define a mapping from namespaces to paths, relative to the package root." | https://getcomposer.org/doc/04-schema.md |
| `autoload.classmap` | "This map is built by scanning for classes in all `.php` and `.inc` files in the given directories/files." | https://getcomposer.org/doc/04-schema.md |
| `autoload.files` | "If you want to require certain files explicitly on every request then you can use the `files` autoloading mechanism." "Files autoload rules are included whenever `vendor/autoload.php` is included, right after the autoloader is registered." | https://getcomposer.org/doc/04-schema.md |
| `autoload.exclude-from-classmap` | "If you want to exclude some files or folders from the classmap you can use the `exclude-from-classmap` property." | https://getcomposer.org/doc/04-schema.md |
| `autoload-dev` | "This section allows defining autoload rules for development purposes." "Classes needed to run the test suite should not be included in the main autoload rules." | https://getcomposer.org/doc/04-schema.md |
| `bin` | "A set of files that should be treated as binaries and made available into the `bin-dir` (from config)." | https://getcomposer.org/doc/04-schema.md |
| `type` | "The type of the package. It defaults to `library`." | https://getcomposer.org/doc/04-schema.md |
| PSR-4 mapping | A namespace prefix "corresponds to at least one "base directory""; sub-namespaces "correspond to a subdirectory within a "base directory"" "in which the namespace separators represent directory separators"; "The terminating class name corresponds to a file name ending in `.php`."; "The file name MUST match the case of the terminating class name." Example: `\Aura\Web\Response\Status`, prefix `Aura\Web`, base `/path/to/aura-web/src/`, file `/path/to/aura-web/src/Response/Status.php`. | https://www.php-fig.org/psr/psr-4/ |

#### (c) Non-source by convention

| Path | Why | Source |
| --- | --- | --- |
| `vendor/` | `composer install` "will download the dependencies' files into the `vendor` directory in your project." "If you are using git for your project, you probably want to add `vendor` in your `.gitignore`." `vendor-dir` "Defaults to `vendor`." | https://getcomposer.org/doc/01-basic-usage.md ; https://getcomposer.org/doc/06-config.md |
| `vendor/bin` | `bin-dir` "Defaults to `vendor/bin`. If a project includes binaries, they will be symlinked into this directory." | https://getcomposer.org/doc/06-config.md |
| `vendor/autoload.php` | Generated; `dump-autoload` "will re-generate the `vendor/autoload.php` file." | https://getcomposer.org/doc/01-basic-usage.md |

#### (d) Edges

| Edge kind | Rule | Source |
| --- | --- | --- |
| `include` / `require` (file) | "The `include` expression includes and evaluates the specified file." "Files are included based on the file path given or, if none is given, the include_path specified. If the file isn't found in the include_path, `include` will finally check in the calling script's own directory and the current working directory before failing." A path that is absolute "or relative to the current directory (starting with `.` or `..`)" ignores include_path. `require` differs only in failing with `E_ERROR`. | https://www.php.net/manual/en/function.include.php |
| `use` (name alias, not a file) | "Aliasing is accomplished with the `use` operator." "PHP can alias(/import) constants, functions, classes, interfaces, traits, enums and namespaces." "Importing is performed at compile-time, and so does not affect dynamic class, function or constant names." | https://www.php.net/manual/en/language.namespaces.importing.php |
| Class to file | Through the autoloader: PSR-4 mapping of the fully qualified class name to a file (above). | https://www.php-fig.org/psr/psr-4/ ; https://getcomposer.org/doc/04-schema.md |
| Package to package | `require`: "Map of packages required by this package."; `require-dev`: "Map of packages required for developing this package, or running tests, etc." | https://getcomposer.org/doc/04-schema.md |

#### (e) Silences

- The manual's `use` page does not say that importing a name loads no file; only a user note says so.
- The config page does not say whether `vendor-dir` is relative to the project root.
- The schema page does not mention `vendor-dir`.

---

### 9. C and C++ (CMake, Meson, Make, compile_commands.json)

#### (a) Markers

| File | What the docs say | Source |
| --- | --- | --- |
| `CMakeLists.txt` | The source tree is "The top-level directory containing source files provided by the project." whose buildsystem is specified in files "starting with a top-level file named CMakeLists.txt." | https://cmake.org/cmake/help/latest/manual/cmake.1.html |
| `CMakeCache.txt` | Build tree: "The top-level directory in which buildsystem files and build output artifacts (e.g. executables and libraries)" are "to be stored." "CMake will write a CMakeCache.txt file to identify the directory as a build tree". | https://cmake.org/cmake/help/latest/manual/cmake.1.html |
| `meson.build` | "at the topmost directory has a file called `meson.build`." | https://mesonbuild.com/Running-Meson.html |
| `compile_commands.json` | "The convention is to name the file compile_commands.json and put it at the top of the build directory." | https://clang.llvm.org/docs/JSONCompilationDatabase.html |
| `compile_flags.txt` | "Clang tools also recognize a compile_flags.txt file" for simple projects. | https://clang.llvm.org/docs/JSONCompilationDatabase.html |

#### (b) What the manifest declares

CMake: **explicit list** per target.

| Rule | Text | Source |
| --- | --- | --- |
| `add_executable` | `add_executable(<name> <options>... <sources>...)`. "The source files can be omitted if they are added later using target_sources()." | https://cmake.org/cmake/help/latest/command/add_executable.html |
| `add_library` | `add_library(<name> [<type>] [EXCLUDE_FROM_ALL] <sources>...)` with STATIC, SHARED, MODULE; INTERFACE libraries "does not compile sources and does not produce a library artifact on disk."; OBJECT libraries "compile source files without archiving or linking their object files into a library." IMPORTED: "No rules are generated to build imported targets". | https://cmake.org/cmake/help/latest/command/add_library.html |
| `target_sources` | "Add sources to a target." "Relative source file paths are interpreted as being relative to the current source directory" (CMAKE_CURRENT_SOURCE_DIR; "Changed in version 3.13", policy CMP0076). "PRIVATE and PUBLIC sources will populate the SOURCES property of <target>"; `FILE_SET <set> [TYPE <type>] [BASE_DIRS <dirs>...] [FILES <files>...]`. | https://cmake.org/cmake/help/latest/command/target_sources.html |
| `file(GLOB)` | "We do not recommend using GLOB to collect a list of source files from your source tree." "If no CMakeLists.txt file changes when a source is added or removed then the generated build system cannot know" "when to ask CMake to regenerate." `CONFIGURE_DEPENDS` reruns the glob at build time but "may not work reliably on all generators"; "Changed in version 3.6: The results will be ordered lexicographically." | https://cmake.org/cmake/help/latest/command/file.html |
| `add_subdirectory` | "Add a subdirectory to the build." "The `source_dir` specifies the directory in which the source `CMakeLists.txt` and code files are located."; "The `CMakeLists.txt` file in the specified source directory will be processed immediately by CMake before processing" continues. | https://cmake.org/cmake/help/latest/command/add_subdirectory.html |
| C++20 modules | "If the source file belongs to a file set of type CXX_MODULES, it will be scanned." "CMake's implementation asks the compiler to scan source files for module dependencies during the build". Generators: Ninja, Ninja Multi-Config, Visual Studio 17 2022, Visual Studio 18 2026. | https://cmake.org/cmake/help/latest/manual/cmake-cxxmodules.7.html |

Meson: **explicit list** per target.

| Rule | Text | Source |
| --- | --- | --- |
| `executable()` | "The first argument specifies its name and the remaining positional arguments define the input files to use." Sources may be "Strings relative to the current source directory." Keyword `link_with`: "One or more shared or static libraries (built by this project) that this target should be linked with."; `dependencies`: dependency objects from `dependency()` or `declare_dependency()`. | https://mesonbuild.com/Reference-manual_functions.html |
| `library()` family | `library()`: "Builds a library that is either static, shared or both depending on the value of `default_library` user" option. `shared_library()`: "Builds a shared library with the given sources." `static_library()`: "Builds a static library with the given sources." | https://mesonbuild.com/Reference-manual_functions.html |
| `files()` | `array[file] files(str file...)`; "returns corresponding File objects that you can use as sources for build targets"; file objects "remember the subdirectory they were defined in and can be used anywhere in the source tree." | https://mesonbuild.com/Reference-manual_functions.html |
| `subdir()` | "Enters the specified subdirectory and executes the `meson.build` file in it." `dir_name` is "Directory relative to the current `meson.build` to enter." and "Cannot contain `..`". | https://mesonbuild.com/Reference-manual_functions.html |
| `subproject()` | "Subprojects must always be placed inside the `subprojects` directory at the top source directory." | https://mesonbuild.com/Reference-manual_functions.html |

Make: no source declaration; rules name targets and prerequisites.

| Rule | Text | Source |
| --- | --- | --- |
| `include` | "The include directive tells make to suspend reading the current makefile and read one or more other makefiles before continuing." "filenames can contain shell file name patterns." Search: "If the specified name does not start with a slash ... and the file is not found in the current directory, several other directories are searched. First, any directories you have specified with the ‘-I’ or ‘--include-dir’ options are searched". "Then the following directories (if they exist) are searched, in this order: prefix/include (normally /usr/local/include)" "/usr/gnu/include, /usr/local/include, /usr/include." `-include` (alias `sinclude`) ignores missing files. | https://www.gnu.org/software/make/manual/html_node/Include.html |
| `VPATH` | "The value of the make variable VPATH specifies a list of directories that make should search." "make uses VPATH as a search list for both prerequisites and targets of rules." "directory names are separated by colons or blanks." Example `VPATH = src:../headers`; `foo.o : foo.c` becomes `foo.o : src/foo.c` when `foo.c` is found in `src`. | https://www.gnu.org/software/make/manual/html_node/General-Search.html |
| `vpath` directive | "allows you to specify a search path for a particular class of file names: those that match a particular pattern." `vpath %.h ../headers`. Directories in a matching `vpath` are searched "just like (and before) the directories in the VPATH variable." | https://www.gnu.org/software/make/manual/html_node/Selective-Search.html |

#### (c) Non-source by convention

| Path | Why | Source |
| --- | --- | --- |
| CMake build tree | Identified by `CMakeCache.txt`; "By default the executable file will be created in the build tree directory corresponding to the source tree directory in which the command was invoked." (same for libraries). | https://cmake.org/cmake/help/latest/manual/cmake.1.html ; https://cmake.org/cmake/help/latest/command/add_executable.html ; https://cmake.org/cmake/help/latest/command/add_library.html |
| Meson build dir | "Meson uses out of source builds"; "The build directory is mandatory."; `meson setup builddir`. "All the resources required for such an IDE integration can be found in the `meson-info` directory in the build directory." `intro-targets.json`: "Here each target with its sources and compiler parameters is specified." | https://mesonbuild.com/Running-Meson.html ; https://mesonbuild.com/IDE-integration.html |
| `compile_commands.json` | Lives "at the top of the build directory"; CMake: "If enabled, generates a `compile_commands.json` file containing the exact compiler calls" "for all translation units of the project in machine-readable form." "This option is implemented only by Makefile Generators and Ninja Generators." "It is ignored on other generators." | https://clang.llvm.org/docs/JSONCompilationDatabase.html ; https://cmake.org/cmake/help/latest/variable/CMAKE_EXPORT_COMPILE_COMMANDS.html |

#### (d) Edges

| Edge kind | Rule | Source |
| --- | --- | --- |
| `#include <file>` | "It searches for a file named file in a standard list of system directories." "You can prepend directories to this list with the -I option". | https://gcc.gnu.org/onlinedocs/cpp/Include-Syntax.html |
| `#include "file"` | "It searches for a file named file first in the directory containing the current file, then in the quote directories" "and then the same directories used for <file>". | https://gcc.gnu.org/onlinedocs/cpp/Include-Syntax.html |
| `-I` | "causes dir to be searched after the current directory (for the quote form of the directive)" "ahead of the standard system directories." `-iquote` and `-isystem` give separate control. | https://gcc.gnu.org/onlinedocs/cpp/Search-Path.html |
| CMake include dirs | `target_include_directories(<target> [SYSTEM] [AFTER|BEFORE] {INTERFACE|PUBLIC|PRIVATE} <dir...> ...)`: "PRIVATE and PUBLIC items will populate the INCLUDE_DIRECTORIES property of <target>." "PUBLIC and INTERFACE items will populate the INTERFACE_INCLUDE_DIRECTORIES property of <target>." "A relative path will be interpreted as relative to the current source directory". Directory-scoped `include_directories`: "Add the given directories to those the compiler uses to search for include files."; "It is recommended that new development use the target_include_directories() command instead." | https://cmake.org/cmake/help/latest/command/target_include_directories.html ; https://cmake.org/cmake/help/latest/command/include_directories.html |
| CMake link | `target_link_libraries`: "libraries or flags to use when linking a given target and/or its dependents." "Usage requirements from linked library targets will be propagated." Items: a library target name, a full path, a plain name (`-lfoo`), a link flag, a generator expression. `PUBLIC` "linked to, and are made part of the link interface"; `PRIVATE` "linked to, but are not made part of the link interface"; `INTERFACE` "appended to the link interface and are not used for linking <target>". | https://cmake.org/cmake/help/latest/command/target_link_libraries.html |
| Meson include dirs | `include_directories(str includes..., is_system: bool)` "Returns an opaque object which contains the directories (relative to the current directory) given in the positional arguments." "Each directory given is converted to two include paths" (source root and build root). "`include_directories` adds both the source directory and corresponding build directory to include path." | https://mesonbuild.com/Reference-manual_functions.html ; https://mesonbuild.com/Include-directories.html |
| Compilation database | "A compilation database is a JSON file, which consists of an array of “command objects”": `directory` ("The working directory of the compilation." "All paths specified in the command or file fields must be either absolute or relative to this directory."), `file` ("The main translation unit source processed by this compilation step."), `arguments` or `command` ("Either arguments or command is required."), `output` (optional). CMake's entries carry `directory`, `command`, `file`, `output`. | https://clang.llvm.org/docs/JSONCompilationDatabase.html ; https://cmake.org/cmake/help/latest/variable/CMAKE_EXPORT_COMPILE_COMMANDS.html |
| Make prerequisites | Rules list prerequisites; `VPATH`/`vpath` decide where a named prerequisite is found. | https://www.gnu.org/software/make/manual/html_node/General-Search.html |

#### (e) Silences

- The `add_executable` and `add_library` pages do not say that sources are relative to the current source directory; `target_sources` does.
- The Meson IDE-integration page does not mention `compile_commands.json`; the Clang page attributes generation to CMake.
- The Meson function reference says "relative to the current directory", not "current source directory", for `include_directories()`.
- The GNU make `Include` page covers `-I` for makefiles only; the compiler's `-I` is the GCC page.
- The Make pages read say nothing about an output directory or a canonical makefile name.
- The cxxmodules manual contains no `target_sources(... FILE_SET ... TYPE CXX_MODULES)` example.

---

### 10. Monorepo tools (npm, Yarn, pnpm, Lerna, Nx, Turborepo)

#### (a) Markers

| File | What the docs say | Source |
| --- | --- | --- |
| Root `package.json` with `workspaces` | npm: "Workspaces are usually defined via the `workspaces` property of the package.json file". Yarn classic: "Note that the `private: true` is required!" | https://docs.npmjs.com/cli/v10/using-npm/workspaces ; https://classic.yarnpkg.com/lang/en/docs/workspaces/ |
| `pnpm-workspace.yaml` | "A workspace must have a pnpm-workspace.yaml file in its root." It "defines the root of the workspace and enables you to include / exclude directories from the workspace." | https://pnpm.io/workspaces ; https://pnpm.io/pnpm-workspace_yaml |
| `lerna.json` | Holds `packages`, `version`, `npmClient`. | https://lerna.js.org/docs/api-reference/configuration |
| `nx.json`, `project.json` | "The `nx.json` file configures the Nx CLI and project defaults."; "Individual project level configuration files (`package.json` and `project.json`)". | https://nx.dev/reference/nx-json ; https://nx.dev/reference/project-configuration |
| `turbo.json` | "`turbo.json` is used to configure the behavior of `turbo`." "The root `package.json` is the base for your workspace." | https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository |

#### (b) How each enumerates packages

| Tool | Kind | Text | Source |
| --- | --- | --- | --- |
| npm | glob or paths | `"workspaces": ["packages/a"]`; on `npm install` from the root "the folder `packages/a` will get symlinked to the `node_modules` folder of the current working dir". `--workspace=a` targets one; `--workspaces` runs in all. Globs allowed per the package.json reference. | https://docs.npmjs.com/cli/v10/using-npm/workspaces ; https://docs.npmjs.com/cli/v10/configuring-npm/package-json |
| Yarn (Berry) | glob | "Workspaces are the name of individual packages that are part of the same project"; "list relative glob patterns pointing to your workspaces' folders"; "all subdirectories in the `packages` folder will become workspaces." | https://yarnpkg.com/features/workspaces |
| Yarn (classic) | glob | `"workspaces": ["workspace-a", "workspace-b"]` or "a single `packages/*` directive"; "`/workspace-a` is aliased as `/node_modules/workspace-a` via a symlink." | https://classic.yarnpkg.com/lang/en/docs/workspaces/ |
| pnpm | glob | `packages:` with `'packages/*'`, `'components/**'` ("all packages in subdirs of components/"), `'!**/test/**'` ("exclude packages that are inside test directories"). "The root package is always included, even when custom location wildcards are used." "If the `packages` field is omitted, only the root package is included in the workspace." | https://pnpm.io/pnpm-workspace_yaml |
| Lerna | reuse or glob | "By default, lerna will try and reuse any `workspaces` configuration you may have from your package manager of choice." `packages` "will tell Lerna where to look for `package.json` files."; example `"packages": ["packages/*"]`. `version`: `fixed` ("all the affected packages will be published using the same version") or `independent`. `npmClient` default `npm`. | https://lerna.js.org/docs/api-reference/configuration |
| Nx | file scan | "Nx analyzes your file system to detect projects." "It identifies projects from a `project.json` file or a `package.json` file". "Any `package.json` file that is referenced by the `workspaces` property" is included; "If you are using pnpm, projects defined in `pnpm-workspace.yml` will be included." "Nx merges the two files to get each project's configuration." Plugins "use config files to infer tasks for projects." | https://nx.dev/concepts/mental-model ; https://nx.dev/reference/project-configuration ; https://nx.dev/reference/nx-json |
| Turborepo | package manager's config | "First, your package manager needs to describe the locations of your packages." "Using this configuration, every directory **with a `package.json`** in the `apps` or `packages` directories will be considered a package." "In the directory of the package, there must be a `package.json` to make the package discoverable to your package manager and `turbo`." "Turborepo does not support nested packages like `apps/**` or `packages/**`"; a package at `apps/a` and another at `apps/a/b` "will result in an error." | https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository |

#### (c) Non-source by convention

| Path | Why | Source |
| --- | --- | --- |
| Root `node_modules/` | Workspaces are symlinked into it (npm, Yarn classic). | https://docs.npmjs.com/cli/v10/using-npm/workspaces ; https://classic.yarnpkg.com/lang/en/docs/workspaces/ |
| Per-package `dist/` | "Packages commonly use a `src` directory to store their source code and compile to a `dist` directory" "although this is not a requirement." | https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository |

#### (d) Edges

| Edge kind | Rule | Source |
| --- | --- | --- |
| Package to package by name | Yarn classic: `workspace-b` lists `"workspace-a": "1.0.0"`; "Requiring `workspace-a` from a file located in `workspace-b` will now use the exact code" from the local project. Yarn Berry `workspace:` protocol resolves "using the workspace of the same name in the project"; "accepts either a regular semver range, or the special `^` / `~` / `*` tokens." pnpm: "pnpm will refuse to resolve to anything other than a local workspace package."; "A bare `workspace:` without a version range is treated as `workspace:*`." | https://classic.yarnpkg.com/lang/en/docs/workspaces/ ; https://yarnpkg.com/features/workspaces ; https://pnpm.io/workspaces |
| Package graph (Turborepo) | "The Package Graph is the structure of your monorepo created by your package manager." "When you install Internal Packages into each other, Turborepo will automatically identify those dependency relationships". `exports` "is used to specify the entrypoints for other packages that want to use the package." | https://turborepo.dev/docs/core-concepts/package-and-task-graph ; https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository |
| Task graph (Turborepo) | "In `turbo.json`, you express how tasks relate to each other."; `"dependsOn": ["^build"]`. | https://turborepo.dev/docs/core-concepts/package-and-task-graph |
| Project graph (Nx) | "Nx analyzes source code, your installed dependencies, and TypeScript configuration to figure out these dependencies for you." `implicitDependencies`: "Some dependencies cannot be deduced statically, so you can set them manually like this." Task graph: "Each node is a task, which is a specific target invoked for a project, such as `myapp:build`." "Edges represent the dependencies between tasks." | https://nx.dev/concepts/mental-model ; https://nx.dev/reference/project-configuration |
| Resolution mechanics | Symlinked workspaces are found by Node's `node_modules` walk (section 1). | https://nodejs.org/api/modules.html |

#### (e) Silences

- The npm workspaces page shows literal paths only; glob support is stated on the package.json reference.
- The Turborepo page does not explicitly list `name` as a hard requirement; it says the name "should be unique within your workspace."
- The Nx pages read do not say how the dependency analysis treats `import` statements by name; the mental-model page says "source code".
- The Nx "inferred tasks" concept page returned 404 at every current URL and is absent from the Nx docs sitemap on 2026-10-15, so nothing from it is cited.
- The Lerna configuration page does not mention `$schema`, `useNx`, or `useWorkspaces`.

---

### Cross-ecosystem reading

Derived only from the sections above.

| Archetype | Marker | Source rule kind | Decisive about source? | Non-source the docs name | Edge kinds the docs define |
| --- | --- | --- | --- | --- | --- |
| npm package | `package.json` | entry points only (`main`, `exports`, `bin`); publish set via `files` glob | No: nothing lists compile inputs | `node_modules`, lockfiles | `require`/`import` resolved by path and `node_modules` walk; `exports` subpaths |
| TypeScript project | `tsconfig.json` | `files` explicit or `include` glob (default `**/*`) minus `exclude` | Yes for the program set, with the caveat that imports pull in excluded files | `node_modules`, `bower_components`, `jspm_packages`, `outDir` | `import`; project `references` |
| Vite / webpack app | `index.html` at root; entry config | entry graph from `index.html` or `./src/index.js` | Yes for the bundle graph (reachability) | `dist`, `public` | HTML script tags; imports |
| .NET SDK project | `*.csproj` with `Sdk` | glob `**/*.cs` etc. | Yes (with `bin`, `obj`, dot-folders removed) | `bin`, `obj`, global packages folder | `ProjectReference`, `PackageReference`, `Reference`, `EmbeddedResource`; `using` is a namespace, not a file |
| .NET non-SDK project | `*.csproj` without `Sdk` | explicit `Compile Include` (wildcards allowed) | Yes | `bin`, `obj` (not stated as defaults for non-SDK on the pages read) | same as above |
| .NET solution | `.sln`, `.slnx`, `.slnf` | lists projects by relative path | Yes for project set | n/a | solution to project; `ProjectDependencies` |
| Maven project | `pom.xml` | convention (`src/main/java`, `src/test/java`, resources) | Yes by convention, overridable in `<build>` | `target`, local repository (outside tree) | `<dependency>`, `<parent>`, `<module>`; Java `import` is a type, mapped to a file through package and class name |
| Gradle project | `settings.gradle(.kts)` + `build.gradle(.kts)` | convention (source sets `src/$name/java`) | Yes by convention, overridable | `build`, `.gradle` | `project(':x')`, configurations |
| Go module | `go.mod` (+ `go.work`) | convention: package = directory; build constraints and name rules | Yes | `_`/`.` names, `testdata`, `vendor`, nested `go.mod` | `import` of a package path |
| Cargo package / workspace | `Cargo.toml` | convention (auto-discovery) plus explicit target tables | Yes | `target`, `OUT_DIR` | `mod` to file; `use`; crate deps (registry, git, path) |
| Python project (setuptools) | `pyproject.toml` (+ `__init__.py`) | convention (src or flat layout) or `packages.find` glob or explicit `packages` | Yes for distribution; flat layout can refuse (multiple top-level packages) | `__pycache__`, `.venv`/`venv`, reserved names in flat layout | `import` via `sys.path`; relative imports |
| Ruby gem | `*.gemspec` | explicit `files`; `lib` on load path | Yes for the gem's files | `vendor/bundle` | `require` via `$LOAD_PATH`; `require_relative` |
| Rails app | `config.ru`, `bin/rails`, `app/` | convention (autoload paths = subdirectories of `app`) | Yes by convention | `log`, `tmp`, `storage`, `public` (compiled assets), `vendor` | constant name to file |
| Composer package | `composer.json` | explicit namespace-to-directory map, classmap scan, files list | Yes for autoloaded code | `vendor` | `include`/`require` file; class to file via PSR-4 |
| CMake project | `CMakeLists.txt` (build tree: `CMakeCache.txt`) | explicit per-target source lists | Yes, per target | build tree | `#include` via include dirs; `target_link_libraries`; `add_subdirectory`; `compile_commands.json` |
| Meson project | `meson.build` | explicit per-target source lists | Yes, per target | mandatory out-of-tree build dir; `subprojects` | include dirs; `link_with`; `subdir` |
| Make project | makefile | none (rules only) | No | none stated | `include`; `VPATH`; prerequisites |
| JS monorepo | root `workspaces`, `pnpm-workspace.yaml`, `lerna.json`, `nx.json`, `turbo.json` | glob over package directories; each package by its `package.json` | Yes for the package set; source per package as npm/TypeScript | root `node_modules`, per-package `dist` | package to package by name (`workspace:`); task graphs |

What the documents do not settle, across the board: no ecosystem's manifest draws a file-to-file edge inside a compilation unit except where the language itself names files (Node `require`/`import` with paths, Rust `mod`, PHP `include`, C `#include`, Ruby `require_relative`). Java, C#, Go and Python name packages, namespaces or module paths, and the file is reached through a documented naming convention (Java package to directory and class to file; PSR-4; Go package path to directory; Python module path on `sys.path`), or, for C#, not reached at all by the directive.

## Part 2: the asset-heavy and other shapes

_Gathered by a second subagent the same way; its summary table opens it. Headings are demoted one level; nothing else is changed._

Survey date: 2026-10-15. Question: when a person points Live Documentation at a directory and says nothing else, which project archetypes can be recognized from marker files, which of their files are the project's own content (including assets), which are generated or cached, and how their files reference each other.

Method: every claim is taken from official documentation and cited by URL; quoted text is verbatim. Where the official docs are silent the section says so and names the nearest non-official source only as "non-official". This survey records what existed on its date and decides nothing.

### Summary

| Archetype | Root marker | Own content | Generated or cached | Edge kinds |
| --- | --- | --- | --- | --- |
| Unity | `Assets/`, `ProjectSettings/`, `Packages/manifest.json` | `Assets/**` plus `.meta` sidecars, `ProjectSettings/`, `Packages/manifest.json`, `packages-lock.json` | `Library/`, `Temp/`, `Logs/`, `UserSettings/`, `*.csproj`, `*.sln` (`obj/` undocumented) | GUID + fileID in YAML; in-file fileID; package names; runtime `Resources` string paths |
| Unreal | `*.uproject` | `Content/**` (`.uasset`, `.umap`), `Source/**` (`.Build.cs`, `.Target.cs`), `Config/`, `Plugins/**` | `Intermediate/`, `Saved/`, `DerivedDataCache/`, `Binaries/` | hard and soft object references by object path (`/Game/...`); Asset Registry dependencies from package headers; module name lists |
| Godot | `project.godot` | everything under `res://` incl. `*.import` and `*.uid` sidecars | `.godot/` (4.x), `.import/` (3.x), `*.translation` | `res://` paths and `uid://` IDs in `[ext_resource]`; `ExtResource("id")`; `load()` strings |
| Static web / SPA | `index.html`; `package.json` + bundler config | HTML, CSS, JS, images, `public/` | `dist/`, `build/`, `.next/`, `node_modules/`, lock files | relative and root-absolute URLs in HTML and CSS; JS asset imports; route-by-folder |
| Android | `settings.gradle(.kts)`, `build.gradle(.kts)`, `AndroidManifest.xml` | `src/main/{java,kotlin,res,assets}`, manifest, build scripts | `build/`, `.gradle/`, `local.properties`, `.idea/`, `R` class | `R.type.name` and `@type/name` resource IDs derived from file names; class names in manifest; Gradle `include` |
| iOS / Swift | `*.xcodeproj/project.pbxproj`, `*.xcworkspace`, `Package.swift` | sources, `*.xcassets`, resources; `Sources/<Target>`, `Tests/<Target>` | `.build/`, DerivedData (Apple docs silent on location), `Pods/`, `Carthage/Build/`; `Package.resolved` is generated but committed | explicit file list in pbxproj or buildable folder path; asset names; target and package names; URL or path dependencies |
| Infrastructure as code | `*.tf`, `kustomization.yaml`, `Chart.yaml`, `compose.yaml`, `Dockerfile`, `.github/workflows/*.yml` | the declarative files | `.terraform/`, `*.tfstate`, Helm `charts/` when fetched | `source = "./..."`, `resources:` paths, `file://` chart paths, `context`/`dockerfile`, `COPY` from context, `uses:` refs |
| Documentation site | `mkdocs.yml`, `docusaurus.config.js`, `conf.py` | `docs/` markdown and images, `static/`, `_static/` | `site/`, `build/`, `_build/` | relative markdown links to source files; `toctree` document names; image paths |
| Data / notebooks | `*.ipynb`, `requirements.txt`, `environment.yml`, `pyproject.toml`, `.dvc/` | notebooks, environment files, `.dvc` pointer files | `.ipynb_checkpoints/`, `__pycache__/`, `.venv/`, data itself (gitignored by convention) | `-r` includes; code strings naming data paths (undocumented); cell attachments |
| Bare folder | none | whatever is there | only what `.gitignore` or Linguist lists say | file names and extensions only |

### 1. Unity

**(a) Markers.** The manual's default directories page defines the project folder's contents: `Assets` ("Use the Assets folder to store all asset files related to your project, including scripts, textures, models, audio files, and scenes."), `Packages` ("Contains a manifest.json file which defines the packages to use in your project."), `ProjectSettings` ("Contains project-specific settings files, such as settings for building, graphics, and memory, and managers for input, tags, and presets."). https://docs.unity3d.com/Manual/default-directories.html

The project manifest sits "in the `Packages` folder under the root folder of your Unity project"; "The project manifest file manages the list of packages through the dependencies object." and "This includes only direct dependencies." https://docs.unity3d.com/6000.2/Documentation/Manual/upm-manifestPrj.html. Resolution is written to "the project's `Packages` folder in a JSON file called `packages-lock.json`", and "Put the lock file under source control so you can consistently reproduce the same package set". https://docs.unity3d.com/6000.2/Documentation/Manual/upm-conflicts-auto.html

**(b) Own content vs generated.**

| Path | Documented role | Source |
| --- | --- | --- |
| `Assets/` | own content (above) | default-directories |
| `Assets/**/*.meta` | "Unity creates `.meta` files for each folder and file in your project's `Assets` folder." "The `.meta` files contain the unique ID assigned to the asset, and values for all the asset's import settings." They "must stay with the asset file they relate to." "If an asset loses its `.meta` file, any reference to that asset is broken in your project." | https://docs.unity3d.com/6000.2/Documentation/Manual/AssetMetadata.html |
| `Library/` | "The Library folder contains a local cache of imported assets and metadata." "Exclude the Library folder from version control, because it's unique to your computer and is a working directory for your project." "Unity regenerates the folder the next time you open the project." | default-directories |
| `Library/SourceAssetDB`, `Library/ArtifactDB` | SourceAssetDB "Contains meta-information about your source asset files which Unity uses to determine whether the file has been modified ... This includes information such as last modified date, a hash of the file's contents, GUIDs, and other meta-information." ArtifactDB "Contains information about the import results of each source asset." "Artifacts are treated as cached data because Unity can always regenerate them from the source assets." "Make sure to exclude these database files from version control systems." | https://docs.unity3d.com/Manual/asset-database-contents.html |
| `Temp/` | "A folder for temporary data, which gets cleared every time you close Unity." "Exclude this folder from version control." | default-directories |
| `Logs/` | "Contains log files related to import operations and other Editor processes." (no version-control sentence on the page) | default-directories |
| `UserSettings/` | "Contains settings for your local version of the project, such as specific user preferences, and your preferred Editor layout." "Exclude from version control to avoid overwriting your teammates' personal Unity preferences." | default-directories |
| `*.sln`, `*.csproj` | "Unity automatically creates and maintains a Visual Studio .sln and .csproj file." https://docs.unity.com/en-us/engine/6000.6/manual/programming-environment/environment-and-tools/scripting-ide-support.md ; "Unity regenerates the .sln and .csproj files in your project whenever a contributor makes changes to the state of a file" https://docs.unity3d.com/2023.1/Documentation/Manual/VisualStudioIntegration.html | |
| `obj/` | Not listed on the default directories page; the Unity manual is silent. | |

Inside `Assets`, the importer skips some names: "During the import process, Unity ignores the following files and folders in the Assets folder and its subfolders": hidden folders; files and folders starting with `.` (except under `StreamingAssets`); files and folders ending with `~`; files and folders named `cvs`; files with the `.tmp` extension. Reserved folder names are `Editor`, `Editor Default Resources`, `Gizmos`, `Plugins`, `Resources` ("Reserved for assets to load on-demand from a script at application runtime rather than creating references to assets in a scene."), and `StreamingAssets`. https://docs.unity3d.com/6000.2/Documentation/Manual/SpecialFolders.html

GitHub Linguist's default generated list has `generated_unity3d_meta?`, matching `.meta` files that start with a `fileFormatVersion` line (non-official for Unity, but the convention GitHub applies). https://raw.githubusercontent.com/github-linguist/linguist/main/lib/linguist/generated.rb

**(c) Edges.**

- Cross-file references are GUID plus local ID: "When Unity serializes an asset reference it points to two things: the GUID and file ID." "GUID is a unique hash, and file ID is a value relative to the asset." The page's scene example shows `m_Script: {fileID : 11500000, guid : 9cbd8cdf99d44b58972fbc7f6f38088f, type : 3}`, and "If working with a text serialized project (see Editor Settings) it is possible to manually modify this information." https://docs.unity3d.com/ScriptReference/AssetDatabase.TryGetGUIDAndLocalFileIdentifier.html. The GUID is the one held in the `.meta` file (AssetMetadata page above). The docs do not explain the `type:` field (search found only forum discussion).
- In-file structure: "The file writes each Object in a Scene as a separate YAML document." Each starts `--- !u!1 &6`; "The first number after `!u!` indicates the class of the object"; "The number following the ampersand is an object ID number unique within the file"; `{fileID: 6}` refers to that object within the file. https://docs.unity3d.com/6000.2/Documentation/Manual/FormatDescription.html. Class IDs: GameObject 1, Transform 4, Material 21, Texture2D 28, Mesh 43, MonoBehaviour 114, MonoScript 115, SceneAsset 1032. https://docs.unity3d.com/6000.2/Documentation/Manual/ClassIDReference.html. Files begin `%YAML 1.1` and `%TAG !u! tag:unity3d.com,2011:`; built-in resources appear as e.g. `m_Mesh: {fileID: 10202, guid: 0000000000000000e000000000000000, type: 0}`. https://docs.unity3d.com/6000.2/Documentation/Manual/YAMLSceneExample.html
- Text is optional: "As well as the default binary format, Unity also provides a text-based format for scene data." "the text data can be generated and parsed by tools, making it possible to create and analyze scenes automatically." https://docs.unity3d.com/6000.2/Documentation/Manual/TextSceneFormat.html. A binary-serialized project has no readable YAML edges.
- Package edges: the manifest's `dependencies` object (upm-manifestPrj above).
- Runtime string edges: assets in `Resources` are loaded by path from scripts "rather than creating references to assets in a scene" (SpecialFolders above); these edges exist only in C# source.

### 2. Unreal Engine

**(a) Markers.** "Every project has a `.uproject` file associated with it." https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-terminology. The file's schema is the C++ `FProjectDescriptor`: "Descriptor for projects. Contains all the information contained within a .uproject file." with `Modules` ("List of all modules associated with this project"), `Plugins` ("List of plugins for this project (may be enabled/disabled)"), `EngineAssociation` ("The engine to open this project with."), `TargetPlatforms`, pre/post build steps. https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/Projects/FProjectDescriptor

**(b) Own content vs generated.** From the directory structure page https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-directory-structure :

| Directory | Documented role |
| --- | --- |
| `Content` | "Holds content for the engine or game, including asset packages and maps." |
| `Source` | "Contains all of the source files for engine or game, including the engine source code, tools, gameplay classes, etc." |
| `Config` | "Configuration files for setting values that control engine behavior." |
| `Plugins` | "Contains plugins used in the engine." Plugins carry "their own source files, binaries, and a `.uplugin` file". |
| `Build` | "Holds files needed for building the engine or game, including files necessary for creating platform-specific builds." |
| `Binaries` | "Contains executable files or other files created during compiling." (no deletion sentence) |
| `Intermediate` | "Contains temporary files generated during building the engine or game." For game projects: "These files can be deleted and rebuilt." |
| `Saved` | "Contains autosaves, configuration (`.ini`) files, and log files." "These files can be deleted and rebuilt." |
| `DerivedDataCache` | Holds derived data generated for referenced content; "Not having cache files present for referenced content can increase load times dramatically." |

The DDC page adds: "Derived data is large, and UE may need to regenerate it throughout development." "Therefore, UE keeps it in a Derived Data Cache (DDC) instead of checking it into source control." "Content stored in the DDC is disposable, and UE can regenerate it anytime using the data stored in .uasset files." Project DDC pak location "<YourProjectDir>/DerivedDataCache/Compressed.ddp"; from 5.4 the local store defaults to "AppSettingsDir/Zen/Data". https://dev.epicgames.com/documentation/en-us/unreal-engine/using-derived-data-cache-in-unreal-engine

Assets: "Assets in your project are stored on disk as `.uasset` files, which is a file format specific to Unreal Engine." "Never move, copy, or delete Assets directly on disk, as this might break functionality in your project and lead to data corruption or data loss." "Always manage `.uasset` files through Unreal Editor." https://dev.epicgames.com/documentation/en-us/unreal-engine/working-with-assets-in-unreal-engine. Levels: "Unreal Engine saves each level as a separate `.umap` file, which is why you will sometimes see them referred to as Maps." (terminology page). The fetched pages do not state that `.uasset` is binary; they only say it is engine-specific and editor-managed. The engine's collaboration page carries no list of what to version; search found only community `.gitignore` templates (non-official).

Code: "All modules require a `[ModuleName].Build.cs` file placed in the module's root directory"; "Create Private and Public subfolders inside your module's root directory."; "The Unreal build system builds projects according to `Target.cs` files in your projects". https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-modules

**(c) Edges.**

- Hard vs soft: "a hard reference where object A refers to object B and causes object B to be loaded when object A is loaded"; "a soft reference where object A refers to object B via an indirect mechanism such as the string form of the path to the object"; for `TSoftObjectPtr` "the property is stored as a string with template code to enable safe checking"; "Note the full path to the asset is used to specify what to load." https://dev.epicgames.com/documentation/en-us/unreal-engine/referencing-assets-in-unreal-engine
- Where the graph lives: the Asset Registry's data "is gathered when an asset is saved and stored in the header of the `UAsset` file that contains the asset." "The Asset Registry reads this header and fills out the `TagsAndValues` map accordingly." `FAssetData` carries `ObjectPath` ("The object path for the asset in the form `Package.GroupNames.AssetName`."), `PackageName`, `AssetName`, `AssetClass`. https://dev.epicgames.com/documentation/en-us/unreal-engine/asset-registry-in-unreal-engine. Dependencies are queried per package: `GetDependencies` "Gets a list of PackageNames that are referenced by the supplied package." "Only returns dependencies reported in the on-disk package." with package names like "/Game/MyFolder/MyAsset" and a `Category` ("Which category(ies) of dependencies to include in the output list.") and `Flags` ("Which flags are required present or not present on the dependencies."). https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/AssetRegistry/IAssetRegistry/GetDependencies
- The editor's view of it: "The Reference Viewer displays a graph of Assets that reference or are referenced by one or more Assets." "References are one-way (unidirectional). The referenced Asset has no reference back to its referrer." with toggles "Show/Hide Soft References" and "Show/Hide Hard References". https://dev.epicgames.com/documentation/en-us/unreal-engine/reference-viewer-in-unreal-engine
- Renames rewrite edges: "After you rename the Asset, Unreal Engine will update all references to the Asset to its new name." (working-with-assets page).
- Code edges: "You should use the `PublicDependencyModuleNames` list if you use the classes from a module publicly" and `PrivateDependencyModuleNames` "if they are only used privately"; "Your `.uproject` and `.uplugin` files contain a `Modules` list defining which modules are included in your project" (modules page).
- Docs silent: the on-disk layout of references inside a `.uasset` (import and export tables) is not described in the manual pages fetched; the documented way to read the graph is the registry and its API.

### 3. Godot

**(a) Marker.** `project.godot` is "the project description file", "always found at the root of the project", written "in plain text, using the win.ini format". "The path `res://` will always point at the project root." https://docs.godotengine.org/en/stable/tutorials/scripting/filesystem.html. "Variables stored in `project.godot` are also loaded into ProjectSettings"; an `override.cfg` "in the project's root directory" uses the same format. https://docs.godotengine.org/en/stable/classes/class_projectsettings.html

**(b) Own content vs generated.**

- Imports: "Importing will add an extra `<asset>.import` file next to the source file, containing the import configuration." "Make sure to commit these files to your version control system, as these files contain important metadata." Imported data is kept "hidden in a `res://.godot/imported/` folder" and "committing the `.godot/` folder to the version control system is not recommended." https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/import_process.html
- Version control page: "`.godot/`: This folder stores various project cache data." "`*.translation`: These files are binary imported translations generated from CSV files." "This lists files and folders that should be ignored from version control in Godot 4.1 and later." https://docs.godotengine.org/en/stable/tutorials/best_practices/version_control_systems.html
- Godot 3.x: "Godot will automatically import these files internally and keep the imported resources hidden in a `res://.import` folder." "If any of the files present in this folder is erased (or the whole folder), the asset or assets will be reimported automatically." "committing this folder to the version control system is optional." https://docs.godotengine.org/en/3.5/tutorials/assets_pipeline/import_process.html
- Opt-out folders: "create an empty file called `.gdignore` in the folder"; then "resources in that folder can't be loaded anymore using the `load()` and `preload()` methods"; `.gdignore` "does not support patterns like `.gitignore` files do." Third-party content goes in "a top-level `addons/` folder". https://docs.godotengine.org/en/stable/tutorials/best_practices/project_organization.html
- `.uid` sidecars (4.4+): "These files are automatically generated by Godot when saving a script or shader", "placed besides the source file with the `.uid` extension as a suffix", and "make sure `.uid` files are committed to version control". https://godotengine.org/article/uid-changes-coming-to-godot-4-4/

**(c) Edges.** From the TSCN format page https://docs.godotengine.org/en/stable/engine_details/file_formats/tscn.html :

- Header: "The file descriptor looks like `[gd_scene format=3 uid="uid://cecaux1sm7mo0"]` and should be the first entry in the file." "Scenes and resources saved with Godot 4.x contain `format=3` in their header, whereas Godot 3.x uses `format=2` instead." Resources use `[gd_resource type="ArrayMesh" format=3 uid="uid://dww8o7hsqrhx5"]`.
- External resources: "External resources are links to resources not contained within the TSCN file itself." "An external resource consists of a path, a type, a UID (used to map its filesystem location to a unique identifier) and an ID (used to refer to the resource in the scene file)." "Godot always generates absolute paths relative to the resource directory and thus prefixed with `res://`" and "paths relative to the TSCN file's location are also valid." Example: `[ext_resource type="Texture2D" uid="uid://ccbm14ebjmpy1" path="res://gradient.tres" id="2_eorut"]`.
- Use sites: "External resources and internal resources are referred to with `ExtResource("id")` and `SubResource("id")`, respectively." Internal `[sub_resource ...]` headings have no path; "the referring resource must appear before the reference to it."
- UIDs: "Resource UIDs (Unique IDentifiers) allow the engine to keep references between resources intact even if files are renamed or moved." "They can be accessed with `uid://`." https://docs.godotengine.org/en/stable/classes/class_resourceuid.html. "Each imported resource in Godot has a `.import` file, which allows for storing a UID." "Godot's own scene and resource file formats store a UID in their header." Scripts may `preload("uid://fkjlqx8er2sg")`. (UID article above.)
- Saved resources carry their references: "If a resource contains properties that reference other resources on disk, the paths to those resources are also included." (filesystem page).
- Docs silent: the TSCN page does not single out scripts (`type="Script"` entries); `load("res://...")` strings inside GDScript are edges visible only by reading the script.

### 4. Static web sites and SPAs

**(a) Markers.**

- Plain site: "index files tend to be recognized as the main homepage file of a website." https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Environment_setup/Dealing_with_files. Servers encode it: Apache's default is `DirectoryIndex index.html` and "a request for `http://example.com/docs/` would return `http://example.com/docs/index.html` if it exists". https://httpd.apache.org/docs/2.4/mod/mod_dir.html
- Vite: "`index.html` is the entry point to your application." "Vite treats `index.html` as source code and part of the module graph." "It resolves `<script type="module" src="...">` that references your JavaScript source code." and CSS "referenced via `<link href>`". https://vite.dev/guide/. `root` defaults to `process.cwd()`: "Project root directory (where `index.html` is located)." https://vite.dev/config/shared-options.html. `vite build` "uses `<root>/index.html` as the build entry point"; a multi-page app can "specify multiple `.html` files as entry points". https://vite.dev/guide/build.html
- webpack: "An entry point indicates which module webpack should use to begin building out its internal dependency graph." "By default its value is `./src/index.js`". https://webpack.js.org/concepts/
- Create React App: "`public/index.html` is the page template;" "`src/index.js` is the JavaScript entry point." "only files inside `src` are processed by webpack." https://create-react-app.dev/docs/folder-structure/
- Next.js: top-level folders `app` (App Router), `pages` (Pages Router), `public` ("Static assets to be served"), `src`; top-level files `next.config.js`, `package.json`, `.env*` ("should not be tracked by version control"), `next-env.d.ts` ("should not be tracked by version control"). "Folders define URL segments." "A route becomes public when a `page` or `route` file exists." Private folders `_folder` opt out of routing; `(group)` folders are omitted from URLs. https://nextjs.org/docs/app/getting-started/project-structure

**(b) Own content vs generated.**

| Tool | Own, copied as-is | Generated |
| --- | --- | --- |
| Vite | `public/`: "Assets in this directory will be served at root path `/` during dev, and copied to the root of the dist directory as-is." For files "Never referenced in source code (e.g. `robots.txt`)" or that "Must retain the exact same file name (without hashing)"; "you should always reference `public` assets using root absolute path." https://vite.dev/guide/assets.html ; `publicDir` files "are always served or copied as-is without transform." (shared-options) | `build.outDir` default `dist` "(relative to project root)"; `build.assetsDir` default `assets`; "By default, Vite will empty the outDir on build if it is inside project root." https://vite.dev/config/build-options.html |
| webpack | n/a | output "defaults to `./dist/main.js` for the main output file and to the `./dist` folder for any other generated file." (concepts) |
| CRA | "If you put a file into the public folder, it will not be processed by webpack." It is copied into the build folder untouched and referenced with `%PUBLIC_URL%` in HTML or `process.env.PUBLIC_URL` in JS. https://create-react-app.dev/docs/using-the-public-folder/ | `build/` |
| Next.js | "Next.js can serve static files, like images, under a folder called `public` in the root directory. Files inside `public` can then be referenced by your code starting from the base URL (`/`)." https://nextjs.org/docs/app/api-reference/file-conventions/public-folder | `.next` by default; "Next.js takes ownership of `distDir` and will sometimes delete its contents." https://nextjs.org/docs/app/api-reference/config/next-config-js/distDir |

Dependencies and lock files: Linguist's vendored list includes `(^|/)node_modules/`, `(^|/)bower_components/`, and `(^|/)dist/` under "Distributions". https://raw.githubusercontent.com/github-linguist/linguist/main/lib/linguist/vendor.yml. Its generated list names `package-lock.json`, `npm-shrinkwrap.json`, `pnpm-lock.yaml`, `bun.lock`, `.pnp.*`, source maps and minified files (content heuristics). https://raw.githubusercontent.com/github-linguist/linguist/main/lib/linguist/generated.rb

**(c) Edges.**

- HTML: "To reference one file from another, you have to provide a file path". Same folder: `my-image.jpg`; subfolder: `subfolder/my-image.jpg`; parent: `../my-image.jpg`; forward slashes always. (MDN Dealing with files, above.) Resolution rule: "If the path part of the URL starts with the `/` character, the browser will fetch that resource from the top root of the server"; otherwise "The browser will attempt to find the document in a subdirectory of the one containing the current resource." https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL
- CSS: `url()` takes "an absolute URL, a relative URL, a blob URL, or a data URL"; "the resource sought can be an image, font, or a stylesheet"; "Relative URLs are resolved relative to the stylesheet URL, not the web page URL." https://developer.mozilla.org/en-US/docs/Web/CSS/url_function
- Bundlers turn these into module edges. Vite: "Importing a static asset will return the resolved public URL when it is served" and "`url()` references in CSS are handled the same way." (assets page). webpack: "`asset/resource` emits a separate file and exports the URL." with `import mainImage from "./images/main.png"`. https://webpack.js.org/guides/asset-modules/. css-loader: `url(image.png) => require('./image.png')`, `url(~module/image.png) => require('module/image.png')`, `@import 'style.css' => require('./style.css')`. https://raw.githubusercontent.com/webpack-contrib/css-loader/master/README.md. CRA: "webpack finds all relative module references in CSS (they start with `./`) and replaces them with the final paths from the compiled bundle." https://create-react-app.dev/docs/adding-images-fonts-and-files/
- Next.js: a file at `public/avatars/me.png` is referenced as `/avatars/me.png`; routes are the folder tree (public-folder and project-structure pages above).

### 5. Android

**(a) Markers.** `settings.gradle(.kts)` "Contains global build information for Gradle initialization and project configuration, such as" the project name, "list of subprojects to include in this build", repositories and version catalogs; the top-level `build.gradle(.kts)` "Should only contain plugin declarations"; each module's `build.gradle(.kts)` "Declares how to build this subproject." https://developer.android.com/build/android-build-structure. Gradle: "The settings file is typically located in the root directory of the project"; "There is only one root project per build."; "The settings file defines the structure of the project by including subprojects". https://docs.gradle.org/current/userguide/settings_file_basics.html. "Every app project must have an `AndroidManifest.xml` file, with precisely that name, at the root of the project source set." https://developer.android.com/guide/topics/manifest/manifest-intro

**(b) Own content vs generated.** On disk a module has `build/` ("Contains build outputs."), `libs/`, and `src/` with `src/main/AndroidManifest.xml`, `java/` ("Contains Kotlin or Java code sources, or both"), `kotlin/`, `res/` ("Contains application resources, such as drawable files and UI string files."), and `assets/` ("Contains files to be compiled into an APK file as-is. For example, this is a good location for textures and game data."). The IDE's Android view "doesn't reflect the actual file hierarchy on disk." https://developer.android.com/studio/projects

Resources: "Place each type of resource in a specific subdirectory of your project's `res/` directory." Table 1 names `drawable/`, `mipmap/`, `raw/`, `values/`, `xml/`, `font/`; "Never save resource files directly inside the `res/` directory." The `layout/`, `menu/`, `anim/`, `animator/`, `color/` directories "are obsolete for modern apps" under Compose. "Files saved in the `assets/` directory are not given a resource ID, so you can't reference them through the `R` class or from XML resources." https://developer.android.com/guide/topics/resources/providing-resources

Generated or local: Gradle's `.gradle/` is a "Project-specific cache directory generated by Gradle." and `build/` is "The build directory of this project into which Gradle generates all build artifacts."; `gradle/wrapper` "Contains the JAR file and configuration of the Gradle Wrapper." https://docs.gradle.org/current/userguide/directory_layout.html. `local.properties` "Contains properties related to the local machine, such as the location of the Android SDK." "Exclude this file from source control!" (android-build-structure). The `R` class: "All resource IDs are defined in your project's `R` class, which the `aapt` tool automatically generates." https://developer.android.com/guide/topics/resources/accessing-resources. Linguist treats `.idea/` files and `gradlew`/`gradlew.bat` as generated (generated.rb).

**(c) Edges.**

- Resource IDs are derived from file names: "A resource ID is always composed of the following:" the resource type and "The resource name, which is the filename excluding the extension." In code `[<package_name>.]R.<resource_type>.<resource_name>`, e.g. `R.drawable.my_icon`; in XML `@drawable/icon_ca`, `@string/hello`, `@color/red`. (accessing-resources page.)
- Manifest to code and resources: components are declared by class name, `android:name=".MainActivity"` "resolved to com.example.myapp.MainActivity based on the namespace property in the build.gradle file"; attribute values use `"@[package:]type/name"`, e.g. `android:label="@string/app_name"`. (manifest-intro page.)
- Build graph: `settings.gradle` includes subprojects; module build files hold "dependencies (libraries and platforms) included when building this subproject" (android-build-structure).
- `assets/` files have no ID edge; they are read by path through `AssetManager` (providing-resources).

### 6. iOS and Swift

**(a) Markers.** `*.xcodeproj` (containing `project.pbxproj`), `*.xcworkspace`, and for packages `Package.swift`: "A Swift package is a directory that contains sources, dependencies, and has a `Package.swift` manifest file at its root." https://raw.githubusercontent.com/swiftlang/swift-package-manager/main/Sources/PackageManagerDocs/Documentation.docc/CreatingSwiftPackage.md

**(b) Own content vs generated.**

- Xcode's file list. Groups: "By default, Xcode maps each group to a folder in your project directory, but you can also create groups without an underlying file-system folder." Folder references: "A folder is a file-system directory that you reference from your project. Xcode includes the contents of the folder in your project." "Folders have a much smaller representation in the project file, which can result in fewer merge conflicts because when you add or remove files to the project you don't modify the project file. Additionally, your Xcode project file automatically updates as you make changes to the file system." https://developer.apple.com/documentation/xcode/managing-files-and-folders-in-your-xcode-project (read via https://developer.apple.com/tutorials/data/documentation/xcode/managing-files-and-folders-in-your-xcode-project.json). Xcode 16: "Buildable folders only record the folder path into the project file without enumerating the contained files." https://developer.apple.com/documentation/xcode-release-notes/xcode-16-release-notes. So a pbxproj is an explicit list for groups and a folder path for buildable folders.
- pbxproj format: Apple publishes no specification; a search of developer.apple.com found none. Linguist marks `.xcworkspacedata`, `.xcuserstate` and `.nib` as generated (generated.rb).
- SwiftPM layout: "Swift sources are collected by target name under the `Sources` directory," and "tests collected, also by target name, under the `Tests` directory." (CreatingSwiftPackage). `Target.path` is "The path of the target, relative to the package root." "If the path is `nil`, Swift Package Manager looks for a target's source files at predefined search paths and in a subdirectory with the target's name." Search paths: "`Sources`, `Source`, `src`, and `srcs` for regular targets" and "`Tests`, `Sources`, `Source`, `src`, and `srcs` for test targets"; e.g. "`[PackageRoot]/Sources/[TargetName]`"; "Don't escape the package root; that is, values like `../Foo` or `/Foo` are invalid." https://developer.apple.com/documentation/packagedescription/target/path
- Resources: "Package manager treats non-source files found in the target's sources directory as assets, scoped to that target." Declared with `.process(...)` or `.copy(...)` in the target's `resources:`; "Always use `Bundle.module` to access resources." https://raw.githubusercontent.com/swiftlang/swift-package-manager/main/Sources/PackageManagerDocs/Documentation.docc/BundlingResources.md
- Generated: `swift build` scratch directory "(default .build)". https://raw.githubusercontent.com/swiftlang/swift-package-manager/main/Sources/PackageManagerDocs/Documentation.docc/SwiftBuild.md. `Package.resolved` is "a file named `Package.resolved` at the top-level of the package" recording "the result of dependency resolution"; "you can keep a `Package.resolved` file in source control". https://raw.githubusercontent.com/swiftlang/swift-package-manager/main/Sources/PackageManagerDocs/Documentation.docc/ResolvingPackageVersions.md. In Xcode: "When you add a package dependency to a project, Xcode creates the `Package.resolved` file. ... Commit this file in Git to ensure that everyone is using the same version of a package dependency." stored at "[appName].xcodeproj/project.workspace/xcshareddata/swiftpm/Package.resolved" (the page's own spelling). https://developer.apple.com/documentation/xcode/adding-package-dependencies-to-your-app
- DerivedData: Apple's current documentation pages found by search do not describe DerivedData's location or contents; the only Apple text is a retired Xcode 3 document ("By default, Xcode places both the build products and the intermediate files that it generates in the `build` directory inside of your project directory.", banner: "This document, which describes Xcode 3, has been superseded by Xcode Overview."). https://developer.apple.com/library/archive/documentation/DeveloperTools/Conceptual/XcodeProjectManagement/210-Building_Products/building.html. The usual `~/Library/Developer/Xcode/DerivedData` path is community knowledge, not documented. Linguist treats `Pods/` and `Carthage/Build/` as generated and `Carthage/` as vendored.

**(c) Edges.**

- Asset catalogs: "In an asset catalog, each asset set represents one resource" (an image, color, or data file) "that your app loads at runtime." "When you refer to a resource in code, the system determines the appropriate variation to display at runtime based on the characteristics of the current device." Templates include `Assets.xcassets`. https://developer.apple.com/documentation/xcode/managing-assets-with-asset-catalogs. On disk, folders are named "`<name-of-catalog-or-asset>.<type-of-item>`", "Each folder can contain a `.json` file encoding the attributes for the catalog, group, or asset in that folder.", and "Asset folders contain the files for an individual asset." https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/FolderStructure.html. Types: `.xcassets` "The top level folder for the asset catalog."; `.imageset` "An image used for `UIImage`, `NSImage`, user interface controls, and other objects using images."; `.appiconset`; `.colorset` "A named color. The name of the color can be used anywhere in an Xcode project."; `.dataset` "Used to include arbitrary app data."; `.spriteatlas`, `.textureset`, `.launchimage`, `.iconset`. https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/AssetTypes.html. The edge from code to an asset is therefore by set name, not file path.
- Package edges: "A remote dependency requires a location, represented by a URL."; local packages use `package(path:)` "with the local path to the package" and "Local dependencies do not enforce version constraints." https://raw.githubusercontent.com/swiftlang/swift-package-manager/main/Sources/PackageManagerDocs/Documentation.docc/Dependencies/AddingDependencies.md. Targets depend on each other by name (`.target(name: "MyLibrary", dependencies: ["Utility"])` in Apple's `Package` example). https://developer.apple.com/documentation/packagedescription/package

### 7. Infrastructure as code

#### Terraform

- Markers and modules: "Code in the Terraform language is stored in plain text files with the `.tf` file extension." plus `.tf.json`. "A module is a collection of `.tf` and/or `.tf.json` files kept together in a directory." "nested directories are treated as completely separate modules, and are not automatically included in the configuration." "In Terraform CLI, the root module is the working directory where Terraform is invoked." https://developer.hashicorp.com/terraform/language/files. Standard structure: "`main.tf` should be the primary entrypoint."; `variables.tf` and `outputs.tf`; "Nested modules should exist under the `modules/` subdirectory."; examples under `examples/`. https://developer.hashicorp.com/terraform/language/modules/develop/structure. The style guide adds `providers.tf`, `terraform.tf`, `backend.tf`, `locals.tf`, `override.tf`. https://developer.hashicorp.com/terraform/language/style
- Generated, do not commit (style guide): "Your `terraform.tfstate` state file, including `terraform.tfstate.*` backup state files."; "Your `.terraform.tfstate.lock.info` file."; "Your `.terraform` directory, where Terraform downloads providers and child modules."; saved plan files; "Any `.tfvars` files that contain sensitive information." Always commit: "All Terraform code files", "Your `.terraform.lock.hcl`", a `.gitignore`, a `README.md`. `terraform init` creates "A hidden `.terraform` directory, which Terraform uses to manage cached provider plugins and modules" that "is automatically managed by Terraform". https://developer.hashicorp.com/terraform/cli/init. State: "By default, Terraform stores each workspace's state in a local file named `terraform.tfstate`"; "Terraform stores your workspaces state as a JSON text file." "Do not directly edit this file." https://developer.hashicorp.com/terraform/language/state. Lock: "The lock file is always named `.terraform.lock.hcl`"; "You should include this file in your version control repository"; "At present, the dependency lock file tracks only provider dependencies." https://developer.hashicorp.com/terraform/language/files/dependency-lock
- Edges: `module` blocks name a `source`. "A local path must begin with either `./` or `../`"; "Local paths are special in that they are not "installed" in the same sense that other sources are." An absolute path is treated like a remote module and copied "into the local module cache"; remote sources are downloaded during `terraform init` "to a directory on local disk". https://developer.hashicorp.com/terraform/language/v1.10.x/modules/sources. Nested modules "should use relative paths like `./modules/consul-cluster`" (structure page).

#### Kubernetes manifests, Kustomize, Helm

- Plain manifests have no marker. "Management of multiple resources can be simplified by grouping them together in the same file (separated by `---` in YAML)." "It is a recommended practice to put resources related to the same microservice or application tier into the same file, and to group all of the files associated with your application in the same directory." `kubectl apply -f <dir>` "will stop at the first level of the directory, not processing any subdirectories" unless `--recursive`/`-R`. https://kubernetes.io/docs/concepts/cluster-administration/manage-deployment/. Edges between manifests are by object name and namespace; the fetched page does not describe them as file references.
- Kustomize: marker `kustomization.yaml`; `kubectl apply -k <kustomization_directory>`; ConfigMaps can be generated from files (`files: - application.properties`). https://kubernetes.io/docs/tasks/manage-kubernetes-objects/kustomization/. `resources`: "Each entry in this list must be a path to a file, or a path (or URL) referring to another kustomization directory." "File paths should be specified relative to the directory holding the kustomization file containing the resources field." "Resources will be read and processed in depth-first order." URLs are "a HTTPS or SSH git clone URL". https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/resource/
- Helm: marker `Chart.yaml`. Layout: `Chart.yaml`, `LICENSE`, `README.md`, `values.yaml`, `values.schema.json`, `charts/` ("A directory containing any charts upon which this chart depends."), `crds/`, `templates/`, `templates/NOTES.txt`. "Helm reserves use of the `charts/`, `crds/`, and `templates/` directories, and of the listed file names." "Other files will be left as they are." https://helm.sh/docs/topics/charts/. Dependencies: "Helm charts store their dependencies in 'charts/'."; "The 'repository' URL should point to a Chart Repository."; a local chart uses "a prefix of "file://"", e.g. `repository: "file://../dependency_chart/nginx"`; `helm dependency build` will "rebuild the charts/ directory based on the Chart.lock file." https://helm.sh/docs/helm/helm_dependency/. `.helmignore` "must be placed in the chart's root directory, alongside the Chart.yaml file." and "Helm ignores every path that matches a pattern when it loads the chart." https://helm.sh/docs/chart_template_guide/helm_ignore_file/

#### Docker Compose and Dockerfiles

- Compose: "The default path for a Compose file is `compose.yaml` (preferred) or `compose.yml` that is placed in the working directory." "Compose also supports `docker-compose.yaml` and `docker-compose.yml` for backwards compatibility of earlier versions." "If both files exist, Compose prefers the canonical `compose.yaml`." https://docs.docker.com/compose/intro/compose-application-model/
- Compose to Dockerfile: "`context` defines either a path to a directory containing a Dockerfile, or a URL to a Git repository." "When the value supplied is a relative path, it is interpreted as relative to the project directory." "`dockerfile` sets an alternate Dockerfile. A relative path is resolved from the build context." Short syntax: "A relative path to the Compose file's folder. This path must be a directory and must contain a `Dockerfile`". https://docs.docker.com/reference/compose-file/build/
- Compose to Compose: `include` "`path` is required and defines the location of the Compose file(s) to be parsed and included into the local Compose model." "Relative paths in Compose files being referred by `include` are resolved relative to their own Compose file path"; `project_directory` "defaults to the directory of the included Compose file." https://docs.docker.com/reference/compose-file/include/
- Dockerfile: "The default filename to use for a Dockerfile is `Dockerfile`, without a file extension." "A common convention is to name these `<something>.Dockerfile`." https://docs.docker.com/build/concepts/dockerfile/. "A Dockerfile must begin with a `FROM` instruction." COPY: "When copying source files from the build context, paths are interpreted as relative to the root of the context." ADD: "The local file path is relative to the build context." https://docs.docker.com/reference/dockerfile/. "The build context is the set of files that your build can access."; "the build client looks for a file named `.dockerignore` in the root directory of the context."; "A Dockerfile-specific ignore-file takes precedence over the `.dockerignore`". https://docs.docker.com/build/concepts/context/

#### GitHub Actions

- Marker: "You must store workflow files in the `.github/workflows` directory of your repository." with a `.yml` or `.yaml` extension. https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions. "Workflows are defined in the `.github/workflows` directory in a repository." https://docs.github.com/en/actions/writing-workflows/about-workflows
- Step edges, `jobs.<job_id>.steps[*].uses`: `{owner}/{repo}@{ref}`, `{owner}/{repo}/{path}@{ref}` ("A subdirectory in a public GitHub repository at a specific branch, ref, or SHA."), `docker://{image}:{tag}`, and for an action in the same repository "The path to the directory that contains the action in your workflow's repository." "The path is relative (`./`) to the default working directory (`github.workspace`, `$GITHUB_WORKSPACE`)." "You must check out your repository before using the action" (a `$/path/to/action` form avoids the checkout). (workflow-syntax page.)
- Job edges, `jobs.<job_id>.uses`: "The location and version of a reusable workflow file to run as a job." `{owner}/{repo}/.github/workflows/{filename}@{ref}` or `./.github/workflows/{filename}` "for reusable workflows in the same repository." (workflow-syntax page.)
- Action edges: "the metadata filename must be either `action.yml` or `action.yaml`."; `runs.main` is "The file that contains your action code."; for Docker actions "To reference a `Dockerfile` local to your repository, the file must be named `Dockerfile` and you must use a path relative to your action metadata file." Composite steps "can be either `run` steps or `uses` steps." https://docs.github.com/en/actions/sharing-automations/creating-actions/metadata-syntax-for-github-actions

### 8. Documentation sites

#### MkDocs

- Marker: "Project settings are configured by default using a YAML configuration file in the project directory named `mkdocs.yml`." `docs_dir` defaults to `docs` and "is resolved relative to the directory containing your configuration file"; `site_dir` defaults to `site`, "The directory where the output HTML and other files are created."; the page tells you to "ensure that your build output files are not committed into the repository". https://www.mkdocs.org/user-guide/configuration/
- Own content: "By convention your project homepage should be named `index.md`"; "All Markdown files included in your documentation directory will be rendered in the built site regardless of any settings."; "Any files which are not identified as Markdown files (by their file extension) within the documentation directory are copied by MkDocs to the built site unaltered." https://www.mkdocs.org/user-guide/writing-your-docs/
- Edges: link "including the relative path to the Markdown document you wish to link to", e.g. `[project license](license.md)`; "Relative paths are adjusted by MkDocs to ensure they are always relative to the page."; images `![Screenshot](img/screenshot.png)`; "MkDocs is not able to validate or convert links contained in raw HTML." (same page.)

#### Docusaurus

- Marker and layout: `docusaurus.config.js` ("A config file containing the site configuration."), `docs/` ("Contains the Markdown files for the docs."), `blog/`, `src/pages` ("Any JSX/TSX/MDX file within this directory will be converted into a website page."), `static/` ("Any contents inside here will be copied into the root of the final `build` directory"), `sidebars.js`. https://docusaurus.io/docs/installation. The docs plugin's `path` defaults to `docs`: "Path to the docs content directory on the file system, relative to site directory."; its `exclude` example lists `**/_*.{js,jsx,ts,tsx,md,mdx}`, `**/_*/**`, `**/*.test.{js,jsx,ts,tsx}`, `**/__tests__/**`. https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs
- Generated: `docusaurus build` "Compiles your site for production." into `--out-dir` default `build`; `docusaurus clear` will "Clear a Docusaurus site's generated assets, caches, build artifacts." https://docusaurus.io/docs/cli. Static files: "By default, none of the files in the static folder will be post-processed, hashed, or minified." and "Missing files referenced via hard-coded absolute paths will not be detected at compilation time". https://docusaurus.io/docs/static-assets
- Edges: "Relative file paths are resolved against the current file's directory." "Docusaurus' Markdown loader will convert the file path to the target file's URL path (and hence remove the `.md` extension)." "Markdown file references only work when the source and target files are processed by the same plugin instance." URL paths are "unprocessed by Docusaurus". https://docusaurus.io/docs/markdown-features/links. Assets: "all asset paths will be resolved as file paths by Docusaurus and automatically converted to `require()` calls."; "The image enters Webpack's build pipeline and its name will be appended by a hash". https://docusaurus.io/docs/markdown-features/assets

#### Sphinx

- Marker: "The root directory of a Sphinx collection of plain-text document sources is called the source directory." "This directory also contains the Sphinx configuration file `conf.py`". https://www.sphinx-doc.org/en/master/usage/quickstart.html. "The configuration directory must contain a file named `conf.py`."; `source_suffix` default `{'.rst': 'restructuredtext'}`; `root_doc` default `'index'`; `exclude_patterns`, `html_static_path`, `templates_path`. https://www.sphinx-doc.org/en/master/usage/configuration.html. Quickstart layout: `build/` "An empty directory (for now) that will hold the rendered documentation.", `make.bat` and `Makefile`, `source/conf.py`, `source/index.rst` "The root document of the project". https://www.sphinx-doc.org/en/master/tutorial/getting-started.html. Linguist vendors `(^|/)docs?/_?(build|themes?|templates?|static)/` (vendor.yml).
- Edges: `toctree` entries "are given as document names", "which in short means that you leave off the file name extension and use forward slashes" (quickstart). "Relative document names (not beginning with a slash) are relative to the document the directive occurs in,"; "Sphinx will emit a warning if it finds a file that is not included," in any toctree. https://www.sphinx-doc.org/en/master/usage/restructuredtext/directives.html. `:doc:` "the document name can be a relative or absolute path"; `:download:` marks the file "for inclusion in the output when building", resolved "relative to the directory the current source file is contained in" or, with a leading `/`, "relative to the top source directory". https://www.sphinx-doc.org/en/master/usage/referencing.html. Images "must either be relative to the source file, or absolute which means that they are relative to the top source directory." "Sphinx will automatically copy image files over to a subdirectory of the output directory on building." https://www.sphinx-doc.org/en/master/usage/restructuredtext/basics.html

#### Markdown links in general

CommonMark: "A link contains link text (the visible text), a link destination (the URI that is the link destination)" and an optional title; "Syntax for images is like the syntax for links, with one difference." https://spec.commonmark.org/0.31.2/. GitHub resolves README links by file: "A relative link is a link that is relative to the current file." "Links starting with `/` will be relative to the repository root." https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes. A markdown link whose destination is a path is therefore an edge from one file to another; whether it is validated depends on the site generator (MkDocs transforms, Docusaurus converts same-plugin file paths, Sphinx warns on orphans).

### 9. Data and notebooks

- Notebook format: "At the highest level, a Jupyter notebook is a dictionary with a few keys:" `metadata`, `nbformat`, `nbformat_minor`, `cells`. Cells are markdown, code ("Code cells are the primary content of Jupyter notebooks."), or raw. Code cells carry "a list of outputs associated with executing that code." Markdown cells may have `attachments`, "typically inline images that can be referenced in the markdown content of a cell." keyed by filename, e.g. `![inline image](attachment:test.png)`. https://nbformat.readthedocs.io/en/latest/format_description.html. The format has no field for external file references; data paths live in cell source as code strings (docs silent on them).
- Checkpoints: Jupyter Server's `FileCheckpoints.checkpoint_dir` is `".ipynb_checkpoints"` with help "The directory name in which to keep file checkpoints This is a path relative to the file's own directory." https://raw.githubusercontent.com/jupyter-server/jupyter_server/main/jupyter_server/services/contents/filecheckpoints.py
- Environment files: "`requirements.txt` is usually what these files are named (although, that is not a requirement)."; lines may be requirement specifiers, archive URLs or paths, `-e <local project path>`, `-r more_requirements.txt`, `-c some_constraints.txt`. https://pip.pypa.io/en/stable/reference/requirements-file-format/. Conda: "You can create an environment file (`environment.yml`) manually to share with others." https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html. `pyproject.toml`: the `[build-system]` table "is strongly recommended"; "Patterns are relative to the directory containing `pyproject.toml`". https://packaging.python.org/en/latest/guides/writing-pyproject-toml/
- Conventional exclusions (GitHub's Python template, non-normative but widely copied): `__pycache__/`, `*.py[codz]`, `build/`, `dist/`, `*.egg-info/`, `.ipynb_checkpoints`, `profile_default/`, `.env`, `.venv`, `env/`, `venv/`, `.mypy_cache/`, `.pytype/`; lock files (`Pipfile.lock`, `poetry.lock`, `pdm.lock`, `uv.lock`) are commented options. https://raw.githubusercontent.com/github/gitignore/main/Python.gitignore
- Data directories (Cookiecutter Data Science, a widely used convention rather than a standard): `data/external` "Data from third party sources.", `data/interim` "Intermediate data that has been transformed.", `data/processed` "The final, canonical data sets for modeling.", `data/raw` "The original, immutable data dump.", `models`, `notebooks` (named `<step>-<ghuser>-<description>.ipynb`), `references`, `reports/figures` "Generated graphics and figures to be used in reporting". https://cookiecutter-data-science.drivendata.org/. "Don't ever edit your raw data." and "by default, the `data/` folder is included in the `.gitignore` file." https://cookiecutter-data-science.drivendata.org/opinions/
- DVC: `dvc init` creates "the internal .dvc/ directory" whose contents "contain the local configuration file(s), default local cache location"; `.dvc` files "are placeholders to track data files and directories" and "are typically versioned with Git"; `dvc.yaml` files "define stages, parameters, metrics, and plots"; `.dvcignore` lists paths for DVC to ignore. https://doc.dvc.org/user-guide/project-structure

### 10. A bare folder with no marker file

No standard defines a project for a folder without a marker. What conventions do say:

- Git: "a `.git` directory at the root of the working tree" marks a repository, or "a plain text file `.git` at the root of your working tree, containing `gitdir:` <path>". https://git-scm.com/docs/gitrepository-layout. `.gitignore` "specifies intentionally untracked files that Git should ignore." and "These patterns match relative to the location of the `.gitignore` file." https://git-scm.com/docs/gitignore. This is the only machine-readable statement of "not my content" most folders carry.
- Linguist's classification, applied by GitHub to every repository: `.gitattributes` overrides `linguist-vendored`, `linguist-generated`, `linguist-documentation`; "By default, Linguist treats all of the paths defined in `vendor.yml` as vendored" and "`generated.rb` lists common generated paths". https://raw.githubusercontent.com/github-linguist/linguist/main/docs/overrides.md. Vendored paths include `node_modules/`, `bower_components/`, `vendors?/`, `[Vv]+endor/`, `dist/`, `cache/`, `^deps/`, `[Ee]xtern(als?)?/`, `(3rd|[Tt]hird)[-_]?[Pp]arty/`, `testdata/`, `Carthage/`, `.yarn/releases/` etc., `docs?/_?(build|themes?|templates?|static)/`. https://raw.githubusercontent.com/github-linguist/linguist/main/lib/linguist/vendor.yml. Documentation paths: `^[Dd]ocs?/`, `(^|/)[Dd]ocumentation/`, `(^|/)[Jj]avadoc/`, `^[Mm]an/`, `^[Ee]xamples/`, `^[Dd]emos?/`, `^[Ss]amples?/`, and files `README`, `CHANGELOG`, `CONTRIBUTING`, `LICENSE`, `COPYING`, `INSTALL`, `CITATION`. https://raw.githubusercontent.com/github-linguist/linguist/main/lib/linguist/documentation.yml. Generated: lock files (`package-lock.json`, `Cargo.lock`, `composer.lock`, `poetry.lock`, `uv.lock`, `Package.resolved`, `.terraform.lock.hcl` and others), `.idea/`, `Pods/`, `Carthage/Build/`, `node_modules/`, minified JS/CSS and source maps by content, Unity `.meta`, and files with "generated" headers. https://raw.githubusercontent.com/github-linguist/linguist/main/lib/linguist/generated.rb
- README placement: GitHub surfaces a README "in your repository's hidden `.github`, root, or `docs` directory", preferring "the `.github` directory, then the repository's root directory, and finally the `docs` directory." (about-readmes page above.)
- Editor conventions: `.editorconfig` is looked for "in the directory of the opened file and in every parent directory" until "an EditorConfig file with `root=true` is found". https://editorconfig.org/. VS Code: "You don't have to do anything for a folder to become a VS Code workspace other than open the folder with VS Code." with settings in `.vscode/settings.json`. https://code.visualstudio.com/docs/editing/workspaces/workspaces
- Web: a folder holding `index.html` is a site to any server that defaults `DirectoryIndex index.html` (section 4).

In a bare folder the only edges are those that file contents carry (relative paths in HTML, CSS and markdown; imports in code); nothing names the root, the entry, or the generated set.

### Cross-cutting observations

- Markers are almost always at the root and almost always a single file or folder name: `project.godot`, `*.uproject`, `Package.swift`, `Chart.yaml`, `mkdocs.yml`, `compose.yaml`, `settings.gradle`, `Assets/` + `ProjectSettings/`. Terraform and plain Kubernetes are the exceptions: any directory of `.tf` files is a module; any directory of YAML can be applied.
- Every engine and build tool documents its generated set as regenerable and excluded from version control (Unity `Library`, Unreal `Intermediate`/`Saved`/DDC, Godot `.godot/`, Gradle `build/`/`.gradle/`, SwiftPM `.build`, Terraform `.terraform`, MkDocs `site`, Docusaurus `build`). Lock files are the one generated class that the same docs say to commit (`packages-lock.json`, `Package.resolved`, `.terraform.lock.hcl`, `Chart.lock`).
- Sidecar files are content, not noise: Unity `.meta` (holds the GUID), Godot `.import` and `.uid` (hold the UID), DVC `.dvc`. Deleting them breaks edges.
- Edge kinds fall into four families: (1) relative or root-anchored paths (HTML, CSS, markdown, Kustomize `resources`, Terraform `./modules`, Compose `context`, Godot `res://`); (2) opaque identifiers mapped through a sidecar or database (Unity GUID+fileID, Godot `uid://`, Android `R` IDs derived from file names); (3) names looked up at build or run time (Xcode asset set names, Helm chart names, Unreal module names, Swift target names, Unity `Resources` paths); (4) references with a version or ref (`uses: owner/repo@ref`, SwiftPM URLs, Terraform registry sources). Only the first family is visible by reading the referencing file alone.
- Two archetypes need a mode or sidecar to be readable at all: Unity (YAML only with text serialization; GUIDs only with `.meta`) and Unreal (`.uasset` edges are documented only through the Asset Registry, which reads package headers).

## The agent's judgement

Not a decision. What the two parts say, read together for the question the owner asked.

**The finite set exists, and its members are the marker files.** Every shape with a build has a marker at its root (`package.json`, `tsconfig.json`, `*.csproj` and `.sln`, `pom.xml`, `settings.gradle`, `go.mod`, `Cargo.toml`, `pyproject.toml`, `*.gemspec`, `composer.json`, `CMakeLists.txt`, `meson.build`, `Assets/` with `ProjectSettings/`, `*.uproject`, `project.godot`, `index.html`, `AndroidManifest.xml`, `Package.swift`, `*.tf`, `Chart.yaml`, `compose.yaml`, `mkdocs.yml`), and the marker says what the project is, where its outputs and dependencies live, and, in one of three ways, which files are its own:

1. **A list or a glob.** tsconfig's `files` and `include` (default `**/*`) minus `exclude`; the SDK-style csproj's `**/*.cs` minus `bin`, `obj` and dot-folders; the old csproj's `Compile Include`; CMake's and Meson's per-target source lists; Composer's namespace-to-directory map; a gemspec's `files`. Decisive, and read from one file.
2. **A convention the ecosystem documents.** Maven's `src/main/java`, Gradle's source sets, Go's package-is-a-directory with its `_`, `.`, `testdata` and `vendor` exclusions, Cargo's target auto-discovery, setuptools' src and flat layouts, Rails' autoload paths. Decisive once the marker is recognized, with the overrides read from the manifest.
3. **An entry and what it reaches.** `package.json` names only entry points (`main`, `exports`, `bin`); Vite's `index.html` and webpack's `./src/index.js` are entries whose module graph is the bundle; Unreal's asset registry and Unity's scenes reach their assets by reference. For these the source set is the reachable set from the entries, which is the walk Live Documentation already does, and a file the walk does not reach is present but unclaimed. The Make-built project, with rules and no source list, is the one shape the documents leave undecided.

So "a finite set of heuristics that might decisively and accurately conclude" source from non-source is not a guess at layouts. It is each ecosystem's own declaration, read from its marker, in the same tier the vision gives cross-system edges: observed from configuration, with the file it was read from as the evidence. It is also the move the entry points made on 2026-10-15, when a manifest's scripts, binaries and main modules were read rather than guessed.

**A project archetype would be a fact on a folder, as a file archetype is a fact on a file.** Recognized from its marker, it says what the folder is, what it claims as source, what it excludes, which sidecars are content (Unity's `.meta` holds the GUID; Godot's `.import` and `.uid` hold the UID; delete them and edges break), and which edge kinds join its files. A folder may hold several (a Unity project generates .NET projects; a web site has a `package.json`), and a monorepo holds a workspace of them, which is what this repository is. The Knowledge Sources panel, which already groups files by directory and extension, would show the projects found, each with its archetype, what it claimed and what it left; `inspect` would print the same; and the World Map's things, which today a person names and a board gives a kind, would have a suggestion to accept, a thing per project with its kind from its archetype, under the standing rule that a suggestion never creates a thing.

**The edges come in four families, and the product reads one.** Relative or root-anchored paths (HTML, CSS, markdown, `#include`, Kustomize, Terraform's `./modules`, Godot's `res://`) are readable from the referencing file alone, and are what the adapters read today. Opaque identifiers mapped through a sidecar or a database (Unity's GUID and fileID, Godot's `uid://`, Android's `R` names derived from file names) need a first pass over the workspace, which the generator already makes for symbols and entries. Names resolved at build or run time (Xcode asset sets, Helm chart names, Unreal module names, Swift targets, Unity `Resources` paths) need the manifest. Versioned references (`uses: owner/repo@ref`, SwiftPM URLs, Terraform registry sources) are external by nature. Each family beyond the first is a basis the grammar does not yet name.

**What no marker claims is the fallback, and it stays visible.** TH04's C++ has no marker (a Python harness drives a DOS-era compiler); a plain folder of scripts has none; a bare folder's only machine-readable statement of "not my content" is its `.gitignore`. For those, every file whose suffix an adapter reads, anywhere, minus what `.gitignore` and the markers' documented output directories exclude, is the honest reading, with the panel saying "claimed by no project" so that the person sees the guess as a guess. The wrong default today is not that it guesses; it is that it guesses one repository's shape and says nothing.

**Generated, committed, and still not authored.** The documents agree that outputs and caches are regenerable and left out of version control (Unity `Library`, Unreal `Intermediate`, Gradle `build`, Cargo `target`, Terraform `.terraform`, MkDocs `site`), and that lock files are the one generated class the same documents say to commit (`package-lock.json`, `Package.resolved`, `.terraform.lock.hcl`, `Chart.lock`, `Cargo.lock`). Under the owner's rule of 2026-10-15, a Live Doc wherever there is authorial decision-making to convey, a lock file has none, committed or not; a sidecar that holds an identifier has none either, but it carries the edge and must be read.

**The person's moment is the same question in two forms.** In the blank, after the folder is listed, the page can show what it concluded (the projects by archetype, the counts by suffix, the unclaimed files) and take the person's includes and excludes before scanning; in the headless form the configuration carries the same decisions as globs, excludes and overrides, as it carries `sampleRoots` and `entryPoints` now. Neither form needs the other first, and the parity rule says both will exist.

**What it would cost, in order.** First, the fallback and an `exclude` option, an afternoon, which makes a cold run honest and lets this repository scan itself without listing its own shape. Second, project archetypes from the markers the product already parses, `package.json` with its tsconfig and `.csproj` with its solution, as a fact discovery honours and the panel shows, measured against what the compilers compile. Third, the other ecosystems one at a time, each when a sample of that shape is at hand and an oracle can grade the claim, under the languages survey's rule: no archetype ahead of a sample and an oracle. The asset-heavy shapes, Unity and Unreal above all, bring the second and third edge families and belong to their own design step, with a text-serialized Unity project as the first sample.

**What not to do.** A longer list of guessed layouts; a default that leaves any file class undocumented because of one repository's habits; and reading a marker for what to scan without writing on the doc that this is what the marker said, since a fact the picture uses must be a fact the docs carry.
