import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { sourceDigests, sourcesDiffer } from "./sources";

describe("a kept record tied to the files it was made from", () => {
  const roots: string[] = [];
  afterEach(() => {
    for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
  });
  const folder = (files: Record<string, string>): string => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "oracle-sources-"));
    roots.push(root);
    for (const [file, text] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      fs.writeFileSync(path.join(root, file), text);
    }
    return root;
  };

  it("agrees with the folder it was made from, whatever its line endings", () => {
    const root = folder({ "A/A.csproj": "<Project />\n", "A/Thing.cs": "class Thing {}\n" });
    const kept = sourceDigests(root, ["A/A.csproj", "A/Thing.cs"]);
    fs.writeFileSync(path.join(root, "A/Thing.cs"), "class Thing {}\r\n");
    expect(sourcesDiffer(sourceDigests(root, ["A/A.csproj", "A/Thing.cs"]), kept)).toEqual([]);
  });

  it("names a file added, one gone and one changed since, and a record that names none", () => {
    const root = folder({ "A/A.csproj": "<Project />\n", "A/Thing.cs": "class Thing {}\n", "A/Gone.cs": "class Gone {}\n" });
    const kept = sourceDigests(root, ["A/A.csproj", "A/Gone.cs", "A/Thing.cs"]);
    fs.writeFileSync(path.join(root, "A/Thing.cs"), "class Thing { int x; }\n");
    fs.writeFileSync(path.join(root, "A/New.cs"), "class New {}\n");
    expect(sourcesDiffer(sourceDigests(root, ["A/A.csproj", "A/New.cs", "A/Thing.cs"]), kept)).toEqual(["A/Gone.cs is gone", "A/New.cs is new", "A/Thing.cs has changed"]);
    expect(sourcesDiffer({}, undefined)).toEqual(["the record names no sources it was made from"]);
  });
});
