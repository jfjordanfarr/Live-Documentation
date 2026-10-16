# packages/engine/src/live-docs/adapters/pom.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/pom.ts
- Generated At: 2026-10-16T16:21:41.114Z

## Authored
### Purpose
The adapter for Maven project files (`pom.xml`, matched by its exact name): the artifact `groupId:artifactId` as the file's one `package` symbol (the groupId taken from `<parent>` when the project states none), the parent and the dependencies it stands on, and the main class its build names as the entry it declares. It carries its own small XML reader, `readXmlElements`, so that the project's `<dependencies>` are told from those of `<dependencyManagement>`, plugins and profiles without an XML library.

### Notes
- Written on 2026-10-16 for the manifests the `reachable` build of October 15 had left for a later pass ([the October 15–16 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-15.1.SUMMARIZED.md#turn-4)), approved by the owner on 2026-10-16 ([Turn 3 of the October 16 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)), where the agent had said this format needs no new dependency.
- The reader keeps elements and their text, CDATA included, and drops comments, processing instructions, the doctype, attributes and namespace prefixes; a close tag closes the nearest open element of its name. `childAt`, `childrenAt` and `textAt` address elements by path.
- Read: `<parent>`, linked to the `pom.xml` at its `<relativePath>` (`../pom.xml` unless written; a folder gets `pom.xml` appended; an empty one means the repository) when the workspace holds it, external as `groupId:artifactId@version` otherwise; each `<dependency>` directly under the project's `<dependencies>`, linked to the workspace `pom.xml` publishing `groupId:artifactId` or external. A `${property}` resolves from `<properties>`, the project's and the parent's coordinates and `basedir`, repeatedly, and is kept as written when it cannot be resolved; properties a parent defines are not inherited. A dependency whose version `<dependencyManagement>` settles is written without one.
- Not read: `<dependencyManagement>`, plugins and their dependencies, `<profiles>`, `<modules>` (what a parent contains), and `<pluginManagement>`.
- Declared: the main class named by `exec-maven-plugin`, `maven-jar-plugin`, `maven-assembly-plugin`, `maven-shade-plugin` or `spring-boot-maven-plugin` (`<mainClass>` or `<Main-Class>` anywhere in the plugin's configuration or executions) or by the `<start-class>` property, as a `command` named by the artifactId, on `<sourceDirectory or src/main/java>/<package path>/<Class>.java`; a nested class's `$` part is dropped. Several that agree declare one entry. Measured by `pom.test.ts` and `tests/integration/live-docs/manifests.test.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `XmlElement` {#symbol-xmlelement}
- Type: interface
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/pom.ts#L47)

##### `XmlElement` — Summary
An element of an XML document: its local name, its children, and the text directly inside it.

#### `readXmlElements` {#symbol-readxmlelements}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/pom.ts#L71)
- Returns: [`XmlElement`](#symbol-xmlelement)

##### `readXmlElements` — Summary
Reads an XML document into its elements: tags, text and CDATA kept;
comments, processing instructions and the doctype passed over; attributes
and namespace prefixes dropped, since a POM carries its facts in elements.
A close tag closes the nearest open element of its name, so that a stray
one does not unbalance the rest. Returns a document element whose children
are the root elements.

#### `childAt` {#symbol-childat}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/pom.ts#L150)
- Returns: [`XmlElement`](#symbol-xmlelement)
- Parameters: `element`: [`XmlElement`](#symbol-xmlelement)

##### `childAt` — Summary
The first child element at the path of names below `element`.

#### `childrenAt` {#symbol-childrenat}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/pom.ts#L159)
- Returns: [`XmlElement`](#symbol-xmlelement)[]
- Parameters: `element`: [`XmlElement`](#symbol-xmlelement)

##### `childrenAt` — Summary
Every element at the path of names below `element`.

#### `textAt` {#symbol-textat}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/pom.ts#L168)
- Parameters: `element`: [`XmlElement`](#symbol-xmlelement)

##### `textAt` — Summary
The trimmed text of the element at the path, or `undefined` when there is none or it is empty.

#### `pomAdapter` {#symbol-pomadapter}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/pom.ts#L201)
- Returns: [`LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter)

##### `pomAdapter` — Summary
Language adapter for `pom.xml`: the artifact as a symbol, its parent and dependencies, and the main class its build starts.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- [`index.LanguageAdapter`](./index.ts.mdmd.md#symbol-languageadapter) (type-only)
- [`manifest.ManifestContext`](./manifest.ts.mdmd.md#symbol-manifestcontext-interface)
- [`manifest.ManifestDependencies`](./manifest.ts.mdmd.md#symbol-manifestdependencies)
- [`manifest.manifestContext`](./manifest.ts.mdmd.md#symbol-manifestcontext-function)
- [`manifest.packageSymbols`](./manifest.ts.mdmd.md#symbol-packagesymbols)
- [`manifest.publishedName`](./manifest.ts.mdmd.md#symbol-publishedname)
- [`manifest.sortDeclared`](./manifest.ts.mdmd.md#symbol-sortdeclared)
- [`manifest.workspaceFile`](./manifest.ts.mdmd.md#symbol-workspacefile)
- [`coreTypes.DeclaredEntry`](../coreTypes.ts.mdmd.md#symbol-declaredentry) (type-only)
- [`coreTypes.SourceAnalysisResult`](../coreTypes.ts.mdmd.md#symbol-sourceanalysisresult) (type-only)
<!-- LIVE-DOC:END Dependencies -->
