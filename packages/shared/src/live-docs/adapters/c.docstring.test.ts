import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { computePublicSymbolHeadingInfo, renderPublicSymbolLines } from "../core";
import { cAdapter } from "./c";

describe("cAdapter docstring bridging", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "c-docstring-"));
  });

  afterEach(async () => {
    if (workspaceRoot) {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("extracts Doxygen-style metadata from block comments", async () => {
    const srcDir = path.join(workspaceRoot, "src");
    await fs.mkdir(srcDir, { recursive: true });
    const headerPath = path.join(srcDir, "logger.h");
    await fs.writeFile(
      headerPath,
      `#pragma once

/** Logs diagnostic events. */
typedef struct logger {
  int level;
} logger;
`,
      "utf8"
    );

    const filePath = path.join(srcDir, "processor.c");
    await fs.writeFile(
      filePath,
      `#include "logger.h"

/**
 * Destroys a logger instance.
 *
 * Releases acquired resources.
 *
 * @param handle Logger to destroy.
 */
void logger_destroy(logger *handle);

/**
 * @brief Builds a logger.
 *
 * Creates a logger configured for the provided sink.
 *
 * @param [out] handle Destination logger pointer.
 * @param [in] level Minimum level.
 * @return logger* Initialized instance.
 * @throws validation_error When level is negative.
 * @note Only call once per sink.
 * @see https://example.com/docs/loggers
 * @example Allocation
 * @code
 * logger handle;
 * logger_build(&handle, 1);
 * @endcode
 */
logger *logger_build(logger *handle, int level);
`,
      "utf8"
    );

    const analysis = await cAdapter.analyze({ absolutePath: filePath, workspaceRoot });
    expect(analysis).not.toBeNull();
    expect(analysis?.symbols).toHaveLength(2);

    const destroy = analysis!.symbols.find((symbol) => symbol.name === "logger_destroy");
    expect(destroy?.documentation?.summary).toContain("Destroys a logger instance.");
    expect(destroy?.documentation?.parameters?.[0]).toEqual({
      name: "handle",
      description: "Logger to destroy."
    });

    const build = analysis!.symbols.find((symbol) => symbol.name === "logger_build");
    expect(build?.documentation?.summary).toContain("Builds a logger.");
    expect(build?.documentation?.remarks).toContain("Only call once per sink.");
    expect(build?.documentation?.parameters).toEqual([
      { name: "handle", description: "Destination logger pointer." },
      { name: "level", description: "Minimum level." }
    ]);
    expect(build?.documentation?.returns).toContain("Initialized instance");
    expect(build?.documentation?.exceptions?.[0]).toEqual({
      type: "validation_error",
      description: "When level is negative."
    });
    expect(build?.documentation?.examples?.[0]?.code).toContain("logger_build(&handle, 1)");
    expect(build?.documentation?.links?.[0]?.target).toBe("https://example.com/docs/loggers");

    expect(analysis?.dependencies).toEqual([
      {
        kind: "import",
        specifier: "logger.h",
        resolvedPath: "src/logger.h",
        symbols: ["logger"]
      }
    ]);

    const docDir = path.join(workspaceRoot, ".live-documentation", "source");
    await fs.mkdir(docDir, { recursive: true });
    const headings = computePublicSymbolHeadingInfo(analysis!.symbols);
    const lines = renderPublicSymbolLines({
      analysis: analysis!,
      docDir,
      sourceAbsolute: filePath,
      workspaceRoot,
      sourceRelativePath: path.relative(workspaceRoot, filePath),
      headings
    });

    expect(lines.some((line) => line.includes("logger_build") && line.includes("Parameters"))).toBe(true);
  });

  it("parses line comments, macros, and system includes", async () => {
    const filePath = path.join(workspaceRoot, "flags.h");
    await fs.writeFile(
      filePath,
      `#include <stdio.h>

/// Enables verbose output.
#define FEATURE_VERBOSE 1

//! Tracks service metrics.
typedef struct metrics_tracker {
  int count;
} metrics_tracker;

/// Increments the counter.
int tracker_increment(metrics_tracker *tracker);
`,
      "utf8"
    );

    const analysis = await cAdapter.analyze({ absolutePath: filePath, workspaceRoot });
    expect(analysis).not.toBeNull();

    const macro = analysis!.symbols.find((symbol) => symbol.name === "FEATURE_VERBOSE");
    expect(macro?.kind).toBe("const");
    expect(macro?.documentation?.summary).toContain("Enables verbose output");

    const structSymbol = analysis!.symbols.find((symbol) => symbol.name === "metrics_tracker");
    expect(structSymbol?.kind).toBe("struct");
    expect(structSymbol?.documentation?.summary).toContain("Tracks service metrics");

    const func = analysis!.symbols.find((symbol) => symbol.name === "tracker_increment");
    expect(func?.kind).toBe("function");
    expect(func?.documentation?.summary).toContain("Increments the counter");

    expect(analysis?.dependencies).toEqual([
      {
        kind: "import",
        specifier: "stdio.h",
        resolvedPath: undefined,
        symbols: []
      }
    ]);
  });
});
