import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { rustAdapter } from "./rust";

describe("rustAdapter docstring bridging", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "rust-docstring-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("extracts structured documentation and dependencies from line doc comments", async () => {
    const absolutePath = path.join(workspaceRoot, "lib.rs");
    const content = [
      "/// Computes aggregate metrics for a slice of values.",
      "///",
      "/// Provides additional context about scaling and parity handling.",
      "///",
      "/// # Arguments",
      "/// * `values` - Slice to inspect.",
      "/// * `scale` - Multiplier applied to the totals.",
      "///",
      "/// # Returns",
      "/// A scaled total as an `i64` value.",
      "///",
      "/// # Errors",
      "/// * `OverflowError` - When the scaled total exceeds `i64::MAX`.",
      "///",
      "/// # Examples",
      "/// ```rust",
      "/// let total = metrics::summarize(&[1, 2, 3], 2).unwrap();",
      "/// assert_eq!(total, 12);",
      "/// ```",
      "///",
      "/// See also https://example.com/docs and [Rust Book](https://doc.rust-lang.org/book/).",
      "pub fn summarize(values: &[i32], scale: i32) -> Result<i64, String> {",
      "    let baseline: i64 = values.iter().map(|v| *v as i64).sum();",
      "    Ok(baseline * (scale as i64))",
      "}",
      "",
      "use crate::models::{Sample, Summary};",
      "use super::math;"
    ].join("\n");

    await fs.writeFile(absolutePath, content, "utf8");

    const result = await rustAdapter.analyze({
      absolutePath,
      workspaceRoot
    });

    expect(result?.symbols).toHaveLength(1);
    const symbol = result?.symbols?.[0];
    expect(symbol?.name).toBe("summarize");
    expect(symbol?.kind).toBe("function");
    expect(symbol?.documentation?.source).toBe("rustdoc");
    expect(symbol?.documentation?.summary).toBe("Computes aggregate metrics for a slice of values.");
    expect(symbol?.documentation?.remarks).toContain("Provides additional context");

    expect(symbol?.documentation?.parameters).toEqual([
      {
        name: "values",
        description: "Slice to inspect."
      },
      {
        name: "scale",
        description: "Multiplier applied to the totals."
      }
    ]);

    expect(symbol?.documentation?.returns).toContain("scaled total");
    expect(symbol?.documentation?.exceptions).toEqual([
      {
        type: "OverflowError",
        description: "When the scaled total exceeds `i64::MAX`."
      }
    ]);

    expect(symbol?.documentation?.examples).toEqual([
      {
        description: undefined,
        code: "let total = metrics::summarize(&[1, 2, 3], 2).unwrap();\nassert_eq!(total, 12);",
        language: "rust"
      }
    ]);

    expect(symbol?.documentation?.links).toHaveLength(2);
    expect(symbol?.documentation?.links).toEqual(
      expect.arrayContaining([
        {
          kind: "href",
          target: "https://example.com/docs"
        },
        {
          kind: "href",
          target: "https://doc.rust-lang.org/book/",
          text: "Rust Book"
        }
      ])
    );

    expect(result?.dependencies).toEqual([
      {
        specifier: "crate::models::{Sample, Summary}",
        resolvedPath: undefined,
        symbols: ["Sample", "Summary"],
        kind: "import"
      },
      {
        specifier: "super::math",
        resolvedPath: undefined,
        symbols: [],
        kind: "import"
      }
    ]);
  });

  it("parses block doc comments for public structs", async () => {
    const absolutePath = path.join(workspaceRoot, "model.rs");
    const content = [
      "/**",
      " * Represents cached metrics with captured timestamps.",
      " *",
      " * Additional remarks carried in the block comment.",
      " */",
      "pub struct CachedMetrics {",
      "    pub total: i64,",
      "    pub updated_at: u64,",
      "}",
      "",
      "pub const VERSION: &str = \"1.0\";"
    ].join("\n");

    await fs.writeFile(absolutePath, content, "utf8");

    const result = await rustAdapter.analyze({
      absolutePath,
      workspaceRoot
    });

    expect(result?.symbols).toHaveLength(2);
    const structSymbol = result?.symbols?.find((entry) => entry.name === "CachedMetrics");
    expect(structSymbol?.documentation?.summary).toBe("Represents cached metrics with captured timestamps.");
    expect(structSymbol?.documentation?.remarks).toContain("Additional remarks");
  });
});
