# packages/engine/src/live-docs/adapters/powershell.builtins.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/adapters/powershell.builtins.ts
- Generated At: 2026-11-19T20:49:27.291Z

## Authored
### Purpose
The commands PowerShell itself ships, Windows PowerShell 5.1's and PowerShell 7's, every cmdlet and function of the modules PowerShell installs with itself, for the PowerShell adapter: a call of such a name never wires to a workspace file merely because that file is the only one defining it.

### Notes
- Written on 2026-11-19 with the rule "loaded, else unique" ([the probe](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/README.md); [the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#a-powershell-call-reaches-what-its-caller-loads-else-the-only-definition-recorded-2026-11-19)). The root's ruling: a function shadows a cmdlet of the same name, so a definition the caller loads is what runs and its wire is true whatever the name; a shipped name is blocked only at the fallback, which removes dbatools' back-ports in `opt/` (defined only on an older PowerShell, 13 wires the probe found false on 5.1) and keeps a real override; the list comes from PowerShell, not from us, and nothing else is blocked.
- Windows PowerShell 5.1, frozen, is read from Microsoft's published reference: the command pages of every module under `reference/5.1` of MicrosoftDocs/PowerShell-Docs at commit `aedd8efe`, 366 commands in 18 modules (the ISE's and PSReadLine's among them, since 5.1 installs them). PowerShell 7's are those `Get-Command -Module` lists for every module under `$PSHOME` of PowerShell 7.7.0 on Linux, 288 commands in 11 modules; its Windows-only modules are not installed there, and their commands that 5.1 also ships are in the first list. 444 names in all, compared without regard to case. The adapter's tests and the oracle's rules read the same list ([`powershell-wires.ts`](../../../../../../../.mdmd/layer-4/scripts/oracle/powershell-wires.ts.mdmd.md)): it is data about PowerShell, not a reading of it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WINDOWS_POWERSHELL_51_COMMANDS` {#symbol-windows_powershell_51_commands}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/powershell.builtins.ts#L34)

##### `WINDOWS_POWERSHELL_51_COMMANDS` — Summary
Windows PowerShell 5.1's commands, 366.

#### `POWERSHELL_7_COMMANDS` {#symbol-powershell_7_commands}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/powershell.builtins.ts#L104)

##### `POWERSHELL_7_COMMANDS` — Summary
PowerShell 7.7.0's commands as installed on Linux, 288.

#### `SHIPPED_COMMANDS` {#symbol-shipped_commands}
- Type: const
- Source: [source](../../../../../../../packages/engine/src/live-docs/adapters/powershell.builtins.ts#L159)
- Returns: `ReadonlySet`

##### `SHIPPED_COMMANDS` — Summary
Every shipped command's name, case-folded, as PowerShell compares command names.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
