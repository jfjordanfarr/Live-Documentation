import fs from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

import { readOracleEdges } from "../../../scripts/oracle/files";
import { displayNames, loadGraph, localMapStill, localRetainUrl } from "../still-picture";

import { readSettled, watchPage } from "./instrument";
import { judgeFloor, LAWS, samePicture, wiresMatchData, wiresMatchOracle, type Floor, type OracleEdge, type Verdict } from "./judgments";
import type { Reading } from "./reading";
import { SCENARIOS, type Scenario } from "./table";
import { resolveList, resolveText, tokenTable, TokenError, type RosettaManifest, type TokenTable } from "./tokens";

/**
 * The still-picture scenario table, run over the Rosetta programs: each scenario is loaded once per map, read once as
 * it settles, and judged by its floor, every law, its relations and its oracle fact, each reported separately so that
 * one scenario lists every promise it broke. Nine maps are the samples `npm run live-docs:visualize:rosetta` builds;
 * the tenth is this repository's own map, which holds the TypeScript program among its samples. Readings, verdicts and
 * screenshots go to `reports/scenarios/<map>/`, one file per scenario, so that cases share nothing and may run in
 * parallel.
 */

const PROGRAMS = path.resolve(__dirname, "../../integration/programs");
const REPORTS = path.resolve(__dirname, "../../../reports/scenarios");
const manifest = JSON.parse(fs.readFileSync(path.join(PROGRAMS, "rosetta-manifest.json"), "utf8")) as RosettaManifest;

/** A map the table runs on: its base on the site, the program it holds, and the prefix of that program's files there. */
interface MapUnder { name: string; base: string; language: string; root: string }

const MAPS: MapUnder[] = [
  ...manifest.variants.map(variant => ({ name: variant.language, base: `/samples/rosetta/${variant.language}/`, language: variant.language, root: "" })),
  { name: "repository", base: "/", language: "typescript", root: "tests/integration/programs/typescript/rosetta/" }
];

const slug = (text: string): string => text.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");

/** The scenario's address under a map's base, its tokens resolved; a program's root is its own folder on a larger map. */
function addressOf(scenario: Scenario, map: MapUnder, table: TokenTable): string {
  const { address } = scenario;
  const dir = (directory: string): string => `${map.base}?view=local&mode=2d&dir=${encodeURIComponent(directory)}`;
  if ("focus" in address) return `${map.base}?view=local&mode=2d&node=${encodeURIComponent(resolveText(address.focus, table))}`;
  if ("retain" in address) return localRetainUrl(map.base, resolveList(address.retain, table));
  if ("directory" in address) return dir(resolveText(address.directory, table));
  return map.root ? dir(map.root.replace(/\/$/u, "")) : `${map.base}?view=local&mode=2d`;
}

function floorOf(floor: Floor, table: TokenTable): Floor {
  return {
    ...floor,
    ...(floor.subject === undefined ? {} : { subject: resolveText(floor.subject, table) }),
    ...(floor.drawn === undefined ? {} : { drawn: resolveList(floor.drawn, table) }),
    ...(floor.pinned === undefined ? {} : { pinned: resolveList(floor.pinned, table) })
  };
}

async function zoomOut(page: Page, presses: number): Promise<void> {
  for (let press = 0; press < presses; press += 1) {
    await page.getByRole("button", { name: "Zoom Out", exact: true }).click();
    await localMapStill(page);
  }
}

for (const map of MAPS) {
  const variant = manifest.variants.find(candidate => candidate.language === map.language)!;
  test.describe(`Rosetta in ${map.name === "repository" ? "this repository's map" : map.name}`, () => {
    for (const scenario of SCENARIOS) {
      test(scenario.name, async ({ page, baseURL }) => {
        // This repository's map is a thousand files: its first picture takes longer than a sample's.
        if (map.name === "repository") test.setTimeout(90_000);
        const graph = await loadGraph(page, map.base);
        const table = tokenTable(manifest, map.language, graph.nodes.map(node => node.id), map.root);
        let address = "", floor: Floor = {}, oracleAt: string | undefined;
        try {
          address = addressOf(scenario, map, table);
          floor = floorOf(scenario.floor, table);
          oracleAt = scenario.oracleAt === undefined ? undefined : resolveText(scenario.oracleAt, table);
        } catch (error) {
          // Not applicable is said, never passed: the token table cannot give what the scenario needs.
          if (!(error instanceof TokenError)) throw error;
          test.skip(true, `not applicable: ${error.message}`);
        }

        const folder = path.join(REPORTS, map.name);
        const name = slug(scenario.name);
        const names = displayNames(graph, graph.nodes.map(node => node.id));
        await page.setViewportSize(scenario.viewport);
        const watch = watchPage(page, baseURL!);
        await page.goto(address);
        await localMapStill(page);
        await zoomOut(page, scenario.zoomOut ?? 0);
        const context = { scenario: scenario.name, map: map.base, watch, names };
        const reading = await readSettled(page, { ...context, shotPath: path.join(folder, `${name}.png`) });
        const verdicts: Verdict[] = [judgeFloor(reading, floor), ...LAWS.map(law => law(reading))];
        const readings: Reading[] = [reading];

        if (scenario.reload) {
          await page.reload();
          const again = await readSettled(page, { ...context, shotPath: path.join(folder, `${name}-reloaded.png`) });
          readings.push(again);
          verdicts.push(samePicture("a reload gives the same picture", reading, again));
        }
        if (oracleAt !== undefined) {
          const references: OracleEdge[] = graph.links.map(link => ({
            consumer: typeof link.source === "string" ? link.source : link.source.id,
            provider: typeof link.target === "string" ? link.target : link.target.id
          }));
          verdicts.push(wiresMatchData(reading, oracleAt, references));
          const compiler = variant.compilerEdges ? readOracleEdges(path.join(PROGRAMS, variant.compilerEdges), path.join(PROGRAMS, variant.path)) : undefined;
          verdicts.push(wiresMatchOracle(reading, oracleAt, compiler ? {
            edges: compiler.edges.map(edge => ({ consumer: `${map.root}${edge.from}`, provider: `${map.root}${edge.to}` })),
            documents: compiler.documents.map(document => `${map.root}${document}`)
          } : null));
        }

        fs.mkdirSync(folder, { recursive: true });
        fs.writeFileSync(path.join(folder, `${name}.json`), `${JSON.stringify({ scenario: scenario.name, map: map.name, address, verdicts, readings }, null, 2)}\n`, "utf8");
        for (const verdict of verdicts) {
          test.info().annotations.push({ type: `${verdict.rank}: ${verdict.outcome}`, description: [verdict.judgment, ...verdict.findings].join("\n  ") });
        }
        // Every promise is judged and every broken one reported, so one scenario lists all it broke.
        for (const verdict of verdicts) expect.soft(verdict.outcome === "broken" ? verdict.findings : [], `${verdict.rank}: ${verdict.judgment}`).toEqual([]);
      });
    }
  });
}
