import { describe, expect, it } from "vitest";

import {
  inferFallbackGraph,
} from "./fallbackInference";

describe("fallback inference", () => {
  it("creates a documents link when markdown references an implementation artifact", async () => {
    const result = await inferFallbackGraph({
      seeds: [
        {
          uri: "file:///repo/docs/vision.md",
          layer: "vision",
          content: "Implements [Calculator](../src/calculator.ts)."
        },
        {
          uri: "file:///repo/src/calculator.ts",
          layer: "code",
          content:
            "export const add = (a: number, b: number) => a + b;" +
            "\n// business logic"
        }
      ]
    });

    expect(result.artifacts).toHaveLength(2);
    expect(result.links).toHaveLength(1);

    const [link] = result.links;
    const document = result.artifacts.find((artifact) => artifact.uri.endsWith("vision.md"));
    const implementation = result.artifacts.find((artifact) => artifact.uri.endsWith("calculator.ts"));

    expect(link.sourceId).toBe(document?.id);
    expect(link.targetId).toBe(implementation?.id);
    expect(link.kind).toBe("documents");

    expect(result.traces).toHaveLength(1);
    expect(result.traces[0].origin).toBe("heuristic");
    expect(result.traces[0].rationale).toContain("markdown link");
  });

  it("detects re-exports and .js specifiers in TypeScript modules", async () => {
    const result = await inferFallbackGraph({
      seeds: [
        {
          uri: "file:///repo/src/index.ts",
          layer: "code",
          content:
            "export {helper} from './helper.js';\n" +
            "export type {HelperShape} from './helper.js';\n" +
            "import {util} from './util.js';\n" +
            "console.log(util);\n"
        },
        {
          uri: "file:///repo/src/helper.ts",
          layer: "code",
          content:
            "export const helper = () => 'helper';\n" +
            "export type HelperShape = {value: string};\n"
        },
        {
          uri: "file:///repo/src/util.ts",
          layer: "code",
          content: "export const util = () => 'util';\n"
        }
      ]
    });

    const indexArtifact = result.artifacts.find((artifact) => artifact.uri.endsWith("index.ts"));
    const helperArtifact = result.artifacts.find((artifact) => artifact.uri.endsWith("helper.ts"));
    const utilArtifact = result.artifacts.find((artifact) => artifact.uri.endsWith("util.ts"));

    expect(indexArtifact).toBeDefined();
    expect(helperArtifact).toBeDefined();
    expect(utilArtifact).toBeDefined();

    const hasEdge = (target: typeof helperArtifact | typeof utilArtifact) =>
      result.links.some((link) => link.sourceId === indexArtifact?.id && link.targetId === target?.id);

    expect(hasEdge(helperArtifact)).toBe(true);
    expect(hasEdge(utilArtifact)).toBe(true);
  });

  it("includes TypeScript imports that are only used as types (for change impact analysis)", async () => {
    // Type-only imports represent real dependencies - if the type definition changes,
    // the importing file is impacted and may need updates.
    const result = await inferFallbackGraph({
      seeds: [
        {
          uri: "file:///repo/src/controller.ts",
          layer: "code",
          content: [
            "import { Widget } from './types';",
            "type Handler = (value: Widget) => string;",
            "export const run: Handler = value => value.kind;",
            ""
          ].join("\n")
        },
        {
          uri: "file:///repo/src/types.ts",
          layer: "code",
          content: "export type Widget = { kind: string };\n"
        }
      ]
    });

    const controllerArtifact = result.artifacts.find((artifact) => artifact.uri.endsWith("controller.ts"));
    const typesArtifact = result.artifacts.find((artifact) => artifact.uri.endsWith("types.ts"));

    expect(controllerArtifact).toBeDefined();
    expect(typesArtifact).toBeDefined();
    // Type-only imports ARE included because they represent real change impact
    expect(result.links).toHaveLength(1);
    expect(result.links[0].sourceId).toBe(controllerArtifact!.id);
    expect(result.links[0].targetId).toBe(typesArtifact!.id);
  });

  it("ignores module references that only appear inside comments", async () => {
    const result = await inferFallbackGraph({
      seeds: [
        {
          uri: "file:///repo/src/example.ts",
          layer: "code",
          content: [
            "// export {Foo} from './foo.js';",
            "/**",
            " * Usage example",
            " * ```",
            " * import bar from 'bar';",
            " * ```",
            " */",
            "export const value = 1;\n"
          ].join("\n")
        },
        {
          uri: "file:///repo/src/foo.ts",
          layer: "code",
          content: "export const foo = 1;\n"
        },
        {
          uri: "file:///repo/src/bar.ts",
          layer: "code",
          content: "export const bar = 1;\n"
        }
      ]
    });

    const exampleArtifact = result.artifacts.find((artifact) => artifact.uri.endsWith("example.ts"));
    const fooArtifact = result.artifacts.find((artifact) => artifact.uri.endsWith("foo.ts"));
    const barArtifact = result.artifacts.find((artifact) => artifact.uri.endsWith("bar.ts"));

    expect(exampleArtifact).toBeDefined();
    expect(fooArtifact).toBeDefined();
    expect(barArtifact).toBeDefined();

    const hasLinkTo = (targetId: string | undefined) =>
      result.links.some((link) => link.sourceId === exampleArtifact?.id && link.targetId === targetId);

    expect(hasLinkTo(fooArtifact?.id)).toBe(false);
    expect(hasLinkTo(barArtifact?.id)).toBe(false);
  });

  it("detects local includes in C sources", async () => {
    const result = await inferFallbackGraph({
      seeds: [
        {
          uri: "file:///repo/src/main.c",
          layer: "code",
          content: [
            "#include \"util.h\"",
            "#include <stdio.h>",
            "int main(void) {",
            "  return add(1, 2);",
            "}\n"
          ].join("\n")
        },
        {
          uri: "file:///repo/src/util.h",
          layer: "code",
          content: "int add(int left, int right);\n"
        },
        {
          uri: "file:///repo/src/util.c",
          layer: "code",
          content: [
            "#include \"util.h\"",
            "int add(int left, int right) {",
            "  return left + right;",
            "}\n"
          ].join("\n")
        }
      ]
    });

    const mainArtifact = result.artifacts.find(artifact => artifact.uri.endsWith("main.c"));
    const headerArtifact = result.artifacts.find(artifact => artifact.uri.endsWith("util.h"));

    expect(mainArtifact).toBeDefined();
    expect(headerArtifact).toBeDefined();

    const includeEdge = result.links.find(
      link => link.sourceId === mainArtifact?.id && link.targetId === headerArtifact?.id && link.kind === "includes"
    );

    expect(includeEdge).toBeDefined();

    const systemIncludeEdge = result.links.find(
      link => link.kind === "includes" && link.targetId !== headerArtifact?.id
    );

    expect(systemIncludeEdge).toBeUndefined();
  });

  it("detects Python import statements without introducing spurious modules", async () => {
    const result = await inferFallbackGraph({
      seeds: [
        {
          uri: "file:///repo/src/main.py",
          layer: "code",
          content: [
            "from util import summarize_values",
            "from helpers import validate_seed",
            "import typing",
            "",
            "def run(seed: int) -> str:",
            "    validate_seed(seed)",
            "    values = [seed, seed + 1, seed + 2]",
            "    return summarize_values(values)",
            ""
          ].join("\n")
        },
        {
          uri: "file:///repo/src/util.py",
          layer: "code",
          content: [
            "from typing import Iterable",
            "",
            "def summarize_values(values: Iterable[int]) -> str:",
            "    total = sum(values)",
            "    count = len(values)",
            "    average = total / count if count else 0",
            "    return f\"total={total};count={count};average={average:.2f}\"",
            ""
          ].join("\n")
        },
        {
          uri: "file:///repo/src/helpers.py",
          layer: "code",
          content: "def validate_seed(seed: int) -> bool:\n    return seed >= 0\n"
        }
      ]
    });

    const mainArtifact = result.artifacts.find(artifact => artifact.uri.endsWith("main.py"));
    const utilArtifact = result.artifacts.find(artifact => artifact.uri.endsWith("util.py"));
    const helpersArtifact = result.artifacts.find(artifact => artifact.uri.endsWith("helpers.py"));

    expect(mainArtifact).toBeDefined();
    expect(utilArtifact).toBeDefined();
    expect(helpersArtifact).toBeDefined();

    const hasEdgeTo = (targetId: string | undefined) =>
      result.links.some(link => link.sourceId === mainArtifact?.id && link.targetId === targetId && link.kind === "depends_on");

    expect(hasEdgeTo(utilArtifact?.id)).toBe(true);
    expect(hasEdgeTo(helpersArtifact?.id)).toBe(true);

    const strayTargets = result.links
      .filter(link => link.sourceId === mainArtifact?.id)
      .map(link => result.artifacts.find(artifact => artifact.id === link.targetId)?.uri ?? "");

    expect(strayTargets.some(uri => uri?.endsWith("data.py"))).toBe(false);
  });

  it("resolves layered Python pipeline imports", async () => {
    const result = await inferFallbackGraph({
      seeds: [
        {
          uri: "file:///repo/src/main.py",
          layer: "code",
          content: [
            "from pipeline import build_report",
            "from validators import ValidationError",
            "",
            "def run(series_id: str) -> dict:",
            "    report = build_report(series_id)",
            "    if report.status != 'ok':",
            "        raise ValidationError('report failed validation')",
            "    return report.payload",
            ""
          ].join("\n")
        },
        {
          uri: "file:///repo/src/pipeline.py",
          layer: "code",
          content: [
            "from dataclasses import dataclass",
            "",
            "from metrics import compute_summary",
            "from repositories import load_series",
            "from validators import ensure_not_empty",
            "",
            "@dataclass",
            "class Report:",
            "    status: str",
            "    payload: dict",
            "",
            "def build_report(series_id: str) -> Report:",
            "    samples = load_series(series_id)",
            "    ensure_not_empty(samples, series_id)",
            "    payload = compute_summary(samples)",
            "    return Report(status='ok', payload=payload)",
            ""
          ].join("\n")
        },
        {
          uri: "file:///repo/src/metrics.py",
          layer: "code",
          content: [
            "from typing import Sequence",
            "",
            "from validators import ensure_not_empty, ensure_positive",
            "",
            "def compute_summary(values: Sequence[int]) -> dict:",
            "    ensure_not_empty(values, 'metrics')",
            "    ensure_positive(values)",
            "    total = sum(values)",
            "    count = len(values)",
            "    average = total / count if count else 0",
            "    return {'total': total, 'count': count, 'average': average}",
            ""
          ].join("\n")
        },
        {
          uri: "file:///repo/src/repositories.py",
          layer: "code",
          content: [
            "from typing import List",
            "",
            "from validators import ValidationError",
            "",
            "_DATASETS = {",
            "    'baseline': [10, 14, 21, 16]",
            "}",
            "",
            "def load_series(series_id: str) -> List[int]:",
            "    if series_id == 'missing':",
            "        raise ValidationError('dataset unavailable')",
            "    return [1, 1, 1]",
            ""
          ].join("\n")
        },
        {
          uri: "file:///repo/src/validators.py",
          layer: "code",
          content: [
            "class ValidationError(Exception):",
            "    ...",
            "",
            "def ensure_not_empty(values, label):",
            "    if not values:",
            "        raise ValidationError(f\"series '{label}' contained no data\")",
            "",
            "def ensure_positive(values):",
            "    for value in values:",
            "        if value < 0:",
            "            raise ValidationError('encountered negative sample')",
            ""
          ].join("\n")
        }
      ]
    });

    const locate = (uriSuffix: string) =>
      result.artifacts.find(artifact => artifact.uri.endsWith(uriSuffix));

    const expectEdge = (
      sourceUri: string,
      targetUri: string,
      present: boolean
    ): void => {
      const source = locate(sourceUri);
      const target = locate(targetUri);
      expect(source).toBeDefined();
      expect(target).toBeDefined();
      const exists = result.links.some(
        link =>
          link.sourceId === source?.id &&
          link.targetId === target?.id &&
          link.kind === "depends_on"
      );
      expect(exists).toBe(present);
    };

    expectEdge("main.py", "pipeline.py", true);
    expectEdge("main.py", "validators.py", true);
    expectEdge("pipeline.py", "repositories.py", true);
    expectEdge("pipeline.py", "metrics.py", true);
    expectEdge("pipeline.py", "validators.py", true);
    expectEdge("repositories.py", "validators.py", true);
    expectEdge("metrics.py", "validators.py", true);
    expectEdge("metrics.py", "repositories.py", false);
  });
});
