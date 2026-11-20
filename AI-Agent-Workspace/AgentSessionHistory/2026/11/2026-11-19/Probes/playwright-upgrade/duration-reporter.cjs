// A Playwright reporter that appends one JSON line per finished case to the file named by SUITE_TIME_OUT: where the
// case is, which pass ran it, its worker, start, duration and status, the first page it opened, and its time split by
// what its steps were doing (navigating, waiting on a page function, fixed pauses, evaluating, assertions, gestures,
// screenshots, hooks and fixtures). It changes nothing in the suite; it is given on the command line beside `list`:
//
//   SUITE_TIME_OUT=/tmp/x/cases.jsonl node scripts/e2e-passes.mjs --reporter=list,<path to this file>
//
// The two-pass runner hands its arguments to both passes, and both append to the one file.
const fs = require("node:fs");

const classOf = step => {
  const t = step.title;
  if (step.category === "hook" || step.category === "fixture") return "hooks";
  if (/^Navigate to|^Reload|^Go back|^Go forward/i.test(t)) return "navigate";
  if (/^Wait for timeout/i.test(t)) return "pause";
  if (/^Wait for function/i.test(t)) return "waitForFunction";
  if (/^Wait for (selector|event|load state|URL|navigation|response|request)/i.test(t)) return "waitForOther";
  if (/^Evaluate/i.test(t)) return "evaluate";
  if (/^(Expect|expect)/.test(t) || step.category === "expect") return "expect";
  if (/^(Click|Double click|Hover|Press|Fill|Type|Tap|Check|Uncheck|Select|Focus|Drag|Mouse|Keyboard|Wheel|Set viewport|Dispatch|Scroll)/i.test(t)) return "gesture";
  if (/screenshot/i.test(t)) return "screenshot";
  if (/^(Query|Get |Bounding box|Count|Is |Text content|Inner|Get attribute|Locator)/i.test(t)) return "query";
  return "other";
};

const addTimes = (steps, into) => {
  for (const step of steps) {
    if (step.category === "test.step" || ((step.category === "hook" || step.category === "fixture") && step.steps.length && step.steps.some(s => s.category === "pw:api"))) {
      const before = Object.values(into).reduce((a, b) => a + b, 0);
      addTimes(step.steps, into);
      const inner = Object.values(into).reduce((a, b) => a + b, 0) - before;
      const rest = Math.max(0, step.duration - inner);
      if (step.category !== "test.step") into.hooks = (into.hooks ?? 0) + rest;
      continue;
    }
    const kind = classOf(step);
    into[kind] = (into[kind] ?? 0) + Math.max(0, step.duration);
  }
};

const firstNavigation = steps => {
  for (const step of steps) {
    if (/^Navigate to/i.test(step.title)) return step.title.replace(/^Navigate to\s*/i, "").replace(/^"|"$/g, "");
    const inner = firstNavigation(step.steps);
    if (inner) return inner;
  }
  return null;
};

const count = (steps, kind) => steps.reduce((n, s) => n + (classOf(s) === kind && s.category !== "test.step" ? 1 : 0) + count(s.steps, kind), 0);

class DurationReporter {
  constructor() {
    this.out = process.env.SUITE_TIME_OUT;
    this.pass = process.env.LIVE_DOCS_E2E_PASS || "";
  }
  onTestEnd(test, result) {
    if (!this.out) return;
    const times = {};
    addTimes(result.steps, times);
    for (const key of Object.keys(times)) times[key] = Math.round(times[key]);
    const row = {
      file: test.location.file.replace(/^.*tests\/e2e\//, ""),
      line: test.location.line,
      title: test.titlePath().slice(3).join(" > "),
      tags: test.tags,
      pass: this.pass,
      worker: result.workerIndex,
      start: result.startTime.toISOString(),
      ms: result.duration,
      status: result.status,
      expected: test.expectedStatus,
      retry: result.retry,
      first: firstNavigation(result.steps),
      navigations: count(result.steps, "navigate"),
      pauses: count(result.steps, "pause"),
      times,
      error: result.error ? String(result.error.message || result.error.value || "").split("\n").find(Boolean)?.slice(0, 300) ?? null : null
    };
    fs.appendFileSync(this.out, JSON.stringify(row) + "\n");
  }
  printsToStdio() { return false; }
}

module.exports = DurationReporter;
