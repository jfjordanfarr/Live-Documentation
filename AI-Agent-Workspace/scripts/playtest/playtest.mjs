#!/usr/bin/env node
// Runs one blind playtester: a headless Claude Code session whose only tools are a browser window's (browser-window.mjs),
// given a link and a visitor's question and told nothing else. Made on 2026-11-18 for the owner's blind UX tests
// (AI-Agent-Workspace/scripts/playtest/README.md says why and how).
//
// Usage:
//   node AI-Agent-Workspace/scripts/playtest/playtest.mjs --task <id from tasks.json> --model <id> --effort <level>
//        [--variant look-only|after-each] [--out <run folder>] [--max-actions 60] [--site <built explorer dir>] [--claude <program>]
//        [--setting <group>.<name>=<value> ...]
//   node AI-Agent-Workspace/scripts/playtest/playtest.mjs --start <url> --words <the visitor's message> ...
//
// The tester is launched from an empty directory outside the repository, with no built-in tools, this window as its
// only MCP server, no setting sources, no skills or slash commands, no session saved, and an environment that carries
// none of the calling session's variables. Its permission mode denies anything not named in --allowedTools, which names
// the window's seven tools and nothing else. The site is served read-only on 127.0.0.1:8792 for the run if nothing
// serves it there already. The whole tester runs under the shared browser lock, so the window's browser does too.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { claudeProgram } from './claude-program.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const option = (name, fallback = null) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };

const claude = claudeProgram(args);
const port = 8792;
const lock = '/tmp/live-docs-browser.lock';
const tools = ['look', 'point', 'click', 'drag', 'scroll', 'type', 'press'];

const taskId = option('--task');
const task = taskId ? JSON.parse(fs.readFileSync(path.join(here, 'tasks.json'), 'utf8')).tasks.find((t) => t.id === taskId) : null;
if (taskId && !task) { console.error(`no task ${taskId} in tasks.json`); process.exit(2); }
const start = option('--start', task?.start);
const words = option('--words', task?.words);
const model = option('--model');
const effort = option('--effort');
const variant = option('--variant', 'look-only');
const maxActions = option('--max-actions', String(task?.maxActions ?? 60));
if (!start || !words || !model || !effort || !['look-only', 'after-each'].includes(variant)) {
  console.error('usage: playtest.mjs (--task <id> | --start <url> --words <text>) --model <id> --effort <level|default> [--variant look-only|after-each] [--out <dir>]');
  process.exit(2);
}
if (!start.startsWith(`http://127.0.0.1:${port}/`)) { console.error(`the start address must be on http://127.0.0.1:${port}/`); process.exit(2); }

// The main checkout's built Explorer, also when this script runs from a worktree.
const mainCheckout = path.dirname(execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: here, encoding: 'utf8' }).trim());
const site = path.resolve(option('--site', path.join(mainCheckout, 'dist', 'explorer')));
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const out = path.resolve(option('--out', path.join(mainCheckout, 'AI-Agent-Workspace', 'tmp', 'playtests', `${stamp}-${taskId ?? 'free'}-${model}-${effort}-${variant}`)));
fs.mkdirSync(out, { recursive: true });

const system = [
  'You are at a web browser window. Through your tools you can see the window and use its mouse and keyboard, and nothing else.',
  'Someone has sent you a link, already open in the window, and a message. Do what they ask as a visitor to the page would, then reply to them in plain words.',
  'Your reply is all they will read. If you copied something to the clipboard, say so: what you copied reaches them with your reply.'
].join(' ');
const prompt = `${words}\n\n${start}`;

async function serving() {
  try { const response = await fetch(`http://127.0.0.1:${port}/`); return response.ok; } catch { return false; }
}

let server = null;
if (!await serving()) {
  if (!fs.existsSync(path.join(site, 'index.html'))) { console.error(`no built Explorer at ${site}`); process.exit(2); }
  const httpServer = createRequire(import.meta.url).resolve('http-server/bin/http-server');
  server = spawn(process.execPath, [httpServer, site, '-a', '127.0.0.1', '-p', String(port), '-c-1', '--silent'], { stdio: 'ignore' });
  for (let i = 0; i < 50 && !await serving(); i++) await new Promise((r) => setTimeout(r, 200));
  if (!await serving()) { server.kill(); console.error('the site did not come up'); process.exit(1); }
}

// The program tells the tester its working folder, so the folder's name says nothing (the first probe saw "blind-tester").
const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'session-'));
const windowArgs = [path.join(here, 'browser-window.mjs'), '--start', start, '--record', out, '--max-actions', maxActions];
if (variant === 'after-each') windowArgs.push('--after-each');
// A task may ask the window to prepare the page before the tester begins (the narrative playtest's history and its
// condition); the window records what it did in setup.json.
for (const flag of task?.window ?? []) if (['--open-history', '--hide-step-words'].includes(flag)) windowArgs.push(flag);
// A viewer's Tuning choices made before the page first loads, as `--setting localMap.framing=follows` (repeatable).
const settings = args.flatMap((arg, i) => (arg === '--setting' ? [args[i + 1]] : []));
for (const setting of settings) windowArgs.push('--setting', setting);
const mcp = { mcpServers: { window: { type: 'stdio', command: process.execPath, args: windowArgs } } };
const claudeArgs = [
  '-p', prompt,
  '--model', model, ...(effort === 'default' ? [] : ['--effort', effort]), // "default": the model's own effort
  '--system-prompt', system,
  '--tools', '',
  '--strict-mcp-config', '--mcp-config', JSON.stringify(mcp),
  '--allowedTools', tools.map((t) => `mcp__window__${t}`).join(','),
  '--permission-mode', 'dontAsk',
  '--setting-sources', '',
  '--disable-slash-commands',
  '--no-session-persistence',
  '--output-format', 'stream-json', '--verbose'
];
// Only what the program needs to run and sign in; none of the calling session's variables. The configuration folder is
// passed on because without it the program writes a fresh configuration file into the home folder.
const env = { HOME: os.homedir(), PATH: process.env.PATH, LANG: process.env.LANG ?? 'C.UTF-8', TERM: 'dumb',
  MCP_TIMEOUT: '120000', MCP_TOOL_TIMEOUT: '120000', ...(process.env.CLAUDE_CONFIG_DIR ? { CLAUDE_CONFIG_DIR: process.env.CLAUDE_CONFIG_DIR } : {}) };

// When the built site was last written, at the start and the end: a gate that rebuilds it under a run shows here.
const siteStamp = () => Object.fromEntries(['index.html', 'explorer-data.json', 'samples/estate/explorer-data.json'].map((file) => {
  try { return [file, fs.statSync(path.join(site, file)).mtime.toISOString()]; } catch { return [file, null]; }
}));
const siteAtStart = siteStamp();
fs.writeFileSync(path.join(out, 'run.json'), JSON.stringify({ task: taskId, start, words, model, effort, variant, settings, maxActions: Number(maxActions),
  site, siteAtStart, systemPrompt: system, prompt, startedAt: new Date().toISOString() }, null, 2) + '\n');

const began = Date.now();
const child = spawn('flock', ['-s', lock, claude, ...claudeArgs], { cwd: empty, env, stdio: ['ignore', 'pipe', 'pipe'] });
const transcript = fs.createWriteStream(path.join(out, 'transcript.jsonl'));
child.stderr.pipe(fs.createWriteStream(path.join(out, 'stderr.log')));
let init = null;
let initAt = null; // the tester starts only once the shared lock is free, which a gate may hold for minutes
let result = null;
let assistantMessages = 0;
let toolCalls = 0;
let buffer = '';
child.stdout.on('data', (chunk) => {
  buffer += chunk;
  let newline;
  while ((newline = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, newline);
    buffer = buffer.slice(newline + 1);
    if (line.trim()) take(line);
  }
});

// The record keeps what the tester showed (its words and its actions) and what came back, never its reasoning.
function take(line) {
  let event;
  try { event = JSON.parse(line); } catch { return; }
  const at = new Date().toISOString();
  if (event.type === 'system' && event.subtype === 'init') {
    initAt = Date.now();
    init = { cwd: event.cwd, model: event.model, permissionMode: event.permissionMode, tools: event.tools, mcp_servers: event.mcp_servers,
      slash_commands: event.slash_commands, skills: event.skills, agents: event.agents, plugins: event.plugins, output_style: event.output_style };
    transcript.write(JSON.stringify({ at, kind: 'init', ...init }) + '\n');
  } else if (event.type === 'assistant') {
    assistantMessages++;
    for (const block of event.message?.content ?? []) {
      if (block.type === 'text') transcript.write(JSON.stringify({ at, kind: 'said', text: block.text }) + '\n');
      if (block.type === 'tool_use') { toolCalls++; transcript.write(JSON.stringify({ at, kind: 'used', tool: block.name, input: block.input }) + '\n'); }
    }
  } else if (event.type === 'user') {
    for (const block of event.message?.content ?? []) {
      if (block.type !== 'tool_result') continue;
      const parts = Array.isArray(block.content) ? block.content : [{ type: 'text', text: String(block.content ?? '') }];
      transcript.write(JSON.stringify({ at, kind: 'got', error: Boolean(block.is_error),
        text: parts.filter((p) => p.type === 'text').map((p) => p.text).join('\n'), pictures: parts.filter((p) => p.type === 'image').length }) + '\n');
    }
  } else if (event.type === 'result') {
    result = event;
  }
}

// A setup the window could not make ends the run: the tester is stopped as soon as setup.json says so. (Claude Code
// restarts a window that exits, and on 2026-11-21 a restarted window set the page up again and the tester went on.)
let setupFailed = false;
const setupWatch = setInterval(() => {
  try {
    if (JSON.parse(fs.readFileSync(path.join(out, 'setup.json'), 'utf8')).ok !== false) return;
  } catch { return; }
  setupFailed = true;
  clearInterval(setupWatch);
  try { execFileSync('pkill', ['-TERM', '-P', String(child.pid)]); } catch { child.kill(); } // the tester under flock
}, 500);
const code = await new Promise((resolve) => child.on('close', resolve));
clearInterval(setupWatch);
const wallMs = Date.now() - (initAt ?? began);
const lockWaitMs = (initAt ?? began) - began;
server?.kill();
fs.rmSync(empty, { recursive: true, force: true });

const actions = fs.existsSync(path.join(out, 'actions.jsonl'))
  ? fs.readFileSync(path.join(out, 'actions.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
const answer = result?.result ?? '';
fs.writeFileSync(path.join(out, 'answer.md'), answer + '\n');
const summary = {
  ...JSON.parse(fs.readFileSync(path.join(out, 'run.json'), 'utf8')),
  finishedAt: new Date().toISOString(), siteAtEnd: siteStamp(),
  setup: fs.existsSync(path.join(out, 'setup.json')) ? JSON.parse(fs.readFileSync(path.join(out, 'setup.json'), 'utf8')) : null,
  siteChanged: JSON.stringify(siteStamp()) !== JSON.stringify(siteAtStart), exitCode: code, outcome: setupFailed ? 'setup failed' : result?.subtype ?? 'no result', wallMs, lockWaitMs, apiMs: result?.duration_api_ms,
  turns: result?.num_turns, assistantMessages, toolCalls, actions: actions.length,
  actionsByTool: Object.fromEntries(tools.map((t) => [t, actions.filter((a) => a.tool === t).length])),
  usage: result?.usage && { input: result.usage.input_tokens, cacheWrite: result.usage.cache_creation_input_tokens,
    cacheRead: result.usage.cache_read_input_tokens, output: result.usage.output_tokens },
  costUsd: result?.total_cost_usd, modelUsage: result?.modelUsage, clipboard: fs.existsSync(path.join(out, 'clipboard.jsonl'))
    ? fs.readFileSync(path.join(out, 'clipboard.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [],
  finalAddress: actions.at(-1)?.address ?? null, init
};
fs.writeFileSync(path.join(out, 'run.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(`${summary.outcome}: ${summary.turns} turns, ${summary.actions} actions, ${(wallMs / 1000).toFixed(0)} s, $${summary.costUsd?.toFixed?.(2)}`);
console.log(out);
