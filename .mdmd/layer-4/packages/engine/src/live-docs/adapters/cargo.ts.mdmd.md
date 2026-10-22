# packages/engine/src/live-docs/adapters/cargo.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/cargo.ts
- Generated At: 2026-10-22T16:47:51.455Z

## Authored
### Purpose
The adapter for Cargo manifests (`Cargo.toml`, matched by its exact name): the crate `[package].name` names as the file's one `package` symbol, what the crate stands on as dependencies, and the targets the manifest writes as the entries it declares on their files. A workspace's root manifest with no `[package]` publishes nothing and is still a tooling entry.

### Notes
- Written on 2026-10-16: the `reachable` build of October 15 read entries only from the manifests that had adapters and left Cargo, pom, pyproject, go.mod and gemspec for a later pass ([the October 15–16 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-15.1.SUMMARIZED.md#turn-4)); the owner approved four of them with the TOML library ([Turn 3 of the October 16 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)).
- Read: `[dependencies]`, `[dev-dependencies]` and `[build-dependencies]`, and the same three under each `[target.<cfg>]`, in the inline and the table forms; a dependency that renames a crate is written by the `package` it names. One with a `path` links to the `Cargo.toml` there when the workspace holds it; any other links to the workspace `Cargo.toml` publishing its name, or is external as `name@version`, the version as written, the name alone for a git dependency. `workspace = true` is read as the root manifest's `[workspace.dependencies]` entry, the root being the manifest `[package].workspace` names or the nearest with a `[workspace]` from the crate's folder upward within the workspace, its path taken from the root's folder; the name alone when no entry is found.
- Not read: `[workspace].members` (what a workspace contains, not what a crate stands on), `[patch]`, `[replace]`, features, `[[test]]` and `[[bench]]` (tests by their archetype). Targets Cargo infers from the file system without a table are the Rust adapter's `program` mark, not repeated here.
- Declared: each `[[bin]]` and `[[example]]` is a `command` by its name, on its `path` or where Cargo looks without one (`src/bin/<name>.rs`, `src/bin/<name>/main.rs`, and `src/main.rs` for the binary named after the package; `examples/<name>.rs`, `examples/<name>/main.rs`); `[lib]` is the package's `module`, on its `path` or `src/lib.rs`. A target whose file the workspace lacks declares nothing. The fixture's targets were checked with `cargo metadata`.
- The Rust adapter reads `[package].name` with its own regular expression to name crates and knows crate roots only at the conventional paths, so a `[lib]` or `[[bin]]` at another path is declared here but is not a crate root there. Measured by `cargo.test.ts` and `tests/integration/live-docs/manifests.test.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `cargoAdapter` {#symbol-cargoadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/cargo.ts#L51)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `cargoAdapter` — Summary
Language adapter for Cargo manifests: the crate as a symbol, its dependencies, and the targets it declares.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`manifest.ManifestContext`](./manifest.ts.mdmd.md#symbol-manifestcontext-interface)
- [`manifest.ManifestDependencies`](./manifest.ts.mdmd.md#symbol-manifestdependencies)
- [`manifest.manifestContext`](./manifest.ts.mdmd.md#symbol-manifestcontext-function)
- [`manifest.manifestIn`](./manifest.ts.mdmd.md#symbol-manifestin)
- [`manifest.packageSymbols`](./manifest.ts.mdmd.md#symbol-packagesymbols)
- [`manifest.publishedName`](./manifest.ts.mdmd.md#symbol-publishedname)
- [`manifest.readToml`](./manifest.ts.mdmd.md#symbol-readtoml)
- [`manifest.sortDeclared`](./manifest.ts.mdmd.md#symbol-sortdeclared)
- [`manifest.stringOf`](./manifest.ts.mdmd.md#symbol-stringof)
- [`manifest.tableOf`](./manifest.ts.mdmd.md#symbol-tableof)
- [`manifest.workspaceFile`](./manifest.ts.mdmd.md#symbol-workspacefile)
- [`coreTypes.DeclaredEntry`](../coreTypes.ts.mdmd.md#symbol-declaredentry) (type-only)
- [`coreTypes.SourceAnalysisResult`](../coreTypes.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
