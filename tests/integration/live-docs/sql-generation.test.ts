/**
 * A SQL script's names reach a Live Doc that the graph reads back. On
 * 2026-11-19 a cold run on tSQLt found generation stopped by one apostrophe in
 * a bracketed procedure name, `[test that it doesn't fail]`: the SQL reader
 * took the apostrophe for the start of a string, the name ran across lines,
 * and the doc it wrote could not be read. This runs the generator over the
 * smallest such script, and over one in tSQLt's own shape.
 */
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import { generateLiveDocs } from "@live-documentation/generator/generator";

it("generates docs the graph reads back when a bracketed SQL name holds an apostrophe", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sql-generation-"));
  const files: Record<string, string> = {
    "smallest.sql": "CREATE PROC [a'b]\n'\nx]",
    "Tests/RunTests.class.sql": [
      "EXEC tSQLt.NewTestClass 'RunTests';",
      "GO",
      "CREATE PROCEDURE RunTests.[test that it doesn't fail]",
      "AS",
      "BEGIN",
      "    EXEC tSQLt.ExpectNoException;",
      "    EXEC RunTests.[helper that won't fail];",
      "END;",
      "GO",
      "CREATE PROCEDURE RunTests.[helper that won't fail] AS RETURN 0;",
      "GO"
    ].join("\r\n")
  };
  try {
    for (const [name, content] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
      fs.writeFileSync(path.join(root, name), content);
    }
    const config = normalizeLiveDocumentationConfig();
    await generateLiveDocs({ workspaceRoot: root, config, logger: { info: () => undefined, warn: () => undefined, error: (message) => { throw new Error(message); } } });
    const graph = await readLiveDocGraph({ workspaceRoot: root, config });
    expect(graph.files["smallest.sql"].symbols.map((symbol) => symbol.name)).toEqual(["a'b"]);
    expect(graph.files["Tests/RunTests.class.sql"].symbols.map((symbol) => symbol.name)).toEqual([
      "RunTests.test that it doesn't fail",
      "RunTests.helper that won't fail"
    ]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
