import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { NODE_FILE_HOST } from "../../tooling/nodeHost";
import { workspaceReads } from "../../tooling/workspaceFiles";
import { goAdapter } from "./go";

/**
 * The Go reader's walk up to its `go.mod`, held to the run's promise that the host is asked for each file once
 * (`workspaceFiles.ts`: "once per file per run"), found by the engine review of 2026-11-22. The walk asks the run's
 * reads for `go.mod` in every folder above a Go file, inside the workspace; where there is none the read fails, a failed
 * read is kept by no one, and so the next Go file of that folder asks the host again for the same absent file. Over the
 * `go/depot` sample a scan asked the host 32 times for eight `go.mod` files that do not exist (`report/go.mod` eight
 * times), each a wait on the browser in a page. The page check cannot see it: its stand-in counts a read only when the
 * file is there (`bytesOf` in `tests/page-scan/stand-ins/fs.mjs`). The asks are counted here at the host, failures
 * among them, as the second pass makes them: each Go file's reader in path order, on one run's reads.
 */

const SAMPLE = path.resolve(__dirname, "..", "..", "..", "..", "..", "tests", "integration", "programs", "go", "depot");
const FILES = [
  "go.mod", "cmd/depot/main.go", "internal/audit/audit.go", "report/count.go", "report/format.go", "report/report.go",
  "report/report_test.go", "stock/item.go", "stock/item_test.go", "stock/quantity.go", "stock/quantity_test.go",
  "store/base.go", "store/inventory.go", "store/memory/memory.go"
];

describe("the Go reader's walk up to its go.mod", () => {
  it("asks the host for each path once in a run, a path with no file among them", async () => {
    const asked = new Map<string, number>();
    const count = (file: string): void => {
      const relative = path.relative(SAMPLE, file).split(path.sep).join("/");
      asked.set(relative, (asked.get(relative) ?? 0) + 1);
    };
    const reads = workspaceReads({
      read: (file) => {
        count(file);
        return NODE_FILE_HOST.read(file);
      },
      head: (file, bytes) => {
        count(file);
        return NODE_FILE_HOST.head(file, bytes);
      }
    }, 512);
    const fileIndex = Object.assign(new Set(FILES), reads);
    for (const file of FILES.filter((each) => each.endsWith(".go"))) {
      await goAdapter.analyze({ absolutePath: path.join(SAMPLE, file), workspaceRoot: SAMPLE, fileIndex });
    }
    const askedMoreThanOnce = Object.fromEntries([...asked].filter(([, times]) => times > 1));
    // Seen 2026-11-22: { "report/go.mod": 4, "stock/go.mod": 4, "store/go.mod": 3, ... } over this one pass.
    expect(askedMoreThanOnce).toEqual({});
  });
});
