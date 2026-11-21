// Probe of November 21, 2026 (not product code): the reader on repositories of unusual forms, each made with git
// beforehand (a shallow clone, a clone borrowing objects through alternates, a reftable clone, a SHA-256 repository),
// as a page would meet them (a host rooted at the folder, reaching nothing outside it) and as the command line would
// (a host rooted at "/"). Writes `results/forms.json` and prints it.
//   node forms.mjs <name>=<folder> ...
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { openRepository } from "./git-reader.mjs";
import { nodeHost } from "./node-host.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = [];
for (const argument of process.argv.slice(2)) {
  const [name, folder] = argument.split("=");
  for (const as of ["page", "command line"]) {
    const host = nodeHost(as === "page" ? folder : "/");
    const gitDir = as === "page" ? ".git" : `${folder.slice(1)}/.git`;
    const row = { name, as };
    try {
      const repository = await openRepository(host, gitDir, as === "page" ? {} : { reach: (absolute) => absolute.slice(1) });
      const head = await repository.resolve("HEAD");
      const mainline = await repository.mainline(head.id);
      let changes = 0;
      let bytes = 0;
      for (let i = 0; i < mainline.length; i += 1) {
        const list = await repository.changes(i === 0 ? null : mainline[i - 1].tree, mainline[i].tree);
        changes += list.length;
        for (const [status, , id, mode] of list) if (status !== "D" && mode !== "160000") bytes += (await repository.blob(id)).length;
      }
      Object.assign(row, { read: true, head: head.id, mainline: mainline.length, shallowMarks: repository.shallow.size, changedPaths: changes, megabytes: +(bytes / 1048576).toFixed(1), notes: repository.notes });
    } catch (error) {
      Object.assign(row, { read: false, why: String(error.message ?? error).slice(0, 300) });
    }
    await host.close();
    out.push(row);
  }
}
fs.writeFileSync(path.join(here, "results", "forms.json"), `${JSON.stringify(out, null, 2)}\n`);
console.log(JSON.stringify(out, null, 1));
