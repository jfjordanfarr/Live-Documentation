// Writes one commit's tree with the history's own writer (`workingTree` of the built git.js, the options the history
// gives it) in a process of its own, and tells its parent over IPC what `workingTree` returned, so that pool-driver.cjs
// --tree-in-process can take the writing of trees off the pool's one process. Nothing about the tree changes.
//   (forked by pool-driver.cjs) node tree-writer.cjs <root> <commit> <directory>
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const [root, commit, directory] = process.argv.slice(2);
const { openGitRepository } = require(path.join(root, "packages/engine/dist/live-docs/history/git.js"));
const config = require(path.join(root, "packages/engine/dist/config/liveDocumentationConfig.js"));
const { treeOptions } = require(path.join(root, "packages/generator/dist/history/regenerate.js"));

(async () => {
  const versionControl = await openGitRepository(root);
  const input = config.parseLiveDocumentationConfigBytes(fs.readFileSync(path.join(root, ".live-docs.config.json")));
  const configuration = config.normalizeLiveDocumentationConfig({ ...config.DEFAULT_LIVE_DOCUMENTATION_CONFIG, ...input });
  const tree = await versionControl.workingTree(commit, directory, treeOptions(configuration, directory));
  const usage = process.resourceUsage();
  process.send({ root: tree.root, environment: tree.environment, unwritten: tree.unwritten, cpu: (usage.userCPUTime + usage.systemCPUTime) / 1e6 }, () => process.exit(0));
})().catch((error) => {
  process.send({ error: String(error && error.stack ? error.stack : error) }, () => process.exit(1));
});
