# packages/explorer/src/client/panels/tuning-levers.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/panels/tuning-levers.test.ts
- Generated At: 2026-10-30T16:56:00.933Z

## Authored
### Purpose
Keeps the template's tuning controls in step with the two things they answer to: the help table, so that every control has exactly one short sentence and the template carries none of its own, and the defaults, so that every control starts at the value the state starts at.

### Notes
- Reads `template.html` as text and finds the controls by their `tuning-` ids, since the template is the page's markup and no DOM is needed to list its controls (the Explorer's rule against jsdom tests). The count of 43 is the number of controls on 2026-10-30; a control added or removed changes it on purpose.
- It also checks every control's initial value in the template, a slider's value and readout and a select's chosen option, against `getDefaultTuning` in `local-storage.ts`, finding each control's setting from its id. The panel overwrites the controls from the state as it starts, so a stale value showed only before that sync and in the markup; on 2026-10-30 Row Levelness read 0.25 and Axis began at By step against defaults of 2 and By date, and this check is what keeps them from drifting again. A control whose id names no setting fails it too.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `readFileSync`
- `node:path` - `path`
- [`tuning-levers.TUNING_HELP`](./tuning-levers.ts.mdmd.md#symbol-tuning_help)
- [`tuning-levers.tuningHelpId`](./tuning-levers.ts.mdmd.md#symbol-tuninghelpid)
- [`local-storage.getDefaultTuning`](../persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`types.TuningConfig`](../types.ts.mdmd.md#symbol-tuningconfig) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
