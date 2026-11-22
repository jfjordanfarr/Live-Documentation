import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { csharpAdapter } from "./csharp";

/**
 * An author's reference to a member through a type that only inherits it, held to the C# compiler's answer; found by
 * the engine review's third pass, 2026-11-22. The reader finds a member named through its type where the type inherits
 * it too ("A member named through its type (`Base.Gadget`) is found where the type inherits it too", `resolveReference`),
 * and since the day's mend it looks in the base types for an overload the type does not have (`namedMembers`). The
 * compiler (`scripts/oracle/csharp-compiler.cs`, Roslyn 4.12, run on exactly these files with two projects, and again
 * with the same references written inside `Lib`) finds neither: `Lib.Derived.Shrink`, `Lib.Derived.Shrink(Lib.Calc)`
 * and `Lib.Derived.Grow(Lib.Calc)`, where `Shrink` and that `Grow` are `Base`'s, all resolve to nothing, as the mended
 * oracle reports ("the compiler resolves the reference to nothing, and the reader links it"), and nor does an inherited
 * property (`Lib.Derived.Layout`). The oracle compiles without framework references; `dotnet build` of these two
 * projects with the framework and `GenerateDocumentationFile` gives the same answer, warning CS1574 ("could not be
 * resolved") for each of the four. So the reader draws links the code does not make, and the reader's own case of
 * 2026-11-22 in `csharp.test.ts` ("Named through its type, an inherited member is found": `Derived.Layout`) asserts the
 * same wrong answer. A member named through the type that declares it is the control.
 */

const CALC = `namespace Lib
{
    public class Calc { }
    public class Base
    {
        public void Grow(Calc a) { }
        public void Shrink(Calc a) { }
        public Calc Layout { get; set; } = new Calc();
    }
    public class Derived : Base
    {
        public void Grow(Calc[] a) { }
    }
}
`;

const USE = `namespace App
{
    /// <summary>
    /// <see cref="Lib.Derived.Grow(Lib.Calc)"/>
    /// <see cref="Lib.Derived.Shrink(Lib.Calc)"/>
    /// <see cref="Lib.Derived.Shrink"/>
    /// <see cref="Lib.Derived.Grow(Lib.Calc[])"/>
    /// <see cref="Lib.Base.Shrink(Lib.Calc)"/>
    /// <see cref="Lib.Derived.Layout"/>
    /// </summary>
    public class Use { }
}
`;

const FILES: Record<string, string> = {
  "Lib/Lib.csproj": '<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup><TargetFramework>net10.0</TargetFramework></PropertyGroup>\n</Project>\n',
  "App/App.csproj": '<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup><TargetFramework>net10.0</TargetFramework></PropertyGroup>\n  <ItemGroup><ProjectReference Include="../Lib/Lib.csproj" /></ItemGroup>\n</Project>\n',
  "Lib/Calc.cs": CALC,
  "App/Use.cs": USE
};

/** The compiler's answer for each reference: the line in `Lib/Calc.cs` of the declaration it names. */
const COMPILER: Array<[string, number[]]> = [
  ["Lib.Derived.Grow(Lib.Calc)", []],
  ["Lib.Derived.Shrink(Lib.Calc)", []],
  ["Lib.Derived.Shrink", []],
  ["Lib.Derived.Layout", []],
  ["Lib.Derived.Grow(Lib.Calc[])", [12]],
  ["Lib.Base.Shrink(Lib.Calc)", [7]]
];

let root = "";
const linked = new Map<string, number[]>();

beforeAll(async () => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "cref-inherited-"));
  for (const [file, text] of Object.entries(FILES)) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), text);
  }
  const result = await csharpAdapter.analyze({ absolutePath: path.join(root, "App/Use.cs"), workspaceRoot: root, fileIndex: new Set(Object.keys(FILES)) });
  for (const symbol of result?.symbols ?? []) {
    for (const link of symbol.documentation?.links ?? []) {
      if (link.kind === "cref") linked.set(link.target, (link.targets ?? []).filter((target) => target.path === "Lib/Calc.cs").map((target) => target.line).sort((a, b) => a - b));
    }
  }
});

afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("a reference to a member through a type that only inherits it, held to the compiler's answer", () => {
  it.each(COMPILER)("%s", (written, lines) => {
    expect(linked.has(written), `the reader read ${written}`).toBe(true);
    expect(linked.get(written)).toEqual(lines);
  });
});
