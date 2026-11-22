# `tests/integration/programs/csharp/names/App/Inheritance.cs`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/programs/csharp/names/App/Inheritance.cs`
- Generated At: 2026-11-22T07:28:58.871Z

## Authored
### Purpose
The inheritance and type-parameter case of the documentation reference: members named through a type that only inherits them, from that type's own comment and through its name from another class, which the C# compiler binds to nothing; the same members named through the type that declares them, which it binds; and a generic type's and a generic method's members named with their type parameters renamed (`Holder{X}.Put(X)`, `Holder{X}.Echo{U}(U)`), which it binds by position. The compiler's answer for each is kept in `expected/csharp-compiler.json` and the C# oracle's test holds the reader to it, declaration by declaration.

### Notes
- Written on 2026-11-22 after the engine review's third pass found the reader linking a member through a type that only inherits it and leaving a renamed type parameter's reference as text ([the review](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/engine-review/README.md); [the record of the mend](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/authors-word/README.md)). Root's ruling: the link is what the compiler binds. Its code makes no edge to another file.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Parent` {#symbol-parent}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Inheritance.cs#L4)

##### `Parent` — Summary
A type whose members a deriving type only inherits.

#### `Grow (method overload 1)` {#symbol-grow-method-overload-1}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Inheritance.cs#L6)
- Parameters: `a`: [`Parent`](#symbol-parent)

#### `Shrink` {#symbol-shrink}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Inheritance.cs#L7)
- Parameters: `a`: [`Parent`](#symbol-parent)

#### `Layout` {#symbol-layout}
- Type: property
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Inheritance.cs#L8)

#### `Child` {#symbol-child}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Inheritance.cs#L15)
- Extends: [`Parent`](#symbol-parent)

##### `Child` — Summary
Names, from its own comment, members it only inherits, which the compiler does not find:
`Shrink(Parent)`, `Layout`, `Grow(Parent)`; and its own, `Grow(Parent[])`.

##### `Child` — Links
- `Grow(Parent)`
- [`Grow(Parent[])`](#symbol-grow-method-overload-2)
- `Layout`
- `Shrink(Parent)`

#### `Grow (method overload 2)` {#symbol-grow-method-overload-2}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Inheritance.cs#L17)
- Parameters: `a`: [`Parent`](#symbol-parent)

#### `Holder` {#symbol-holder}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Inheritance.cs#L21)

##### `Holder` — Summary
A generic type and a generic method, named below with their type parameters renamed.

#### `Put` {#symbol-put}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Inheritance.cs#L23)
- Parameters: `item`: `T`

#### `Echo` {#symbol-echo}
- Type: method
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Inheritance.cs#L24)
- Parameters: `item`: `M`

#### `InheritanceNotes` {#symbol-inheritancenotes}
- Type: class
- Source: [source](../../../../../../../../tests/integration/programs/csharp/names/App/Inheritance.cs#L34)

##### `InheritanceNotes` — Summary
Names members through a type that only inherits them, which the compiler does not find:
`Child.Shrink(Parent)`, `Child.Shrink`, `Child.Layout`, `Child.Grow(Parent)`;
through the type that declares them, which it does: `Parent.Shrink(Parent)`, `Child.Grow(Parent[])`;
and a generic's members with its type parameters renamed, which it binds by position:
`Holder<X>.Put(X)`, `Holder<X>.Echo<U>(U)`, `Holder<T>.Put(T)`.

##### `InheritanceNotes` — Links
- `Child.Grow(Parent)`
- [`Child.Grow(Parent[])`](#symbol-grow-method-overload-2)
- `Child.Layout`
- `Child.Shrink`
- `Child.Shrink(Parent)`
- [`Holder<T>.Put(T)`](#symbol-put)
- [`Holder<X>.Echo<U>(U)`](#symbol-echo)
- [`Holder<X>.Put(X)`](#symbol-put)
- [`Parent.Shrink(Parent)`](#symbol-shrink)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
