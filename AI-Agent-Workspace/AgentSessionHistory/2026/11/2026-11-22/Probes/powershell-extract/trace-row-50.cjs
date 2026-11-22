// Row 50: can `GetLatestRelease` (AL-Go `Actions/Github-Helper.psm1:603`, holding the judged call at line 677) run
// when the Troubleshooting action runs? Read from the parser's record of AL-Go at 403f36ab (`powershell-ast.ps1`
// over every .ps1, .psm1 and .psd1 of the corpus), given as the one argument.
//
// The run: `Actions/Troubleshooting/action.yaml` runs `Invoke-AlGoAction.ps1 -Action { Troubleshooting.ps1 … }`.
// 1. Its files: those two scripts and everything they load or run, followed (dot-sources, imports, `using module`,
//    `#requires`, loops' listings, scripts run by path, manifests' entries), as the parser resolved them.
// 2. What runs: every command at the own level of those files, including inside script blocks there, and every
//    function of those files such a command names, followed through the commands inside each function, every
//    function of a name followed.
// 3. Every command whose name only a run knows (`& $x`, `. $x`), with the function that holds it.
// 4. Every command anywhere in the corpus that names `GetLatestRelease`.
const fs = require("node:fs");
const files = JSON.parse(fs.readFileSync(process.argv[2], "utf8")).files;

const loadsOf = (file) => {
  const facts = files[file];
  if (!facts) return [];
  const out = [];
  const add = (to) => to && out.push(to);
  if (facts.references) { for (const reference of facts.references) add(reference.resolved); return out; }
  for (const command of facts.importModules) for (const name of command.names) add(name.resolved);
  for (const using of facts.usingStatements) add(using.resolved);
  for (const module of facts.requiredModules) add(module.resolved);
  for (const dotSource of facts.dotSources) add(dotSource.resolved);
  for (const load of facts.loads) for (const to of load.resolved) add(to);
  for (const invocation of facts.invocations) add(invocation.resolved);
  return out;
};

const start = ["Actions/Invoke-AlGoAction.ps1", "Actions/Troubleshooting/Troubleshooting.ps1"];
const run = new Set(start);
const pending = [...start];
while (pending.length > 0) for (const to of loadsOf(pending.pop())) if (!run.has(to)) { run.add(to); pending.push(to); }
const runFiles = [...run].sort();
console.log(`1. The run's files (${runFiles.length}): ${runFiles.join(", ")}`);

const bodies = new Map();
const own = [];
for (const file of runFiles) {
  const facts = files[file];
  if (!facts.functions) continue;
  for (const fn of facts.functions) if (!fn.member && !bodies.has(fn.name.toLowerCase())) bodies.set(fn.name.toLowerCase(), new Set());
}
for (const file of runFiles) {
  const facts = files[file];
  if (!facts.invocations) continue;
  for (const invocation of facts.invocations) {
    if (!invocation.name) continue;
    const name = invocation.name.toLowerCase();
    if (invocation.function) bodies.get(invocation.function.toLowerCase())?.add(name);
    else own.push(name);
  }
}
const reached = new Set();
const names = [...own];
while (names.length > 0) {
  const name = names.pop();
  if (reached.has(name) || !bodies.has(name)) continue;
  reached.add(name);
  for (const called of bodies.get(name)) names.push(called);
}
console.log(`2. Functions of those files the run reaches by name (${reached.size}): ${[...reached].sort().join(", ")}`);
console.log(`   GetLatestRelease among them: ${reached.has("getlatestrelease") ? "yes" : "no"}`);

console.log("3. Commands named by a value only a run knows, in the run's files:");
for (const file of runFiles) {
  const facts = files[file];
  if (!facts.invocations) continue;
  for (const invocation of facts.invocations) {
    if (invocation.name || invocation.resolved) continue;
    const holder = invocation.function ?? "(own level)";
    const live = invocation.function ? (reached.has(invocation.function.toLowerCase()) ? "reached" : "not reached") : "runs";
    console.log(`   ${file}:${invocation.line} in ${holder} (${live}): ${invocation.text.slice(0, 70)}`);
  }
}

console.log("4. Every command in the corpus that names GetLatestRelease:");
const byFile = new Map();
for (const [file, facts] of Object.entries(files)) {
  if (!facts.invocations) continue;
  for (const invocation of facts.invocations) {
    if (invocation.name?.toLowerCase() !== "getlatestrelease") continue;
    const where = `${file}:${invocation.line} in ${invocation.function ?? "(own level)"}`;
    if (file.startsWith("Tests/")) byFile.set(file, (byFile.get(file) ?? 0) + 1);
    else console.log(`   ${where}${run.has(file) ? " (a file of the run)" : ""}`);
  }
}
for (const [file, count] of byFile) console.log(`   ${file}: ${count} commands, a Pester test`);
