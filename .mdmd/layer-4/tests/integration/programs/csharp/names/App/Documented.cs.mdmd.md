# `tests/integration/programs/csharp/names/App/Documented.cs`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/programs/csharp/names/App/Documented.cs`
- Generated At: 2026-11-22T02:42:24.620Z

## Authored
### Purpose
The documentation-reference case: a class whose code uses nothing and whose documentation comments name other files' declarations, one `cref` of each kind worth telling apart (a type, a member, a nested type, a generic beside the type of its name, each of two overloads in two parts of a partial class, the overloads' name alone, a namespace, a name nothing declares, a type of a project this one does not reference), on `see`, `seealso`, `inheritdoc`, `exception` and `permission`. The C# compiler's resolution of each is kept in `expected/csharp-compiler.json` and held, in words, by the C# oracle's test, so that a reader drawing an author's documentation reference is measured against the compiler before it is built.

### Notes
- Written on 2026-11-22 for the owner's ruling of 2026-11-21 that an author's documentation reference is to be honoured ([the work item](../../../../../../../../AI-Agent-Workspace/Work/readers-on-main.md#a-documentation-comments-reference-is-drawn-as-the-authors-word); [the record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/authors-word/README.md)). Every pair it names is one only the author's word makes: the compiler binds none of them through code.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Documented` {#symbol-documented}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Documented.cs#L13)

##### `Documented` — Summary
Uses nothing in its code; its documentation names other files' declarations, one of each kind:
a type, `Base`; a member, `Base.Gadget`; a nested type, `Base.Options`;
a generic, `Lib.Helper<T>`, beside the type of the same name without one, `Lib.Helper`;
one overload, `Runner.Run(Runner.Count)`, and the other, declared in another file,
`Runner.Run(Runner.Text)`; the overloads' name alone, `Runner.Run`;
a namespace, which no other reference here reaches into, `App.Other`; and a name nothing declares,
`Missing`.

##### `Documented` — Links
- `App.Other`
- [`Base`](./Base.cs.mdmd.md#symbol-base)
- [`Base.Gadget`](./Base.cs.mdmd.md#symbol-gadget)
- [`Base.Options`](./Base.cs.mdmd.md#symbol-options)
- [`Derived`](./Derived.cs.mdmd.md#symbol-derived) (permission)
- [`Lib.Helper`](./Helper.cs.mdmd.md#symbol-helper)
- [`Lib.Helper<T>`](./HelperOfT.cs.mdmd.md#symbol-helper)
- `Missing`
- [`Runner.Run`](./Runner.Text.cs.mdmd.md#symbol-run)
- [`Runner.Run`](./Runner.cs.mdmd.md#symbol-run)
- [`Runner.Run(Runner.Count)`](./Runner.cs.mdmd.md#symbol-run)
- [`Runner.Run(Runner.Text)`](./Runner.Text.cs.mdmd.md#symbol-run)

##### `Documented` — Unsupported Doc Tags
- `permission`

#### `Gadget` {#symbol-gadget}
- Type: property
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Documented.cs#L17)

##### `Gadget` — Exceptions
- `Lib.Thing`: A type of a project this one does not reference.

##### `Gadget` — Links
- [`Base.Gadget`](./Base.cs.mdmd.md#symbol-gadget) (inheritdoc)
- `Lib.Thing` (exception)

##### `Gadget` — Additional Documentation
- <inheritdoc cref="Base.Gadget"/>
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
