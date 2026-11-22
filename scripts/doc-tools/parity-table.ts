/**
 * Prints the table of `.mdmd/layer-2/parity.mdmd.md` from the parity ledger
 * (`tests/integration/live-docs/parity-ledger.json`), so that the table a person reads is the one the ledger's test
 * holds to the commands (2026-11-22). The table stands between two comment lines of the document; the test fails when
 * it differs from what this prints.
 *
 * Usage: `npx tsx --tsconfig ./tsconfig.base.json scripts/doc-tools/parity-table.ts [--write]`; without `--write` it
 * prints the table, with it it rewrites the document's table in place.
 */
import * as fs from "node:fs";
import * as path from "node:path";

/** One row of the ledger: a thing the page offers, what offers it to an agent or a pipeline, and how it is checked. */
export interface ParityRow {
  section: string;
  page: string;
  agent: string;
  /**
   * `the command line's own`: what the command line gives that the page does not draw yet. `no: the page differs`: the
   * command line answers by the rule and the page otherwise, shown by a line of the page's code.
   */
  status: "yes" | "yes, as files" | "yes, as JSON only" | "no: lacks part" | "no: no command" | "no: the page differs" | "the command line's own";
  /** The workspace (`estate` or `history`), the command and its arguments. */
  run?: string[];
  /** The workspace and a file in it whose text the row rests on; `repository` is this checkout, read in place. */
  file?: [string, string];
  /** For an equivalent: what its output holds. */
  expect?: string[];
  /** For a gap: what its output holds while the gap stands. */
  symptom?: string;
  /** The stream the row is read from: standard output for an equivalent, standard error for a gap, unless named. */
  stream?: "stdout" | "stderr";
  /** The exit the command must give: 0 for an equivalent, 1 for a gap, unless named. */
  exit?: number;
}

/** The ledger: its rows in the table's order. */
export interface ParityLedger {
  rows: ParityRow[];
}

/** The comment line before the printed table. */
export const BEGIN = "<!-- parity table: printed from tests/integration/live-docs/parity-ledger.json by scripts/doc-tools/parity-table.ts -->";
/** The comment line after it. */
export const END = "<!-- end of the parity table -->";

/** The table and its totals, as markdown, the rows in the ledger's order under their sections. */
export function renderParityTable(ledger: ParityLedger): string {
  const lines = ["| In the page | For an agent or a pipeline | Equivalent? |", "| --- | --- | --- |"];
  let section = "";
  for (const row of ledger.rows) {
    if (row.section !== section) {
      section = row.section;
      lines.push(`| **${section}** | | |`);
    }
    lines.push(`| ${row.page} | ${row.agent} | ${row.status} |`);
  }
  const yes = ledger.rows.filter((row) => row.status.startsWith("yes"));
  const own = ledger.rows.filter((row) => row.status === "the command line's own").length;
  const onlyAs = yes.filter((row) => row.status !== "yes").length;
  const lacks = ledger.rows.filter((row) => row.status === "no: lacks part").length;
  const none = ledger.rows.filter((row) => row.status === "no: no command").length;
  const differs = ledger.rows.filter((row) => row.status === "no: the page differs").length;
  lines.push("", `**Totals:** ${ledger.rows.length} rows; ${yes.length} with an equivalent (${onlyAs} of them only as files or JSON), ${lacks + none + differs} gaps: ${none} with no command, ${lacks} where a command lacks part${differs ? `, ${differs} where the page differs from the rule` : ""}${own ? `; and ${own} the command line's own, which the page does not draw yet` : ""}.`);
  return lines.join("\n");
}

/** The document's text with its table replaced by the one the ledger prints. */
export function withTable(document: string, table: string): string {
  const begin = document.indexOf(BEGIN);
  const end = document.indexOf(END);
  if (begin < 0 || end < begin) {
    throw new Error("the parity document has no table markers");
  }
  return `${document.slice(0, begin + BEGIN.length)}\n\n${table}\n\n${document.slice(end)}`;
}

/** The ledger, from the repository's root. */
export const LEDGER_PATH = path.join("tests", "integration", "live-docs", "parity-ledger.json");
/** The document whose table it prints, from the repository's root. */
export const DOCUMENT_PATH = path.join(".mdmd", "layer-2", "parity.mdmd.md");

if (process.argv[1]?.endsWith("parity-table.ts")) {
  const root = process.cwd();
  const ledger = JSON.parse(fs.readFileSync(path.join(root, LEDGER_PATH), "utf8")) as ParityLedger;
  const table = renderParityTable(ledger);
  if (process.argv.includes("--write")) {
    const documentPath = path.join(root, DOCUMENT_PATH);
    fs.writeFileSync(documentPath, withTable(fs.readFileSync(documentPath, "utf8"), table), "utf8");
  } else {
    console.log(table);
  }
}
