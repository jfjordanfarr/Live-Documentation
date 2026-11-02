import { expect, test, type Page } from "@playwright/test";

import { describeFaults, overlapsAmong, textBoxes, truncations } from "./design-audit";
import { currentSnapshot } from "./search-bar";
import { noReaderHandles } from "../../packages/engine/src/config/liveDocumentationConfig";

/**
 * The Knowledge Sources panel says what the graph index says, and no more
 * (rewritten 2026-10-08 from the dead code sweep, and 2026-10-15 around the
 * entry points the docs declare): the bundle's shape, the files most used and
 * most using, the entry points with their reasons, what a walk from them
 * reaches and what it does not, the "Reachable from" field, the disconnected
 * groups of the files (2026-11-02), the related documentation and the export. Each expectation here is computed again from
 * `explorer-data.json` by this file's own walk, independently of the panel's
 * module and of the engine's, so that a panel that counted wrong would fail.
 * Which kinds of file a reader handles is the engine's registry by definition
 * (`noReaderHandles`), so the files nothing reaches are split by it: not read
 * apart from unreachable (2026-10-22).
 */

test.use({ viewport: { width: 1400, height: 1000 } });

/** The text the design audit reads on this panel. */
const TEXT = [
  "#view-sources h1",
  "#view-sources .sources-title",
  "#view-sources .sources-group-name",
  "#view-sources .sources-directory-name",
  "#view-sources .sources-row-label",
  "#view-sources .sources-row-value",
  "#view-sources .sources-file",
  "#view-sources .sources-path",
  "#view-sources .sources-count",
  "#view-sources .sources-reasons",
  "#view-sources .sources-reach-label",
  "#view-sources .sources-reach-status",
  "#view-sources .sources-status",
  "#view-sources .sources-seed",
  "#view-sources .sources-declare-line",
  "#view-sources .sources-directory",
  "#view-sources .sources-inline",
  "#view-sources .sources-note",
  "#view-sources .sources-panel-desc",
  "#view-sources .sources-empty",
  "#view-sources .sources-symbols code",
  "#view-sources .sources-kind",
  "#view-sources .bundled-tree-name",
  "#view-sources .export-label",
  "#view-sources .export-format-option span",
  "#view-sources .action-btn"
];

interface IndexEntry { reason: string }
interface IndexFile { codePath: string; archetype?: string; entries: IndexEntry[]; inbound: string[]; outbound: string[]; symbols: { name: string; slug?: string }[]; edges: { to?: string; toSymbol?: string }[] }
interface Bundle { graph: { files: Record<string, IndexFile> }; sampleRoots?: string[] }

/** A breadth-first walk of this file's own, along what each file depends on; the starts are not among the reached. */
function reachedFrom(files: Record<string, IndexFile>, starts: readonly string[]): Map<string, number> {
  const hops = new Map<string, number>(starts.map(start => [start, 0]));
  const queue = [...starts];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const id = queue[cursor];
    for (const next of files[id]?.outbound ?? []) {
      if (hops.has(next)) continue;
      hops.set(next, hops.get(id)! + 1);
      queue.push(next);
    }
  }
  for (const start of starts) hops.delete(start);
  return hops;
}

/**
 * The disconnected groups of this file's own, by a union-find over each file's dependencies, so that a link joins its
 * two files whichever way it runs: each group of two or more by its seed, the member with the most distinct neighbours,
 * ties by path, largest first and then by seed; and the files joined to none, in path order.
 */
function groupsOf(files: Record<string, IndexFile>): { groups: { seed: string; size: number }[]; alone: string[] } {
  const ids = Object.keys(files).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const parent = new Map(ids.map(id => [id, id]));
  const root = (id: string): string => (parent.get(id) === id ? id : root(parent.get(id)!));
  const near = new Map(ids.map(id => [id, new Set<string>()]));
  for (const id of ids) {
    for (const to of files[id].outbound) {
      if (to === id || !parent.has(to)) continue;
      near.get(id)!.add(to);
      near.get(to)!.add(id);
      parent.set(root(id), root(to));
    }
  }
  const byRoot = new Map<string, string[]>();
  for (const id of ids) byRoot.set(root(id), [...(byRoot.get(root(id)) ?? []), id]);
  const sets = [...byRoot.values()];
  const groups = sets.filter(members => members.length > 1).map(members => ({
    seed: members.reduce((best, id) => (near.get(id)!.size > near.get(best)!.size ? id : best)),
    size: members.length
  })).sort((a, b) => b.size - a.size || (a.seed < b.seed ? -1 : a.seed > b.seed ? 1 : 0));
  return { groups, alone: sets.filter(members => members.length === 1).map(([id]) => id) };
}

/** What the index says, read again here. */
async function expectations(page: Page, base: string) {
  const data = await (await page.request.get(`${base}explorer-data.json`)).json() as Bundle;
  // In path order as the engine sorts it, by code point, so that the lists compare one to one.
  const files = Object.values(data.graph.files).sort((a, b) => (a.codePath < b.codePath ? -1 : a.codePath > b.codePath ? 1 : 0));
  const byPath = data.graph.files;
  const isTest = (file: IndexFile): boolean => file.archetype === "test";
  const entries = files.filter(file => file.entries.length > 0 || isTest(file));
  const reached = reachedFrom(byPath, entries.map(file => file.codePath));
  const fromCode = reachedFrom(byPath, entries.filter(file => !isTest(file)).map(file => file.codePath));
  const startSet = new Set(entries.map(file => file.codePath));
  const unreached = files.filter(file => !startSet.has(file.codePath) && !reached.has(file.codePath));
  const unreachable = unreached.filter(file => !noReaderHandles(file.codePath));
  const unread = unreached.filter(file => noReaderHandles(file.codePath));
  const testsOnly = files.filter(file => reached.has(file.codePath) && !fromCode.has(file.codePath));
  const mostUsed = [...files].sort((a, b) => b.inbound.length - a.inbound.length || a.codePath.localeCompare(b.codePath))[0];
  const named = new Set<string>();
  for (const file of files) for (const edge of file.edges) if (edge.to === mostUsed.codePath && edge.toSymbol && edge.to !== file.codePath) named.add(edge.toSymbol);
  const sampleRoots = data.sampleRoots ?? [];
  const underSample = (path: string): boolean => sampleRoots.some(root => path === root || path.startsWith(`${root}/`));
  return { files, byPath, entries, reached, unreachable, unread, testsOnly, mostUsed, mostUsedSymbolsNamed: named.size, sampleRoots, underSample, groups: groupsOf(byPath) };
}

async function open(page: Page, base: string): Promise<void> {
  await page.goto(`${base}?view=sources`);
  await page.waitForSelector("#sources-container h1", { timeout: 15_000 });
}

for (const [label, base] of [["this repository", "/"], ["the estate sample", "/samples/estate/"]] as const) {
  test(`${label}: the panel's counts are the index's, the entry points carry their reasons, a named file goes to the detail panel, and no text collides`, async ({ page }) => {
    const expected = await expectations(page, base);
    await open(page, base);

    const bundle = page.locator('[data-section="bundle"]');
    await expect(bundle.locator('.sources-row[data-row="files"] .sources-row-value')).toHaveText(new RegExp(`^${expected.files.length.toLocaleString()}: `));

    const used = page.locator('[data-section="use"] ol').first().locator("li").first();
    await expect(used.locator(".sources-file")).toHaveText(expected.mostUsed.codePath.slice(expected.mostUsed.codePath.lastIndexOf("/") + 1));
    await expect(used.locator(".sources-count")).toHaveText(`used by ${expected.mostUsed.inbound.length.toLocaleString()} files, ${expected.mostUsedSymbolsNamed} of ${expected.mostUsed.symbols.length} symbol${expected.mostUsed.symbols.length === 1 ? "" : "s"}`);

    // The entry points: their number, and the status line that says what they reach.
    const section = page.locator('[data-section="entries"]');
    await expect(section.locator("h2 .sources-count")).toHaveText(expected.entries.length.toLocaleString());
    const others = expected.files.length - expected.entries.length;
    await expect(section.locator(".sources-reach-status")).toHaveText(`${expected.entries.length.toLocaleString()} entry points reach ${expected.reached.size.toLocaleString()} of the other ${others.toLocaleString()} files.`);

    // Every group by reason lists the index's files with that reason, the sample programs' under their root.
    for (const [reason, group] of [["program", "Programs"], ["command", "Commands"], ["module", "Modules"], ["opening", "Openings served"], ["tooling", "Tooling inputs"], ["declared", "Declared"]] as const) {
      const files = expected.entries.filter(file => file.entries.some(entry => entry.reason === reason));
      const details = section.locator(`details[data-reason="${reason}"]`);
      if (files.length === 0) {
        await expect(details).toHaveCount(0);
        continue;
      }
      await expect(details.locator("> summary .sources-group-name")).toHaveText(group);
      await expect(details.locator("> summary .sources-count")).toHaveText(files.length.toLocaleString());
      await details.locator("> summary").click();
      const own = files.filter(file => !expected.underSample(file.codePath)).map(file => file.codePath).sort();
      const listed = await details.locator("> ul .sources-file").evaluateAll(buttons => buttons.map(button => (button as HTMLElement).dataset.nodeId));
      expect(listed.sort(), `${label}: ${group}`).toEqual(own);
      for (const root of expected.sampleRoots) {
        const sample = files.filter(file => file.codePath.startsWith(`${root}/`));
        const fold = details.locator(`details[data-sample="${root}"]`);
        if (sample.length === 0) {
          await expect(fold).toHaveCount(0);
          continue;
        }
        await expect(fold.locator("> summary .sources-count")).toHaveText(`${sample.length.toLocaleString()} sample entr${sample.length === 1 ? "y" : "ies"}`);
      }
    }
    const tests = expected.entries.filter(file => file.archetype === "test");
    if (tests.length > 0) await expect(section.locator('details[data-reason="test"] > summary .sources-count')).toHaveText(tests.length.toLocaleString());

    // What nothing reaches, by archetype, every one a button; what no reader handles, apart; and what only a test reaches.
    const unreachable = page.locator('[data-section="unreachable"]');
    await expect(unreachable.locator("h2 .sources-count")).toHaveText(expected.unreachable.length.toLocaleString());
    const groups = unreachable.locator('[data-list="unreachable"] details.sources-group[data-archetype]');
    let listed = 0;
    for (const group of await groups.all()) listed += await group.locator(".sources-file").count();
    expect(listed).toBe(expected.unreachable.length);
    const unread = unreachable.locator("h3", { hasText: "Not read" });
    await expect(unread.locator(".sources-count")).toHaveText(expected.unread.length.toLocaleString());
    const unreadListed = await unreachable.locator('[data-list="unread"] .sources-file').evaluateAll(buttons => buttons.map(button => (button as HTMLElement).dataset.nodeId));
    expect(unreadListed.sort()).toEqual(expected.unread.map(file => file.codePath).sort());
    await expect(unreachable.locator("h3", { hasText: "Reached only from tests" }).locator(".sources-count")).toHaveText(expected.testsOnly.length.toLocaleString());
    const testsOnlyListed = await unreachable.locator('[data-list="tests-only"] .sources-file').evaluateAll(buttons => buttons.map(button => (button as HTMLElement).dataset.nodeId));
    expect(testsOnlyListed.sort()).toEqual(expected.testsOnly.map(file => file.codePath).sort());

    // The disconnected groups: how many, the status line, each group by its seed as a link to the Local Map in 3D, and the lone files folded.
    const groupsSection = page.locator('[data-section="groups"]');
    const { groups: islands, alone } = expected.groups;
    const plural = (count: number, noun: string): string => `${count.toLocaleString()} ${noun}${count === 1 ? "" : "s"}`;
    await expect(groupsSection.locator("h2 .sources-title")).toHaveText("Groups");
    await expect(groupsSection.locator("h2 .sources-count")).toHaveText(islands.length.toLocaleString());
    await expect(groupsSection.locator(".sources-status")).toHaveText(`${plural(expected.files.length - alone.length, "file")} in ${plural(islands.length, "group")}; ${plural(alone.length, "file")} alone.`);
    const seeds = await groupsSection.locator('[data-list="groups"] .sources-seed').evaluateAll(links => links.map(link => link.textContent));
    expect(seeds).toEqual(islands.map(group => group.seed));
    await expect(groupsSection.locator('[data-list="groups"] > li > .sources-count')).toHaveText(islands.map(group => plural(group.size, "file")));
    if (islands.length > 0) {
      await expect(groupsSection.locator(".sources-seed").first()).toHaveAttribute("href", `?view=local&mode=3d&node=${encodeURIComponent(islands[0].seed)}`);
    }
    const lone = groupsSection.locator('details[data-list="alone"]');
    if (alone.length === 0) {
      await expect(lone).toHaveCount(0);
    } else {
      await expect(lone).not.toHaveAttribute("open");
      await expect(lone.locator("> summary .sources-count")).toHaveText(plural(alone.length, "file"));
      const loneListed = await lone.locator(".sources-file").evaluateAll(buttons => buttons.map(button => (button as HTMLElement).dataset.nodeId));
      expect(loneListed).toEqual(alone);
    }

    // Reading a named file leaves the source view, map subject and retained exploration in place.
    const first = section.locator("details[data-reason] > ul .sources-file").first();
    const firstPath = await first.getAttribute("data-node-id");
    const beforeInspection = currentSnapshot(page);
    expect(beforeInspection.view).toBe("sources");
    const contextBefore = await page.locator("#context-name").innerText();
    await first.click();
    await expect(page.locator("#detail-panel")).toHaveAttribute("aria-hidden", "false");
    await expect(page.locator("#detail-body .path-value")).toHaveText(firstPath!);
    expect(currentSnapshot(page).inspection).toEqual({ kind: "file", nodeId: firstPath });
    expect(currentSnapshot(page).view).toBe("sources");
    expect(currentSnapshot(page).selectedNodeId).toBe(beforeInspection.selectedNodeId);
    expect(currentSnapshot(page).pinSet).toEqual(beforeInspection.pinSet);
    await expect(page.locator("#context-name")).toHaveText(contextBefore);
    await expect(page.locator("#sources-container h1")).toBeVisible();

    // The words keep apart, with groups open.
    const boxes = await textBoxes(page, TEXT);
    expect(boxes.length).toBeGreaterThan(20);
    const overlaps = overlapsAmong(boxes);
    const cut = await truncations(page, TEXT);
    expect(overlaps.length + cut.length, describeFaults(overlaps, cut)).toBe(0);
  });

  test(`${label}: the Reachable from field walks from a chosen file, offers its declaration, rides the link, and the clear goes back to the entries`, async ({ page }) => {
    const expected = await expectations(page, base);
    // A file with something beyond it that is not itself an entry.
    const chosen = expected.files.find(file => file.outbound.length > 0 && file.entries.length === 0 && file.archetype !== "test" && !expected.underSample(file.codePath))!;
    const reached = reachedFrom(expected.byPath, [chosen.codePath]);
    const unreadFromChosen = expected.files.filter(file => file.codePath !== chosen.codePath && !reached.has(file.codePath) && noReaderHandles(file.codePath)).length;
    await open(page, base);

    const field = page.locator("#sources-reach-from");
    await field.fill(chosen.codePath.slice(chosen.codePath.lastIndexOf("/") + 1));
    await page.locator(`#sources-reach-results .search-row--file:has(.search-row-context:text-is("${chosen.codePath}"))`).first().click();

    const section = page.locator('[data-section="entries"]');
    await expect(section.locator(".sources-reach-status")).toHaveText(`${chosen.codePath} reaches ${reached.size.toLocaleString()} of the other ${(expected.files.length - 1).toLocaleString()} files.`);
    await expect(field).toHaveValue(chosen.codePath);
    await expect(section.locator(".sources-declare-line")).toHaveText(`"entryPoints": ["${chosen.codePath}"]`);
    await expect(section.locator("details[data-reason]")).toHaveCount(0);
    const unreachable = page.locator('[data-section="unreachable"]');
    await expect(unreachable.locator("h2 .sources-title")).toHaveText(`Unreachable from ${chosen.codePath}`);
    await expect(unreachable.locator("h2 .sources-count")).toHaveText((expected.files.length - 1 - reached.size - unreadFromChosen).toLocaleString());
    await expect(unreachable.locator("h3 .sources-title")).toHaveText(["Not read"]);
    await expect(unreachable.locator("h3 .sources-count")).toHaveText(unreadFromChosen.toLocaleString());

    // The choice rides the address: a reload shows the same walk.
    await page.reload();
    await page.waitForSelector("#sources-container h1", { timeout: 15_000 });
    await expect(page.locator("#sources-reach-from")).toHaveValue(chosen.codePath);
    await expect(page.locator('[data-section="entries"] .sources-reach-status')).toHaveText(new RegExp(`^${chosen.codePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} reaches `));

    // The export carries the walk as the CLI prints it.
    const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#download-facts-btn").click()]);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    const facts = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { reach: { from: string; starts: { path: string }[]; reached: { path: string; hops: number }[] } };
    expect(facts.reach.from).toBe("asked");
    expect(facts.reach.starts.map(start => start.path)).toEqual([chosen.codePath]);
    expect(facts.reach.reached.length).toBe(reached.size);

    // The clear puts the entry points back.
    await page.locator("#sources-reach-clear").click();
    await expect(page.locator('[data-section="entries"] h2 .sources-count')).toHaveText(expected.entries.length.toLocaleString());
    await expect(page.locator("#sources-reach-from")).toHaveValue("");
    await expect(page.locator('[data-section="entries"] .sources-declare-line')).toHaveCount(0);
  });

  test(`${label}: the panel's facts come out as JSON`, async ({ page }) => {
    const expected = await expectations(page, base);
    await open(page, base);
    const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#download-facts-btn").click()]);
    expect(download.suggestedFilename()).toBe("knowledge-sources.json");
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    const facts = JSON.parse(Buffer.concat(chunks).toString("utf8")) as { shape: { files: number }; reach: { from: string; starts: { path: string; reasons: string[] }[]; unreachable: { path: string }[]; unread: { path: string }[]; testsOnly: { path: string }[] }; mostUsed: { path: string }[] };
    expect(facts.shape.files).toBe(expected.files.length);
    expect(facts.reach.from).toBe("entries");
    expect(facts.reach.starts.map(start => start.path)).toEqual(expected.entries.map(file => file.codePath));
    expect(facts.reach.unreachable.map(entry => entry.path)).toEqual(expected.unreachable.map(file => file.codePath));
    expect(facts.reach.unread.map(entry => entry.path)).toEqual(expected.unread.map(file => file.codePath));
    expect(facts.reach.testsOnly.map(entry => entry.path)).toEqual(expected.testsOnly.map(file => file.codePath));
    expect(facts.mostUsed[0].path).toBe(expected.mostUsed.codePath);
  });
}
