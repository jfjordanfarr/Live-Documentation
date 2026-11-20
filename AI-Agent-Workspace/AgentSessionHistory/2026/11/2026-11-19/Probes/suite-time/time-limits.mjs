#!/usr/bin/env node
// Every time limit in the browser suite's sources (tests/e2e/, Vitest's *.test.ts left out), one row per limit, sorted
// into kinds. Reads only; changes nothing.
//
//   node <this file> > time-limits.tsv        (run from the repository's root)
//
// Kinds:
//   alarm  a bound whose failure says the product is too slow: the case clocks and settle clocks of
//          force-graph-observation.ts (`caseClock`, `cameToRest`'s seconds, "Slow, not broken"), and assertions that a
//          measured duration is under a bound (`expect(ms).toBeLessThan(BOUND)` on a press, a wait, a frame).
//   net    a case's own time limit (`test.setTimeout`, `test.slow`, the configuration's 30 s): how long the case may run
//          before Playwright stops it. A plain wait for the whole case; where a spec names it "only the net" it says so.
//   wait   how long one step waits for something that always comes (`{ timeout }` on an expect, a locator, a
//          `waitForFunction`, an `expect.poll`), or a default it takes (`waitForFunction` with none takes the case's
//          limit; `expect`/`expect.poll` with none take Playwright's 5 s).
//   page   a deadline the spec runs inside the page (`performance.now() + N`, a 5 s settle loop): a plain wait, run in
//          the page, whose failure message names motion that did not stop.
//   pause  `waitForTimeout(N)` or a timer: not a limit but a fixed cost, paid every time.
// The sort is by the construct and, for alarms, by the failure message's words; the `why` column says which.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("tests/e2e");
const files = [];
const walk = dir => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.ts$/.test(entry.name) && !/\.test\.ts$/.test(entry.name) && !/\.d\.ts$/.test(entry.name)) files.push(full);
  }
};
walk(ROOT);

const ms = text => {
  const t = text.replace(/_/g, "").trim();
  return /^\d+(\.\d+)?$/.test(t) ? Number(t) : text.trim();
};

const rows = [];
const add = (file, line, construct, value, kind, why, text) => rows.push({ file: path.relative(process.cwd(), file), line, construct, value, kind, why, text: text.trim().slice(0, 140).replace(/\t/g, " ") });

for (const file of files.sort()) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const base = path.basename(file);
  lines.forEach((text, index) => {
    const line = index + 1;
    if (/^\s*(\/\/|\*|\/\*)/.test(text)) return; // comments
    // The configuration's own limits.
    if (base === "playwright.config.ts") {
      const m = text.match(/^\s*timeout:\s*([\d_]+)/);
      if (m) add(file, line, /webServer/.test(lines.slice(Math.max(0, index - 6), index).join(" ")) ? "webServer.timeout" : "config timeout (every case)", ms(m[1]), "net", "the framework's default case limit", text);
      return;
    }
    let m;
    if ((m = text.match(/test\.setTimeout\(([^)]+)\)/))) {
      const near = lines.slice(Math.max(0, index - 4), index).join(" ");
      add(file, line, "test.setTimeout", ms(m[1]), "net", /net|safety/i.test(near) ? "named the net beside it" : "a case's own limit", text);
    }
    if ((m = text.match(/test\.slow\(/))) add(file, line, "test.slow", "x3", "net", "triples the case's limit", text);
    if ((m = text.match(/caseClock\(([^)]+)\)/)) && !/function caseClock/.test(text)) add(file, line, "caseClock", m[1].trim(), "alarm", "soft expectation: 'its clock allows N s. Slow, not broken'", text);
    if (/cameToRest\(/.test(text) && !/function cameToRest/.test(text)) {
      const s = text.match(/seconds:\s*([\w.]+)/);
      add(file, line, "cameToRest seconds", s ? s[1] : "(passed through)", "alarm", "soft expectation: 'the clock allows N s. Slow, not broken'", text);
    }
    if ((m = text.match(/waitForTimeout\(([^)]+)\)/))) add(file, line, "waitForTimeout", ms(m[1]), "pause", "a fixed pause, paid every time", text);
    if ((m = text.match(/(?<![.\w])setTimeout\(\s*(?:resolve|r|done|res)\s*,\s*([\w_.]+)\s*\)/))) add(file, line, "timer in page or spec", ms(m[1]), "pause", "a fixed pause, paid every time", text);
    if ((m = text.match(/(?:deadline|until|limit|stop)\s*=\s*(?:since|start|began|performance\.now\(\)|Date\.now\(\))\s*\+\s*([\w_.]+)/))) add(file, line, "in-page deadline", ms(m[1]), "page", "a loop's own deadline", text);
    // Durations asserted under a bound: the product too slow.
    if (/toBeLessThan(OrEqual)?\(/.test(text) && /(\bms\b|took|elapsed|returned in|waiting \$\{|first frame|Date\.now\(\) - |within a minute|seconds|PRESS_BOUND|WAIT_BOUND|FIRST_FRAME_BOUND)/.test(text) && !/frame\.(right|bottom|top|left|x|y|width|height)/.test(text) && !/FRAMES \+ 1/.test(text) && !/bounds\.seconds|toBeLessThanOrEqual\(seconds\)/.test(text)) {
      const bound = (text.match(/toBeLessThan(?:OrEqual)?\(([^)]+)\)/) || [])[1] ?? "";
      if (/Math\.(abs|hypot)/.test(text)) { /* a distance in pixels, read at a moment named in ms: not a limit */ }
      else if (/page\.clock|has not already passed the phase/.test(text)) add(file, line, "guard on a fake clock", bound, "wait", "the page's clock is Playwright's fake one: a guard that the case reads the phase it means, not a speed", text);
      else if (/within a minute/.test(text)) add(file, line, "loop deadline worded as a promise", ms(bound), "alarm", "hard; a poll loop's deadline whose message promises the picture finishes growing within a minute (borderline: counted an alarm, so that it stays)", text);
      else add(file, line, "duration under a bound", bound, "alarm", "asserts that a measured duration (a press, a wait, a first frame) is under a bound", text);
    }
    // `{ timeout: N }` on a step.
    const re = /timeout:\s*([^,}\)]+)/g;
    let t;
    while ((t = re.exec(text))) {
      const value = ms(t[1]);
      const window = lines.slice(Math.max(0, index - 6), index + 1).join(" ");
      const api = (window.match(/(waitForFunction|expect\.poll|waitForSelector|waitForEvent|waitForURL|waitForResponse|waitForLoadState|toBeVisible|toBeHidden|toHaveAttribute|toHaveText|toContainText|toHaveCount|toHaveClass|toHaveValue|toHaveURL|toBeFocused|toBeEnabled|toBeDisabled|toBeChecked|toHaveCSS|toPass|click|fill|hover|press|goto|waitFor\(|toBeAttached|toHaveScreenshot|toBeInViewport|localMapSettled|evaluate)(?![\s\S]*(waitForFunction|expect\.poll|toBeVisible|toHaveAttribute|toHaveText|toHaveCount|waitFor\())/) || [])[1] ?? "step";
      add(file, line, `${api} { timeout }`, value === 0 || value === "0" ? "none (unbounded)" : value, "wait", value === 0 ? "explicitly unbounded; another bound ends it" : "how long the step waits", text);
    }
    if (/waitForFunction\(/.test(text)) {
      const ahead = lines.slice(index, index + 25).join(" ");
      const close = ahead.indexOf(");");
      if (!/timeout:/.test(close >= 0 ? ahead.slice(0, close + 2) : ahead)) add(file, line, "waitForFunction (no timeout)", "case limit", "wait", "takes the case's own limit", text);
    }
    if (/expect\.poll\(/.test(text)) {
      const ahead = lines.slice(index, index + 12).join(" ");
      const end = ahead.search(/\)\s*\.(to\w+)\(/);
      if (!/timeout:/.test(end >= 0 ? ahead.slice(0, end + 1) : ahead)) add(file, line, "expect.poll (no timeout)", 5000, "wait", "Playwright's default 5 s expect timeout", text);
    }
  });
}

const header = ["file", "line", "construct", "value", "kind", "why", "text"];
console.log(header.join("\t"));
for (const row of rows) console.log(header.map(key => String(row[key])).join("\t"));
const count = {};
for (const row of rows) count[row.kind] = (count[row.kind] ?? 0) + 1;
console.error(JSON.stringify(count));
