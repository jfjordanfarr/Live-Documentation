/**
 * The estate scanned as seven things against the estate scanned once: the
 * probe of the World Map's first ticket (AI-Agent-Workspace/Probes/2026-10-09/two-scans.md),
 * kept as a test. Each thing's folder is scanned alone, the scans are read as
 * the board names them and merged into the estate's graph, and the wires the
 * board draws are compared with the one-scan build's, wire by wire.
 */
import * as fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG, normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { parseBoard } from "@live-documentation/engine/live-docs/board";
import { deriveBoardGraph, type Wire } from "@live-documentation/engine/live-docs/boardGraph";
import { entryWords } from "@live-documentation/engine/live-docs/document";
import { readEstateGraph, readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import { generateLiveDocs } from "@live-documentation/generator/generator";

import { fixtureGlobs } from "../../../scripts/oracle/compare";
import { readHandVerifiedEdges } from "../../../scripts/oracle/files";
import { copyFixture } from "../../../scripts/oracle/fixture";

const ESTATE = path.resolve(__dirname, "../programs/csharp/estate");

const quiet = { info: () => undefined, warn: () => undefined, error: (message: string) => console.error(message) };

/** A wire by what identifies it on the board, with the number of file edges behind it. */
function wireKey(wire: Wire): string {
  return `${wire.from} -> ${wire.to}${wire.door ? ` . ${wire.door.name} (${wire.door.kind ?? "?"})` : ""} [${wire.basis}]`;
}

describe("the estate scanned as seven things", () => {
  it("draws the one-scan build's wires, every hand-verified remote edge among them, with the wires to the shared library carried by project references alone", async () => {
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: fixtureGlobs() });
    const board = parseBoard(fs.readFileSync(path.join(ESTATE, "board.md"), "utf8"));
    const folders = board.things.flatMap((thing) => (thing.from ? [thing.from] : []));
    expect(folders).toHaveLength(7);

    const once = copyFixture(ESTATE, "estate-once-");
    const apart = copyFixture(ESTATE, "estate-apart-");
    try {
      await generateLiveDocs({ workspaceRoot: once, config, logger: quiet });
      const oneScan = deriveBoardGraph(board, await readLiveDocGraph({ workspaceRoot: once, config }), "board.md");

      for (const folder of folders) {
        await generateLiveDocs({ workspaceRoot: path.join(apart, folder), config, logger: quiet });
      }
      const reading = await readEstateGraph({ workspaceRoot: apart, config, board, boardPath: "board.md" });
      expect(reading.scans).toEqual(["Contracts", "Database/Oracle", "Database/SqlServer", "Gateway", "Hub", "PaymentService", "Portal"].sort((a, b) => a.length - b.length || (a < b ? -1 : 1)));
      expect(reading.issues).toEqual([]);
      const sevenScans = deriveBoardGraph(board, reading.graph, "board.md");
      expect(sevenScans.issues).toEqual([]);

      // Every wire of the one-scan build is drawn, and no other.
      const expected = new Map(oneScan.wires.map((wire) => [wireKey(wire), wire.edges]));
      const actual = new Map(sevenScans.wires.map((wire) => [wireKey(wire), wire.edges]));
      expect([...actual.keys()].sort()).toEqual([...expected.keys()].sort());

      // A type reference to a class outside the scan resolves to nothing, so the wires to the
      // contracts library carry the project reference alone where the one scan carried every use.
      for (const [key, edges] of expected) {
        if (key.endsWith("-> contracts [source]")) {
          expect(edges, key).toBeGreaterThan(1);
          expect(actual.get(key), key).toBe(1);
        } else {
          expect(actual.get(key), key).toBe(edges);
        }
      }

      // The six hand-verified remote edges, file to file, where the one scan has them.
      const handVerified = readHandVerifiedEdges(path.join(ESTATE, "expected", "hand-verified-edges.json"), ESTATE)!;
      const inOneScan = (await readLiveDocGraph({ workspaceRoot: once, config })).files;
      for (const edge of handVerified.edges.filter((candidate) => candidate.remote)) {
        const from = edge.from.replace(/^\.\.\//u, "");
        const to = edge.to.replace(/^\.\.\//u, "");
        const once = inOneScan[from]?.edges.some((candidate) => candidate.to === to) ?? false;
        const apart = reading.graph.files[from]?.edges.some((candidate) => candidate.to === to) ?? false;
        expect(apart, `${from} to ${to}: ${edge.via}`).toBe(once);
      }

      // What each thing stands on is the same, and the hub's staging address is a ghost in both builds.
      for (const entry of oneScan.things) {
        const other = sevenScans.things.find((candidate) => candidate.thing.name === entry.thing.name)!;
        expect(other.standsOn.map((item) => item.label), entry.thing.name).toEqual(entry.standsOn.map((item) => item.label));
        expect(other.ghosts, entry.thing.name).toEqual(entry.ghosts);
      }
      expect(sevenScans.things.find((entry) => entry.thing.name === "hub")?.ghosts).toEqual([
        { label: "net.tcp://payments-staging.onprem.example:8732/PaymentService", basis: "configuration", files: ["Hub/App.config"] }
      ]);
    } finally {
      fs.rmSync(once, { recursive: true, force: true });
      fs.rmSync(apart, { recursive: true, force: true });
    }
  });

  it("reads the root scan alone when the root has docs, reporting a thing's own docs inside it as a scan not read", async () => {
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: fixtureGlobs() });
    const board = parseBoard(fs.readFileSync(path.join(ESTATE, "board.md"), "utf8"));
    const workDir = copyFixture(ESTATE, "estate-nested-");
    try {
      await generateLiveDocs({ workspaceRoot: workDir, config, logger: quiet });
      await generateLiveDocs({ workspaceRoot: path.join(workDir, "Hub"), config, logger: quiet });
      const reading = await readEstateGraph({ workspaceRoot: workDir, config, board, boardPath: "board.md" });
      expect(reading.scans).toEqual([""]);
      expect(reading.issues).toEqual(["the scan at Hub lies inside the scan at the workspace root and is not read; a scan never lies inside another scan"]);
      expect(Object.keys(reading.graph.files)).toContain("Hub/App.config");
    } finally {
      fs.rmSync(workDir, { recursive: true, force: true });
    }
  });

  it("marks as entries the files that serve an opening, read from the sources: the routes, the listening addresses, the procedure and the tables, with the manifests and configurations as tooling", async () => {
    const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: fixtureGlobs() });
    const workDir = copyFixture(ESTATE, "estate-entries-");
    try {
      await generateLiveDocs({ workspaceRoot: workDir, config, logger: quiet });
      const graph = await readLiveDocGraph({ workspaceRoot: workDir, config });
      const openings: Record<string, string[]> = {};
      const tooling: string[] = [];
      for (const file of Object.values(graph.files)) {
        const served = file.entries.filter((entry) => entry.reason === "opening").map((entry) => entry.symbol!.name);
        if (served.length > 0) openings[file.codePath] = served;
        if (file.entries.some((entry) => entry.reason === "tooling")) tooling.push(file.codePath);
        expect(file.entries.map((entry) => entry.reason).filter((reason) => reason !== "opening" && reason !== "tooling"), file.codePath).toEqual([]);
      }
      // [Route("api/payments")] under [HttpPost] and [Route("api/payments/{paymentId}")] under [HttpGet] in both controllers; the
      // endpoint each service listens on in its App.config; CREATE TABLE and CREATE PROCEDURE in the SQL Server scripts and
      // CREATE TABLE in the Oracle one.
      expect(openings).toEqual({
        "Database/Oracle/CENTRAL.ACCOUNT.sql": ["CENTRAL.ACCOUNT"],
        "Database/SqlServer/dbo.Payment.sql": ["dbo.Payment"],
        "Database/SqlServer/dbo.usp_PostPayment.sql": ["dbo.usp_PostPayment"],
        "Gateway/Controllers/PaymentsController.cs": ["POST api/payments", "GET api/payments/{paymentId}"],
        "Hub/App.config": ["net.tcp://hub.onprem.example:8731/PaymentHub"],
        "PaymentService/App.config": ["net.tcp://payments.onprem.example:8732/PaymentService"],
        "Portal/Controllers/PaymentsController.cs": ["POST api/payments", "GET api/payments/{paymentId}"]
      });
      expect(tooling.sort()).toEqual([
        "Contracts/Contracts.csproj", "Gateway/Gateway.csproj", "Gateway/Web.config", "Hub/App.config", "Hub/Hub.csproj",
        "PaymentService/App.config", "PaymentService/PaymentService.csproj", "Portal/Portal.csproj", "Portal/Web.config"
      ]);
      expect(graph.files["Hub/App.config"].entries.map(entryWords)).toEqual(["opening net.tcp://hub.onprem.example:8731/PaymentHub", "tooling"]);
    } finally {
      fs.rmSync(workDir, { recursive: true, force: true });
    }
  });
});
