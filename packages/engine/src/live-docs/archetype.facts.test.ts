import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../config/liveDocumentationConfig";
import { resolveArchetype } from "./archetype";
import { buildWorkspaceIndexes } from "./discovery";

/**
 * The facts of which files exist for the tests that a reader sees and a path does not, as the first pass gathers them
 * from the readers (the project reader, the Rust reader, the SQL reader), and the archetype they give. The rules are
 * the runners' own, kept with their sources in the record of 2026-11-21,
 * `AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/test-rules/README.md`: `dotnet test` runs a project
 * that sets IsTestProject (Microsoft.NET.Test.Sdk's props) or of MSTest.Sdk; the compiler builds a module declared
 * under `#[cfg(test)]` for the tests alone; tSQLt runs the `test…` procedures of a schema made by `tSQLt.NewTestClass`.
 */
const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })));
});

async function firstPass(files: Record<string, string>) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "archetype-facts-"));
  roots.push(root);
  for (const [file, text] of Object.entries(files)) {
    await fs.mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await fs.writeFile(path.join(root, file), text);
  }
  const relative = Object.keys(files).sort();
  const { tests } = await buildWorkspaceIndexes({
    targetFiles: relative.map((file) => path.join(root, file)), workspaceRoot: root,
    liveDocsRoot: ".mdmd/layer-4", docExtension: ".mdmd.md", fileIndex: new Set(relative)
  });
  const config = normalizeLiveDocumentationConfig({});
  return { tests, archetype: (file: string) => resolveArchetype(file, config, false, tests) };
}

const project = (body: string, sdk = "Microsoft.NET.Sdk") => `<Project Sdk="${sdk}">\n${body}\n</Project>\n`;

describe("a .NET test project makes the files of its folder tests", () => {
  it("reads a project as a test project by the test SDK, MSTest.Sdk or IsTestProject, and never by a framework alone", async () => {
    const { tests } = await firstPass({
      "src/Lib/Lib.csproj": project("<ItemGroup><PackageReference Include=\"Newtonsoft.Json\" Version=\"13.0.3\" /></ItemGroup>"),
      "src/Lib.Tests/Lib.Tests.csproj": project("<ItemGroup><PackageReference Include=\"Microsoft.NET.Test.Sdk\" Version=\"17.11.1\" /><PackageReference Include=\"xunit\" Version=\"2.9.0\" /></ItemGroup>"),
      "src/Central.Tests/Central.Tests.csproj": project("<ItemGroup><PackageReference Include=\"microsoft.net.test.sdk\" /></ItemGroup>"),
      "src/Ms.Tests/Ms.Tests.csproj": project("", "MSTest.Sdk/3.6.4"),
      "src/Said.Tests/Said.Tests.csproj": project("<PropertyGroup><IsTestProject>true</IsTestProject></PropertyGroup>"),
      "src/Unsaid.Tests/Unsaid.Tests.csproj": project("<PropertyGroup><IsTestProject>false</IsTestProject></PropertyGroup><ItemGroup><PackageReference Include=\"Microsoft.NET.Test.Sdk\" /></ItemGroup>"),
      "src/Rosetta/Rosetta.csproj": project("<ItemGroup><PackageReference Include=\"xunit\" Version=\"2.6.1\" /></ItemGroup>"),
      "src/Commented/Commented.csproj": project("<!-- <ItemGroup><PackageReference Include=\"Microsoft.NET.Test.Sdk\" /></ItemGroup> -->"),
      // A reference under a condition is read as the project reader reads it, as a reference.
      "src/Conditional/Conditional.csproj": project("<ItemGroup Condition=\"'$(Configuration)' == 'Debug'\"><PackageReference Include=\"Microsoft.NET.Test.Sdk\" /></ItemGroup>"),
      "Root.csproj": project("")
    });
    expect(Object.fromEntries(tests.projects)).toEqual({
      "src/Lib": false, "src/Lib.Tests": true, "src/Central.Tests": true, "src/Ms.Tests": true, "src/Said.Tests": true,
      "src/Unsaid.Tests": false, "src/Rosetta": false, "src/Commented": false, "src/Conditional": true, "": false
    });
  });

  it("calls a test project's .NET files and data tests, the nearest project deciding, and leaves other languages to their rules", async () => {
    const { archetype } = await firstPass({
      "src/Lib/Lib.csproj": project(""),
      "src/Lib/Parcel.cs": "namespace Lib; public class Parcel {}\n",
      "src/Lib.Tests/Lib.Tests.csproj": project("<ItemGroup><PackageReference Include=\"Microsoft.NET.Test.Sdk\" /></ItemGroup>"),
      "src/Lib.Tests/ParcelChecks.cs": "namespace Lib.Tests; public class ParcelChecks { [Fact] public void Holds() {} }\n",
      "src/Lib.Tests/Fakes/FakeClock.cs": "namespace Lib.Tests; public class FakeClock {}\n",
      "src/Lib.Tests/xunit.runner.json": "{}\n",
      "src/Lib.Tests/tools/check.ps1": "Write-Output 1\n",
      "src/Lib.Tests/Sample/Sample.csproj": project(""),
      "src/Lib.Tests/Sample/Program.cs": "System.Console.WriteLine(1);\n"
    });
    expect(archetype("src/Lib/Parcel.cs")).toBe("implementation");
    expect(archetype("src/Lib/Lib.csproj")).toBe("implementation");
    expect(archetype("src/Lib.Tests/ParcelChecks.cs")).toBe("test");
    expect(archetype("src/Lib.Tests/Fakes/FakeClock.cs")).toBe("test");
    expect(archetype("src/Lib.Tests/Lib.Tests.csproj")).toBe("test");
    expect(archetype("src/Lib.Tests/xunit.runner.json")).toBe("test");
    expect(archetype("src/Lib.Tests/tools/check.ps1")).toBe("implementation");
    expect(archetype("src/Lib.Tests/Sample/Program.cs")).toBe("implementation");
  });
});

describe("a Rust module declared under #[cfg(test)] is built for the tests alone", () => {
  it("reports the declared module's file and every module beneath it, and nothing else", async () => {
    const { tests, archetype } = await firstPass({
      "Cargo.toml": "[package]\nname = \"shelf\"\nversion = \"0.1.0\"\nedition = \"2021\"\n",
      "src/lib.rs": [
        "mod core;",
        "#[cfg(test)]",
        "/// Helpers for the unit tests.",
        "mod testutil;",
        "#[cfg(not(test))]",
        "mod real;",
        "#[cfg(test)]",
        "mod tests {",
        "    #[test]",
        "    fn holds() {}",
        "}",
        ""
      ].join("\n"),
      "src/core.rs": "pub fn shelve() {}\n",
      "src/real.rs": "pub fn now() {}\n",
      "src/testutil.rs": "mod deep;\npub fn fixture() {}\n",
      "src/testutil/deep.rs": "pub fn deeper() {}\n",
      "src/legacy_test.rs": "pub fn not_declared() {}\n",
      "tests/shelving.rs": "#[test]\nfn shelves() {}\n"
    });
    expect([...tests.files].sort()).toEqual(["src/testutil.rs", "src/testutil/deep.rs"]);
    expect(archetype("src/testutil.rs")).toBe("test");
    expect(archetype("src/testutil/deep.rs")).toBe("test");
    expect(archetype("src/lib.rs")).toBe("implementation");
    expect(archetype("src/core.rs")).toBe("implementation");
    expect(archetype("src/real.rs")).toBe("implementation");
    expect(archetype("src/legacy_test.rs")).toBe("implementation");
    expect(archetype("tests/shelving.rs")).toBe("test");
  });
});

describe("a script of a tSQLt test class holds tests", () => {
  it("joins the classes and their test procedures across scripts, as tSQLt's Tests view does", async () => {
    const { tests, archetype } = await firstPass({
      "Tests/AssertTests.class.sql": "EXEC tSQLt.NewTestClass 'AssertTests';\nGO\nCREATE PROCEDURE AssertTests.[test that it holds]\nAS\nBEGIN\n  EXEC tSQLt.AssertEquals 1, 1;\nEND;\nGO\n",
      "Source/classes.sql": "EXEC tSQLt.NewTestClass @ClassName = 'Other';\nGO\nEXECUTE [tSQLt].[NewTestClass] Bare;\nGO\n",
      "Source/other.sql": "CREATE PROC [Other].[Test lower case] AS SELECT 1;\nGO\n",
      "Source/bare.sql": "CREATE PROCEDURE Bare.testBare AS SELECT 1;\nGO\n",
      "Source/ghost.sql": "-- EXEC tSQLt.NewTestClass 'Ghost';\nCREATE PROCEDURE Ghost.[test a] AS SELECT 1;\nGO\n",
      "Source/helper.sql": "CREATE PROCEDURE dbo.testHelper AS SELECT 1;\nGO\nCREATE PROCEDURE Other.Setup AS SELECT 1;\nGO\n",
      "Source/tSQLt.Tests.view.sql": "CREATE VIEW tSQLt.Tests AS SELECT name FROM sys.procedures WHERE LOWER(name) LIKE 'test%';\nGO\n"
    });
    expect([...tests.files].sort()).toEqual(["Source/bare.sql", "Source/other.sql", "Tests/AssertTests.class.sql"]);
    expect(archetype("Source/other.sql")).toBe("test");
    expect(archetype("Source/bare.sql")).toBe("test");
    expect(archetype("Source/classes.sql")).toBe("implementation");
    expect(archetype("Source/ghost.sql")).toBe("implementation");
    expect(archetype("Source/helper.sql")).toBe("implementation");
    expect(archetype("Source/tSQLt.Tests.view.sql")).toBe("implementation");
  });
});
