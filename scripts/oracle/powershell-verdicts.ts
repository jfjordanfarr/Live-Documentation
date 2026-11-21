/**
 * The hand reading of 2026-11-19 as a measure the rule can fail: 222 wires, each a call at a line of one file claimed
 * to reach a function another file defines, judged in the source by two readers (true, false or arguable), kept as the
 * table of `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/samples.md`.
 *
 * Over a corpus the grader has read, each row of that corpus is set beside what a reading draws: the rule's, written
 * over the parser's facts in `powershell-wires.ts`, and the adapter's. A true wire not drawn and a false wire drawn are
 * where the reading and the hand differ; an arguable wire is counted, never scored. Since the rule and the adapter hold
 * the same design, this, and not the comparison of the two, is what grades the design itself. A row is not scored when
 * its corpus was never committed (the cold run's shop), or when the folder holds no file its call names.
 */

/** One judged wire: the call, the function, the file claimed to define it, and the first reader's verdict. */
export interface HandVerdict {
  row:     number;
  corpus:  string;
  caller:  string;
  line:    number;
  name:    string;
  definer: string;
  verdict: "T" | "F" | "A";
  /** The second reader's verdict, which agrees on every row of the table. */
  second:  "T" | "F" | "A";
}

/** The corpora of the table whose files were never committed, so that no row of theirs can be scored. */
export const UNCOMMITTED_CORPORA = new Set(["shop"]);

/** A `path:line` cell, its backticks removed. */
function location(cell: string): { file: string; line: number } | undefined {
  const match = /^`?(.+):(\d+)`?$/u.exec(cell.trim());
  return match ? { file: match[1], line: Number(match[2]) } : undefined;
}

/** The rows of the table: every line `| n | corpus | call | name | defined in | drawn by | sampled for | verdicts | why |`. */
export function readVerdicts(markdown: string): HandVerdict[] {
  const rows: HandVerdict[] = [];
  for (const line of markdown.split(/\r?\n/u)) {
    if (!/^\|\s*\d+\s*\|/u.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    const call = location(cells[2] ?? "");
    const definer = location(cells[4] ?? "");
    const verdicts = /^([TFA])\s*\/\s*([TFA])$/u.exec(cells[7] ?? "");
    if (!call || !definer || !verdicts) throw new Error(`A row of the hand reading is not read: ${line}`);
    rows.push({
      row:     Number(cells[0]),
      corpus:  cells[1],
      caller:  call.file,
      line:    call.line,
      name:    cells[3].replace(/`/gu, ""),
      definer: definer.file,
      verdict: verdicts[1] as HandVerdict["verdict"],
      second:  verdicts[2] as HandVerdict["verdict"]
    });
  }
  return rows;
}

/** How a reading stands to the rows it is set beside. */
export interface VerdictTally {
  trueDrawn:      number;
  trueMissed:     number;
  falseSpared:    number;
  falseDrawn:     number;
  arguableDrawn:  number;
  arguableSpared: number;
  /** The rows where the reading and the hand differ: a true wire not drawn, a false wire drawn. */
  differ:         HandVerdict[];
}

/** The rows of one corpus set beside the rule's reading and the adapter's. */
export interface VerdictScore {
  corpus:     string;
  rows:       number;
  rule:       VerdictTally;
  adapter:    VerdictTally;
  /** Rows of this corpus whose calling or defining file the folder does not hold. */
  unheld:     HandVerdict[];
  /** Rows of corpora never committed, which no run can score. */
  uncommitted: HandVerdict[];
}

/** A call's key, `caller → name → definer`, the name case-folded, as PowerShell compares names. */
function callKey(caller: string, name: string, definer: string): string {
  return `${caller} → ${name.toLowerCase()} → ${definer}`;
}

/** Each call of a reading, by its case-folded key, from the grader's `caller → name → definer` keys. */
export function callKeys(calls: Iterable<string>): Set<string> {
  const keys = new Set<string>();
  for (const call of calls) {
    const [caller, name, definer] = call.split(" → ");
    keys.add(callKey(caller, name, definer));
  }
  return keys;
}

function tally(rows: HandVerdict[], drawn: Set<string>): VerdictTally {
  const counted: VerdictTally = { trueDrawn: 0, trueMissed: 0, falseSpared: 0, falseDrawn: 0, arguableDrawn: 0, arguableSpared: 0, differ: [] };
  for (const row of rows) {
    const isDrawn = drawn.has(callKey(row.caller, row.name, row.definer));
    if (row.verdict === "T") {
      if (isDrawn) counted.trueDrawn += 1;
      else {
        counted.trueMissed += 1;
        counted.differ.push(row);
      }
    } else if (row.verdict === "F") {
      if (isDrawn) {
        counted.falseDrawn += 1;
        counted.differ.push(row);
      } else counted.falseSpared += 1;
    } else if (isDrawn) counted.arguableDrawn += 1;
    else counted.arguableSpared += 1;
  }
  return counted;
}

/** Sets the rows of one corpus beside the rule's calls and the adapter's, each a set of grader keys. */
export function scoreVerdicts(rows: HandVerdict[], corpus: string, files: ReadonlySet<string>, rule: Iterable<string>, adapter: Iterable<string>): VerdictScore {
  const own = rows.filter((row) => row.corpus === corpus);
  const unheld = own.filter((row) => !files.has(row.caller) || !files.has(row.definer));
  const scored = own.filter((row) => files.has(row.caller) && files.has(row.definer));
  return {
    corpus,
    rows:        own.length,
    rule:        tally(scored, callKeys(rule)),
    adapter:     tally(scored, callKeys(adapter)),
    unheld,
    uncommitted: rows.filter((row) => UNCOMMITTED_CORPORA.has(row.corpus))
  };
}
