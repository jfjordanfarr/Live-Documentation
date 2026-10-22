import { describe, expect, it } from "vitest";

import { citingDocuments, markdownLinkTargets, relatedDocsOf } from "./relatedDocs";

const LOCATION = { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md" };

describe("markdownLinkTargets", () => {
  it("reads every link's target as written, with its fragment, and not the ones inside fenced or inline code", () => {
    const text = [
      "See [the plan](docs/plan.md#open-questions) and ![a picture](shots/one.png \"The first\").",
      "A `[span](not/a/link.md)` and <[angle](<docs/with space.md>)>.",
      "```md",
      "[fenced](docs/fenced.md)",
      "```",
      "~~~",
      "[tilde fenced](docs/tilde.md)",
      "~~~",
      "   ```ts",
      "   const x = '[indented fence](docs/indented.md)';",
      "   ```",
      "After [the fences](README.md)."
    ].join("\n");
    expect(markdownLinkTargets(text)).toEqual(["docs/plan.md#open-questions", "shots/one.png", "docs/with space.md", "README.md"]);
  });
});

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

  it("leaves out a Live Doc, the doc itself, an external page, a path out of the workspace, a file that is not markdown and a link inside code", () => {
    const authored = [
      "Uses [the model](../core/model.ts.mdmd.md#makemodel), [itself](main.ts.mdmd.md), [a site](https://example.com/guide.md),",
      "[outside](../../../../../elsewhere/notes.md), [a picture](../../../../docs/shot.png) and [the source](../../../../src/app/main.ts).",
      "```",
      "[fenced](../../../../docs/fenced.md)",
      "```"
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

describe("citingDocuments", () => {
  const files = new Set(["src/app/main.ts", "src/core/model.ts", "docs/diagram.png", "src/data/set%20one.json"]);

  it("names, for each documented file, the documents whose links name it by its path or its doc's, each once, sorted", () => {
    const documents = [
      { path: "README.md", text: [
        "The app starts in [main](src/app/main.ts#L12) and [its doc](.mdmd/layer-4/src/app/main.ts.mdmd.md#symbol-main);",
        "the model is [here](./src/core/model.ts) and again [here](src/core/model.ts \"the model\").",
        "![The diagram](docs/diagram.png) and [a data set](src/data/set%2520one.json)."
      ].join("\n") },
      { path: "docs/design/notes.md", text: "Reads [the model](../../src/core/model.ts), [the design](index.md), [the folder](../../src/core/), [a site](https://example.test/src/core/model.ts) and [nothing](../../src/core/missing.ts)." },
      { path: "docs/empty.md", text: "No links here." },
      { path: "docs/guide.rst", text: "`main <src/app/main.ts>`_ and [a markdown link](src/core/model.ts) in a file that is not markdown." },
      { path: "LICENSE", text: "[the model](src/core/model.ts)" }
    ];
    expect(citingDocuments(documents, files, LOCATION)).toEqual(new Map([
      ["docs/diagram.png", ["README.md"]],
      ["src/app/main.ts", ["README.md"]],
      ["src/core/model.ts", ["README.md", "docs/design/notes.md"]],
      ["src/data/set%20one.json", ["README.md"]]
    ]));
  });

  it("leaves out a document the bundle exclusions name, a link inside code, and a doc that names no documented file", () => {
    const documents = [
      { path: "AI-Agent-Workspace/notes.md", text: "[main](../src/app/main.ts)" },
      { path: "docs/how.md", text: "```\n[main](../src/app/main.ts)\n```\nand `[model](../src/core/model.ts)` and [a doc of a file gone](../.mdmd/layer-4/src/gone.ts.mdmd.md)." }
    ];
    expect(citingDocuments(documents, files, LOCATION, ["AI-Agent-Workspace/**"])).toEqual(new Map());
  });
});
