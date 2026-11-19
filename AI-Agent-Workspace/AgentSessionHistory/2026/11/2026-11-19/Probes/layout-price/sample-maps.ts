/**
 * A seeded draw of maps for the first order's sample: single files as a link opens them, files with their own directory
 * opened, and sets of two to four files pinned whole, from this repository's source and from the estate. Prints one
 * `capture-addresses.ts` argument per map. Files that are tests, documents or assets are not drawn as subjects.
 *
 *   npx tsx --tsconfig ./tsconfig.base.json <this file> <seed> <per kind in the repository> <per kind in the estate>
 */
import { compressSnapshot, DEFAULT_SNAPSHOT } from "../../../../../../../packages/explorer/src/client/persistence/compressed-url-state";
import { addPin, EMPTY_PIN_SET } from "../../../../../../../packages/explorer/src/client/views/pin-state";
import { loadBundleGraph, type ScopeRun } from "../../../../../../../scripts/layout-lab/scopes";

async function main(): Promise<void> {
  const [seedArg, repoArg, estateArg] = process.argv.slice(2);
  let state = Number(seedArg);
  const next = (): number => { state = (state * 1103515245 + 12345) % 2147483648; return state / 2147483648; };
  const pick = <T>(list: readonly T[]): T => list[Math.floor(next() * list.length)];
  for (const [bundle, base, count] of [["repository", "/", Number(repoArg)], ["estate", "/samples/estate/", Number(estateArg)]] as const) {
    const graph = await loadBundleGraph({ bundle, base } as ScopeRun);
    const files = graph.nodes.filter(node => /\.(ts|cs)$/u.test(node.id) && !/\.test\.ts$|\.d\.ts$/u.test(node.id)
      && (bundle === "estate" || node.id.startsWith("packages/") || node.id.startsWith("scripts/")) && (node.archetype ?? "").toLowerCase() !== "test").map(node => node.id).sort();
    const directoryOf = (id: string): string => id.slice(0, id.lastIndexOf("/"));
    for (let i = 0; i < count; i++) {
      const file = pick(files);
      console.log(`${bundle}-file-${i}=${bundle}|${base}|${base}?view=local&node=${encodeURIComponent(file)}`);
    }
    for (let i = 0; i < count; i++) {
      const file = pick(files);
      const s = compressSnapshot({ ...DEFAULT_SNAPSHOT, selectedNodeId: file, openDirectories: new Set([directoryOf(file)]) });
      console.log(`${bundle}-opened-${i}=${bundle}|${base}|${base}?s=${s}`);
    }
    for (let i = 0; i < count; i++) {
      const pins = [...new Set(Array.from({ length: 2 + Math.floor(next() * 3) }, () => pick(files)))];
      const s = compressSnapshot({ ...DEFAULT_SNAPSHOT, selectedNodeId: pins[0], pinSet: pins.reduce((set, id) => addPin(set, id, "*"), EMPTY_PIN_SET) });
      console.log(`${bundle}-pins-${i}=${bundle}|${base}|${base}?s=${s}`);
    }
  }
}

main().catch(error => { console.error(error); process.exit(1); });
