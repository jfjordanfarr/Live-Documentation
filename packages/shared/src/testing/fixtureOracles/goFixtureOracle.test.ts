import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  generateGoFixtureGraph,
  mergeGoOracleEdges,
  serializeGoOracleEdges,
  type GoFixtureOracleOptions
} from "./goFixtureOracle";

describe("goFixtureOracle", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "go-oracle-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("generates edges for a simple Go module", () => {
    // Create go.mod
    fs.writeFileSync(
      path.join(tempDir, "go.mod"),
      `module example\n\ngo 1.21\n`
    );

    // Create source files
    const srcDir = path.join(tempDir, "src");
    fs.mkdirSync(srcDir, { recursive: true });

    const modelsDir = path.join(srcDir, "models");
    fs.mkdirSync(modelsDir, { recursive: true });

    // main.go imports models
    fs.writeFileSync(
      path.join(srcDir, "main.go"),
      `package main

import "example/src/models"

func Main() {
  _ = models.CreateRecord()
}
`
    );

    // models.go has no imports
    fs.writeFileSync(
      path.join(modelsDir, "models.go"),
      `package models

func CreateRecord() string {
  return "record"
}
`
    );

    const options: GoFixtureOracleOptions = {
      fixtureRoot: tempDir
    };

    const edges = generateGoFixtureGraph(options);

    expect(edges).toHaveLength(1);
    expect(edges[0]).toEqual({
      source: "src/main.go",
      target: "src/models/models.go",
      relation: "references",
      provenance: "import-statement"
    });
  });

  it("handles grouped imports", () => {
    // Create go.mod
    fs.writeFileSync(
      path.join(tempDir, "go.mod"),
      `module testmod\n\ngo 1.21\n`
    );

    const srcDir = path.join(tempDir, "src");
    const helpersDir = path.join(srcDir, "helpers");
    const modelsDir = path.join(srcDir, "models");
    fs.mkdirSync(helpersDir, { recursive: true });
    fs.mkdirSync(modelsDir, { recursive: true });

    // main.go with grouped imports
    fs.writeFileSync(
      path.join(srcDir, "main.go"),
      `package main

import (
  "fmt"
  "testmod/src/helpers"
  "testmod/src/models"
)

func Main() {
  fmt.Println(helpers.Format(models.Value))
}
`
    );

    fs.writeFileSync(
      path.join(helpersDir, "helpers.go"),
      `package helpers

func Format(v int) string { return "" }
`
    );

    fs.writeFileSync(
      path.join(modelsDir, "models.go"),
      `package models

var Value = 42
`
    );

    const edges = generateGoFixtureGraph({ fixtureRoot: tempDir });

    expect(edges).toHaveLength(2);
    
    const sources = edges.map(e => e.source);
    const targets = edges.map(e => e.target);
    
    expect(sources).toContain("src/main.go");
    expect(targets).toContain("src/helpers/helpers.go");
    expect(targets).toContain("src/models/models.go");
  });

  it("skips stdlib imports", () => {
    fs.writeFileSync(
      path.join(tempDir, "go.mod"),
      `module mymod\n\ngo 1.21\n`
    );

    const srcDir = path.join(tempDir, "src");
    fs.mkdirSync(srcDir, { recursive: true });

    fs.writeFileSync(
      path.join(srcDir, "main.go"),
      `package main

import (
  "fmt"
  "os"
  "net/http"
)

func Main() {}
`
    );

    const edges = generateGoFixtureGraph({ fixtureRoot: tempDir });

    // No edges because all imports are stdlib
    expect(edges).toHaveLength(0);
  });

  it("skips test files", () => {
    fs.writeFileSync(
      path.join(tempDir, "go.mod"),
      `module testmod\n\ngo 1.21\n`
    );

    const srcDir = path.join(tempDir, "src");
    fs.mkdirSync(srcDir, { recursive: true });

    fs.writeFileSync(
      path.join(srcDir, "main.go"),
      `package main

func Main() {}
`
    );

    fs.writeFileSync(
      path.join(srcDir, "main_test.go"),
      `package main

import "testing"

func TestMain(t *testing.T) {}
`
    );

    const edges = generateGoFixtureGraph({ fixtureRoot: tempDir });

    // No edges from or to test files
    expect(edges.every(e => !e.source.includes("_test.go"))).toBe(true);
    expect(edges.every(e => !e.target.includes("_test.go"))).toBe(true);
  });

  it("serializes edges to JSON", () => {
    const edges = [
      { source: "src/main.go", target: "src/models/models.go", relation: "references" as const, provenance: "import-statement" as const }
    ];

    const serialized = serializeGoOracleEdges(edges);
    const parsed = JSON.parse(serialized);

    expect(parsed).toEqual([
      { source: "src/main.go", target: "src/models/models.go", relation: "references" }
    ]);
  });

  it("merges edges with overrides", () => {
    const edges = [
      { source: "src/a.go", target: "src/b.go", relation: "references" as const, provenance: "import-statement" as const }
    ];

    const overrides = {
      manualEdges: [
        { source: "src/a.go", target: "src/c.go", relation: "references" }
      ]
    };

    const result = mergeGoOracleEdges(edges, overrides);

    expect(result.mergedRecords).toHaveLength(2);
    expect(result.mergedRecords).toContainEqual({ source: "src/a.go", target: "src/b.go", relation: "references" });
    expect(result.mergedRecords).toContainEqual({ source: "src/a.go", target: "src/c.go", relation: "references" });
  });
});
