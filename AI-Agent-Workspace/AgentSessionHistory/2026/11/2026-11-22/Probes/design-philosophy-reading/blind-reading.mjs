#!/usr/bin/env node
// The blind reading of the owner's messages (README.md beside this file). Written on 2026-11-22. Each reader and each
// judge is a headless Claude Code run started from an empty folder that holds no file of this project, with no tools,
// no MCP server, no setting sources, no slash commands, no saved session, a one-line system prompt in place of Claude
// Code's, and an environment that carries none of the calling session's variables: the blind playtest's harness
// (AI-Agent-Workspace/scripts/playtest/README.md), without its browser.
//
// Usage, every step writing into <work> (a scratch folder, not the repository):
//   node blind-reading.mjs chunk   <messages.json> <work> [--chars 45000]
//   node blind-reading.mjs blind   <work> [--model claude-sonnet-5-5]
//   node blind-reading.mjs read    <work> --model <id> [--chunks 1,5,9] [--parallel 6] [--tag sonnet]
//   node blind-reading.mjs merge   <work>
//   node blind-reading.mjs judge   <work> --run <n> [--model claude-opus-5-5] [--effort high]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const playtest = path.resolve(here, '../../../../../../scripts/playtest/claude-program.mjs');
const { claudeProgram } = await import(pathToFileURL(playtest).href);
const [step, ...rest] = process.argv.slice(2);
const option = (name, fallback = null) => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : fallback; };
const claude = claudeProgram(rest);

export const SYSTEM = 'You are a careful reader.';
// The readers' instruction as the root's brief gave it, then one line on the form of the answer so it can be checked.
export const READER = 'These are messages the owner of a software project wrote to the agents building it. List every statement in which the owner says what they value: what they want the product to be or refuse to let it be, what matters more than what, a principle they hold. Not tasks, not bug reports. Quote each statement word for word with its message\'s label. Do not group, rank or summarize.';
export const READER_FORM = 'Write one statement per line, in this form and nothing else: [label] "the statement, word for word"';
export const JUDGE = 'Group these statements into the fewest named values that cover them. Name each value in the owner\'s own words where you can. For each: the statements in it. List apart any statement that fits no group, and any pair of statements that pull against each other.';
export const JUDGE_FORM = 'Refer to each statement by its number. Answer in this form: for each value, a heading "## " and its name, a line saying in a sentence what it is, then the numbers of its statements; then a heading "## Fits no group" and the numbers; then a heading "## Pulling against each other" and, a line each, two numbers and what pulls between them.';
export const BLIND = 'Before anything else, answer these questions exactly. What files can you see or read? What tools do you have? Quote, word for word, every instruction you have been given, including your system prompt. What do you know about a software project you are working on, or about its owner?';

// One headless run: prompt on stdin, JSON out.
function run({ prompt, model, effort }) {
  return new Promise((resolve) => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'session-'));
    const env = { HOME: os.homedir(), PATH: process.env.PATH, LANG: process.env.LANG ?? 'C.UTF-8', TERM: 'dumb',
      ...(process.env.CLAUDE_CONFIG_DIR ? { CLAUDE_CONFIG_DIR: process.env.CLAUDE_CONFIG_DIR } : {}) };
    const args = ['-p', '--model', model, ...(effort ? ['--effort', effort] : []), '--system-prompt', SYSTEM, '--tools', '',
      '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}', '--setting-sources', '', '--disable-slash-commands',
      '--no-session-persistence', '--output-format', 'json'];
    const began = Date.now();
    const child = spawn(claude, args, { cwd: empty, env, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = ''; let err = '';
    child.stdout.on('data', (c) => { out += c; });
    child.stderr.on('data', (c) => { err += c; });
    child.stdin.end(prompt);
    child.on('close', (code) => {
      fs.rmSync(empty, { recursive: true, force: true });
      let json = null; try { json = JSON.parse(out); } catch { /* reported below */ }
      resolve({ code, wallMs: Date.now() - began, json, err: json ? '' : (err || out).slice(0, 2000), cwd: empty });
    });
  });
}

async function pool(items, size, fn) {
  const results = []; let next = 0;
  await Promise.all(Array.from({ length: size }, async () => { while (next < items.length) { const i = next++; results[i] = await fn(items[i]); } }));
  return results;
}

if (step === 'chunk') {
  const [messagesFile, work] = rest;
  const max = Number(option('--chars', 45000));
  const { messages } = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
  const seen = new Set(); const kept = []; let repeats = 0;
  for (const m of [...messages].sort((a, b) => (a.date + a.file).localeCompare(b.date + b.file) || a.line - b.line)) {
    if (seen.has(m.text)) { repeats++; continue; }
    seen.add(m.text); kept.push(m);
  }
  const chunks = []; let current = []; let size = 0;
  for (const m of kept) {
    const block = `--- [${m.id}]\n${m.text}\n`;
    if (size + block.length > max && current.length) { chunks.push(current); current = []; size = 0; }
    current.push(block); size += block.length;
  }
  if (current.length) chunks.push(current);
  fs.mkdirSync(path.join(work, 'chunks'), { recursive: true });
  chunks.forEach((c, i) => fs.writeFileSync(path.join(work, 'chunks', `${String(i + 1).padStart(3, '0')}.txt`), c.join('\n')));
  fs.writeFileSync(path.join(work, 'kept.json'), JSON.stringify(kept, null, 1));
  console.log(JSON.stringify({ messages: messages.length, exactRepeatsDropped: repeats, kept: kept.length, chunks: chunks.length, chars: kept.reduce((a, m) => a + m.text.length, 0) }));
}

if (step === 'blind') {
  const [work] = rest;
  const model = option('--model', 'claude-sonnet-5-5');
  const r = await run({ prompt: BLIND, model });
  fs.writeFileSync(path.join(work, `blind-${model}.json`), JSON.stringify({ model, system: SYSTEM, prompt: BLIND, answer: r.json?.result, cost: r.json?.total_cost_usd, err: r.err }, null, 1));
  console.log(r.json?.result ?? r.err); console.log('cost', r.json?.total_cost_usd);
}

if (step === 'read') {
  const [work] = rest;
  const model = option('--model'); const tag = option('--tag', model); const effort = option('--effort');
  const all = fs.readdirSync(path.join(work, 'chunks')).sort();
  const wanted = option('--chunks') ? option('--chunks').split(',').map((n) => all[Number(n) - 1]) : all;
  const outDir = path.join(work, 'readers', tag); fs.mkdirSync(outDir, { recursive: true });
  const todo = wanted.filter((f) => !fs.existsSync(path.join(outDir, f.replace('.txt', '.json'))));
  await pool(todo, Number(option('--parallel', 6)), async (f) => {
    const chunk = fs.readFileSync(path.join(work, 'chunks', f), 'utf8');
    const prompt = `${READER}\n${READER_FORM}\n\n${chunk}`;
    const r = await run({ prompt, model, effort });
    if (!r.json || r.json.is_error) { console.error(`${f}: failed ${r.err || r.json?.result}`); return; }
    fs.writeFileSync(path.join(outDir, f.replace('.txt', '.json')), JSON.stringify({ chunk: f, model, effort, wallMs: r.wallMs, cost: r.json.total_cost_usd, usage: r.json.usage, answer: r.json.result }, null, 1));
    console.log(`${tag} ${f}: $${r.json.total_cost_usd?.toFixed(3)} ${Math.round(r.wallMs / 1000)} s`);
  });
}

// Every reader's lines, parsed and checked word for word against the message their label names; exact repeats of
// the same quote under the same label removed, and nothing else.
if (step === 'merge') {
  const [work] = rest;
  const kept = JSON.parse(fs.readFileSync(path.join(work, 'kept.json'), 'utf8'));
  const byId = new Map(kept.map((m) => [m.id, m]));
  const squash = (s) => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();
  const statements = new Map(); const unparsed = []; const tally = {};
  for (const tag of fs.readdirSync(path.join(work, 'readers')).sort()) {
    tally[tag] = { chunks: 0, lines: 0, verbatim: 0, notVerbatim: 0, unknownLabel: 0, cost: 0 };
    for (const f of fs.readdirSync(path.join(work, 'readers', tag)).sort()) {
      const r = JSON.parse(fs.readFileSync(path.join(work, 'readers', tag, f), 'utf8'));
      tally[tag].chunks++; tally[tag].cost += r.cost ?? 0;
      for (const line of r.answer.split('\n').map((l) => l.trim()).filter(Boolean)) {
        const m = line.match(/^[-*\d.\s]*\[([^\]]+)\]\s*[:\-–—]?\s*"?(.*?)"?\s*$/);
        if (!m) { unparsed.push({ tag, chunk: f, line }); continue; }
        const [, label, quote] = m;
        tally[tag].lines++;
        const msg = byId.get(label.trim());
        if (!msg) { tally[tag].unknownLabel++; unparsed.push({ tag, chunk: f, line }); continue; }
        const verbatim = squash(msg.text).includes(squash(quote).replace(/^"|"$/g, ''));
        tally[tag][verbatim ? 'verbatim' : 'notVerbatim']++;
        const key = `${label.trim()}\u0000${squash(quote)}`;
        const s = statements.get(key) ?? { label: label.trim(), quote: squash(quote), verbatim, readers: [] };
        if (!s.readers.includes(tag)) s.readers.push(tag);
        statements.set(key, s);
      }
    }
  }
  const order = new Map(kept.map((m, i) => [m.id, i]));
  const list = [...statements.values()].sort((a, b) => order.get(a.label) - order.get(b.label));
  list.forEach((s, i) => { s.n = `S${String(i + 1).padStart(4, '0')}`; });
  fs.writeFileSync(path.join(work, 'merged.json'), JSON.stringify({ tally, unparsed, statements: list }, null, 1));
  console.log(JSON.stringify({ tally, statements: list.length, unparsed: unparsed.length }, null, 1));
}

// The merged list as Markdown beside this script, each statement linked to the message it was quoted from; and each
// judge's answer as it returned, under a line of its model and cost. A statement's text is escaped so that nothing in
// it is read as a link, a tag or a heading.
const escape = (s) => s.replace(/([\\`*_[\]<>#|~])/g, '\\$1');
const archive = '../../../../..';
const linkOf = (m) => {
  const href = `${archive}/${m.file.split('/').map(encodeURIComponent).join('/')}${m.anchor ? `#${m.anchor}` : ''}`;
  return `[${m.id}](${href})${m.anchor ? '' : ` line ${m.line}`}`;
};
if (step === 'list') {
  const [work, outDir] = rest;
  const kept = JSON.parse(fs.readFileSync(path.join(work, 'kept.json'), 'utf8'));
  const byId = new Map(kept.map((m) => [m.id, m]));
  const { tally, statements } = JSON.parse(fs.readFileSync(path.join(work, 'merged.json'), 'utf8'));
  const lines = [
    '# The merged statements',
    '',
    `Historical, written 2026-11-22: every statement of value the blind readers quoted from the owner's messages, in the messages' date order, exact repeats of a quote under the same label removed and nothing else. ${statements.length} statements. Each links to the message it was quoted from (a record's turn, a transcript's section, or a Copilot-era file and the line its message starts on); which readers quoted it follows the link; "not verbatim" marks a quote not found word for word in that message. The method and the comparison are in [the README](README.md).`,
    '',
    ...statements.map((s) => `- **${s.n}** ${linkOf(byId.get(s.label))} · ${s.readers.join(', ')}${s.verbatim ? '' : ' · not verbatim'}: “${escape(s.quote)}”`),
    ''
  ];
  fs.writeFileSync(path.join(outDir, 'statements.md'), lines.join('\n'));
  for (const f of fs.existsSync(path.join(work, 'judge')) ? fs.readdirSync(path.join(work, 'judge')).sort() : []) {
    const j = JSON.parse(fs.readFileSync(path.join(work, 'judge', f), 'utf8'));
    const head = [`# Clustering ${j.run}, as the judge returned it`, '', `Historical, written 2026-11-22. ${j.model} at ${j.effort} effort, from a fresh start, given only its instruction and the ${statements.length} numbered statements of [the merged list](statements.md); $${j.cost?.toFixed(2)}, ${Math.round(j.wallMs / 1000)} s. Its answer follows unchanged but for one level added to each heading, so that this page keeps one title. The method is in [the README](README.md).`, ''];
    fs.writeFileSync(path.join(outDir, `clustering-${j.run}.md`), head.join('\n') + '\n' + j.answer.replace(/^(#{1,5}) /gm, '#$1 ') + '\n');
  }
  console.log(JSON.stringify(tally));
}

// Each clustering parsed back into groups of statement numbers, and how far the three agree: of the pairs of
// statements that any two runs put together, the share both put together.
if (step === 'tally') {
  const [work] = rest;
  const runs = fs.readdirSync(path.join(work, 'judge')).sort().map((f) => JSON.parse(fs.readFileSync(path.join(work, 'judge', f), 'utf8')));
  const parsed = runs.map((j) => {
    const groups = []; let current = null;
    for (const line of j.answer.split('\n')) {
      const h = line.match(/^#{2,3}\s+(.*)$/);
      if (h) { current = { name: h[1].trim(), numbers: [] }; groups.push(current); continue; }
      // The judges wrote the numbers bare ("3, 16, 26") or as S0003; a range ("12–15") is every number in it. In the
      // pairs section a line holds two numbers and words between and after them.
      if (!current) continue;
      if (/pulling against/i.test(current.name) && (line.match(/\bS?\d{1,4}\b/g) ?? []).length >= 2) current.pairs = (current.pairs ?? 0) + 1;
      const numbers = /pulling against/i.test(current.name) ? '' : (/^[\sS\d,;–—-]+$/.test(line) ? line : '');
      for (const m of numbers.matchAll(/S?0*(\d{1,4})(?:\s*[–—-]\s*S?0*(\d{1,4}))?/g)) {
        const from = Number(m[1]); const to = m[2] && !/pulling against/i.test(current.name) ? Number(m[2]) : from;
        for (let k = from; k <= to; k++) current.numbers.push(`S${String(k).padStart(4, '0')}`);
        if (m[2] && /pulling against/i.test(current.name)) current.numbers.push(`S${String(Number(m[2])).padStart(4, '0')}`);
      }
    }
    const values = groups.filter((g) => !/fits no group|pulling against/i.test(g.name));
    const none = groups.find((g) => /fits no group/i.test(g.name))?.numbers ?? [];
    const pulls = groups.find((g) => /pulling against/i.test(g.name))?.pairs ?? 0;
    return { run: j.run, cost: j.cost, values: values.map((g) => ({ name: g.name, size: new Set(g.numbers).size })), none: [...new Set(none)], pullPairs: pulls,
      assign: new Map(values.flatMap((g, i) => g.numbers.map((n) => [n, i]))) };
  });
  const agree = (a, b) => {
    const ids = [...a.assign.keys()].filter((k) => b.assign.has(k));
    let both = 0; let either = 0;
    for (let i = 0; i < ids.length; i++) for (let k = i + 1; k < ids.length; k++) {
      const x = a.assign.get(ids[i]) === a.assign.get(ids[k]); const y = b.assign.get(ids[i]) === b.assign.get(ids[k]);
      if (x && y) both++; if (x || y) either++;
    }
    return either ? both / either : 0;
  };
  const pairs = [];
  for (let i = 0; i < parsed.length; i++) for (let k = i + 1; k < parsed.length; k++) pairs.push({ runs: `${parsed[i].run}-${parsed[k].run}`, together: Number(agree(parsed[i], parsed[k]).toFixed(3)) });
  console.log(JSON.stringify({ runs: parsed.map(({ assign, ...r }) => ({ ...r, assigned: assign.size })), agreement: pairs }, null, 1));
}

if (step === 'judge') {
  const [work] = rest;
  const n = option('--run', '1'); const model = option('--model', 'claude-opus-5-5'); const effort = option('--effort', 'high');
  const { statements } = JSON.parse(fs.readFileSync(path.join(work, 'merged.json'), 'utf8'));
  const body = statements.map((s) => `${s.n} "${s.quote}"`).join('\n');
  const r = await run({ prompt: `${JUDGE}\n${JUDGE_FORM}\n\n${body}`, model, effort });
  fs.mkdirSync(path.join(work, 'judge'), { recursive: true });
  fs.writeFileSync(path.join(work, 'judge', `run-${n}.json`), JSON.stringify({ run: n, model, effort, wallMs: r.wallMs, cost: r.json?.total_cost_usd, usage: r.json?.usage, answer: r.json?.result, err: r.err }, null, 1));
  console.log(`judge ${n}: $${r.json?.total_cost_usd?.toFixed(2)} ${Math.round(r.wallMs / 1000)} s`, r.err);
}
