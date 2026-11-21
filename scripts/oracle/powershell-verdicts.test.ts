import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { readVerdicts, scoreVerdicts, type HandVerdict } from "./powershell-verdicts";

const SAMPLES = path.resolve(__dirname, "..", "..", "AI-Agent-Workspace", "AgentSessionHistory", "2026", "11", "2026-11-19", "Probes", "powershell-wires", "samples.md");

describe("the hand reading of 222 PowerShell wires", () => {
  it("reads every row of the committed table, each corpus's rows and verdicts as the table counts them", () => {
    const rows = readVerdicts(readFileSync(SAMPLES, "utf8"));
    expect(rows).toHaveLength(222);
    const by = (key: (row: HandVerdict) => string): Record<string, number> => {
      const counts: Record<string, number> = {};
      for (const row of rows) counts[key(row)] = (counts[key(row)] ?? 0) + 1;
      return counts;
    };
    expect(by((row) => row.corpus)).toEqual({ "al-go": 88, "azurestack-tools": 15, dbatools: 111, shop: 1, tsqlt: 7 });
    expect(by((row) => row.verdict)).toEqual({ T: 137, F: 81, A: 4 });
    expect(rows.every((row) => row.verdict === row.second)).toBe(true);
    expect(rows[1]).toEqual({
      row: 2, corpus: "al-go", caller: "Actions/.Modules/CompileFromWorkspace.psm1", line: 344, name: "OutputWarning",
      definer: "Actions/Troubleshooting/Troubleshooting.ps1", verdict: "F", second: "F"
    });
  });

  it("holds a reading to each verdict: a true wire not drawn and a false wire drawn differ, an arguable one is only counted", () => {
    const row = (number: number, verdict: HandVerdict["verdict"], caller: string, corpus = "x"): HandVerdict =>
      ({ row: number, corpus, caller, line: 1, name: "Get-Thing", definer: "lib.ps1", verdict, second: verdict });
    const rows = [row(1, "T", "a.ps1"), row(2, "T", "b.ps1"), row(3, "F", "c.ps1"), row(4, "F", "d.ps1"), row(5, "A", "e.ps1"), row(6, "T", "gone.ps1"), row(7, "T", "s.ps1", "shop")];
    const files = new Set(["a.ps1", "b.ps1", "c.ps1", "d.ps1", "e.ps1", "lib.ps1"]);
    // The grader's keys carry the name as the definition spells it; the table's, as the call does.
    const score = scoreVerdicts(rows, "x", files, ["a.ps1 → get-thing → lib.ps1", "c.ps1 → Get-Thing → lib.ps1", "e.ps1 → Get-Thing → lib.ps1"], ["a.ps1 → Get-Thing → lib.ps1", "b.ps1 → Get-Thing → lib.ps1"]);
    expect(score.rows).toBe(6);
    expect(score.unheld.map((item) => item.row)).toEqual([6]);
    expect(score.uncommitted.map((item) => item.row)).toEqual([7]);
    expect(score.rule).toMatchObject({ trueDrawn: 1, trueMissed: 1, falseSpared: 1, falseDrawn: 1, arguableDrawn: 1, arguableSpared: 0 });
    expect(score.rule.differ.map((item) => item.row)).toEqual([2, 3]);
    expect(score.adapter).toMatchObject({ trueDrawn: 2, trueMissed: 0, falseSpared: 2, falseDrawn: 0, arguableDrawn: 0, arguableSpared: 1 });
    expect(score.adapter.differ).toEqual([]);
  });
});
