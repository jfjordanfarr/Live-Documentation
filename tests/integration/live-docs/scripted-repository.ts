/**
 * A small git repository built from a script of seven commits, the subject
 * of the history command's integration test and of the Explorer's history
 * specs: files added, a directory renamed whole, a file renamed above the
 * similarity threshold and one rewritten below it, a file deleted, a symbol
 * added, a content change that moves no symbol. The repository's git is
 * isolated from the person's configuration, and its authors and dates are
 * fixed, so that the sequence it yields is the same on every machine.
 *
 * Shared by `history.test.ts` and `scripts/live-docs/visualize-history-sample.ts`,
 * which builds the bundle the Playwright specs scrub (2026-10-18).
 */
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { renderLiveDoc } from "../../../packages/engine/src/live-docs/document";

/** The configuration the fixture commits, and the lens its history is read under. */
export const SCRIPTED_CONFIG = { root: ".mdmd", baseLayer: "layer-4", extension: ".mdmd.md", entryPoints: ["src/app/main.ts"] };

/** The fixture's git is isolated from the person's configuration, and its authors and dates are fixed. */
export const FIXTURE_GIT_ENV = {
  ...process.env,
  GIT_CONFIG_GLOBAL: os.devNull,
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_AUTHOR_NAME: "Ada Fixture",
  GIT_AUTHOR_EMAIL: "ada@example.invalid",
  GIT_COMMITTER_NAME: "Ada Fixture",
  GIT_COMMITTER_EMAIL: "ada@example.invalid"
};

const VIEW = (heading: string): string => `import { type Model } from "../core/model";

/** ${heading} */
export function render(model: Model): string {
  const label = model.name.trim();
  const size = String(model.size).padStart(3, " ");
  return \`\${label} (\${size})\`;
}

/** Writes several models, one to a line. */
export function renderAll(models: Model[]): string {
  return models.map((model) => render(model)).join("\\n");
}
`;

// The view renamed to a screen with two of its lines rewritten: git scores the rename 75%, found at 50% and not at 90%.
const SCREEN = `import { type Model } from "../engine/model";

/** Writes a model to the screen, its name in capitals. */
export function render(model: Model): string {
  const label = model.name.trim().toUpperCase();
  const size = String(model.size).padStart(3, " ");
  return \`\${label} (\${size})\`;
}

/** Writes several models, one to a line. */
export function renderAll(models: Model[]): string {
  return models.map((model) => render(model)).join("\\n");
}
`;

const MAIN = (imports: string[], body: string): string => `${imports.join("\n")}

/** Runs the app. */
export function main(): string {
  return ${body};
}
`;

const UTIL = (smooth: boolean): string => `/** Keeps a value between two others. */
export function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

/** The value a fraction of the way from one to another. */
export function lerp(from: number, to: number, fraction: number): number {
  return from + (to - from) * fraction;
}
${smooth ? `
/** A smooth step between two edges. */
export function smoothstep(low: number, high: number, value: number): number {
  const t = clamp((value - low) / (high - low), 0, 1);
  return t * t * (3 - 2 * t);
}
` : ""}`;

/** The model, with the factor its size grows by: the same symbols whatever the factor, so a change of it moves nothing in the shape. */
export const MODEL = (factor: number): string => `/** A thing the app keeps. */
export interface Model {
  name: string;
  size: number;
}

/** Makes a model. */
export function makeModel(name: string): Model {
  return { name, size: name.length * ${factor} };
}
`;

const BIG = `/** Counts to a big number, one step at a time. */
export function big(): number {
  let total = 0;
  for (let step = 0; step < 10; step += 1) {
    total += step;
  }
  for (let step = 10; step > 0; step -= 1) {
    total -= step / 2;
  }
  return total;
}
`;

const HUGE = `export const HUGE = 1_000_000;

/** A huge constant, halved. */
export function huge(): number {
  return HUGE / 2;
}
`;

/** One commit of the script: its message, its date, and what it does to the tree. */
export interface ScriptedCommit {
  message: string;
  date: string;
  write?: Record<string, string>;
  move?: Array<[string, string]>;
  remove?: string[];
}

/** The seven commits, oldest first. */
export const SCRIPT: ScriptedCommit[] = [
  {
    message: "Begin with a core, an app and two helpers",
    date: "2026-01-05T10:00:00+00:00",
    write: {
      ".live-docs.config.json": `${JSON.stringify(SCRIPTED_CONFIG, null, 2)}\n`,
      "src/core/model.ts": MODEL(1),
      "src/core/util.ts": UTIL(false),
      "src/app/view.ts": VIEW("Writes a model out."),
      "src/app/main.ts": MAIN(
        [
          `import { makeModel } from "../core/model";`,
          `import { clamp } from "../core/util";`,
          `import { render } from "./view";`,
          `import { old } from "../../lib/legacy";`,
          `import { big } from "../../lib/big";`
        ],
        "render(makeModel(old())) + clamp(big(), 0, 10)"
      ),
      "lib/legacy.ts": `/** What the app used to say. */\nexport function old(): string {\n  return "legacy";\n}\n`,
      "lib/big.ts": BIG,
      "tests/main.test.ts": `import { main } from "../src/app/main";\n\nmain();\n`,
      // A committed mirror's orphan: the doc of a file long gone, kept by the generator of its day for its authored words.
      ".mdmd/layer-4/lib/ghost.ts.mdmd.md": renderLiveDoc({
        codePath: "lib/ghost.ts",
        layer: 4,
        archetype: "implementation",
        entries: [],
        generatedAt: "2025-12-01T00:00:00.000Z",
        authored: "### Purpose\nA helper deleted long ago, whose doc was kept for its words.\n\n### Notes\n- Kept by hand.",
        symbols: [],
        dependencies: []
      })
    }
  },
  {
    message: "Rename the core to the engine",
    date: "2026-01-06T10:00:00+00:00",
    move: [["src/core", "src/engine"]],
    write: {
      "src/app/view.ts": VIEW("Writes a model out.").replace("../core/model", "../engine/model"),
      "src/app/main.ts": MAIN(
        [
          `import { makeModel } from "../engine/model";`,
          `import { clamp } from "../engine/util";`,
          `import { render } from "./view";`,
          `import { old } from "../../lib/legacy";`,
          `import { big } from "../../lib/big";`
        ],
        "render(makeModel(old())) + clamp(big(), 0, 10)"
      )
    }
  },
  {
    message: "Call the view a screen",
    date: "2026-01-07T10:00:00+00:00",
    move: [["src/app/view.ts", "src/app/screen.ts"]],
    write: {
      "src/app/screen.ts": SCREEN,
      "src/app/main.ts": MAIN(
        [
          `import { makeModel } from "../engine/model";`,
          `import { clamp } from "../engine/util";`,
          `import { render } from "./screen";`,
          `import { old } from "../../lib/legacy";`,
          `import { big } from "../../lib/big";`
        ],
        "render(makeModel(old())) + clamp(big(), 0, 10)"
      )
    }
  },
  {
    message: "Rewrite the big helper as a huge one",
    date: "2026-01-08T10:00:00+00:00",
    move: [["lib/big.ts", "lib/huge.ts"]],
    write: {
      "lib/huge.ts": HUGE,
      "src/app/main.ts": MAIN(
        [
          `import { makeModel } from "../engine/model";`,
          `import { clamp } from "../engine/util";`,
          `import { render } from "./screen";`,
          `import { old } from "../../lib/legacy";`,
          `import { huge } from "../../lib/huge";`
        ],
        "render(makeModel(old())) + clamp(huge(), 0, 10)"
      )
    }
  },
  {
    message: "Retire the legacy helper",
    date: "2026-01-09T10:00:00+00:00",
    remove: ["lib/legacy.ts"],
    write: {
      "src/app/main.ts": MAIN(
        [
          `import { makeModel } from "../engine/model";`,
          `import { clamp } from "../engine/util";`,
          `import { render } from "./screen";`,
          `import { huge } from "../../lib/huge";`
        ],
        `render(makeModel("new")) + clamp(huge(), 0, 10)`
      )
    }
  },
  {
    message: "Teach the engine to smooth",
    date: "2026-01-10T10:00:00+00:00",
    write: { "src/engine/util.ts": UTIL(true) }
  },
  {
    message: "Make models a little larger",
    date: "2026-01-11T10:00:00+00:00",
    write: { "src/engine/model.ts": MODEL(2) }
  }
];

/** Runs git in the fixture, isolated from the person's configuration. */
export function git(cwd: string, args: string[], extraEnv: Record<string, string> = {}): string {
  return execFileSync("git", args, { cwd, env: { ...FIXTURE_GIT_ENV, ...extraEnv }, encoding: "utf8" });
}

/** Builds the repository commit by commit at `root` and returns the commits' ids, oldest first. */
export function buildRepository(root: string, script: ScriptedCommit[] = SCRIPT): string[] {
  git(root, ["init", "--quiet", "-b", "main"]);
  const ids: string[] = [];
  for (const commit of script) {
    for (const [from, to] of commit.move ?? []) {
      fs.mkdirSync(path.dirname(path.join(root, to)), { recursive: true });
      git(root, ["mv", from, to]);
    }
    for (const file of commit.remove ?? []) {
      git(root, ["rm", "--quiet", file]);
    }
    for (const [file, content] of Object.entries(commit.write ?? {})) {
      fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      fs.writeFileSync(path.join(root, file), content, "utf8");
    }
    git(root, ["add", "--all"]);
    git(root, ["commit", "--quiet", "-m", commit.message], { GIT_AUTHOR_DATE: commit.date, GIT_COMMITTER_DATE: commit.date });
    ids.push(git(root, ["rev-parse", "HEAD"]).trim());
  }
  return ids;
}
