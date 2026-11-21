# `packages/engine/src/live-docs/adapters/dotnetXml.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/adapters/dotnetXml.ts`
- Generated At: 2026-11-21T04:54:07.664Z

## Authored
### Purpose
The one step every .NET reader that reads XML by pattern takes first: it writes each XML comment over in spaces, its line breaks kept, so that no pattern reads what a comment holds as an element and every position found stays where it was. Project files (`project.ts`, `dotnetProjects.ts`), solutions in their XML form (`solution.ts`) and `Web.config`, `App.config` and `packages.config` (`dotnetConfig.ts`) take it.

### Notes
- Written on 2026-11-21 ([the work item](../../../../../../../AI-Agent-Workspace/Work/readers-on-main.md)), after an independent review of the readers' joining found a commented-out `<ProjectReference>` read as real by the project reader and by the C# reader's project reach, where MSBuild, asked the same file (`dotnet msbuild -getItem:ProjectReference`), reads none. The compiler oracle had read references by the same kind of pattern and is now MSBuild's evaluation too (`scripts/oracle/scip-edges.ts`).
- Measured on DNN Platform and mojoPortal: their project files hold no reference inside a comment, and on every project MSBuild can evaluate here (50 of DNN's 84, 21 of mojoPortal's 25) the patterns read the same project references as MSBuild but on three of mojoPortal's, whose references depend on the build configuration, which no pattern evaluates; their configuration files hold 6 (DNN's `App.config`s) and 164 (mojoPortal's `Web.config`s) elements inside comments. Generated before and after the step, neither corpus gains or loses an edge (31,798 on DNN, 9,749 on mojoPortal); the settings no longer read from comments are 2 on DNN (`UsePortNumber` in `development.config` and `release.config`) and 18 on mojoPortal in 7 files (the commented-out sample `MSSQLConnectionString`, `LoginLink` and others in `Web/Web.config`, and `MyDB` in six transform files).
- A CDATA section is passed over whole, since `<!--` inside one is its text; a comment left open runs to the end of the file, as an XML parser would refuse the rest.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `withoutXmlComments` {#symbol-withoutxmlcomments}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/dotnetXml.ts#L16)

##### `withoutXmlComments` — Summary
The text with every XML comment (`<!-- … -->`) written over in spaces, its line breaks kept, so that a position
found in the result is the same position in the text. A comment left open runs to the end. A CDATA section is
passed over whole, since `<!--` inside one is its text, not a comment.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
