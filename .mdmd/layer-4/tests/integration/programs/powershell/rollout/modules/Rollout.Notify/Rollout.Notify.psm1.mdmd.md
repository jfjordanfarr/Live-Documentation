# tests/integration/programs/powershell/rollout/modules/Rollout.Notify/Rollout.Notify.psm1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/powershell/rollout/modules/Rollout.Notify/Rollout.Notify.psm1
- Generated At: 2026-10-16T21:50:05.257Z

## Authored
### Purpose
The rollout program's notices: writes a line telling the operators what a rollout did, through a formatter and a private prefix; the entry script imports it and sends one notice at its end.

### Notes
- Written on 2026-10-16 to measure an export list that only a run can read: its public functions are listed once in `$public` and exported with `Export-ModuleMember -Function $public`, as an estate's modules often do. PowerShell exports `Send-RolloutNotice` and `Format-RolloutNotice` when the module runs; a reading of the text cannot know what `$public` holds, so the oracle and the adapter both publish every function, the private `Get-NoticePrefix` too, which shows a private function rather than hiding public ones ([the decision](../../../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#powershell-read-by-a-grammar-of-our-own-measured-against-powershells-own-parser-recorded-2026-10-16)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Send-RolloutNotice` {#symbol-send-rolloutnotice}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/powershell/rollout/modules/Rollout.Notify/Rollout.Notify.psm1#L13)

##### `Send-RolloutNotice` — Summary
Writes a notice of the rollout for the operators.

##### `Send-RolloutNotice` — Parameters
- `Message`: What the notice says.

#### `Format-RolloutNotice` {#symbol-format-rolloutnotice}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/powershell/rollout/modules/Rollout.Notify/Rollout.Notify.psm1#L25)

##### `Format-RolloutNotice` — Summary
Formats a notice: the prefix and the message.

##### `Format-RolloutNotice` — Parameters
- `Message`: What the notice says.

#### `Get-NoticePrefix` {#symbol-get-noticeprefix}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/programs/powershell/rollout/modules/Rollout.Notify/Rollout.Notify.psm1#L30)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
