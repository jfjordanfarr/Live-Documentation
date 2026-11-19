import { describe, expect, it } from "vitest";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "../../config/liveDocumentationConfig";
import type { CommitInfo, HistoryLens, HistorySource } from "./format";
import { emptyFileRows, type FileRows, type Rows } from "./rows";
import { SequenceBuilder } from "./sequence";
import type { Shape } from "./shape";
import { textInPart, textReferences, wordsDirectory, wordsOfFile, wordsPartFile, wordsStore } from "./words";

const LENS: HistoryLens = { key: "0123456789abcdef", generator: { version: "0.0.0", code: null, commit: null, modified: null }, configuration: DEFAULT_LIVE_DOCUMENTATION_CONFIG };
const SOURCE: HistorySource = { system: "git", root: ".", branch: "main", head: "c3", shallow: false, knowledgeBegins: "c0", sampling: { rule: "every-commit" }, authors: false };

function commit(index: number): CommitInfo {
  return { id: `c${index}`, parents: index === 0 ? [] : [`c${index - 1}`], date: new Date(Date.UTC(2026, 0, 1 + index)).toISOString(), subject: `change ${index}` };
}

function moment(files: Record<string, Partial<FileRows>>): { shape: Shape; rows: Rows } {
  const shape: Shape = { files: new Map(), edges: new Map(), docLinks: new Set() };
  const rows: Rows = new Map();
  for (const [path, file] of Object.entries(files)) {
    const own = { ...emptyFileRows(), ...file };
    rows.set(path, own);
    shape.files.set(path, { archetype: "implementation", symbols: own.symbols.length, entry: false });
  }
  return { shape, rows };
}

const describe1 = (text: number) => [{ name: "a", slug: "a", kind: "function", flags: [], references: [], text }];

/**
 * Four changes: the engine's words read at once and rewritten at the second, a description added to its symbol, the
 * app's doc unread until the third, and the engine renamed into another folder at the last, its words with it.
 */
const moments = [
  moment({ "src/engine/core.ts": { authored: 0, symbols: describe1(1) }, "src/app/main.ts": { authored: "unread" }, "README.ts": { authored: 0 } }),
  moment({ "src/engine/core.ts": { authored: 2, symbols: describe1(1) }, "src/app/main.ts": { authored: "unread" }, "README.ts": { authored: 0 } }),
  moment({ "src/engine/core.ts": { authored: 2, symbols: describe1(3) }, "src/app/main.ts": { authored: 4 }, "README.ts": { authored: 0 } }),
  moment({ "lib/engine/core.ts": { authored: 2, symbols: describe1(3) }, "src/app/main.ts": { authored: 4 }, "README.ts": { authored: 0 } })
];

function sequence(): ReturnType<SequenceBuilder["finish"]> {
  const builder = new SequenceBuilder({ lens: LENS, source: SOURCE }, commit(0), moments[0].shape, moments[0].rows);
  builder.add(commit(1), moments[1].shape, { renamed: [], modified: [] }, moments[1].rows);
  builder.add(commit(2), moments[2].shape, { renamed: [], modified: [] }, moments[2].rows);
  builder.add(commit(3), moments[3].shape, { renamed: [["src/engine/core.ts", "lib/engine/core.ts"]], modified: [] }, moments[3].rows);
  return builder.finish();
}

const TEXTS = ["### Purpose\nThe placeholder.", "Makes an a.", "### Purpose\nThe engine, rewritten.", "Makes an a, faster.", "### Purpose\nThe app."];

describe("the words store", () => {
  it("names each text in the part of the directory of the file that first names it there, each file's versions together", () => {
    const references = textReferences(sequence());
    expect([...references.keys()]).toEqual(["", "lib/engine", "src/app", "src/engine"]);
    expect(references.get("src/engine")).toEqual([0, 1, 2, 3]);
    expect(references.get("src/app")).toEqual([4]);
    // The renamed file brings the words it holds into its new folder's part.
    expect(references.get("lib/engine")).toEqual([2, 3]);
    // The same text in two folders is in both parts.
    expect(references.get("")).toEqual([0]);
  });

  it("holds every text the rows name at every step, read back through the part a file's directory names", () => {
    const history = sequence();
    const { head, parts } = wordsStore(history, "history-words", (id) => TEXTS[id]);
    expect(head).toEqual({ folder: "history-words", directories: ["", "lib/engine", "src/app", "src/engine"], texts: 5 });
    for (const [step, at] of moments.entries()) {
      for (const [path, file] of at.rows) {
        const words = wordsOfFile(at.rows, path);
        const part = parts[Number(wordsPartFile(head, path)!.replace(".json", ""))];
        if (typeof words.authored === "number") expect(textInPart(part, words.authored), `${path} at ${step}`).toBe(TEXTS[file.authored as number]);
        for (const description of words.descriptions ?? []) expect(textInPart(part, description.text)).toBe(TEXTS[description.text]);
      }
    }
    expect(wordsOfFile(moments[0].rows, "src/app/main.ts").authored).toBe("unread");
    expect(wordsOfFile(moments[0].rows, "gone.ts")).toEqual({ codePath: "gone.ts", exists: false });
    expect(wordsDirectory("README.ts")).toBe("");
  });
});
