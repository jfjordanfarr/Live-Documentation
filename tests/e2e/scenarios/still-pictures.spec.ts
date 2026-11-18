import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { readOracleEdges } from "../../../scripts/oracle/files";
import { displayNames, loadGraph, localRetainUrl } from "../still-picture";

import { readSettled, watchPage } from "./instrument";
import { judgeFloor, LAWS, samePicture, wiresMatchOracle, type Floor, type Verdict } from "./judgments";
import type { Reading } from "./reading";
import { SCENARIOS, type Scenario } from "./table";
import { resolveList, resolveText, tokenTable, TokenError, type RosettaManifest, type TokenTable } from "./tokens";

/**
 * The still-picture scenario table, run over the Rosetta programs: each scenario is loaded once per program, read once
 * as it settles, and judged by every law, its floor, its relations and its oracle fact, each reported separately so that
 * one scenario lists every promise it broke. The readings, verdicts and screenshots are written to
 * `reports/scenarios/<language>/` for an eye to confirm. The samples are built by `npm run live-docs:visualize:rosetta`.
 */

const PROGRAMS = path.resolve(__dirname, "../../integration/programs");
const REPORTS = path.resolve(__dirname, "../../../reports/scenarios");
const manifest = JSON.parse(fs.readFileSync(path.join(PROGRAMS, "rosetta-manifest.json"), "utf8")) as RosettaManifest;

const slug = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");

/** The scenario's address under a map's base, its tokens resolved. */
function addressOf(scenario: Scenario, base: string, table: TokenTable): string {
  const { address } = scenario;
  if ("focus" in address) return `${base}?view=local&mode=2d&node=${encodeURIComponent(resolveText(address.focus, table))}`;
  if ("retain" in address) return localRetainUrl(base, resolveList(address.retain, table));
  if ("directory" in address) return `${base}?view=local&mode=2d&dir=${encodeURIComponent(resolveText(address.directory, table))}`;
  return `${base}?view=local&mode=2d`;
}

function floorOf(floor: Floor, table: TokenTable): Floor {
  return {
    ...floor,
    ...(floor.subject === undefined ? {} : { subject: resolveText(floor.subject, table) }),
    ...(floor.drawn === undefined ? {} : { drawn: resolveList(floor.drawn, table) }),
    ...(floor.pinned === undefined ? {} : { pinned: resolveList(floor.pinned, table) })
  };
}

for (const variant of manifest.variants) {
  const base = `/samples/rosetta/${variant.language}/`;
  test.describe(`Rosetta in ${variant.language}`, () => {
    for (const scenario of SCENARIOS) {
      test(scenario.name, async ({ page, baseURL }) => {
        const graph = await loadGraph(page, base);
        const table = tokenTable(manifest, variant.language, graph.nodes.map(node => node.id));
        let address: string, floor: Floor, oracleAt: string | undefined;
        try {
          address = addressOf(scenario, base, table);
          floor = floorOf(scenario.floor, table);
          oracleAt = scenario.oracleAt === undefined ? undefined : resolveText(scenario.oracleAt, table);
        } catch (error) {
          // Not applicable is said, never passed: the token table cannot give what the scenario needs.
          if (error instanceof TokenError) test.skip(true, `not applicable: ${error.message}`);
          throw error;
        }

        const folder = path.join(REPORTS, variant.language);
        const name = slug(scenario.name);
        const names = displayNames(graph, graph.nodes.map(node => node.id));
        await page.setViewportSize(scenario.viewport);
        const watch = watchPage(page, baseURL!);
        await page.goto(address);
        const reading = await readSettled(page, { scenario: scenario.name, map: base, watch, names, shotPath: path.join(folder, `${name}.png`) });
        const verdicts: Verdict[] = [judgeFloor(reading, floor), ...LAWS.map(law => law(reading))];
        const readings: Reading[] = [reading];

        if (scenario.reload) {
          await page.reload();
          const again = await readSettled(page, { scenario: scenario.name, map: base, watch, names, shotPath: path.join(folder, `${name}-reloaded.png`) });
          readings.push(again);
          verdicts.push(samePicture("a reload gives the same picture", reading, again));
        }
        if (oracleAt !== undefined) {
          const fixture = path.join(PROGRAMS, variant.path);
          const compiler = variant.compilerEdges ? readOracleEdges(path.join(PROGRAMS, variant.compilerEdges), fixture) : undefined;
          verdicts.push(wiresMatchOracle(reading, oracleAt, compiler ? compiler.edges.map(edge => ({ consumer: edge.from, provider: edge.to })) : null));
        }

        fs.mkdirSync(folder, { recursive: true });
        fs.writeFileSync(path.join(folder, `${name}.json`), `${JSON.stringify({ scenario: scenario.name, language: variant.language, address, verdicts, readings }, null, 2)}\n`, "utf8");
        for (const verdict of verdicts) {
          test.info().annotations.push({ type: `${verdict.rank}: ${verdict.outcome}`, description: [verdict.judgment, ...verdict.findings].join("\n  ") });
        }
        // Every promise is judged and every broken one reported, so one scenario lists all it broke.
        for (const verdict of verdicts) expect.soft(verdict.findings, `${verdict.rank}: ${verdict.judgment}`).toEqual(verdict.outcome === "broken" ? [] : verdict.findings);
      });
    }
  });
}
