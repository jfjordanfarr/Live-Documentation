/**
 * The PowerShell reader held to the hand reading of 2026-11-19: 222 wires, each a call at a line of one file claimed
 * to reach a function another file defines, judged in the source by two readers who agreed on every one
 * (`AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/powershell-wires/samples.md`). That reading is the
 * one independent truth held for the reader's rule, "loaded, else unique", on real code; the parser-record tests grade
 * the reader against the same rule written a second time, which a wrong rule passes on both sides.
 *
 * The four corpora are public repositories this one does not hold. Their extract
 * (`fixtures/powershell-judged/extract.json`, written by `scripts/oracle/powershell-judged.ts`, the owner's permission
 * of 2026-11-22) keeps each file a wire's answer rests on, with only its paths, the functions it defines, the judged
 * calls and its loads, each at its line. Each corpus's skeleton is written from it into a folder of its own and the
 * reader reads every calling file there, the skeleton's files its index, as the generator would have it read them. A
 * true wire is to be drawn, a false one not; an arguable one is pinned to what the reader draws today.
 *
 * Where the reader of today and the judges differ, the row is in the register below by its cause, as the oracle
 * tests hold their measured misses: a difference mended in silence, or a new one, fails the test until the register
 * says so. The reader is not mended here, and no row is dropped.
 *
 * What a skeleton cannot show: the reader's reading of a load as the corpus writes it, since each load is written
 * again plainly. On the corpora's own text the reader misses one more true wire, #60 (AL-Go's `CommentPublishing.ps1`
 * calling `Test-GlobMatch` of `FindingPlacement.ps1`), because its grammar reads with an error the module that loads
 * both files in a loop; here that load is plain and the wire is drawn.
 */
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { powershellAdapter } from "@live-documentation/engine/live-docs/adapters/powershell";

import { skeletonText, writeSkeleton, type JudgedExtract } from "../../../scripts/oracle/powershell-judged";
import { readVerdicts } from "../../../scripts/oracle/powershell-verdicts";

const FIXTURE = path.resolve(__dirname, "..", "fixtures", "powershell-judged");
const SAMPLES = path.resolve(__dirname, "..", "..", "..", "AI-Agent-Workspace", "AgentSessionHistory", "2026", "11", "2026-11-19", "Probes", "powershell-wires", "samples.md");

/**
 * The rows where the reader of today and the judges differ, each with its cause. Measured on 2026-11-22 against the
 * reader at `b3fe1749a`; see `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/powershell-extract/`.
 */
const MEASURED_DIFFERENCES: Record<string, string> = {
  "#50 true, not drawn":  "OutputWarning is defined in DebugLogHelper.psm1 and in Troubleshooting.ps1; Github-Helper.psm1 loads neither, and the judges found the copy each run reaches by how the actions are run, which the text does not say",
  "#53 true, not drawn":  "OutputError is defined twice; ProcessALCodeAnalysisLogs.ps1 loads neither copy, and only how the action is run tells which",
  "#55 true, not drawn":  "OutputWarning is defined twice; ProcessALCodeAnalysisLogs.ps1 loads neither copy, and only how the action is run tells which",
  "#71 true, not drawn":  "OutputWarning is defined twice; Troubleshoot.Secrets.ps1 loads neither copy, and is dot-sourced by Troubleshooting.ps1, which defines its own",
  "#105 true, not drawn": "Get-FleetState is defined in FleetCore.psm1 and in reconcile-runner-fleet.ps1; the test imports FleetCore through a path the text does not fix",
  "#107 true, not drawn": "Get-RunnerDemand is defined in FleetCore.psm1 and in reconcile-runner-fleet.ps1; the test imports FleetCore through a path the text does not fix"
};

/**
 * The arguable rows, each with whether the reader draws it today: the judges' word is "arguable", so this pins the
 * reading, not a verdict. `Actions/AL-Go-TestRepoHelper.ps1` dot-sources `AL-Go-Helper.ps1`, which imports
 * `DebugLogHelper.psm1`, so its calls of `OutputError` and `OutputWarning` reach that copy by what it loads (#11, #13);
 * `Troubleshooting.ps1`'s own copies, which win when that script dot-sources the helper, are not loaded by it (#12, #14).
 */
const ARGUABLE: Record<string, "drawn" | "not drawn"> = {
  "#11": "drawn",
  "#12": "not drawn",
  "#13": "drawn",
  "#14": "not drawn"
};

/** Rows no run can score: their corpus was never committed. */
const UNSCORABLE: Record<string, string> = {
  "#215": "the cold run's shop, made by hand in a scratch folder on 2026-11-19 and never committed"
};

const extract = JSON.parse(fs.readFileSync(path.join(FIXTURE, "extract.json"), "utf8")) as JudgedExtract;

/** A call's key, caller, case-folded name and defining file, as PowerShell compares names. */
const callKey = (caller: string, name: string, definer: string): string => `${caller} → ${name.toLowerCase()} → ${definer}`;

describe("the PowerShell reader against the hand reading of 222 wires", () => {
  let root: string;
  /** Every call the reader draws from each corpus's calling files, by corpus. */
  const drawn = new Map<string, Set<string>>();

  beforeAll(async () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "powershell-judged-"));
    for (const corpus of extract.corpora) {
      const folder = path.join(root, corpus.name);
      const index  = new Set(writeSkeleton(corpus, folder));
      const calls  = new Set<string>();
      const callers = new Set(extract.wires.filter((wire) => wire.corpus === corpus.name).map((wire) => wire.caller));
      for (const file of callers) {
        const analysis = (await powershellAdapter.analyze({ absolutePath: path.join(folder, file), workspaceRoot: folder, fileIndex: index }))!;
        for (const dependency of analysis.dependencies) {
          for (const name of dependency.symbols) if (dependency.resolvedPath) calls.add(callKey(file, name, dependency.resolvedPath));
        }
      }
      drawn.set(corpus.name, calls);
    }
  });

  afterAll(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("keeps every row of the hand reading, with both judges' verdicts, as the table has it", () => {
    const table = readVerdicts(fs.readFileSync(SAMPLES, "utf8"));
    expect(extract.wires.map(({ definerLine: _line, why: _why, ...row }) => row)).toEqual(table);
    expect(extract.wires).toHaveLength(222);
    expect(extract.wires.every((wire) => wire.verdict === wire.second)).toBe(true);
  });

  it("names each repository, its address, commit and licence, and keeps the licence's notice", () => {
    expect(extract.permission).toMatchObject({ answer: "Yep! Go ahead!", date: "2026-11-22" });
    const notices: Record<string, RegExp> = {
      "dbatools":         /MIT License[\s\S]*Copyright \(c\) 2018 Chrissy LeMaire[\s\S]*Permission is hereby granted/u,
      "al-go":            /MIT License[\s\S]*Copyright \(c\) Microsoft Corporation[\s\S]*Permission is hereby granted/u,
      "azurestack-tools": /The MIT License \(MIT\)[\s\S]*Copyright \(c\) 2016 Microsoft[\s\S]*Permission is hereby granted/u,
      "tsqlt":            /Apache License[\s\S]*Version 2\.0, January 2004[\s\S]*END OF TERMS AND CONDITIONS/u
    };
    expect(extract.corpora.map((corpus) => corpus.name)).toEqual(Object.keys(notices));
    for (const corpus of extract.corpora) {
      expect(corpus.address).toBe(`https://github.com/${corpus.repository}`);
      expect(corpus.commit).toMatch(/^[0-9a-f]{40}$/u);
      expect(fs.readFileSync(path.join(FIXTURE, corpus.notice), "utf8")).toMatch(notices[corpus.name]);
    }
  });

  it("holds every file a row names, and of each file nothing but definitions, calls and loads", () => {
    const statement = /^(?:function [\w-]+ \{ \}|& \{ function [\w-]+ \{ \} \}|(?:\. |& |Import-Module )"\$PSScriptRoot\/[^"$`]+"|(?:[&.] )?[\w-]+)$/u;
    for (const wire of extract.wires) {
      if (UNSCORABLE[`#${wire.row}`]) continue;
      const files = extract.corpora.find((corpus) => corpus.name === wire.corpus)!.files;
      expect(files[wire.caller]?.calls?.some((call) => call.line === wire.line && call.name.toLowerCase() === wire.name.toLowerCase()), `row ${wire.row}`).toBe(true);
      const definitions = [...(files[wire.definer]?.defines ?? []), ...(files[wire.definer]?.local ?? [])];
      expect(definitions.some((fn) => fn.line === wire.definerLine && fn.name.toLowerCase() === wire.name.toLowerCase()), `row ${wire.row}`).toBe(true);
    }
    for (const corpus of extract.corpora) {
      for (const [file, entry] of Object.entries(corpus.files)) {
        if (entry.manifest) continue;
        for (const line of skeletonText(file, entry).split("\n")) {
          for (const item of line ? line.split("; ") : []) expect(item, file).toMatch(statement);
        }
      }
    }
  });

  it("draws each judged wire as the judges read it, but for the measured differences, and pins the arguable ones", () => {
    const differences: string[] = [];
    const arguable: Record<string, "drawn" | "not drawn"> = {};
    const unscored: string[] = [];
    let agreeing = 0;
    for (const wire of extract.wires) {
      const calls = drawn.get(wire.corpus);
      if (!calls) {
        unscored.push(`#${wire.row}`);
        continue;
      }
      const isDrawn = calls.has(callKey(wire.caller, wire.name, wire.definer));
      if (wire.verdict === "A") arguable[`#${wire.row}`] = isDrawn ? "drawn" : "not drawn";
      else if (wire.verdict === "T" && !isDrawn) differences.push(`#${wire.row} true, not drawn`);
      else if (wire.verdict === "F" && isDrawn) differences.push(`#${wire.row} false, drawn`);
      else agreeing += 1;
    }
    expect(unscored).toEqual(Object.keys(UNSCORABLE));
    expect(differences).toEqual(Object.keys(MEASURED_DIFFERENCES));
    expect(arguable).toEqual(ARGUABLE);
    expect(agreeing).toBe(222 - Object.keys(UNSCORABLE).length - Object.keys(MEASURED_DIFFERENCES).length - Object.keys(ARGUABLE).length);
  });
});
