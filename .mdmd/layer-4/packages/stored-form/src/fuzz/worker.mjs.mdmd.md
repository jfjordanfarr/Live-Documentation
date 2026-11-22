# `packages/stored-form/src/fuzz/worker.mjs`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/stored-form/src/fuzz/worker.mjs`
- Generated At: 2026-11-22T01:36:47.578Z

## Authored
### Purpose
The fuzzer's worker: reads each mutant of a range of seeds with the reader it is given (`readScan`, `resumeFrom` and, where facts came back, `textOf`), measures the most memory each read held over the worker at rest, and posts the outcome after each, so that the test can stop a reader that hangs.

### Notes
A worker, so that a hang or a reader taking the machine's memory is stopped without stopping the test process; it loads the TypeScript source unchanged, by Node's own type stripping.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:v8` - `setFlagsFromString`
- `node:vm` - `runInNewContext`
- `node:worker_threads` - `parentPort`, `workerData`
- [`mutants.mutant`](./mutants.mjs.mdmd.md#symbol-mutant)
<!-- LIVE-DOC:END Dependencies -->
