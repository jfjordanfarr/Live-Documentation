# packages/engine/src/live-docs/adapters/dotnetConfig.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/dotnetConfig.ts
- Generated At: 2026-09-28T17:02:47.875Z

## Authored
### Purpose
The adapter for .NET configuration files. A `Web.config` or `App.config` publishes the names code reaches into it by, appSettings keys, connection string names, WCF client endpoint names and WCF service names, and the addresses its services listen on, so that a generated link to a key or an endpoint has somewhere to land. It depends on the workspace types its endpoints and services name through `contract` and `service name` and, observed from configuration, on the file that listens on the address each client endpoint points at. A `packages.config` lists its packages as externals.

### Notes
- Written on 2026-09-27 in the C# rewrite ([Turn 3](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-3)), when configuration keys held in constants and WCF endpoint names began to resolve and their targets had to publish anchors; until then ten docs under the fixtures carried hand-written headings that faked those anchors, a case [the decisions log](../../../../../../layer-3/architectural-decisions.mdmd.md) keeps. On 2026-09-28 it grew the listening addresses, the client-address edges with `configuration` as their basis, the walk of elements in place of flat tag matching, single-quoted attributes and the join of a relative service address to its host's base address ([Turn 34](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-34)).
- The walk is a tag scanner with a stack of open elements, not an XML parser: it keeps the names of the elements each one sits under, which is what the rules need (`add` under `appSettings` or `connectionStrings`, `endpoint` under `client` or `service`). A `<service>` resets the base address, so a host's base addresses apply to that service's endpoints only.
- Types named by `contract` and `service name` resolve through `resolveWorkspaceTypes` from `csharp.ts`, the table the C# adapter builds, so a configuration file and the code it configures agree on where a type lives.
- Its symbol kinds are `setting`, `connection-string`, `service`, `endpoint` and `address`; the C# dependency heuristics link to the first four by name, and `address`, an opening kind, is a door on a board. Measured by `dotnetConfig.test.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `dotnetConfigAdapter` {#symbol-dotnetconfigadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/dotnetConfig.ts#L70)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `dotnetConfigAdapter` — Summary
Language adapter for `.config` files: configuration names and service addresses as symbols; contracts, services and the files behind client addresses as dependencies.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- [`csharp.resolveWorkspaceTypes`](./csharp.ts.mdmd.md#symbol-resolveworkspacetypes)
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`core.DependencyEntry`](../core.ts.mdmd.md#symbol-dependencyentry) (type-only)
- [`core.PublicSymbolEntry`](../core.ts.mdmd.md#symbol-publicsymbolentry) (type-only)
- [`core.SourceAnalysisResult`](../core.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
- [`core.WorkspaceSymbolIndex`](../core.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`openings.ADDRESS_KIND`](../openings.ts.mdmd.md#symbol-address_kind)
- [`pathUtils.normalizeWorkspacePath`](../../tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->
