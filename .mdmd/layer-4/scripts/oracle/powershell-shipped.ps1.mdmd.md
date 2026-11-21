# `scripts/oracle/powershell-shipped.ps1`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/oracle/powershell-shipped.ps1`
- Entry: program
- Generated At: 2026-11-21T05:02:06.235Z

## Authored
### Purpose
Prints, as JSON, the names a clean pwsh session answers by itself: the cmdlets and functions of the modules under `$PSHOME` and of Microsoft.PowerShell.Core, the functions PowerShell defines without a module (`Pause`, `help`, `prompt`) and the aliases it defines at start, each with the command it names. Run as `pwsh -NoProfile -NonInteractive -File scripts/oracle/powershell-shipped.ps1`. It is the source of PowerShell 7's half of the reader's list of shipped names ([`powershell.builtins.ts`](../../packages/engine/src/live-docs/adapters/powershell.builtins.ts.mdmd.md)), and the PowerShell grader runs it to grade that list ([`powershell-wires.ts`](./powershell-wires.ts.mdmd.md)).

### Notes
- Written on 2026-11-21 ([the account](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/powershell-findings.md)), when an independent review found the list gathered with `Get-Command -Module` alone, which lists no module-less function and no alias, and the grader taking the list from the reader itself. On PowerShell 7.7.0 on Linux it gives the 288 commands already listed, 10 functions and 108 aliases. It reads the functions and aliases before listing any module's commands, since listing may import a module and bring its aliases in.
- Windows PowerShell 5.1's half cannot be produced on this machine; the list takes it from Microsoft's documentation and says so where it is written.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
