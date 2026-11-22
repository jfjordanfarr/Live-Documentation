# `packages/stored-form/test/storedForm.fuzz.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/stored-form/test/storedForm.fuzz.test.ts`
- Generated At: 2026-11-22T02:13:56.305Z

## Authored
### Purpose
The standing fuzzer of the stored form's reader: 800 mutants of two valid files, each made from its seed alone (bits flipped, cuts, lengths and counts that lie, bytes put in and taken out, frames doubled and swapped, noise, and a section that inflates to 256 MiB), read in a worker that the test stops if an answer takes ten seconds and whose memory it bounds. Every mutant must give facts or a refusal, never a crash or a hang.

### Notes
Its second case reads the same mutants with a deliberately careless reader and holds that the fuzzer finds it out, so that the first case is a test that can fail. Run once on 2026-11-22 against the careless reader, the first case went red: crashes on cuts and noise, 1.5 GB held on the bombs, and a hang at seed 19 ([the record](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/stored-form-module/README.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:url` - `pathToFileURL`
- `node:worker_threads` - `Worker`
- `node:zlib` - `constants`, `deflateRawSync`
- [`storedForm.writeScan`](../src/storedForm.ts.mdmd.md#symbol-writescan)
- [`testScans.everyFact`](./testScans.ts.mdmd.md#symbol-everyfact)
- [`testScans.seededScan`](./testScans.ts.mdmd.md#symbol-seededscan)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
