/**
 * The command line's answers mended after the parity probe of 2026-11-22
 * (`.mdmd/layer-2/parity.mdmd.md`): the lint's report in one order, the orphans
 * command reading the docs where the configuration puts them, a file's
 * neighbours in place of every terminal path, and a path that runs only the
 * other way offered as the command to run. Each case was seen failing before
 * its mend. Over the estate sample, its docs generated into a copy.
 */
import * as assert from "node:assert";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeAll, describe, it } from "vitest";

import { normalizeLiveDocumentationConfig } from "../../../packages/engine/src/config/liveDocumentationConfig";
import { generateLiveDocs } from "../../../packages/generator/src/generator";
import { NOT_FIXTURE } from "../../../scripts/oracle/fixture";

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const estateSource = path.join(repoRoot, "tests", "integration", "programs", "csharp", "estate");
const folders: string[] = [];
let estate = "";
let elsewhere = "";
let names = "";

function cli(script: string, workspace: string, args: string[]): { status: number; stdout: string; stderr: string } {
  const result = spawnSync(process.execPath, [tsxCli, "--tsconfig", path.join(repoRoot, "tsconfig.base.json"), path.join(repoRoot, "scripts", "live-docs", script), "--workspace", workspace, ...args],
    { cwd: workspace, encoding: "utf8" });
  return { status: result.status ?? 0, stdout: result.stdout, stderr: result.stderr };
}

async function estateCopy(config: Record<string, string>, source = estateSource): Promise<string> {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), "cli-answers-"));
  folders.push(folder);
  // A fixture is copied without what a compiler or an indexer left in it (`obj`, `bin`): a checkout that has run the
  // C# oracles holds such folders, ignored by git, and a copy that took them scanned thirty files more.
  fs.cpSync(source, folder, { recursive: true, filter: (from) => !NOT_FIXTURE.has(path.basename(from)) });
  if (Object.keys(config).length) {
    fs.writeFileSync(path.join(folder, ".live-docs.config.json"), JSON.stringify(config), "utf8");
  }
  await generateLiveDocs({ workspaceRoot: folder, config: normalizeLiveDocumentationConfig(config),
    logger: { info: () => undefined, warn: () => undefined, error: (message) => { throw new Error(message); } } });
  return folder;
}

beforeAll(async () => {
  estate = await estateCopy({});
  // A configuration that puts the docs neither where the defaults do nor where this repository does.
  elsewhere = await estateCopy({ root: "notes", baseLayer: "mirror", extension: ".live.md" });
  // The names sample: App/Documented.cs names six files of the program only in its documentation.
  names = await estateCopy({}, path.join(repoRoot, "tests", "integration", "programs", "csharp", "names"));
});

afterAll(() => {
  for (const folder of folders) {
    fs.rmSync(folder, { recursive: true, force: true });
  }
});

describe("live-docs:lint", () => {
  it("reports the same docs in the same order, the order of their paths", () => {
    const first = cli("lint.ts", estate, []);
    const second = cli("lint.ts", estate, []);
    assert.strictEqual(first.status, 0, first.stderr);
    const files = first.stderr.split("\n").filter((line) => line.startsWith("- ")).map((line) => line.slice(2, line.indexOf(": ")));
    assert.ok(files.length > 20, first.stderr);
    assert.deepStrictEqual(files, [...files].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
    assert.strictEqual(second.stderr, first.stderr);
  });
});

describe("live-docs:orphans", () => {
  it("reads the docs where the folder's configuration puts them, and names the one whose source is gone", () => {
    fs.rmSync(path.join(elsewhere, "Hub", "ServiceRouting.cs"));
    const result = cli("find-orphans.ts", elsewhere, []);
    assert.strictEqual(result.status, 1, result.stdout + result.stderr);
    assert.strictEqual(result.stderr, "Found 1 orphan live documentation file(s):\n - notes/mirror/Hub/ServiceRouting.cs.live.md (expected code path: Hub/ServiceRouting.cs)\n");
  });
});

describe("live-docs:inspect, a file alone", () => {
  it("answers with its direct users, counted, one line each, not every terminal path whole", () => {
    const result = cli("inspect.ts", estate, ["--from", "Contracts/IPaymentService.cs", "--direction", "inbound"]);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.strictEqual(result.stdout.replace(/ \[[^\]]+\]/g, ""),
      "Contracts/IPaymentService.cs is used by 4 files directly (inbound).\n  Hub/App.config\n  Hub/PaymentHub.cs\n  PaymentService/App.config\n  PaymentService/PaymentService.cs\n" +
      // Hub/PaymentHub.cs's documentation names the contract too: the author's word, printed apart and not counted.
      "Contracts/IPaymentService.cs is named by the documentation of 1 file (the author's word, not a use).\n  Hub/PaymentHub.cs\n");
  });
});

describe("live-docs:inspect, a route between two files", () => {
  // The owner, 2026-11-22: a route asked is told as asked, the relation of each step said in the product's word.
  it("is told from --from to --to when the dependency runs the other way, each step said as used by the next", () => {
    const result = cli("inspect.ts", estate, ["--from", "Database/SqlServer/dbo.Payment.sql", "--to", "Portal/Pages/Default.aspx"]);
    assert.strictEqual(result.status, 0, result.stderr);
    const lines = result.stdout.replace(/ \[[^\]]+\]/g, "").split("\n");
    assert.strictEqual(lines[0], "Path from Database/SqlServer/dbo.Payment.sql to Portal/Pages/Default.aspx, 11 hop(s): each file is used by the next.");
    assert.strictEqual(lines[1], "  1. Database/SqlServer/dbo.Payment.sql is used by PaymentService/Data/Payment.cs");
    assert.strictEqual(lines[11], "  11. Portal/Scripts/portal.js is used by Portal/Pages/Default.aspx");
    const json = JSON.parse(cli("inspect.ts", estate, ["--from", "Database/SqlServer/dbo.Payment.sql", "--to", "Portal/Pages/Default.aspx", "--json"]).stdout) as { direction: string; each: string };
    assert.deepStrictEqual([json.direction, json.each], ["inbound", "is used by"]);
  });

  it("is told with each file using the next when the dependency runs as asked", () => {
    const result = cli("inspect.ts", estate, ["--from", "Portal/Pages/Default.aspx", "--to", "Database/SqlServer/dbo.Payment.sql"]);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout.replace(/ \[[^\]]+\]/g, ""), /^Path from Portal\/Pages\/Default\.aspx to Database\/SqlServer\/dbo\.Payment\.sql, 11 hop\(s\): each file uses the next\.\n {2}1\. Portal\/Pages\/Default\.aspx uses Portal\/Scripts\/portal\.js\n/u);
  });

  it("kept to one way by --direction, says in one line that none runs and gives the command for the way back, which answers", () => {
    const result = cli("inspect.ts", estate, ["--from", "Database/SqlServer/dbo.Payment.sql", "--to", "Portal/Pages/Default.aspx", "--direction", "outbound"]);
    assert.strictEqual(result.status, 1);
    assert.strictEqual(result.stdout,
      "No path runs from Database/SqlServer/dbo.Payment.sql to Portal/Pages/Default.aspx (outbound); one runs the other way, 11 hop(s): npm run live-docs:inspect -- --from Portal/Pages/Default.aspx --to Database/SqlServer/dbo.Payment.sql\n");
    const offered = result.stdout.slice(result.stdout.indexOf("-- ") + 3).trim().split(" ");
    const back = cli("inspect.ts", estate, offered);
    assert.strictEqual(back.status, 0, back.stderr);
    assert.match(back.stdout, /^Path from Portal\/Pages\/Default\.aspx to Database\/SqlServer\/dbo\.Payment\.sql, 11 hop\(s\): each file uses the next\./u);
  });

  it("says in one line that none runs either way when none does", () => {
    const result = cli("inspect.ts", estate, ["--from", "Estate.sln", "--to", "Hub/ServiceRouting.cs"]);
    assert.strictEqual(result.status, 1);
    assert.strictEqual(result.stdout, "No path runs between Estate.sln and Hub/ServiceRouting.cs, either way.\n");
  });
});

describe("live-docs:board --files", () => {
  it("lists each thing's files and each wire's file-level edges", () => {
    const result = cli("board.ts", estate, ["board.md", "--files"]);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout, /\n {2}portal \(web\) {2}from Portal: 11 files\n[\s\S]*?\n {4}files \(11\):\n {6}Portal\/App_Code\/Globals\.cs\n/u);
    assert.match(result.stdout, /\n {2}gateway -> contracts {2}\[source\] {2}x13\n(?: {6}\S.*\n){13}/u);
    assert.ok(result.stdout.includes("\n      Gateway/Wcf/HubProxy.cs uses Contracts/IPaymentHub.cs (IPaymentHub)\n"), result.stdout);
  });
});

describe("live-docs:inspect, an author's documentation reference", () => {
  // The owner, 2026-11-21: "If an author made an effort to tell us in their own words that these two things are
  // related, we should honor their word." Root's ruling, 2026-11-22: it is shown, and never counted as a use.
  const namedFiles = ["App/Base.cs", "App/Derived.cs", "App/Helper.cs", "App/HelperOfT.cs", "App/Runner.Text.cs", "App/Runner.cs"];

  it("is printed for a file both ways, after its neighbours, with the element's word", () => {
    const result = cli("inspect.ts", names, ["--from", "App/Documented.cs", "--direction", "both"]);
    assert.strictEqual(result.status, 0, result.stderr);
    const text = result.stdout.replace(/ \[[^\]]+\]/g, "");
    assert.ok(text.startsWith("App/Documented.cs uses 0 files directly (outbound).\nApp/Documented.cs is used by 0 files directly (inbound).\nApp/Documented.cs's documentation names 11 declarations in 6 files (the author's word, not a use).\n"), text);
    assert.ok(text.includes("\n  Derived (permission) in App/Derived.cs\n"), text);
    assert.ok(text.includes("\n  Base.Gadget (inheritdoc) in App/Base.cs\n"), text);
    const named = cli("inspect.ts", names, ["--from", "App/HelperOfT.cs", "--direction", "inbound"]);
    assert.ok(named.stdout.replace(/ \[[^\]]+\]/g, "").includes("App/HelperOfT.cs is named by the documentation of 1 file (the author's word, not a use).\n  App/Documented.cs\n"), named.stdout);
    const json = JSON.parse(cli("inspect.ts", names, ["--from", "App/Documented.cs", "--json"]).stdout) as {
      neighbours: Array<{ count: number }>; documentation: { names: { count: number; references: Array<{ to: string }> }; namedBy: { count: number } };
    };
    assert.deepStrictEqual(json.neighbours.map((way) => way.count), [0]);
    assert.strictEqual(json.documentation.names.count, 11);
    assert.deepStrictEqual([...new Set(json.documentation.names.references.map((reference) => reference.to))].sort(), namedFiles);
  });

  it("is no neighbour, and nothing it names is reached or pathed through it", () => {
    const neighbours = JSON.parse(cli("inspect.ts", names, ["--from", "App/Documented.cs", "--direction", "both", "--json"]).stdout) as { neighbours: Array<{ count: number }> };
    assert.deepStrictEqual(neighbours.neighbours.map((way) => way.count), [0, 0]);
    const reached = JSON.parse(cli("inspect.ts", names, ["--from", "App/Documented.cs", "--reachable", "--direction", "both", "--json"]).stdout) as { reached: Array<{ files: unknown[] }> };
    assert.deepStrictEqual(reached.reached.map((way) => way.files.length), [0, 0]);
    for (const to of namedFiles) {
      const route = cli("inspect.ts", names, ["--from", "App/Documented.cs", "--to", to]);
      assert.strictEqual(route.stdout, `No path runs between App/Documented.cs and ${to}, either way.\n`, to);
    }
  });
});

describe("live-docs:inspect, a directory as an end", () => {
  // A directory stands for every file under it, by the engine's `under`, the rule the Explorer's path ends read.
  it("is the end of a path: the nearest file under it answers, the route told as asked", () => {
    const result = cli("inspect.ts", estate, ["--from", "Portal/Pages/Default.aspx", "--to", "PaymentService"]);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout.replace(/ \[[^\]]+\]/g, ""), /^Path from Portal\/Pages\/Default\.aspx to PaymentService\/App\.config, 8 hop\(s\): each file uses the next\.\n/u);
  });

  it("is the start of a path, with or without its closing slash and in any case", () => {
    for (const typed of ["PaymentService", "PaymentService/", "paymentservice"]) {
      const result = cli("inspect.ts", estate, ["--from", typed, "--to", "Hub/App.config"]);
      assert.strictEqual(result.status, 0, `${typed}: ${result.stderr}`);
      assert.match(result.stdout.replace(/ \[[^\]]+\]/g, ""), /^Path from PaymentService\/App\.config to Hub\/App\.config, 1 hop\(s\): each file is used by the next\.\n {2}1\. PaymentService\/App\.config is used by Hub\/App\.config\n$/u, typed);
    }
  });

  it("is the start of a reach, its own files not listed", () => {
    const result = JSON.parse(cli("inspect.ts", estate, ["--from", "PaymentService", "--reachable", "--json"]).stdout) as { from: { codePath: string }; reached: Array<{ files: Array<{ node: { codePath: string } }> }> };
    assert.strictEqual(result.from.codePath, "PaymentService/");
    const reached = result.reached[0].files.map((file) => file.node.codePath);
    assert.ok(reached.includes("Contracts/IPaymentService.cs") && reached.includes("Database/SqlServer/dbo.Payment.sql"), reached.join(", "));
    assert.ok(reached.every((file) => !file.startsWith("PaymentService/")), reached.join(", "));
  });

  it("alone, with neither --to nor --reachable, is refused in one line", () => {
    const result = cli("inspect.ts", estate, ["--from", "PaymentService"]);
    assert.strictEqual(result.status, 1);
    assert.strictEqual(result.stderr, "PaymentService is a directory: give --to for a path from any of its files, or --reachable for what they reach.\n");
  });
});

describe("live-docs:inspect, two ends that share files", () => {
  // Root's rule, 2026-11-22, after the engine review: a path's ends are each a file or a directory, so apart or one
  // holding the other; when one holds the other the path runs between the inner end and the rest of the outer, and when
  // the two are the same there is no path. A name in another case is one directory only when one answers to it.
  let nested = "";
  beforeAll(async () => {
    nested = fs.mkdtempSync(path.join(os.tmpdir(), "cli-answers-nested-"));
    folders.push(nested);
    const files: Record<string, string> = {
      "src/a.ts": 'import { b } from "./b";\nexport const a = b;\n',
      "src/b.ts": "export const b = 1;\n",
      "src/Pay/p.ts": 'import { a } from "../a";\nexport const p = a;\n',
      "src/PaymentService/s.ts": "export const s = 2;\n"
    };
    for (const [file, text] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(nested, file)), { recursive: true });
      fs.writeFileSync(path.join(nested, file), text);
    }
    await generateLiveDocs({ workspaceRoot: nested, config: normalizeLiveDocumentationConfig({}),
      logger: { info: () => undefined, warn: () => undefined, error: (message) => { throw new Error(message); } } });
  });

  it("runs from the rest of an outer directory to a file it holds, and says the outer was taken without the inner", () => {
    const result = cli("inspect.ts", nested, ["--from", "src/", "--to", "src/b.ts"]);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.strictEqual(result.stdout.replace(/ \[[^\]]+\]/g, ""), "Path from src/a.ts to src/b.ts, 1 hop(s): each file uses the next; src/ taken without src/b.ts.\n  1. src/a.ts uses src/b.ts\n");
    const json = JSON.parse(cli("inspect.ts", nested, ["--from", "src/", "--to", "src/b.ts", "--json"]).stdout) as { kind: string; asked: unknown };
    assert.deepStrictEqual([json.kind, json.asked], ["path", { from: "src/", to: "src/b.ts", narrowed: "from" }]);
  });

  it("runs from an inner directory to the rest of the outer one", () => {
    const result = cli("inspect.ts", nested, ["--from", "src/Pay", "--to", "src"]);
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.stdout.replace(/ \[[^\]]+\]/g, ""), /^Path from src\/Pay\/p\.ts to src\/a\.ts, 1 hop\(s\): each file uses the next; src\/ taken without src\/Pay\/\.\n/u);
  });

  it("is no path when the two ends are the same, a directory or a file", () => {
    for (const [end, label] of [["src", "src/"], ["src/a.ts", "src/a.ts"]]) {
      const result = cli("inspect.ts", nested, ["--from", end, "--to", end]);
      assert.strictEqual(result.status, 1);
      assert.strictEqual(result.stdout, `No path runs between ${label} and ${label}: the two ends are the same.\n`);
      const json = JSON.parse(cli("inspect.ts", nested, ["--from", end, "--to", end, "--json"]).stdout) as { kind: string; asked: { narrowed: string } };
      assert.deepStrictEqual([json.kind, json.asked.narrowed], ["not-found", "same"]);
    }
  });

  it("takes a directory named in another case as the one directory that answers, spelled as it is", () => {
    const json = JSON.parse(cli("inspect.ts", nested, ["--from", "src/PAY", "--to", "src/a.ts", "--json"]).stdout) as { asked: { from: string } };
    assert.strictEqual(json.asked.from, "src/Pay/");
  });

  it("is no path from a symbol to itself, nor from a symbol to its own file", () => {
    for (const to of ["src/a.ts#a", "src/a.ts"]) {
      const result = cli("inspect.ts", nested, ["--from", "src/a.ts#a", "--to", to]);
      assert.strictEqual(result.status, 1, to);
      assert.strictEqual(result.stdout, `No symbol path found from src/a.ts#a to ${to} (outbound).\n`);
    }
  });
});
