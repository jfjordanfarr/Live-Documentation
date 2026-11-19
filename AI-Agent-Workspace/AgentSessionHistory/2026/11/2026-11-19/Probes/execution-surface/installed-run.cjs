// Run from a scratch folder where the three packed packages were installed with production dependencies only:
//   node <this file> <install folder> <folder to map>
// Says whether generate runs from the installed packages, and whether the Explorer's builder loads.
const path = require("node:path");
const [installDir, folder] = process.argv.slice(2);
const from = (id) => require(require.resolve(id, { paths: [installDir] }));
(async () => {
  try {
    const { generateLiveDocs } = from("@live-documentation/generator");
    const result = await generateLiveDocs({ workspaceRoot: folder, config: {}, logger: { info() {}, warn() {}, error() {} } });
    console.log(JSON.stringify({ generate: "ok", processed: result.processed, written: result.written }));
  } catch (error) {
    console.log(JSON.stringify({ generate: "failed", error: String(error).slice(0, 300) }));
  }
  try {
    const builder = from("@live-documentation/explorer/shared/staticBuilder");
    await builder.buildStaticExplorer?.({ workspaceRoot: folder, outputDir: path.join(folder, "..", "explorer-out") });
    console.log(JSON.stringify({ visualize: "ok", exports: Object.keys(builder) }));
  } catch (error) {
    console.log(JSON.stringify({ visualize: "failed", error: String(error).slice(0, 300) }));
  }
})();
