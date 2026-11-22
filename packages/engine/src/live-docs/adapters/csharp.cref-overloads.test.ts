import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { csharpAdapter } from "./csharp";

/**
 * An author's reference to one overload of a method, held to the C# compiler's own answer, declaration by declaration;
 * found by the engine review of 2026-11-22. The reader compares a reference's parameters with each overload's by a
 * shape that drops array marks and modifiers (`parameterShape`), so that `Mix(Calc[])` and `Mix(ref Calc)` are alike to
 * it, and where no overload matches it links every overload of the same count (`namedMembers`). The compiler
 * (`scripts/oracle/csharp-compiler.cs`, Roslyn 4.12, run on exactly these files with their two projects) names one
 * overload or none for each. The C# oracle cannot see any of it: it compares file pairs, and every target here lies in
 * one file, so its report on these files was "2 pairs, 2 of them the compiler's", with nothing only the reader makes.
 */

const CALC = `namespace Lib
{
    public class Calc
    {
        public int Mix(Calc[] a) => 0;
        public int Mix(ref Calc a) => 0;
        public int Mix(Calc a, Calc b) => 0;
    }
    public class Pair<T> { }
}
`;

const USE = `namespace App
{
    /// <summary>
    /// <see cref="Lib.Calc.Mix(Lib.Calc[])"/>
    /// <see cref="Lib.Calc.Mix(ref Lib.Calc)"/>
    /// <see cref="Lib.Calc.Mix(Lib.Pair{Lib.Calc})"/>
    /// <see cref="Lib.Calc.Mix(Lib.Calc,)"/>
    /// <see cref="Lib.Calc.Mix(Lib.Calc, Lib.Calc)"/>
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

/** The compiler's answer for each reference, as the line in `Lib/Calc.cs` of each declaration it names. */
const COMPILER: Array<[string, number[]]> = [
  ["Lib.Calc.Mix(Lib.Calc[])", [5]],
  ["Lib.Calc.Mix(ref Lib.Calc)", [6]],
  ["Lib.Calc.Mix(Lib.Pair{Lib.Calc})", []],
  ["Lib.Calc.Mix(Lib.Calc,)", []],
  ["Lib.Calc.Mix(Lib.Calc, Lib.Calc)", [7]]
];

let root = "";
const linked = new Map<string, number[]>();

beforeAll(async () => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "cref-overloads-"));
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

describe("a reference to one overload, held to the compiler's answer declaration by declaration", () => {
  it.each(COMPILER)("%s", (written, lines) => {
    // `crefName` writes a type's arguments in angle brackets, as the Live Doc shows them.
    const key = written.replace(/\{/gu, "<").replace(/\}/gu, ">");
    expect(linked.has(key), `the reader read ${written}`).toBe(true);
    expect(linked.get(key)).toEqual(lines);
  });
});
