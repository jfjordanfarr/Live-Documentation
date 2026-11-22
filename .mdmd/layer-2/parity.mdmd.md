# Parity: the page, the command line and the pipeline

_Current, authored. As of 2026-11-22. A proposal in its reading of parity; its rows are held to the commands by a test, as the last section says._

## Metadata

- Layer: 2
- Audience: the owner; the root agent ranking work; builders adding to the page or the command line

## Why it exists

The owner, 2026-11-21: "The primary user of the browser form is human users. The primary user of the CLI form is AI agents. Both need everything we give. They just enjoy it in different formats", and in the next message, that the command line "should also have an audience of _CICD pipelines_!" The guide's fourth value says each gets everything in its own form. Until this table nobody could say how far that is true. Each row is something a person can learn or do in the Explorer, set against the command, file or exported data that gives an agent or a pipeline the same fact or the same effect. Equivalent means the same fact, not the same gesture.

A row says "yes" only where the command was run and seen to answer, on the estate sample or this repository, on 2026-11-22. What was run, its output and its timing are in [the record](../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/parity/README.md), as are the 24 scored runs of agents given only the command line. The commands below are written `live-docs <command>`; today that is `npm --prefix <checkout> run live-docs:<command> --`, and the one-word form is a wrapper made for the test (see the gaps).

## The page against the command line

<!-- parity table: printed from tests/integration/live-docs/parity-ledger.json by scripts/doc-tools/parity-table.ts -->

| In the page | For an agent or a pipeline | Equivalent? |
| --- | --- | --- |
| **Knowledge Sources** | | |
| Entry points by reason, what they reach, what nothing reaches, what is not read, what only tests reach | `inspect --reachable` (`--json`) | yes |
| The disconnected groups and the lone files | `inspect --groups` (`--json`) | yes |
| "Reachable from" a file | `inspect --from <file> --reachable` | yes |
| "Reachable from" a directory | `inspect --from <directory> --reachable`: what a path reaches from any of its files, its own not listed | yes |
| The counts: files, links, references, dependencies outside the scan | `inspect --groups` counts files; no command totals links or references | no: lacks part |
| Most used and most using files | none; the derived `index.json` holds each file's inbound and outbound, unranked | no: no command |
| Symbols nothing references | none | no: no command |
| What a file's authored words cite, and what cites it | `inspect --from <file> --json`, its `documents.cites` and `documents.citedBy` | yes, as JSON only |
| Download the docs as markdown or a zip | the docs are files on disk after `generate` | yes, as files |
| Download the panel's facts as JSON | `inspect --reachable --json`, `inspect --groups --json` | yes |
| **World Map** | | |
| Things, regions, doors, wires with their basis, ghosts, what each stands on | `board <board.md>` | yes |
| A wire's evidence: which files make it | `board <board.md> --files`: under each wire the file that uses and the file it uses, at most 20, the rest counted | yes |
| A thing's files | `board <board.md> --files`: under each thing its files, at most 20, the rest counted | yes |
| **Local Map, 2D and 3D** | | |
| A file's direct users and uses | `inspect --from <file> --reachable --direction inbound` (or `outbound`) `--max-depth 1` | yes |
| A file's neighbourhood a few hops out | the same with `--max-depth <n>` | yes |
| Which symbols carry each reference between two files | the Live Doc's Dependencies lines; `inspect --from A --to B --verbose` names no symbols | yes, as files |
| A folder opened: its files and how they connect inside and out | none | no: no command |
| Several pinned files with every reference among them | none | no: no command |
| **Search and the path** | | |
| Find a directory, file or symbol by a few words | none; `grep` over the docs | no: no command |
| The shortest path between two files, its hops in order | `inspect --from A --to B` | yes |
| The path between two symbols | `inspect --from A#S --to B#T` | yes |
| A path to or from a directory | `inspect --from A --to <directory>` (or a directory as `--from`): the nearest file under it answers | yes |
| A route asked against the direction of dependency, told as asked | `inspect --from A --to B` finds it either way and says each file uses, or is used by, the next; with `--direction` kept to one way, it gives the command for the other | yes |
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
| A link that opens the same view for someone else | no command prints an Explorer address | no: no command |
| **Only the command line, for now** | | |
| (not drawn yet) The declarations a file's documentation names, and the files whose documentation names it: the author's word, never counted as a use | `inspect --from <file>`, after the neighbours, under headings of their own (`--json`: `documentation.names`, `documentation.namedBy`) | the command line's own |

**Totals:** 32 rows; 22 with an equivalent (4 of them only as files or JSON), 9 gaps: 7 with no command, 2 where a command lacks part; and 1 the command line's own, which the page does not draw yet.

<!-- end of the parity table -->

## The gaps by cause

- **No command exists** (7): most used; symbols nothing references; a folder and how its files connect; the pinned set's references; search by words; the authors of a step; an Explorer link for a view.
- **A command exists and lacks part** (2): the totals of links and references; a path at a moment. Five were mended on 2026-11-22: the reverse question, which became the answer itself when the owner chose that a route is told as asked; a wire's files and a thing's files, which `board --files` lists; and a directory as a path's start and end and as the start of a reach, by the engine's `under`, the rule the Explorer's path ends read, checked in the built page (Knowledge Sources: "PaymentService reaches 8 of the other 30 files.", as `inspect --from PaymentService --reachable` counts 8).
- **Output not of a stable or bounded shape:** none now. Two were mended on 2026-11-22: `lint` printed its warnings in another order each run, and now reports in the order of the docs' paths; `inspect --from <file>` without `--to` or `--reachable` printed every terminal path whole (ten paths of up to eleven files for one estate file, limit 200), and now lists the file's direct neighbours, counted, at most 200 a way.
- **Asks a question mid-run or needs a network:** none found. Every command finished with its input closed, opened no network connection under `strace`, and gave the same exit in a namespace with no network.
- **Only a script of this repository** (3): every command is an npm script of this checkout, so a stranger's agent gets no command on its path and its `--help` begins `npm run live-docs:inspect --`; `live-docs:orphans` read `.mdmd/layer-4` whatever the folder's configuration said (mended on 2026-11-22: it reads the configuration's); the audits and link enforcement (`slopcop:*`, `docs:links:enforce`) are this repository's own checks.
- **The command line can do what the page cannot** (5): since 2026-11-22, an author's documentation reference, which the page does not draw yet and which the table lists as the command line's own; `generate --check`, which fails when the committed docs are stale; `lint`; `--between` any two commits, where the page steps; and `--json` of every answer.

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
| `lint` | 0; 1 on a doc that does not parse | yes, since 2026-11-22 (before, warnings in another order each run) | no | no |
| `inspect` (any, `--json`) | 0; 1 on an unknown file or option | yes | no | no |
| `board <file>` | 0; 1 on a missing or malformed board, with the line | yes | no | no |
| `history` | 0 | yes, resumed and from nothing | no | no |
| `visualize` | 0 | yes | no | no |
| audits, link enforcement | this repository's scripts; not run on another folder | | | |

## How the table is kept true

Decided by the root on 2026-11-22: a ledger and a test, as the oracles' registers of measured misses are held. Each row of the table is an entry of [the ledger](../../tests/integration/live-docs/parity-ledger.json), and the table above is printed from it by `scripts/doc-tools/parity-table.ts --write`. [The test](../../tests/integration/live-docs/parity.test.ts) runs every entry's command over the estate sample, or over a two-commit scripted repository with its history, and fails in three cases:

- **An equivalent stops answering:** its output no longer holds what its entry expects.
- **A gap starts answering:** its output no longer shows the symptom its entry names, so the mend that closes it moves its row in the same commit. A gap with no command is probed by the option its smallest design would take, which is refused today.
- **The table here differs** from what the ledger prints.

It runs the 30 commands four at a time, about 23 s of the integration suite. **Not held:** that every control of the page has a row. Until a cheap and honest definition of "a control" is found, a control added to the page without a row goes unnoticed, and so does a gap whose option takes another name.
