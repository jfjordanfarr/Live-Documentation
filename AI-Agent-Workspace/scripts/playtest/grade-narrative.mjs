#!/usr/bin/env node
// Grades one narrative playtest by another hand: a fresh headless Claude Code session with no tools at all is given the
// grader's brief, the claims, the narrative and the tester's account, and writes grade.md in the run's folder. Made on
// 2026-11-19 for the owner's test of whether the Explorer alone can retell how this software came to be
// (AI-Agent-Workspace/scripts/playtest/README.md). It needs no browser, so it never takes the browser lock.
//
// Usage:
//   node AI-Agent-Workspace/scripts/playtest/grade-narrative.mjs <run folder> [--model claude-opus-5-5] [--effort high]
//
// The grader is not told the tester's model or condition. It starts in an empty folder outside the repository with
// no setting sources, no MCP server, no skills and none of the calling session's variables, like a tester.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const option = (name, fallback = null) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const run = args[0] && path.resolve(args[0]);
if (!run || !fs.existsSync(path.join(run, 'answer.md'))) { console.error('usage: grade-narrative.mjs <run folder with answer.md> [--model id] [--effort level]'); process.exit(2); }
const claude = option('--claude', '/home/node/.vscode-server/extensions/anthropic.claude-code-2.1.327-linux-x64/resources/native-binary/claude');
const model = option('--model', 'claude-opus-5-5');
const effort = option('--effort', 'high');

const repo = path.dirname(execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: here, encoding: 'utf8' }).trim());
const brief = fs.readFileSync(path.join(here, 'narrative-grader.md'), 'utf8').split('\n---\n').slice(1).join('\n---\n').trim();
const claims = fs.readFileSync(path.join(here, 'narrative-claims.md'), 'utf8');
const narrative = fs.readFileSync(path.join(here, '..', '..', 'Memory', 'narrative.md'), 'utf8');
const account = fs.readFileSync(path.join(run, 'answer.md'), 'utf8');
const prompt = `${brief}\n\n# 1. The claims\n\n${claims}\n\n# 2. The narrative\n\n${narrative}\n\n# 3. The account\n\n${account}`;

const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'session-'));
const env = { HOME: os.homedir(), PATH: process.env.PATH, LANG: process.env.LANG ?? 'C.UTF-8', TERM: 'dumb',
  ...(process.env.CLAUDE_CONFIG_DIR ? { CLAUDE_CONFIG_DIR: process.env.CLAUDE_CONFIG_DIR } : {}) };
const began = Date.now();
const result = spawnSync(claude, ['-p', '--model', model, '--effort', effort, '--tools', '', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}',
  '--setting-sources', '', '--disable-slash-commands', '--no-session-persistence', '--output-format', 'json'],
{ cwd: empty, env, input: prompt, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
fs.rmSync(empty, { recursive: true, force: true });
let out;
try { out = JSON.parse(result.stdout); } catch { console.error(result.stderr || result.stdout); process.exit(1); }
fs.writeFileSync(path.join(run, 'grade.md'), `${out.result}\n`);
fs.writeFileSync(path.join(run, 'grade.json'), JSON.stringify({ model, effort, gradedAt: new Date().toISOString(), wallMs: Date.now() - began,
  costUsd: out.total_cost_usd, usage: out.usage, claimsFile: path.relative(repo, path.join(here, 'narrative-claims.md')) }, null, 2) + '\n');
console.log(`graded ${path.basename(run)}: ${path.join(run, 'grade.md')} ($${out.total_cost_usd?.toFixed(2)})`);
