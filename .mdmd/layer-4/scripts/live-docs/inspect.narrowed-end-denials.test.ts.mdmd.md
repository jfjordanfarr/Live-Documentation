# `scripts/live-docs/inspect.narrowed-end-denials.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `scripts/live-docs/inspect.narrowed-end-denials.test.ts`
- Generated At: 2026-11-22T07:26:33.603Z

## Authored
### Purpose
Holds what the command line denies when one end of a path holds the other and no path is found. The test maps a workspace where `src/lone/w.ts` uses `src/lone/z.ts`, and first checks that fact through the command line's own neighbours of `w.ts`. It then asks two questions:

- `--from src/lone --to src --direction both`: the answer must not print either denial as written, because a file of both ends uses another.
- `--from src --to src/lone --direction outbound`: the answer must say that `src/` was taken without `src/lone/`.

### Notes
- Written on 2026-11-22 by the engine review's fourth pass ([its record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/engine-review/README.md#2026-11-22-at-the-close-the-fourth-pass)).
- Two of the day's mends meet in this answer:
  - the sentence of the search both ways, mended in the review's second pass;
  - the rule of nested ends (`endsApart`), under which the outer end is walked without the inner.
- `emitDualDirectionResult` writes its denials from the ends as asked, so `No file of src/lone/ uses a file of src/` is false as printed. The `--direction outbound` answer, `No path runs from src/ to src/lone/ (outbound), nor the other way.`, says nothing of the narrowing.
- When the review committed this file, the case failed at its first denial.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs`
- `node:os`
- `node:path`
- [`generator.generateLiveDocs`](../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
