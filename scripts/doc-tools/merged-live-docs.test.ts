import { describe, expect, it } from "vitest";

import { authoredPart, authoredVerdict, resolveGeneratedConflicts } from "./merged-live-docs";

/** A Live Doc in the mirror's shape: metadata, the Authored part, one generated region. */
function doc(parts: { stamp?: string; notes?: string; region?: string }): string {
  return [
    "# `src/a.ts`",
    "",
    "## Metadata",
    "- Layer: 4",
    parts.stamp ?? "- Generated At: 2026-11-22T01:00:00.000Z",
    "",
    "## Authored",
    "### Purpose",
    "Reads a thing.",
    "",
    "### Notes",
    parts.notes ?? "None yet.",
    "",
    "## Generated",
    "<!-- LIVE-DOC:BEGIN Public Symbols -->",
    parts.region ?? "#### `a`",
    "<!-- LIVE-DOC:END Public Symbols -->",
    ""
  ].join("\n");
}

const conflict = (ours: string, theirs: string): string => `<<<<<<< HEAD\n${ours}\n=======\n${theirs}\n>>>>>>> builder`;

describe("a conflicted Live Doc resolved inside its conflicts only", () => {
  it("takes the incoming side of a conflict in the metadata and in a generated region, and keeps the Authored part as git merged it", () => {
    const conflicted = doc({
      stamp: conflict("- Generated At: 2026-11-22T01:00:00.000Z", "- Generated At: 2026-11-22T02:00:00.000Z"),
      notes: "A paragraph our side wrote, merged cleanly.",
      region: conflict("#### `a`", "#### `a`\n#### `b`")
    });
    const { text, conflicts } = resolveGeneratedConflicts(conflicted);
    expect(conflicts).toBe(2);
    expect(text).toBe(doc({ stamp: "- Generated At: 2026-11-22T02:00:00.000Z", notes: "A paragraph our side wrote, merged cleanly.", region: "#### `a`\n#### `b`" }));
  });

  it("refuses a conflict in the Authored part, naming its line", () => {
    const conflicted = doc({ notes: conflict("Ours.", "Theirs.") });
    expect(() => resolveGeneratedConflicts(conflicted)).toThrow(/Authored part, at line 12/);
  });

  it("refuses a marker left standing", () => {
    expect(() => resolveGeneratedConflicts(doc({ region: "<<<<<<< HEAD\n#### `a`" }))).toThrow(/left standing/);
  });

  it("leaves a doc without conflicts as it is", () => {
    expect(resolveGeneratedConflicts(doc({}))).toEqual({ text: doc({}), conflicts: 0 });
  });
});

describe("the Authored part of a Live Doc", () => {
  it("runs from its heading to the generated part, and is empty where a doc has none", () => {
    expect(authoredPart(doc({ notes: "Words." }))).toBe("## Authored\n### Purpose\nReads a thing.\n\n### Notes\nWords.\n\n");
    expect(authoredPart("# a\n\n## Generated\n")).toBe("");
  });
});

describe("what a merge did with an Authored part", () => {
  const base = "base";
  it("is kept when the merge holds the one side's change whole", () => {
    expect(authoredVerdict({ base, ours: base, theirs: "theirs", merged: "theirs" })).toBe("kept");
    expect(authoredVerdict({ base, ours: "ours", theirs: base, merged: "ours" })).toBe("kept");
    expect(authoredVerdict({ base, ours: base, theirs: base, merged: base })).toBe("kept");
  });

  it("is not kept when one side's whole file was taken over the other's change", () => {
    expect(authoredVerdict({ base, ours: base, theirs: "theirs", merged: base })).toBe("theirs not kept");
    expect(authoredVerdict({ base, ours: "ours", theirs: base, merged: base })).toBe("ours not kept");
    expect(authoredVerdict({ base, ours: base, theirs: "theirs, two paragraphs", merged: "theirs" })).toBe("theirs not kept");
  });

  it("is named where both changed it and the merge holds exactly one, and trusted where it holds neither", () => {
    expect(authoredVerdict({ base, ours: "ours", theirs: "theirs", merged: "theirs" })).toBe("both changed, one taken");
    expect(authoredVerdict({ base, ours: "ours", theirs: "theirs", merged: "ours and theirs" })).toBe("kept");
  });
});
