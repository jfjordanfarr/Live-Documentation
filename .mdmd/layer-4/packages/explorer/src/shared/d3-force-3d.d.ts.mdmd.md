# packages/explorer/src/shared/d3-force-3d.d.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/shared/d3-force-3d.d.ts
- Generated At: 2026-10-22T18:45:25.899Z

## Authored
### Purpose
Supplies the verified TypeScript contract for the untyped d3-force-3d library used by the Local Map and layout lab.

### Notes
The installed library publishes no declarations, and no corresponding DefinitelyTyped package was available when this binding was added. This ambient source module covers the API actually used, checked against version 3.0.6; importing it contributes types and emits no implementation. On 2026-10-17 it gained `forceRadial`, the many-body force's `distanceMax`, `distanceMin` and `theta`, and the simulation's `alphaMin` and `alphaTarget`, each read from the library's source for the restoring forces of [the change-over-time plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions) (C5, and C2 to come). The simulation itself remains the packaged upstream library.

Created for [the October 13 shared-preset implementation](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-6--shared-presets-and-advanced-tuning-approved-for-implementation).

Renamed from `d3-force-3d.ts` to `d3-force-3d.d.ts` on 2026-10-22, when the base tsconfig moved to `NodeNext` resolution: under it a `.ts` file's `declare module` for a package that resolves is read as an augmentation of that untyped package and refused (TS2665), while a declaration file is the ambient contract it was always meant to be; `forceGraphLayout.ts` no longer imports it for its side effect, which the bundler could not resolve once no `.ts` stood there, and the browser client's and the tests' projects name it in their `include` instead ([the decision](../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#no-formatter-for-typescript-lint-for-correctness-on-eslint-10-and-the-tsconfig-off-baseurl-and-node10-recorded-2026-10-22)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
