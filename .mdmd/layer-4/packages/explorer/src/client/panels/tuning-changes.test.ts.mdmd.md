# `packages/explorer/src/client/panels/tuning-changes.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/explorer/src/client/panels/tuning-changes.test.ts`
- Generated At: 2026-11-19T21:10:13.952Z

## Authored
### Purpose
Holds the list of changed Tuning settings to what it must be: empty at the defaults, every moved setting in any group and nothing else, the same settings the browser keeps, and a lever found for every control in the template, so that a changed lever always carries its mark.

### Notes
- Written on 2026-11-19 with `tuning-changes.ts`, for Reset to defaults ([the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)).
- Reads `template.html` as text to list the levers, as `tuning-levers.test.ts` does, since no DOM is needed to list a page's controls. That file maps a control's id to its setting for its own check; this one maps the other way, the direction the panel needs.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `readFileSync`
- `node:path` - `path`
- [`tuning-changes.ChangedSetting`](./tuning-changes.ts.mdmd.md#symbol-changedsetting)
- [`tuning-changes.changedSettings`](./tuning-changes.ts.mdmd.md#symbol-changedsettings)
- [`tuning-changes.changedSettingsWords`](./tuning-changes.ts.mdmd.md#symbol-changedsettingswords)
- [`tuning-changes.tuningControlId`](./tuning-changes.ts.mdmd.md#symbol-tuningcontrolid)
- [`local-storage.changedFromDefaults`](../persistence/local-storage.ts.mdmd.md#symbol-changedfromdefaults)
- [`local-storage.getDefaultFilters`](../persistence/local-storage.ts.mdmd.md#symbol-getdefaultfilters)
- [`local-storage.getDefaultTuning`](../persistence/local-storage.ts.mdmd.md#symbol-getdefaulttuning)
- [`types.TuningConfig`](../types.ts.mdmd.md#symbol-tuningconfig) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
