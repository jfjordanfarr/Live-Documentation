/**
 * The package manifests of four ecosystems as Live Docs, over the manifests
 * fixture, discovered by the shipped default globs: a Cargo workspace of two
 * crates, one standing on the other by path; a Python project in the src
 * layout with a script; a Maven parent with two modules, one standing on the
 * other at `${project.version}` and naming its main class; and a Go module
 * replacing a requirement with a local one. Each manifest is a tooling entry
 * and publishes its package, what it stands on links the manifest the
 * workspace holds or is kept external, and what it starts carries the Entry
 * line. The expectations are a reading of the fixture's files, not a run of
 * the generator.
 */
import * as fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { entryWords } from "@live-documentation/engine/live-docs/document";
import type { LiveDocGraph } from "@live-documentation/engine/live-docs/graph";
import { readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";
import { generateLiveDocs } from "@live-documentation/generator/generator";

const FIXTURE = path.resolve(__dirname, "../fixtures/manifests/workspace");

const config = normalizeLiveDocumentationConfig({});

let workspace: string;
let graph: LiveDocGraph;

beforeAll(async () => {
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), "manifests-"));
  fs.cpSync(FIXTURE, workspace, { recursive: true });
  await generateLiveDocs({ workspaceRoot: workspace, config, logger: { info: () => undefined, warn: () => undefined, error: (message) => { throw new Error(message); } } });
  graph = await readLiveDocGraph({ workspaceRoot: workspace, config });
});

afterAll(() => {
  fs.rmSync(workspace, { recursive: true, force: true });
});

const MANIFESTS = [
  "go/app/go.mod",
  "go/ledger/go.mod",
  "java/app/pom.xml",
  "java/core/pom.xml",
  "java/pom.xml",
  "python/pyproject.toml",
  "rust/Cargo.toml",
  "rust/stock/Cargo.toml",
  "rust/stockctl/Cargo.toml"
];

const wordsOf = (codePath: string): string[] => graph.files[codePath].entries.map(entryWords);

describe("the manifests' docs", () => {
  it("are discovered by name, and nothing else of their formats is", () => {
    expect(Object.keys(graph.files).filter((codePath) => /\.(?:toml|xml|mod)$/u.test(codePath)).sort()).toEqual(MANIFESTS);
  });

  it("publish the package each names as its one symbol, and none for a workspace root that names none", () => {
    const published = Object.fromEntries(MANIFESTS.map((codePath) => [codePath, graph.files[codePath].symbols.map((symbol) => `${symbol.kind} ${symbol.name}`)]));
    expect(published).toEqual({
      "go/app/go.mod": ["package example.com/tally/app"],
      "go/ledger/go.mod": ["package example.com/tally/ledger"],
      "java/app/pom.xml": ["package com.acme.tally:tally-app"],
      "java/core/pom.xml": ["package com.acme.tally:tally-core"],
      "java/pom.xml": ["package com.acme.tally:tally-parent"],
      "python/pyproject.toml": ["package tally"],
      "rust/Cargo.toml": [],
      "rust/stock/Cargo.toml": ["package stock"],
      "rust/stockctl/Cargo.toml": ["package stockctl"]
    });
  });

  it("link what each stands on in the workspace, and keep the rest external with its version", () => {
    const linked = Object.fromEntries(MANIFESTS.map((codePath) => [codePath, graph.files[codePath].outbound]));
    expect(linked).toEqual({
      "go/app/go.mod": ["go/ledger/go.mod"],
      "go/ledger/go.mod": [],
      "java/app/pom.xml": ["java/core/pom.xml", "java/pom.xml"],
      "java/core/pom.xml": ["java/pom.xml"],
      "java/pom.xml": [],
      "python/pyproject.toml": [],
      "rust/Cargo.toml": [],
      "rust/stock/Cargo.toml": [],
      "rust/stockctl/Cargo.toml": ["rust/stock/Cargo.toml"]
    });
    expect(graph.files["python/pyproject.toml"].dependencies.map((dependency) => dependency.label)).toEqual(["click@>=8.1"]);
    // A linked dependency names the package the other manifest publishes and links its symbol, as a package.json's does.
    expect(graph.files["java/app/pom.xml"].dependencies.map((dependency) => [dependency.label, dependency.link])).toEqual([
      ["pom.com.acme.tally:tally-core", "../core/pom.xml.md#symbol-comacmetallytally-core"],
      ["pom.com.acme.tally:tally-parent", "../pom.xml.md#symbol-comacmetallytally-parent"]
    ]);
    expect(graph.files["rust/stockctl/Cargo.toml"].dependencies.map((dependency) => [dependency.label, dependency.link])).toEqual([["Cargo.stock", "../stock/Cargo.toml.md#symbol-stock"]]);
  });
});

describe("the Entry lines", () => {
  it("make every manifest a tooling entry, and write on each file what its manifest starts", () => {
    for (const codePath of MANIFESTS) {
      expect(wordsOf(codePath), codePath).toEqual(["tooling"]);
    }
    expect(wordsOf("rust/stock/src/lib.rs")).toEqual(["module of rust/stock/Cargo.toml"]);
    expect(wordsOf("rust/stockctl/src/main.rs")).toEqual(["program main", "command count of rust/stockctl/Cargo.toml"]);
    expect(wordsOf("python/src/tally/cli.py")).toEqual(["command tally of python/pyproject.toml"]);
    expect(wordsOf("java/app/src/main/java/com/acme/tally/app/Main.java")).toEqual(["program main", "command tally-app of java/app/pom.xml"]);
    expect(wordsOf("go/app/main.go")).toEqual(["program main"]);
    for (const codePath of ["python/src/tally/__init__.py", "java/core/src/main/java/com/acme/tally/core/Ledger.java", "go/ledger/ledger.go"]) {
      expect(wordsOf(codePath), codePath).toEqual([]);
    }
  });

  it("link the manifest that declares the file, where the parser reads it back", () => {
    const text = fs.readFileSync(path.join(workspace, graph.files["python/src/tally/cli.py"].docPath), "utf8");
    expect(text).toContain("- Entry: command `tally` of [`python/pyproject.toml`](../../pyproject.toml.md)");
    expect(graph.files["python/src/tally/cli.py"].entries[0].declarer).toEqual({ label: "python/pyproject.toml", link: "../../pyproject.toml.md" });
  });
});
