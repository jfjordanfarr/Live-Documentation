# Parity: the page, the command line and the pipeline

_A proposal, current, authored. As of 2026-11-22. Nothing in it is decided; the form that keeps it true is a fork put to the owner below._

## Metadata

- Layer: 2
- Audience: the owner; the root agent ranking work; builders adding to the page or the command line

## Why it exists

The owner, 2026-11-21: "The primary user of the browser form is human users. The primary user of the CLI form is AI agents. Both need everything we give. They just enjoy it in different formats", and in the next message, that the command line "should also have an audience of _CICD pipelines_!" The guide's fourth value says each gets everything in its own form. Until this table nobody could say how far that is true. Each row is something a person can learn or do in the Explorer, set against the command, file or exported data that gives an agent or a pipeline the same fact or the same effect. Equivalent means the same fact, not the same gesture.

A row says "yes" only where the command was run and seen to answer, on the estate sample or this repository, on 2026-11-22. What was run, its output and its timing are in [the record](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/parity/README.md), as are the 24 scored runs of agents given only the command line. The commands below are written `live-docs <command>`; today that is `npm --prefix <checkout> run live-docs:<command> --`, and the one-word form is a wrapper made for the test (see the gaps).

## The page against the command line

| In the page | For an agent or a pipeline | Equivalent? |
| --- | --- | --- |
| **Knowledge Sources** | | |
| Entry points by reason, what they reach, what nothing reaches, what is not read, what only tests reach | `inspect --reachable` (`--json`) | yes |
| The disconnected groups and the lone files | `inspect --groups` (`--json`) | yes |
| "Reachable from" a file | `inspect --from <file> --reachable` | yes |
| "Reachable from" a directory | none: a directory is not a `--from` or `--to` | no: lacks part |
| The counts: files, links, references, dependencies outside the scan | `inspect --groups` counts files; `generate` counts docs; no command totals links or references | no: lacks part |
| Most used and most using files | none; `index.json` holds each file's inbound and outbound, unranked | no: no command |
| Symbols nothing references | none | no: no command |
| What a file's authored words cite, and what cites it | `inspect --from <file> --json`, its `documents.cites` and `documents.citedBy` (not in the text output) | yes, as JSON only |
| Download the docs as markdown or a zip | the docs are files on disk after `generate` | yes, as files |
| Download the panel's facts as JSON | `inspect --reachable --json`, `inspect --groups --json` | yes |
| **World Map** | | |
| Things, regions, doors, wires with their basis, ghosts, what each stands on | `board <board.md>` | yes |
| A wire's evidence: which files make it | `board` prints a count (`x13`) and the basis, not the files | no: lacks part |
| A thing's files | `board` prints the folder and a count | no: lacks part |
| **Local Map, 2D and 3D** | | |
| A file's direct users and uses | `inspect --from <file> --reachable --direction inbound` (or `outbound`) `--max-depth 1` | yes |
| A file's neighbourhood a few hops out | the same with `--max-depth <n>` | yes |
| Which symbols carry each reference between two files | the Live Doc's Dependencies lines; `inspect --from A --to B --verbose` names no symbols today | yes, as files; the command lacks part |
| A folder opened: its files and how they connect inside and out | none | no: no command |
| Several pinned files with every reference among them | none | no: no command |
| **Search and the path** | | |
| Find a directory, file or symbol by a few words | none; `grep` over the docs | no: no command |
| The shortest path between two files, its hops in order | `inspect --from A --to B` | yes |
| The path between two symbols | `inspect --from A#S --to B#T` | yes |
| A path to or from a directory | refused: `Unable to resolve --to 'PaymentService'` | no: lacks part |
| No path this way: the reverse question offered | prints "No dependency path found … (outbound)" and a frontier; offers no reverse | no: lacks part |
| **The reader** | | |
| Purpose, symbols, dependencies, Notes | the file's Live Doc | yes, as files |
| **The history** | | |
| A file at a moment: whether it stood, its symbols, lines and links | `inspect --at <commit> --from <file>` | yes |
| What changed between two moments | `inspect --between <a> <b>` | yes |
| Reach from the entries at a moment | `inspect --at <commit> --reachable` | yes |
| The words of a file at a moment | `inspect --at <commit> --from <file> --words` | yes |
| A path at a moment | `inspect --at <commit> --from A --to B` gives the links between the two, not a path | no: lacks part |
| Who made a step (the authors toggle) | none | no: no command |
| **Links** | | |
| A link that opens the same view for someone else | no command prints an Explorer address; its form is written only in this repository's skill | no: no command |

**Totals:** 31 rows; 17 with an equivalent (4 of them only as files or JSON), 14 gaps.

## The gaps by cause

- **No command exists** (7): most used; symbols nothing references; a folder and how its files connect; the pinned set's references; search by words; the authors of a step; an Explorer link for a view.
- **A command exists and lacks part** (7): a directory as a start; a directory as an end; the totals of links and references; a wire's files; a thing's files; the reverse question; a path at a moment. Beside them, a row counted as having its equivalent in the docs: `inspect --from A --to B` names no symbols, which the 2D map draws.
- **Output not of a stable or bounded shape** (2, apart from the rows): `lint` prints its warnings in a different order on each run of the same docs; `inspect --from <file> --direction inbound` without `--reachable` prints every terminal path whole (ten paths of up to eleven files for one estate file, limit 200), not the file's users.
- **Asks a question mid-run or needs a network:** none found. Every command finished with its input closed, opened no network connection under `strace`, and gave the same exit in a namespace with no network.
- **Only a script of this repository** (3): every command is an npm script of this checkout, so a stranger's agent gets no command on its path and its `--help` begins `npm run live-docs:inspect --`; `live-docs:orphans` reads `.mdmd/layer-4` whatever the folder's configuration says, and fails on any other folder; the audits and link enforcement (`slopcop:*`, `docs:links:enforce`) are this repository's own checks.
- **The command line can do what the page cannot** (4): `generate --check`, which fails when the committed docs are stale; `lint`; `--between` any two commits, where the page steps; and `--json` of every answer.

## What is the page's by nature

None of these is a fact; each is how a person sees facts, so the command line needs none.

- The camera: orbit, zoom, pan, fit and centre. A view has no camera in text.
- Motion between 2D and 3D, and the transitions of opening and following. They keep a person's bearings; text has none to keep.
- Layout and Tuning's levers, the palette and the frame. They place pictures.
- Hover peeks, focus rings and the key. They explain a drawing.
- Back and Forward. A shell's history is its own.
- Labels kept clear of each other, directory bands and membranes. They are drawing.
- Dragging a World Map piece. The effect worth keeping is the board's text, which is a file.

## For a pipeline

Each command run twice on the same input, with its input closed (2026-11-22, estate copies and a two-commit repository made from it).

| Command | Exit codes seen | Same input, same bytes? | Can it prompt? | Network? |
| --- | --- | --- | --- | --- |
| `generate` | 0 | rerun over existing docs: yes; from nothing: no, every doc's `Generated At` and `index.json`'s `generatedAt` differ | no | no |
| `generate --check` | 0 current; 1 stale | yes | no | no |
| `generate --dry-run` | 0, stale or not | yes | no | no |
| `lint` | 0; 1 on a doc that does not parse | no: warnings in another order each run | no | no |
| `inspect` (any, `--json`) | 0; 1 on an unknown file or option | yes | no | no |
| `board <file>` | 0; 1 on a missing or malformed board, with the line | yes | no | no |
| `history` | 0 | yes, resumed and from nothing | no | no |
| `visualize` | 0 | yes | no | no |
| audits, link enforcement | this repository's scripts; not run on another folder | | | |

## A fork for the owner: how this table is kept true

The record proposes a ledger a test reads, as the oracles' registers of measured misses are held. Root decides; the builder's recommendation is the ledger.

- **A ledger and a test.** A committed `parity.json` with one entry for each row: the page's ability, the command and its arguments over the estate sample, a fact its output must hold (`Hub/PaymentHub.cs` among the four users of `IPaymentService.cs`), or, for a gap, its cause. The integration test runs each command and fails when an equivalent stops answering, when a listed gap starts answering (so the row moves to "yes" in the same commit), and when the page's template gains a control that no entry and no line of the page's-by-nature list names. This document is then printed from the ledger. Cost: about 25 runs of the CLI at 1 to 3 s each, so 40 to 70 s of the integration suite; one entry in the same commit as each new control or command; and a rule for what counts as a control, which is the hard part.
- **The table alone, reviewed by hand.** No cost now; it rots the first time a control is added without a row.
- **The agents' runs as the check.** Score blind agents given only the command line on the page testers' tasks, as the record did. It measures what matters, an agent's answers, but costs minutes and money each time and cannot run in the gate.
