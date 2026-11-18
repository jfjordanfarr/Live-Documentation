# The scenario suite's first slice: the count of today's cases, and what the table measured

Historical record of a measurement, November 18, 2026, by the root of [the day's session](../../2026-11-18.1.record.md) and one builder. What the suite is now is in the Live Docs of `tests/e2e/scenarios/` and in [the tooling guide](../../../../../../../.mdmd/layer-2/internal-tooling.mdmd.md); nothing here is decided beyond what that code does, and the numbers are of this date.

## What was asked

The owner, on November 17, of a browser suite that had grown to 488 cases and more than an hour ([Turn 8 of that day's record](../../../2026-11-17/2026-11-17.1.record.md#turn-8)): whether many of its cases could be one table of scenarios, each a map and an address, read once as a settled page and judged by many small promises, run over the nine Rosetta programs in place of this repository's own large map. The root's frame for it is in [its reply to Turn 11](../../../2026-11-17/2026-11-17.1.record.md#roots-reply-to-turn-11-as-delivered): a scenario, a reading, and judgments ranked law, relation, oracle fact, baseline.

## What is here

- **[ledger.tsv](ledger.tsv):** every one of the 488 cases of the full run of 16:14 UTC, with its seconds at one worker, its kind, its view and why. For the cases the first table covers, the judgments that carry each promise and what is not carried.

  | Kind | Cases | Seconds |
  | --- | --- | --- |
  | A still picture, one reading | 93 | 464 |
  | A relation between two readings of one run | 70 | 989 |
  | A journey | 213 | 1,664 |
  | Motion | 64 | 738 |
  | Other (the design audit's own checks, the network policy, the layout lab) | 46 | 290 |
  | Where this repository's size is the point | 2 | 13 |

  How it was counted: a helper of the builder's read every test body in the 66 spec files, briefed with the kinds and not with the builder's view ([review-classification.tsv](review-classification.tsv) is its raw answer); the builder read five files whole and agreed with every row of them. A careful first pass, not an audit.
- **[ledger-literals.tsv](ledger-literals.tsv):** for the covered cases, each number or colour written into a spec, sorted as carried by a law, needing a recorded baseline, or belonging to a gesture. It is the evidence for the finding that almost no case can be deleted as it stands: a case must be split, its still half to the table and its gesture half kept.
- **[table-quiet-run.txt](table-quiet-run.txt):** the table's run on a quiet machine at one worker, 18:40 to 18:42 UTC: 43 cases passed and 7 not applicable, 713 promises judged and none broken, 128.4 s of case time. A second run at 19:14, after the compiler judgment was corrected, judged 715 promises in 127.3 s.
- **[audit-specs-run.txt](audit-specs-run.txt):** every spec that calls the design audit, rerun after the audit learned to see a clip between an element and its text: 15 files, 141 cases, none turned red by it (one red, `history-scrubber.spec.ts:180`, a known race that passed alone).

## What the measurement says

- Per promise the table is far cheaper: about 5.5 promises a second, where today's 93 still-picture cases of the 2D map average 13 s for one to three promises.
- In time on the clock it saves only what is deleted. The 15 runs of today's suite whose promises the table carries take 317.7 s, and they stay until they are split.
- The table adds its own 128 s to the suite, and 5.7 s for the nine sample builds.
- No total is claimed for converting the rest. Where the saving would be: the cases that walk the zoom on this repository's large map, made relations between readings on the small maps.

## What the root sent back

The judgment against the compiler, twice ([the review](../../2026-11-18.1.record.md#work-notes-the-scenario-builders-third-handback-and-roots-review)). As first run it failed C and C++ because the table's own token chose the implementation where the other parts include the header; the token now names the file of a part that the other parts use most, read from the map. As next built, on the root's own ruling, it excused whatever the repository's oracle comparison reported the docs as lacking, computed live, and so could not go red for a lost edge. It now holds a frozen list of known gaps by name, two entries, reported at the frame's lowest rank: the C header and the C++ header each lack the edge to their own implementation, since the C-family adapters record an include where the compiler records the use of a definition.

## Four pictures, as the root saw them

- **[The C program, the processor's header in focus](c-processor-header-in-focus.png):** uses enter on the left of the header's card and its three functions' offerings leave on the right to the implementation, the two tests and `main.c`. The header's include guard, `ROSETTA_PROCESSOR_H`, is listed among its symbols, which is the C adapter's to mend.
- **[The Java program, retained whole](java-whole-program-retained.png):** `Main.java` pinned in its directory, nine pins, the picture larger than the frame, as the edge signs say.
- **[This repository's map, the TypeScript program's folder opened](repository-rosetta-folder-opened.png):** framed whole and centred, its two directories closed with their cells.
- **[The TypeScript program, three presses out](typescript-processor-three-presses-out.png):** at the left edge the name `ProcessorConfig` breaks inside the word, "Process / orConfig", the open defect [direction.md](../../../../../../Memory/direction.md) already names. The law for it is written and tested and kept out of the table until the defect is mended.
