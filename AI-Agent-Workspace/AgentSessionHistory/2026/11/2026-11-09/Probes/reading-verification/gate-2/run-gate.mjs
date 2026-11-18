import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { openSync, closeSync, mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, statSync, cpSync } from 'node:fs';
import path from 'node:path';

const root = '/workspaces/Live-Documentation';
const out = '/tmp/live-docs-20261109-reading-gate2';
const lock = '/tmp/live-docs-20261108-browser.lock';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function git(args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr || 'git failed');
  return result.stdout;
}
function write(name, value) { writeFileSync(path.join(out, name), JSON.stringify(value, null, 2) + '\n'); }
function sourceManifest() {
  const files = git(['ls-files', '--cached', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean);
  const entries = {};
  for (const file of files.sort()) {
    if (!/^(packages\/|scripts\/|tests\/|\.agents\/|\.live-docs\.config\.json$|[^/]*(?:config|package|lock)[^/]*\.(?:json|ts|mjs|js)$|\.nvmrc$)/u.test(file)) continue;
    const absolute = path.join(root, file);
    if (!existsSync(absolute) || !statSync(absolute).isFile()) continue;
    const bytes = readFileSync(absolute);
    entries[file] = { bytes: bytes.length, sha256: hash(bytes) };
  }
  return entries;
}
function treeManifest(directory) {
  const entries = {};
  if (!existsSync(directory)) return entries;
  function visit(current) {
    for (const name of readdirSync(current).sort()) {
      const absolute = path.join(current, name), stat = statSync(absolute);
      if (stat.isDirectory()) visit(absolute);
      else if (stat.isFile()) { const bytes = readFileSync(absolute); entries[path.relative(directory, absolute)] = { bytes: bytes.length, sha256: hash(bytes) }; }
    }
  }
  visit(directory);
  return entries;
}

if (existsSync(path.join(out, 'gate.log'))) throw new Error('Refusing to overwrite an existing gate log');
mkdirSync(out, { recursive: true });
const outputPaths = ['test-results', 'tests/e2e/test-results', 'reports'];
const preexistingOutputs = Object.fromEntries(outputPaths.map(relative => [relative, treeManifest(path.join(root, relative))]));
write('preexisting-outputs-manifest.json', preexistingOutputs);
write('preexisting-assets-manifest.json', treeManifest(path.join(root, 'dist/explorer')));
const before = sourceManifest();
write('source-test-before.json', before);
writeFileSync(path.join(out, 'git-before.txt'), git(['status', '--short']));
writeFileSync(path.join(out, 'product-before.patch'), git(['diff', '--binary', 'HEAD', '--', 'packages', 'scripts', 'tests', '.mdmd', 'package.json', 'package-lock.json', 'vitest.config.ts']));
const run = { cwd: root, head: git(['rev-parse', 'HEAD']).trim(), command: 'LIVE_DOCS_E2E_PORT=8913 flock /tmp/live-docs-20261108-browser.lock npm run safe:commit -- --e2e', port: 8913, startedAt: new Date().toISOString(), node: process.version, parentPid: process.pid };
write('run.json', run);
const log = openSync(path.join(out, 'gate.log'), 'wx');
const child = spawn('flock', [lock, 'npm', 'run', 'safe:commit', '--', '--e2e'], { cwd: root, env: { ...process.env, LIVE_DOCS_E2E_PORT: '8913' }, stdio: ['ignore', log, log] });
run.gatePid = child.pid; write('run.json', run);
const result = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', (code, signal) => resolve({ code, signal })); });
closeSync(log);
run.finishedAt = new Date().toISOString(); run.exitCode = result.code; run.signal = result.signal; write('run.json', run);
const after = sourceManifest(); write('source-test-after.json', after);
write('source-test-differences.json', [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(file => JSON.stringify(before[file]) !== JSON.stringify(after[file])).map(file => ({ file, before: before[file], after: after[file] })));
writeFileSync(path.join(out, 'git-after.txt'), git(['status', '--short']));
writeFileSync(path.join(out, 'product-after.patch'), git(['diff', '--binary', 'HEAD', '--', 'packages', 'scripts', 'tests', '.mdmd', 'package.json', 'package-lock.json', 'vitest.config.ts']));
const gateText = readFileSync(path.join(out, 'gate.log'), 'utf8');
run.reachedPlaywright = /Running \d+ tests? using \d+ workers?/u.test(gateText);
run.assetAttribution = run.reachedPlaywright ? 'Post-run copy of assets built by this gate before Playwright; sources/assets unchanged during tests by the runner.' : 'Gate did not reach Playwright; copied assets are not claimed as served by this run. Compare preexisting-assets-manifest.json.';
write('run.json', run);
const assets = path.join(root, 'dist/explorer');
if (existsSync(assets)) { cpSync(assets, path.join(out, 'served-assets'), { recursive: true }); write('served-assets-manifest.json', treeManifest(path.join(out, 'served-assets'))); }
const outputChanges = {};
for (const relative of outputPaths) {
  const previous = preexistingOutputs[relative], current = treeManifest(path.join(root, relative));
  outputChanges[relative] = Object.fromEntries([...new Set([...Object.keys(previous), ...Object.keys(current)])].sort().map(file => [file, { attribution: !current[file] ? 'removed by run' : !previous[file] ? 'new since gate start' : JSON.stringify(previous[file]) !== JSON.stringify(current[file]) ? 'changed since gate start' : 'identical to preexisting output; not independently attributed', before: previous[file], after: current[file] }]));
  const directory = path.join(root, relative);
  if (existsSync(directory)) cpSync(directory, path.join(out, 'outputs', relative), { recursive: true });
}
write('output-attribution.json', outputChanges);
write('outputs-manifest.json', treeManifest(path.join(out, 'outputs')));
write('evidence-manifest.json', Object.fromEntries(Object.entries(treeManifest(out)).filter(([file]) => !file.startsWith('served-assets/') && !file.startsWith('outputs/') && file !== 'evidence-manifest.json')));
console.log(JSON.stringify(run));
console.log('Source/test differences: ' + JSON.stringify(readFileSync(path.join(out, 'source-test-differences.json'), 'utf8')));
process.exitCode = result.code ?? 1;
