/**
 * Node's side of the standing check that the engine runs in a page: the generator, under Node as the command line
 * runs it, over a folder, with the clock the page is given, so that the two runs' `Generated At` lines are the same
 * instant. Prints one line of JSON: how long `generateLiveDocs` took, the files it processed and those it could not
 * map. The folder must lie outside every git repository, so that Node takes the way for no git that a page takes.
 *
 *   tsx --tsconfig tsconfig.base.json tests/page-scan/node-scan.ts <folder> <ISO instant>
 */
import { generateLiveDocs } from "@live-documentation/generator/generator";

async function main(): Promise<void> {
  const [folder, now] = process.argv.slice(2);
  if (!folder || !now) throw new Error("Usage: node-scan.ts <folder> <ISO instant>");
  const warnings: string[] = [];
  const started = performance.now();
  const result = await generateLiveDocs({
    workspaceRoot: folder,
    now: () => new Date(now),
    logger: { info: () => undefined, warn: (message) => warnings.push(message), error: (message) => warnings.push(message) }
  });
  const ms = performance.now() - started;
  console.log(JSON.stringify({
    ms,
    processed: result.processed,
    failed: result.failed.map((entry) => ({ sourcePath: entry.sourcePath, reason: entry.reason })),
    warnings
  }));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
