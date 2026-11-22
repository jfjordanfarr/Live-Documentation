#!/usr/bin/env node
// Runs one command-line blind tester, 2026-11-22: a headless Claude Code session whose only tool is a shell, in a
// fresh copy of a folder of code outside this repository, given a person's question and told nothing else. Two arms:
// `files`, the code and a shell, the baseline of an agent with the repository open; `cli`, the same and one command on
// the path, `live-docs` (the wrapper beside this file), with its Live Docs generated as a repository that uses the tool
// holds them. The page's testers (playtest.mjs) are the other half of the comparison; README.md says how to read both.
//
// Usage:
//   node AI-Agent-Workspace/scripts/playtest/cli-playtest.mjs --tasks <cli-tasks.json> --task <id> --arm files|cli
//        --base <folder made by make-cli-folder.mjs> --model <id> --effort <level|default> --out <run folder>
//        [--max-turns 80] [--max-minutes 20] [--claude <program>]
//
// The tester starts in a fresh copy of the base folder under the system's temporary folder, with the shell as its only
// built-in tool, no MCP server, no setting sources, no skills or slash commands, no saved session, its own system
// prompt in place of Claude Code's, and an environment that carries none of the calling session's variables. Its
// permission mode refuses every tool but the shell. Nothing stops a shell from reading outside its folder: the record
// lists every command that names a path outside it, for the judge.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { claudeProgram } from './claude-program.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const option = (name, fallback = null) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };

const claude = claudeProgram(args);
const tasksFile = option('--tasks');
const taskId = option('--task');
const arm = option('--arm');
const base = option('--base') && path.resolve(option('--base'));
const model = option('--model');
const effort = option('--effort');
const out = option('--out') && path.resolve(option('--out'));
const maxTurns = option('--max-turns', '80');
const maxMinutes = Number(option('--max-minutes', '20'));
if (!tasksFile || !taskId || !['files', 'cli'].includes(arm) || !base || !model || !effort || !out) {
  console.error('usage: cli-playtest.mjs --tasks <file> --task <id> --arm files|cli --base <folder> --model <id> --effort <level|default> --out <dir>');
  process.exit(2);
}
const task = JSON.parse(fs.readFileSync(tasksFile, 'utf8')).tasks.find((t) => t.id === taskId);
if (!task) { console.error(`no task ${taskId} in ${tasksFile}`); process.exit(2); }
if (!fs.existsSync(base)) { console.error(`no folder at ${base}`); process.exit(2); }
if (fs.existsSync(path.join(out, 'run.json')) && JSON.parse(fs.readFileSync(path.join(out, 'run.json'), 'utf8')).finishedAt) {
  console.log(`already finished: ${out}`); process.exit(0);
}
fs.mkdirSync(out, { recursive: true });

// A fresh copy each run, so one tester's writes never reach another. The folder's name says nothing.
const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'session-'));
const folder = path.join(parent, 'code');
fs.cpSync(base, folder, { recursive: true });
let bin = null;
if (arm === 'cli') {
  bin = fs.mkdtempSync(path.join(os.tmpdir(), 'bin-'));
  fs.symlinkSync(path.join(here, 'live-docs'), path.join(bin, 'live-docs'));
}

const system = [
  'You are at a shell, in a folder that holds a copy of someone\'s code. Through your one tool you can run commands.',
  ...(arm === 'cli' ? ['The command `live-docs` is installed.'] : []),
  'They have sent you a message about the code. Do what they ask, then reply to them in plain words. Your reply is all they will read.'
].join(' ');
const claudeArgs = [
  '-p', task.words,
  '--model', model, ...(effort === 'default' ? [] : ['--effort', effort]),
  '--system-prompt', system,
  '--tools', 'Bash',
  '--allowedTools', 'Bash',
  '--strict-mcp-config', '--mcp-config', JSON.stringify({ mcpServers: {} }),
  '--permission-mode', 'dontAsk',
  '--setting-sources', '',
  '--disable-slash-commands',
  '--no-session-persistence',
  '--max-turns', maxTurns,
  '--output-format', 'stream-json', '--verbose'
];
const env = { HOME: os.homedir(), PATH: [bin, process.env.PATH].filter(Boolean).join(path.delimiter), LANG: process.env.LANG ?? 'C.UTF-8', TERM: 'dumb',
  ...(process.env.CLAUDE_CONFIG_DIR ? { CLAUDE_CONFIG_DIR: process.env.CLAUDE_CONFIG_DIR } : {}) };

fs.writeFileSync(path.join(out, 'run.json'), JSON.stringify({ task: taskId, arm, source: task.source, base, words: task.words, model, effort, maxTurns: Number(maxTurns),
  maxMinutes, systemPrompt: system, startedAt: new Date().toISOString() }, null, 2) + '\n');

const began = Date.now();
const child = spawn(claude, claudeArgs, { cwd: folder, env, stdio: ['ignore', 'pipe', 'pipe'] });
let timedOut = false;
const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); }, maxMinutes * 60_000);
const transcript = fs.createWriteStream(path.join(out, 'transcript.jsonl'));
child.stderr.pipe(fs.createWriteStream(path.join(out, 'stderr.log')));
const commands = [];
let init = null;
let result = null;
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

// What the tester showed (its words, its commands) and what came back, never its reasoning. A long output is kept
// whole in the transcript, since what the tool printed is the evidence of a stumble.
function take(line) {
  let event;
  try { event = JSON.parse(line); } catch { return; }
  const at = new Date().toISOString();
  if (event.type === 'system' && event.subtype === 'init') {
    init = { cwd: event.cwd, model: event.model, permissionMode: event.permissionMode, tools: event.tools, mcp_servers: event.mcp_servers,
      slash_commands: event.slash_commands, skills: event.skills, agents: event.agents, plugins: event.plugins };
    transcript.write(JSON.stringify({ at, kind: 'init', ...init }) + '\n');
  } else if (event.type === 'assistant') {
    for (const block of event.message?.content ?? []) {
      if (block.type === 'text') transcript.write(JSON.stringify({ at, kind: 'said', text: block.text }) + '\n');
      if (block.type === 'tool_use') {
        if (block.name === 'Bash') commands.push({ at, command: block.input?.command ?? '' });
        transcript.write(JSON.stringify({ at, kind: 'used', tool: block.name, input: block.input }) + '\n');
      }
    }
  } else if (event.type === 'user') {
    for (const block of event.message?.content ?? []) {
      if (block.type !== 'tool_result') continue;
      const parts = Array.isArray(block.content) ? block.content : [{ type: 'text', text: String(block.content ?? '') }];
      transcript.write(JSON.stringify({ at, kind: 'got', error: Boolean(block.is_error), text: parts.filter((p) => p.type === 'text').map((p) => p.text).join('\n') }) + '\n');
    }
  } else if (event.type === 'result') {
    result = event;
  }
}

const code = await new Promise((resolve) => child.on('close', resolve));
clearTimeout(timer);
const wallMs = Date.now() - began;
fs.rmSync(parent, { recursive: true, force: true });
if (bin) fs.rmSync(bin, { recursive: true, force: true });

// A command that names an absolute path outside the tester's folder, or climbs above it, is listed for the judge.
const outside = commands.filter(({ command }) => /(^|[\s='"(])\/(?!dev\/null)[^\s'"]*/.test(command.replaceAll(folder, '')) || /(^|[\s/])\.\.(\/|\s|$)/.test(command));
const usesOfTool = commands.filter(({ command }) => /\blive-docs\b/.test(command)).length;
fs.writeFileSync(path.join(out, 'commands.txt'), commands.map(({ command }, i) => `## ${i + 1}\n${command.replaceAll(folder, '<folder>')}\n`).join('\n'));
const answer = result?.result ?? '';
fs.writeFileSync(path.join(out, 'answer.md'), answer + '\n');
const summary = {
  ...JSON.parse(fs.readFileSync(path.join(out, 'run.json'), 'utf8')),
  finishedAt: new Date().toISOString(), exitCode: code, outcome: timedOut ? 'timed out' : result?.subtype ?? 'no result', wallMs, apiMs: result?.duration_api_ms,
  turns: result?.num_turns, commands: commands.length, commandsNamingLiveDocs: usesOfTool,
  commandsOutsideFolder: outside.map(({ command }) => command.replaceAll(folder, '<folder>')),
  usage: result?.usage && { input: result.usage.input_tokens, cacheWrite: result.usage.cache_creation_input_tokens,
    cacheRead: result.usage.cache_read_input_tokens, output: result.usage.output_tokens },
  costUsd: result?.total_cost_usd, modelUsage: result?.modelUsage, init
};
fs.writeFileSync(path.join(out, 'run.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(`${arm} ${taskId}: ${summary.outcome}, ${summary.turns} turns, ${summary.commands} commands (${usesOfTool} live-docs), ${(wallMs / 1000).toFixed(0)} s, $${summary.costUsd?.toFixed?.(2)}`);
