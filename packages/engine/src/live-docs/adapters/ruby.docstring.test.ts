import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { computePublicSymbolHeadingInfo, composeSymbolBlocks } from "../core";
import { renderSymbolBlocks } from "../document";
import { rubyAdapter } from "./ruby";

describe("rubyAdapter docstring bridging", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "ruby-docstring-"));
  });

  afterEach(async () => {
    if (workspaceRoot) {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("extracts YARD-style metadata from line comments", async () => {
    const filePath = path.join(workspaceRoot, "reporter.rb");
    await fs.writeFile(
      filePath,
      `# frozen_string_literal: true

# Reporter broadcasts events to stdout.
#
# Handles formatting and level checks.
class Reporter
  # Builds a reporter for the provided IO stream.
  #
  # @param io [IO] Target stream.
  # @param level [Symbol] Severity threshold.
  # @return [Reporter] Configured reporter instance.
  # @raise ArgumentError when io is nil.
  # @example Basic usage
  #   Reporter.build($stdout, :info)
  def self.build(io, level = :info)
  end

  # Emits an event.
  #
  # @param event [String] Message to write.
  # @return [void]
  def emit(event)
  end
end
`.trimStart(),
      "utf8"
    );

    const analysis = await rubyAdapter.analyze({ absolutePath: filePath, workspaceRoot });
    expect(analysis).not.toBeNull();
    expect(analysis?.symbols).toHaveLength(3);

    const reporterClass = analysis!.symbols.find((symbol) => symbol.name === "Reporter");
    expect(reporterClass?.documentation?.summary).toContain("Reporter broadcasts events");
    expect(reporterClass?.documentation?.remarks).toContain("Handles formatting");

    const buildMethod = analysis!.symbols.find((symbol) => symbol.name === "self.build");
    expect(buildMethod?.documentation?.parameters).toEqual([
      {
        name: "io",
        description: "Target stream."
      },
      {
        name: "level",
        description: "Severity threshold."
      }
    ]);
    expect(buildMethod?.documentation?.returns).toContain("Configured reporter instance.");
    expect(buildMethod?.documentation?.exceptions).toEqual([
      {
        type: "ArgumentError",
        description: "when io is nil."
      }
    ]);
    expect(buildMethod?.documentation?.examples?.[0]?.code).toContain("Reporter.build($stdout, :info)");

    const emitMethod = analysis!.symbols.find((symbol) => symbol.name === "emit");
    expect(emitMethod?.documentation?.parameters?.[0]).toEqual({
      name: "event",
      description: "Message to write."
    });

    const docDir = path.join(workspaceRoot, ".live-documentation", "source");
    await fs.mkdir(docDir, { recursive: true });
    const headings = computePublicSymbolHeadingInfo(analysis!.symbols);
    const lines = renderSymbolBlocks(composeSymbolBlocks({ headings, docDir, sourceAbsolute: filePath, sourceRelativePath: path.relative(workspaceRoot, filePath) }));

    expect(lines).toContain("##### `self.build` — Parameters");
    expect(lines.some((line) => line.includes("Reporter.build"))).toBe(true);
  });

  it("parses block comments and attr macros", async () => {
    const filePath = path.join(workspaceRoot, "settings.rb");
    await fs.writeFile(
      filePath,
      `=begin
Stores configuration shared across components.

# Parameters
- key - Unique identifier.
- value - Associated value.
=end
module Settings
  attr_accessor :key, :value

  # Registers a callback.
  #
  # @param block [Proc] Executed on update.
  def on_change(&block)
  end
end
`.trimStart(),
      "utf8"
    );

    const analysis = await rubyAdapter.analyze({ absolutePath: filePath, workspaceRoot });
    expect(analysis).not.toBeNull();

    const moduleSymbol = analysis!.symbols.find((symbol) => symbol.name === "Settings");
    expect(moduleSymbol?.documentation?.summary).toContain("Stores configuration shared across components.");
    expect(moduleSymbol?.documentation?.parameters).toEqual([
      { name: "key", description: "Unique identifier." },
      { name: "value", description: "Associated value." }
    ]);

    const properties = analysis!.symbols.filter((symbol) => symbol.kind === "property").map((symbol) => symbol.name);
    expect(properties).toEqual(["key", "value"]);
  });
});

describe("rubyAdapter program entry", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "ruby-program-"));
  });

  afterEach(async () => {
    if (workspaceRoot) {
      await fs.rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  async function analyze(name: string, content: string) {
    const filePath = path.join(workspaceRoot, name);
    await fs.writeFile(filePath, content, "utf8");
    const analysis = await rubyAdapter.analyze({ absolutePath: filePath, workspaceRoot });
    expect(analysis).not.toBeNull();
    return analysis!;
  }

  it("reports a file guarded by __FILE__ == $0 or $PROGRAM_NAME, on its own line or as a statement modifier, as the program entry", async () => {
    expect((await analyze("own_line.rb", "def main\nend\n\nif __FILE__ == $0\n  main\nend\n")).program).toEqual({});
    expect((await analyze("modifier.rb", "puts Rosetta.main(10) if __FILE__ == $PROGRAM_NAME\n")).program).toEqual({});
    expect((await analyze("reversed.rb", "if $PROGRAM_NAME == __FILE__ then\n  main\nend\n")).program).toEqual({});
    expect((await analyze("dollar_zero_first.rb", "main if $0 == __FILE__ # run\n")).program).toEqual({});

    const sample = path.resolve(__dirname, "../../../../../tests/integration/programs/ruby/rosetta");
    const analysis = await rubyAdapter.analyze({ absolutePath: path.join(sample, "lib", "main.rb"), workspaceRoot: sample });
    expect(analysis?.program).toEqual({});
  });

  it("leaves program absent for a file without the guard, with it commented out, inside a method, or in a string", async () => {
    expect(await analyze("plain.rb", "class Foo\n  def run; end\nend\n")).not.toHaveProperty("program");
    expect(await analyze("commented.rb", "# if __FILE__ == $0\n#   main\n# end\n")).not.toHaveProperty("program");
    expect(await analyze("block_commented.rb", "=begin\nif __FILE__ == $0\n  main\nend\n=end\n")).not.toHaveProperty("program");
    expect(await analyze("nested.rb", "def run\n  main if __FILE__ == $0\nend\n")).not.toHaveProperty("program");
    expect(await analyze("string.rb", "USAGE = 'run me if __FILE__ == $0'\n")).not.toHaveProperty("program");
  });
});
