import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { csharpAdapter } from "./csharp";

/**
 * An author's reference that names a generic's type parameter by a name of its own, held to the C# compiler's answer;
 * found by the engine review's third pass, 2026-11-22. A `cref` may call a type's or a method's type parameter what it
 * likes (`Box{X}.Put(X)` for `Box<T>.Put(T)`), and the compiler binds it by position. The reader compares a parameter's
 * type by its written name (`parameterShape`), so `X` is not `T` to it, and the reference is left as text where the
 * compiler names a declaration. The compiler's answers are `scripts/oracle/csharp-compiler.cs` (Roslyn 4.12) on these
 * files with two projects, as the mended oracle reports them: "the reader reads the reference and resolves it to
 * nothing". The cases that spell the parameter as declared are the control.
 */

const CALC = `namespace Lib
{
    public class Calc
    {
        public T Echo<T>(T value) => value;
        public Calc Echo(Calc value) => value;
    }
    public class Box<T>
    {
        public void Put(T value) { }
        public void Put(Calc value) { }
    }
}
`;

const USE = `namespace App
{
    /// <summary>
    /// <see cref="Lib.Calc.Echo{T}(T)"/>
    /// <see cref="Lib.Calc.Echo{U}(U)"/>
    /// <see cref="Lib.Box{T}.Put(T)"/>
    /// <see cref="Lib.Box{X}.Put(X)"/>
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
  ["Lib.Calc.Echo{T}(T)", [5]],
  ["Lib.Calc.Echo{U}(U)", [5]],
  ["Lib.Box{T}.Put(T)", [10]],
  ["Lib.Box{X}.Put(X)", [10]]
];

let root = "";
const linked = new Map<string, number[]>();

beforeAll(async () => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "cref-renamed-"));
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

describe("a reference that renames a generic's type parameter, held to the compiler's answer", () => {
  it.each(COMPILER)("%s", (written, lines) => {
    const key = written.replace(/\{/gu, "<").replace(/\}/gu, ">");
    expect(linked.has(key), `the reader read ${written}`).toBe(true);
    expect(linked.get(key)).toEqual(lines);
  });
});
