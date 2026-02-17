# scripts/slopcop/config.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/slopcop/config.ts
- Live Doc ID: LD-implementation-scripts-slopcop-config-ts
- Generated At: 2026-02-17T21:05:05.155Z

## Authored
### Purpose
Centralises SlopCop configuration parsing so the markdown, asset, and symbol audits all respect the same include/ignore globs, target overrides, and severity settings drawn from `slopcop.config.json`.

### Notes
- Added during the SlopCop CLI extraction (late Oct 2025) to keep the three audits in sync after we split them into dedicated scripts (`2025-10-25.SUMMARIZED.md`).
- Normalises string inputs (`includeGlobs`, `ignoreTargets`, severity levels) and supports per-section overrides, which the integration fixtures assert against when simulating misconfigured repos.
- `CONFIG_FILE_NAME` remains fixed so `npm run slopcop:*` commands and `safe-to-commit.mjs` can rely on workspace-relative resolution, with `--config` allowing targeted regression tests.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T21:05:05.155Z","inputHash":"6550e6ed15d16ae4"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SeveritySetting` {#symbol-severitysetting}
- Type: type
- Source: [source](../../../../scripts/slopcop/config.ts#L11)

##### `SeveritySetting` — Summary
Tri-state severity for SlopCop diagnostic rules.

- `"off"` — rule is disabled
- `"warn"` — violations are reported as warnings
- `"error"` — violations are reported as errors (fails CI)

#### `SlopcopConfigSection` {#symbol-slopcopconfigsection}
- Type: interface
- Source: [source](../../../../scripts/slopcop/config.ts#L17)

##### `SlopcopConfigSection` — Summary
Shared configuration applicable to any SlopCop audit section
(markdown, assets, or symbols).

#### `SlopcopSymbolConfig` {#symbol-slopcopsymbolconfig}
- Type: interface
- Source: [source](../../../../scripts/slopcop/config.ts#L32)
- Extends: [`SlopcopConfigSection`](#symbol-slopcopconfigsection)

##### `SlopcopSymbolConfig` — Summary
Extended section config for the symbol auditor, which has additional
severity knobs for duplicate headings and missing anchors.

#### `SlopcopConfig` {#symbol-slopcopconfig}
- Type: interface
- Source: [source](../../../../scripts/slopcop/config.ts#L49)

##### `SlopcopConfig` — Summary
Top-level SlopCop configuration, typically loaded from `slopcop.config.json`
at the workspace root.

Global fields (`ignoreGlobs`, `ignoreTargets`, `rootDirectories`) are
merged into every section. Per-section overrides refine behaviour for
markdown link, asset reference, and symbol anchor audits respectively.

#### `CONFIG_FILE_NAME` {#symbol-config_file_name}
- Type: const
- Source: [source](../../../../scripts/slopcop/config.ts#L67)

##### `CONFIG_FILE_NAME` — Summary
Default filename for the SlopCop configuration file.

#### `loadSlopcopConfig` {#symbol-loadslopcopconfig}
- Type: function
- Source: [source](../../../../scripts/slopcop/config.ts#L81)
- Returns: [`SlopcopConfig`](#symbol-slopcopconfig)

##### `loadSlopcopConfig` — Summary
Loads and normalises a SlopCop configuration from disk.

If no `overridePath` is given, looks for `slopcop.config.json` in the
workspace root. Returns an empty config object when the default file
is absent; throws if an explicit override path is missing.

##### `loadSlopcopConfig` — Parameters
- `overridePath`: Optional explicit path to a config file.
- `workspaceRoot`: Absolute path to the workspace root.

#### `resolveIgnoreGlobs` {#symbol-resolveignoreglobs}
- Type: function
- Source: [source](../../../../scripts/slopcop/config.ts#L112)
- Parameters: `config`: [`SlopcopConfig`](#symbol-slopcopconfig); `section`: `SectionKey`

##### `resolveIgnoreGlobs` — Summary
Merges global and section-level ignore globs with built-in defaults.

##### `resolveIgnoreGlobs` — Parameters
- `config`: The loaded SlopCop config.
- `defaults`: Built-in ignore globs always applied.
- `section`: Which audit section to resolve globs for.

##### `resolveIgnoreGlobs` — Returns
Combined array of ignore glob patterns.

#### `resolveIncludeGlobs` {#symbol-resolveincludeglobs}
- Type: function
- Source: [source](../../../../scripts/slopcop/config.ts#L131)
- Parameters: `config`: [`SlopcopConfig`](#symbol-slopcopconfig); `section`: `SectionKey`

##### `resolveIncludeGlobs` — Summary
Resolves include globs for a section, falling back to defaults
when no section-level overrides are configured.

##### `resolveIncludeGlobs` — Parameters
- `config`: The loaded SlopCop config.
- `defaults`: Built-in include globs used when the section has none.
- `section`: Which audit section to resolve globs for.

##### `resolveIncludeGlobs` — Returns
Array of include glob patterns.

#### `compileIgnorePatterns` {#symbol-compileignorepatterns}
- Type: function
- Source: [source](../../../../scripts/slopcop/config.ts#L153)
- Parameters: `config`: [`SlopcopConfig`](#symbol-slopcopconfig); `section`: `SectionKey`

##### `compileIgnorePatterns` — Summary
Compiles global and section-level `ignoreTargets` strings into RegExp
instances for link-target matching.

Throws if any pattern string is an invalid regular expression.

##### `compileIgnorePatterns` — Parameters
- `config`: The loaded SlopCop config.
- `section`: Which audit section to compile patterns for.

##### `compileIgnorePatterns` — Returns
Array of compiled RegExp ignore patterns.

#### `resolveRootDirectories` {#symbol-resolverootdirectories}
- Type: function
- Source: [source](../../../../scripts/slopcop/config.ts#L188)
- Parameters: `config`: [`SlopcopConfig`](#symbol-slopcopconfig); `section`: `SectionKey`

##### `resolveRootDirectories` — Summary
Collects root directories from both global and section-level config.

These directories are used as additional resolution roots when
checking relative link targets.

##### `resolveRootDirectories` — Parameters
- `config`: The loaded SlopCop config.
- `section`: Which audit section to resolve roots for.

##### `resolveRootDirectories` — Returns
Array of additional root directory paths.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->
