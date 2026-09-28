/**
 * The first boards: the estate sample's, measured against its hand-verified remote
 * edges, and this repository's own, kept valid against its docs.
 */
import * as fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG, normalizeLiveDocumentationConfig, type LiveDocumentationConfigInput } from "@live-documentation/engine/config/liveDocumentationConfig";
import { lintBoard, parseBoard } from "@live-documentation/engine/live-docs/board";
import { deriveBoardGraph } from "@live-documentation/engine/live-docs/boardGraph";
import { readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import { generateLiveDocs } from "@live-documentation/generator/generator";

import { fixtureGlobs } from "../../../scripts/oracle/compare";
import { copyFixture } from "../../../scripts/oracle/fixture";

const ESTATE = path.resolve(__dirname, "../programs/csharp/estate");
const REPOSITORY = path.resolve(__dirname, "../../..");

interface HandVerified {
  edges: Array<{ from: string; to: string; via: string; remote?: boolean }>;
}

describe("the estate's board", () => {
  it("draws every remote hand-verified edge as a wire between two things, and the declared tunnel", async () => {
    const workDir = copyFixture(ESTATE, "board-");
    try {
      const config = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, glob: fixtureGlobs() });
      await generateLiveDocs({ workspaceRoot: workDir, config, logger: { info: () => undefined, warn: () => undefined, error: (message) => console.error(message) } });
      const graph = await readLiveDocGraph({ workspaceRoot: workDir, config });

      const board = parseBoard(fs.readFileSync(path.join(ESTATE, "board.md"), "utf8"));
      expect(lintBoard(board)).toEqual([]);
      const derived = deriveBoardGraph(board, graph, "board.md");
      expect(derived.issues).toEqual([]);

      const thingOf = (file: string): string | undefined => derived.things.find((entry) => entry.files.includes(file))?.thing.name;
      const handVerified = JSON.parse(fs.readFileSync(path.join(ESTATE, "expected", "hand-verified-edges.json"), "utf8")) as HandVerified;
      const remote = handVerified.edges.filter((edge) => edge.remote);
      expect(remote.length).toBeGreaterThan(0);
      for (const edge of remote) {
        const from = thingOf(edge.from);
        const to = thingOf(edge.to);
        expect(from, edge.from).toBeDefined();
        expect(to, edge.to).toBeDefined();
        const wire = derived.wires.find((candidate) => candidate.from === from && candidate.to === to && candidate.basis !== "declared");
        expect(wire, `${edge.from} to ${edge.to}: ${edge.via}`).toBeDefined();
      }

      expect(derived.wires.filter((wire) => wire.basis === "declared")).toEqual([{ from: "CLOUD", to: "ON-PREM", basis: "declared", edges: 1, over: "IPsec tunnel" }]);
      expect(derived.things.find((entry) => entry.thing.name === "gateway")?.doors.map((door) => door.name)).toContain("POST api/payments");
      expect(derived.things.find((entry) => entry.thing.name === "oracle")?.doors).toEqual([{ name: "CENTRAL.ACCOUNT", kind: "table" }]);
    } finally {
      fs.rmSync(workDir, { recursive: true, force: true });
    }
  });
});

describe("this repository's board", () => {
  it("parses, lints clean, and every thing with a folder finds its docs", async () => {
    const configInput = JSON.parse(fs.readFileSync(path.join(REPOSITORY, ".live-docs.config.json"), "utf8")) as LiveDocumentationConfigInput;
    const config = normalizeLiveDocumentationConfig(configInput);
    const graph = await readLiveDocGraph({ workspaceRoot: REPOSITORY, config });

    const boardPath = ".mdmd/layer-3/board.mdmd.md";
    const board = parseBoard(fs.readFileSync(path.join(REPOSITORY, boardPath), "utf8"));
    expect(lintBoard(board)).toEqual([]);
    const derived = deriveBoardGraph(board, graph, boardPath);
    expect(derived.issues).toEqual([]);
    for (const entry of derived.things.filter((candidate) => candidate.thing.from !== undefined)) {
      expect(entry.files.length, entry.thing.name).toBeGreaterThan(0);
    }
    expect(derived.wires.some((wire) => wire.from === "scripts" && wire.to === "engine" && wire.basis === "source")).toBe(true);
  });
});
