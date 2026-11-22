# `tests/integration/programs/csharp/names/App/Overloads.cs`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/programs/csharp/names/App/Overloads.cs`
- Generated At: 2026-11-22T07:11:41.151Z

## Authored
### Purpose
The overloads case of the documentation reference: a class whose methods share a name and are told apart only by what their parameters' types are written with (an array's mark and its rank, `ref` and `out`, a generic type's arguments, `params`), and a class whose documentation names each of them within this file, references no overload answers, and an alias-qualified name the compiler's grammar does not take. The compiler's answer for each is kept in `expected/csharp-compiler.json`, declaration by declaration, and the C# oracle's test holds the reader to it, a reference within its own file as any other.

### Notes
- Written on 2026-11-22 after an independent review found the reader linking two overloads for a reference to one, and an overload of the same count where none matched, unseen by an oracle that compared only pairs of files ([the review](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/engine-review/README.md); [the record of the mend](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/authors-word/README.md)). Its code makes no edge to another file.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Mixer (class)` {#symbol-mixer-class}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L6)

##### `Mixer (class)` — Summary
Overloads told apart only by what their parameters' types are written with.

#### `Mixer (constructor overload 1)` {#symbol-mixer-constructor-overload-1}
- Type: constructor
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L8)

#### `Mixer (constructor overload 2)` {#symbol-mixer-constructor-overload-2}
- Type: constructor
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L9)
- Parameters: `other`: [`Mixer`](#symbol-mixer-class)

#### `Mix (method overload 1)` {#symbol-mix-method-overload-1}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L10)
- Parameters: `a`: [`Mixer`](#symbol-mixer-class)

#### `Mix (method overload 2)` {#symbol-mix-method-overload-2}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L11)
- Parameters: `a`: [`Mixer`](#symbol-mixer-class)

#### `Mix (method overload 3)` {#symbol-mix-method-overload-3}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L12)
- Parameters: `a`: [`Mixer`](#symbol-mixer-class); `b`: [`Mixer`](#symbol-mixer-class)

#### `Grid (method overload 1)` {#symbol-grid-method-overload-1}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L13)
- Parameters: `a`: [`Mixer`](#symbol-mixer-class)

#### `Grid (method overload 2)` {#symbol-grid-method-overload-2}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L14)
- Parameters: `a`: [`Mixer`](#symbol-mixer-class)

#### `Take (method overload 1)` {#symbol-take-method-overload-1}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L15)
- Parameters: `a`: [`Box`](#symbol-box), [`Mixer`](#symbol-mixer-class)

#### `Take (method overload 2)` {#symbol-take-method-overload-2}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L16)
- Parameters: `a`: [`Box`](#symbol-box), [`Mixer`](#symbol-mixer-class)

#### `Opt (method overload 1)` {#symbol-opt-method-overload-1}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L17)
- Parameters: `a`: [`Mixer`](#symbol-mixer-class)

#### `Opt (method overload 2)` {#symbol-opt-method-overload-2}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L18)
- Parameters: `a`: [`Mixer`](#symbol-mixer-class); `rest`: [`Mixer`](#symbol-mixer-class)

#### `Out (method overload 1)` {#symbol-out-method-overload-1}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L19)
- Parameters: `a`: [`Mixer`](#symbol-mixer-class)

#### `Out (method overload 2)` {#symbol-out-method-overload-2}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L20)
- Parameters: `a`: [`Mixer`](#symbol-mixer-class)

#### `Box` {#symbol-box}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L24)

##### `Box` — Summary
A generic type for `Mixer`'s overloads to take.

##### `Box` — Links
- [`Mixer`](#symbol-mixer-class)

#### `MixerNotes` {#symbol-mixernotes}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L36)

##### `MixerNotes` — Summary
Names one overload each, within its own file, as the compiler resolves it:
`Mixer.Mix(Mixer[])`, `Mixer.Mix(ref Mixer)`, `Mixer.Mix(Mixer, Mixer)`,
`Mixer.Grid(Mixer[,])`, `Mixer.Grid(Mixer[])`,
`Mixer.Take(Box<Mixer>)`, `Mixer.Take(Box<Box<Mixer>>)`,
`Mixer.Opt(Mixer, Mixer[])`, `Mixer.Out(out Mixer)`, `Mixer.Out(Mixer)`,
`Mixer.Mixer(Mixer)`; and names none where no overload has the parameters written:
`Mixer.Mix(Box<Mixer>)`, `Mixer.Mix(Mixer,)`, `Mixer.Out(ref Mixer)`,
`Mixer.Mixer(Box<Mixer>)`; and an alias-qualified name the compiler's grammar does not take, `:Mixer`.

##### `MixerNotes` — Links
- `M::Mixer`
- [`Mixer.Grid(Mixer[,])`](#symbol-grid-method-overload-1)
- [`Mixer.Grid(Mixer[])`](#symbol-grid-method-overload-2)
- `Mixer.Mix(Box<Mixer>)`
- [`Mixer.Mix(Mixer, Mixer)`](#symbol-mix-method-overload-3)
- `Mixer.Mix(Mixer,)`
- [`Mixer.Mix(Mixer[])`](#symbol-mix-method-overload-1)
- [`Mixer.Mix(ref Mixer)`](#symbol-mix-method-overload-2)
- `Mixer.Mixer(Box<Mixer>)`
- [`Mixer.Mixer(Mixer)`](#symbol-mixer-constructor-overload-2)
- [`Mixer.Opt(Mixer, Mixer[])`](#symbol-opt-method-overload-2)
- [`Mixer.Out(Mixer)`](#symbol-out-method-overload-2)
- [`Mixer.Out(out Mixer)`](#symbol-out-method-overload-1)
- `Mixer.Out(ref Mixer)`
- [`Mixer.Take(Box<Box<Mixer>>)`](#symbol-take-method-overload-2)
- [`Mixer.Take(Box<Mixer>)`](#symbol-take-method-overload-1)

#### `Gatherer` {#symbol-gatherer}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L39)

##### `Gatherer` — Summary
Uses another file's type only as the type of a `params` parameter.

#### `Gather` {#symbol-gather}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Overloads.cs#L41)
- Parameters: `parts`: [`Derived`](./Derived.cs.mdmd.md#symbol-derived)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`Derived`](./Derived.cs.mdmd.md#symbol-derived)
<!-- LIVE-DOC:END Dependencies -->
