// Prefixes each line of its input with the seconds since it started, to time a command's progress lines.
//   <command> 2>&1 | node stamp.cjs
"use strict";
const { performance } = require("node:perf_hooks");
const lines = require("node:readline").createInterface({ input: process.stdin });
lines.on("line", (line) => process.stdout.write(`${(performance.now() / 1000).toFixed(2).padStart(8)} ${line}\n`));
