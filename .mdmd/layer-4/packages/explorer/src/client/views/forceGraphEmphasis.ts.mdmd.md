# packages/explorer/src/client/views/forceGraphEmphasis.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/forceGraphEmphasis.ts
- Generated At: 2026-10-31T21:21:48.181Z

## Authored
### Purpose
Says how a step of the history tells its changed files apart in the 3D picture: a changed sphere's colour lifted toward white, an unchanged one's alpha reduced, by the tuning's mode, with a strength that fades over the play's interval while the history plays and holds at rest.

### Notes
Written on 2026-10-31 for the owner's ask in [Turn 8 of the October 31 record](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-8): "As the history plays, we should get a glow around files which changed in a commit, which dims by the time the next commit's changes are played. Whether the "glow" is performed by dimming nodes which are not participating in a commit or by finding some other way to visually highlight the nodes which are in play in a given commit will be a matter of taste, and worth trying many permutations." So the modes are a lever (`ChangeEmphasis`: glow, dim, both, none) and the module is pure, so that the view, the history control and a test agree on the colours. The glow lifts each channel seven tenths of the way to white at full strength and draws the sphere whole; the dimming leaves a fifth of the alpha; a changed wire rises toward .85. The fade is linear from the step's arrival to the next step's, the play's interval; at rest the strength is one, so that a person who stops at a step sees what it changed. `pairKey` names an undirected pair so that the control and the view agree on which wires a step added or changed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `glows` {#symbol-glows}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L23)

##### `glows` — Summary
Whether the mode glows the changed.

#### `dims` {#symbol-dims}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L25)

##### `dims` — Summary
Whether the mode dims the unchanged.

#### `emphasisStrength` {#symbol-emphasisstrength}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L31)

##### `emphasisStrength` — Summary
The strength of the emphasis at `now`: one while the history rests; while it plays, falling from one at the step's
arrival to nothing at the next step's, `interval` later. Nothing before the arrival.

#### `emphasizedSphere` {#symbol-emphasizedsphere}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L48)
- Parameters: `mode`: [`ChangeEmphasis`](../types.ts.mdmd.md#symbol-changeemphasis)

##### `emphasizedSphere` — Summary
A sphere's colour under the emphasis, as `rgba()`: a changed sphere's lifted toward white by the strength and drawn
whole, an unchanged one's alpha reduced by the strength, where the mode says so; otherwise the colour at its alpha.

#### `emphasizedWireAlpha` {#symbol-emphasizedwirealpha}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L60)
- Parameters: `mode`: [`ChangeEmphasis`](../types.ts.mdmd.md#symbol-changeemphasis)

##### `emphasizedWireAlpha` — Summary
A white reference wire's alpha under the emphasis: a changed wire's raised toward the glow, an unchanged one's reduced, where the mode says so.

#### `pairKey` {#symbol-pairkey}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/forceGraphEmphasis.ts#L68)

##### `pairKey` — Summary
The key of an undirected pair of files, the same whichever end is named first.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ChangeEmphasis`](../types.ts.mdmd.md#symbol-changeemphasis) (type-only)
<!-- LIVE-DOC:END Dependencies -->
