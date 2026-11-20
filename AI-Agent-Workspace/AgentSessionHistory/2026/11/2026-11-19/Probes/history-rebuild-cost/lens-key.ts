// Prints the history's lens key for this checkout's committed code and its configuration, as the history command computes it.
import { readFileSync } from "node:fs";
import path from "node:path";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG, normalizeLiveDocumentationConfig, parseLiveDocumentationConfigBytes } from "../../../../../../../packages/engine/src/config/liveDocumentationConfig";
import { lensOf } from "../../../../../../../packages/engine/src/live-docs/history/lens";
import { generatorIdentity } from "../../../../../../../packages/generator/src/history/generatorIdentity";

async function main(): Promise<void> {
  const root = path.resolve(__dirname, "..", "..", "..", "..", "..", "..", "..");
  const input = parseLiveDocumentationConfigBytes(readFileSync(path.join(root, ".live-docs.config.json")));
  const configuration = normalizeLiveDocumentationConfig({ ...DEFAULT_LIVE_DOCUMENTATION_CONFIG, ...input });
  const identity = await generatorIdentity();
  const lens = lensOf(identity, configuration);
  console.log(JSON.stringify({ key: lens.key, code: identity.code, modified: identity.modified, commit: identity.commit, unicode: identity.unicode, node: process.version }));
}

void main();
