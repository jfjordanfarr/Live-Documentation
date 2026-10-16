import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { ResolvedSymbolLocation, WorkspaceSymbolIndex } from "../coreTypes";
import { cargoAdapter } from "./cargo";

describe("cargoAdapter", () => {
  let workspaceRoot: string;
  const write = async (file: string, content: string): Promise<void> => {
    await fs.mkdir(path.dirname(path.join(workspaceRoot, file)), { recursive: true });
    await fs.writeFile(path.join(workspaceRoot, file), content, "utf8");
  };
  const analyze = (file: string, fileIndex: string[], symbolIndex?: WorkspaceSymbolIndex) =>
    cargoAdapter.analyze({ absolutePath: path.join(workspaceRoot, file), workspaceRoot, fileIndex: new Set(fileIndex), symbolIndex });
  const crate = (name: string, sourcePath: string): [string, ResolvedSymbolLocation[]] =>
    [name, [{ liveDocPath: `${sourcePath}.md`, sourcePath, anchor: `symbol-${name}`, kind: "package" }]];

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "cargo-adapter-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("publishes the crate, and reads every dependency table in the inline and the table forms, renames by the package they name", async () => {
    await write("app/Cargo.toml", [
      "[package]",
      "name = \"app\"",
      "version = \"0.3.0\"",
      "",
      "[dependencies]",
      "serde = \"1.0\"",
      "tokio = { version = \"1.38\", features = [\"full\"] }",
      "json = { package = \"serde_json\", version = \"1\" }",
      "rand = { git = \"https://github.com/rust-random/rand\" }",
      "",
      "[dependencies.regex]",
      "version = \"1.10\"",
      "default-features = false",
      "",
      "[dev-dependencies]",
      "proptest = \"1.4\"",
      "",
      "[build-dependencies]",
      "cc = \"1.0\"",
      "",
      "[target.'cfg(windows)'.dependencies]",
      "winapi = { version = \"0.3\", features = [\"winuser\"] }",
      "",
      "[target.x86_64-unknown-linux-gnu.dev-dependencies]",
      "nix = \"0.28\"",
      "",
      "[patch.crates-io]",
      "serde = { git = \"https://github.com/serde-rs/serde\" }"
    ].join("\n"));

    const result = await analyze("app/Cargo.toml", ["app/Cargo.toml"]);

    expect(result?.symbols).toEqual([{ name: "app", kind: "package", location: { line: 1, character: 1 } }]);
    expect(result?.dependencies.map((dependency) => dependency.specifier)).toEqual([
      "cc@1.0", "nix@0.28", "proptest@1.4", "rand", "regex@1.10", "serde@1.0", "serde_json@1", "tokio@1.38", "winapi@0.3"
    ]);
    expect(result?.dependencies.every((dependency) => dependency.resolvedPath === undefined)).toBe(true);
    expect(result?.declares).toBeUndefined();
  });

  it("links a path dependency to the crate there, by the name it publishes, and keeps one whose crate the workspace lacks by name", async () => {
    await write("crates/core/Cargo.toml", "[package]\nname = \"depot-core\"\n");
    await write("crates/cli/Cargo.toml", [
      "[package]",
      "name = \"depot-cli\"",
      "",
      "[dependencies]",
      "core = { package = \"depot-core\", path = \"../core\" }",
      "gone = { path = \"../gone\", version = \"0.1\" }",
      "elsewhere = { path = \"../../../outside\" }"
    ].join("\n"));
    const symbolIndex: WorkspaceSymbolIndex = new Map([crate("depot-core", "crates/core/Cargo.toml")]);

    const result = await analyze("crates/cli/Cargo.toml", ["crates/core/Cargo.toml", "crates/cli/Cargo.toml"], symbolIndex);

    expect(result?.dependencies).toEqual([
      { specifier: "crates/core/Cargo.toml", resolvedPath: "crates/core/Cargo.toml", symbols: ["depot-core"], kind: "import" },
      { specifier: "elsewhere", symbols: [], kind: "import" },
      { specifier: "gone@0.1", symbols: [], kind: "import" }
    ]);
  });

  it("links a dependency without a path to the workspace crate that publishes its name, and never to a package of another ecosystem", async () => {
    await write("Cargo.toml", "[package]\nname = \"app\"\n[dependencies]\nshared = \"0.1\"\nleft-pad = \"1\"\n");
    const symbolIndex: WorkspaceSymbolIndex = new Map([
      crate("shared", "shared/Cargo.toml"),
      crate("left-pad", "web/package.json")
    ]);

    const result = await analyze("Cargo.toml", ["Cargo.toml", "shared/Cargo.toml", "web/package.json"], symbolIndex);

    expect(result?.dependencies).toEqual([
      { specifier: "shared/Cargo.toml", resolvedPath: "shared/Cargo.toml", symbols: ["shared"], kind: "import" },
      { specifier: "left-pad@1", symbols: [], kind: "import" }
    ]);
  });

  it("reads `workspace = true` as the root manifest's entry, its path from the root's folder, and as the name alone without one", async () => {
    await write("Cargo.toml", [
      "[workspace]",
      "members = [\"crates/*\"]",
      "",
      "[workspace.dependencies]",
      "anyhow = \"1.0.86\"",
      "serde = { version = \"1.0\", features = [\"derive\"] }",
      "model = { path = \"crates/model\" }"
    ].join("\n"));
    await write("crates/model/Cargo.toml", "[package]\nname = \"model\"\n");
    await write("crates/api/Cargo.toml", [
      "[package]",
      "name = \"api\"",
      "",
      "[dependencies]",
      "anyhow.workspace = true",
      "serde = { workspace = true, features = [\"rc\"] }",
      "model = { workspace = true }",
      "missing = { workspace = true }"
    ].join("\n"));
    const fileIndex = ["Cargo.toml", "crates/model/Cargo.toml", "crates/api/Cargo.toml"];

    const result = await analyze("crates/api/Cargo.toml", fileIndex);

    expect(result?.dependencies).toEqual([
      { specifier: "crates/model/Cargo.toml", resolvedPath: "crates/model/Cargo.toml", symbols: ["model"], kind: "import" },
      { specifier: "anyhow@1.0.86", symbols: [], kind: "import" },
      { specifier: "missing", symbols: [], kind: "import" },
      { specifier: "serde@1.0", symbols: [], kind: "import" }
    ]);

    const root = await analyze("Cargo.toml", fileIndex);
    expect(root).toEqual({ symbols: [], dependencies: [] });
  });

  it("takes the root manifest `[package].workspace` names over the nearest one with a `[workspace]`", async () => {
    await write("Cargo.toml", "[workspace]\n[workspace.dependencies]\nlog = \"0.3\"\n");
    await write("tools/Cargo.toml", "[workspace]\n[workspace.dependencies]\nlog = \"0.4\"\n");
    await write("tools/lint/Cargo.toml", "[package]\nname = \"lint\"\nworkspace = \"../..\"\n[dependencies]\nlog = { workspace = true }\n");

    const result = await analyze("tools/lint/Cargo.toml", ["Cargo.toml", "tools/Cargo.toml", "tools/lint/Cargo.toml"]);
    expect(result?.dependencies.map((dependency) => dependency.specifier)).toEqual(["log@0.3"]);

    await write("tools/lint/Cargo.toml", "[package]\nname = \"lint\"\n[dependencies]\nlog = { workspace = true }\n");
    const nearest = await analyze("tools/lint/Cargo.toml", ["Cargo.toml", "tools/Cargo.toml", "tools/lint/Cargo.toml"]);
    expect(nearest?.dependencies.map((dependency) => dependency.specifier)).toEqual(["log@0.4"]);
  });

  it("declares each [[bin]] and [[example]] by name, on its path or where Cargo looks, and [lib] as the module, when the workspace holds the file", async () => {
    await write("Cargo.toml", [
      "[package]",
      "name = \"depot\"",
      "",
      "[lib]",
      "path = \"src/depot.rs\"",
      "",
      "[[bin]]",
      "name = \"depotctl\"",
      "path = \"tools/ctl.rs\"",
      "",
      "[[bin]]",
      "name = \"seed\"",
      "",
      "[[bin]]",
      "name = \"migrate\"",
      "",
      "[[bin]]",
      "name = \"depot\"",
      "",
      "[[bin]]",
      "name = \"phantom\"",
      "",
      "[[example]]",
      "name = \"tour\"",
      "",
      "[[test]]",
      "name = \"smoke\"",
      "path = \"tests/smoke.rs\""
    ].join("\n"));
    const fileIndex = ["Cargo.toml", "src/depot.rs", "src/main.rs", "tools/ctl.rs", "src/bin/seed.rs", "src/bin/migrate/main.rs", "examples/tour/main.rs", "tests/smoke.rs"];

    const result = await analyze("Cargo.toml", fileIndex);

    expect(result?.declares).toEqual([
      { reason: "command", file: "examples/tour/main.rs", name: "tour" },
      { reason: "command", file: "src/bin/migrate/main.rs", name: "migrate" },
      { reason: "command", file: "src/bin/seed.rs", name: "seed" },
      { reason: "module", file: "src/depot.rs" },
      { reason: "command", file: "src/main.rs", name: "depot" },
      { reason: "command", file: "tools/ctl.rs", name: "depotctl" }
    ]);
  });

  it("declares [lib] at src/lib.rs without a path, and nothing for a target the manifest does not write", async () => {
    await write("Cargo.toml", "[package]\nname = \"plain\"\n[lib]\nname = \"plain\"\n");
    expect((await analyze("Cargo.toml", ["Cargo.toml", "src/lib.rs", "src/main.rs"]))?.declares).toEqual([{ reason: "module", file: "src/lib.rs" }]);

    await write("Cargo.toml", "[package]\nname = \"plain\"\n");
    expect((await analyze("Cargo.toml", ["Cargo.toml", "src/lib.rs", "src/main.rs"]))?.declares).toBeUndefined();
  });

  it("reads a malformed manifest as empty", async () => {
    await write("Cargo.toml", "[package\nname = ");
    expect(await analyze("Cargo.toml", ["Cargo.toml"])).toEqual({ symbols: [], dependencies: [] });
  });
});
