# packages/server/src/features/changeEvents/changeQueue.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/changeEvents/changeQueue.ts
- Live Doc ID: LD-implementation-packages-server-src-features-changeevents-changequeue-ts
- Generated At: 2026-01-12T21:47:40.500Z

## Authored
### Purpose
Provides a debounced queue for batching workspace file change events before processing. When files are saved rapidly (e.g., during a large refactor or IDE auto-save), this queue coalesces multiple changes to the same URI and flushes them together after a configurable debounce window.

### Notes
- Uses `setTimeout`/`clearTimeout` via globalThis wrappers to remain environment-agnostic.
- The `onFlush` callback receives the batched changes for downstream processing (e.g., Live Doc regeneration triggers).
- Debounce window is configurable via `updateDebounceWindow()` and defaults to the value provided at construction.
- Calling `dispose()` cancels any pending flush and clears the queue.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-12T21:47:40.500Z","inputHash":"fcfffda7f859eb83"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `QueuedChange` {#symbol-queuedchange}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/changeEvents/changeQueue.ts#L12)

#### `ChangeQueue` {#symbol-changequeue}
- Type: class
- Source: [source](../../../../../../../packages/server/src/features/changeEvents/changeQueue.ts#L24)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
