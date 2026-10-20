import { describe, expect, it } from "vitest";

import { relatedDocsOf } from "./relatedDocs";

const LOCATION = { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" };

describe("relatedDocsOf", () => {
  it("reads the documents a doc's authored words link to, resolved from the doc's place, each once, sorted", () => {
    const authored = [
      "### Purpose",
      "Built from [the plan](../../../../.mdmd/layer-3/change-over-time.mdmd.md#open-questions) and [the record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-9).",
      "",
      "### Notes",
      "- Again [the plan](../../../../.mdmd/layer-3/change-over-time.mdmd.md), and [a README](../README.md)."
    ].join("\n");
    expect(relatedDocsOf({ docPath: ".mdmd/layer-4/src/app/main.ts.mdmd.md", authored }, LOCATION)).toEqual([
      ".mdmd/layer-3/change-over-time.mdmd.md",
      ".mdmd/layer-4/src/README.md",
      "AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md"
    ]);
  });

  it("leaves out a Live Doc, the doc itself, an external page, a path out of the workspace and a file that is not markdown", () => {
    const authored = [
      "Uses [the model](../core/model.ts.mdmd.md#makemodel), [itself](main.ts.mdmd.md), [a site](https://example.com/guide.md),",
      "[outside](../../../../../elsewhere/notes.md), [a picture](../../../../docs/shot.png) and [the source](../../../../src/app/main.ts)."
    ].join("\n");
    expect(relatedDocsOf({ docPath: ".mdmd/layer-4/src/app/main.ts.mdmd.md", authored }, LOCATION)).toEqual([]);
  });

  it("leaves out what the configuration's bundle exclusions name, as the bundle does", () => {
    const authored = "See [the record](../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md) and [its summary](../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-20.1.SUMMARIZED.md).";
    const exclude = ["AI-Agent-Workspace/ChatHistory/**/!(*.SUMMARIZED).md"];
    expect(relatedDocsOf({ docPath: ".mdmd/layer-4/a.ts.mdmd.md", authored }, LOCATION, exclude)).toEqual([
      "AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-20.1.SUMMARIZED.md"
    ]);
  });
});
