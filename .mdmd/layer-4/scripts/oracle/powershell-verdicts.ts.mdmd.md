# `scripts/oracle/powershell-verdicts.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/oracle/powershell-verdicts.ts`
- Generated At: 2026-11-21T05:53:29.169Z

## Authored
### Purpose
The hand reading of 222 PowerShell wires of 2026-11-19 ([its rows](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/samples.md)) as a measure the rule can fail: `readVerdicts` reads the committed table, and `scoreVerdicts` sets one corpus's rows beside the calls a reading draws, the rule's over the parser's facts and the adapter's, counting true wires drawn and missed, false wires spared and drawn, and arguable ones apart. `npm run oracle:powershell -- <folder> --verdicts <samples.md> --corpus <name>` prints it ([`powershell-compare.ts`](./powershell-compare.ts.mdmd.md)).

### Notes
- Written on 2026-11-21 ([the account](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/powershell-findings.md)), at the root's request, because the comparison with the parser cannot grade the rule which file a call reaches: both sides hold that rule. The rows of the cold run's shop are named as never scorable, its corpus never committed; a row whose files the folder does not hold is named apart, as a corpus at another commit would give.
- The corpora are fetched by hand, not committed; a test the gate runs could hold the rule to the verdicts only with an extract of their facts committed, which waits for the owner's word.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `HandVerdict` {#symbol-handverdict}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-verdicts.ts#L14)

##### `HandVerdict` — Summary
One judged wire: the call, the function, the file claimed to define it, and the first reader's verdict.

#### `UNCOMMITTED_CORPORA` {#symbol-uncommitted_corpora}
- Type: const
- Source: [source](../../../../scripts/oracle/powershell-verdicts.ts#L27)

##### `UNCOMMITTED_CORPORA` — Summary
The corpora of the table whose files were never committed, so that no row of theirs can be scored.

#### `readVerdicts` {#symbol-readverdicts}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-verdicts.ts#L36)
- Returns: [`HandVerdict`](#symbol-handverdict)[]

##### `readVerdicts` — Summary
The rows of the table: every line `| n | corpus | call | name | defined in | drawn by | sampled for | verdicts | why |`.

#### `VerdictTally` {#symbol-verdicttally}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-verdicts.ts#L60)

##### `VerdictTally` — Summary
How a reading stands to the rows it is set beside.

#### `VerdictScore` {#symbol-verdictscore}
- Type: interface
- Source: [source](../../../../scripts/oracle/powershell-verdicts.ts#L72)

##### `VerdictScore` — Summary
The rows of one corpus set beside the rule's reading and the adapter's.

#### `callKeys` {#symbol-callkeys}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-verdicts.ts#L89)
- Parameters: `calls`: `Iterable`

##### `callKeys` — Summary
Each call of a reading, by its case-folded key, from the grader's `caller → name → definer` keys.

#### `scoreVerdicts` {#symbol-scoreverdicts}
- Type: function
- Source: [source](../../../../scripts/oracle/powershell-verdicts.ts#L120)
- Returns: [`VerdictScore`](#symbol-verdictscore)
- Parameters: `rows`: [`HandVerdict`](#symbol-handverdict)[]; `files`: `ReadonlySet`; `rule`: `Iterable`; `adapter`: `Iterable`

##### `scoreVerdicts` — Summary
Sets the rows of one corpus beside the rule's calls and the adapter's, each a set of grader keys.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
