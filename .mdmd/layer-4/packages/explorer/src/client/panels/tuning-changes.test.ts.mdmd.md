# packages/explorer/src/client/panels/tuning-changes.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/panels/tuning-changes.test.ts

## Authored
### Purpose
Holds the list of changed Tuning settings to what it must be: empty at the defaults, every moved setting in any group and nothing else, the same settings the browser keeps, and a lever found for every control in the template, so that a changed lever always carries its mark.

### Notes
- Written on 2026-11-19 with `tuning-changes.ts`, for Reset to defaults ([the Explorer design](../../../../../../../.mdmd/layer-3/live-documentation-explorer.mdmd.md#competing-layout-preferences)).
- Reads `template.html` as text to list the levers, as `tuning-levers.test.ts` does, since no DOM is needed to list a page's controls. That file maps a control's id to its setting for its own check; this one maps the other way, the direction the panel needs.
