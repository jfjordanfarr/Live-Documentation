# packages/explorer/src/client/views/localView/render.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/render.ts
- Generated At: 2026-10-12T18:02:21.937Z

## Authored
### Purpose
Draws every Local Map scope through one directory-aware, optimized scene: a direct file neighborhood, retained branches, an opened directory or an explicit path.

### Notes
- The rendering boundary originated in the December 4, 2025 Local Map extraction. The [owner's walkthrough](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-12.1.record.md#turn-3) exposed that unpinned links and paths still selected the older renderers; all scopes now use the branch stage and router.
- Reuse the stage within a mode to preserve motion and identity. A path borrows the view with its own first-file fit; switching to or from it replaces the stage, while the controller restores the exploration camera on Clear.
- Scope selection belongs to branches.ts. This module manages the shared render lifecycle and camera, not another set of layout rules.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `renderLocalView` {#symbol-renderlocalview}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/render.ts#L5)
- Parameters: `controller`: [`LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller)

##### `renderLocalView` — Summary
Draw every Local Map scope with the same cards, directory membranes and optimized layout.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-renderer.createStage`](./branch-renderer.ts.mdmd.md#symbol-createstage)
- [`branch-renderer.renderBranches`](./branch-renderer.ts.mdmd.md#symbol-renderbranches)
- [`controller.LocalViewController`](./controller.ts.mdmd.md#symbol-localviewcontroller) (type-only)
<!-- LIVE-DOC:END Dependencies -->
