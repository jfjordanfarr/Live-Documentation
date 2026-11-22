#!/usr/bin/env node
// Extracts every message the owner typed from the chat archive, for the blind reading of the design philosophy
// (README.md beside this file). Written on 2026-11-22. It reads four kinds of source and writes one JSON list:
//   records       AgentSessionHistory/**/*.record.md, 2026-09-30 onward: fenced blocks whose label names the owner
//   claude-code   the rebuilt Claude Code transcripts of late September 2026: sections headed "## Owner · <time>"
//   copilot       the Copy-All pastes of 2025-10-16 to 2026-04-01: from "jfjordanfarr:" or "User:" at a line's start
//                 to the next "GitHub Copilot:"
//   antigravity   the three Antigravity exports of 2025-11-19 and 20: "### User Input" to the agent's first action
// In every message, lines the owner quoted (starting with ">"), fenced blocks they pasted, and the harness's own
// tags (an opened file, a selection, a reminder) are replaced by a bracketed note: they are not the owner's typing.
// Nothing is chosen by content. Usage:
//   node extract-owner-messages.mjs <AgentSessionHistory folder> <out.json>
import fs from 'node:fs';
import path from 'node:path';

const [root, outFile] = process.argv.slice(2);
if (!root || !outFile) { console.error('usage: extract-owner-messages.mjs <AgentSessionHistory folder> <out.json>'); process.exit(2); }

const all = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) { if (entry.name !== 'Summarized' && entry.name !== 'Probes' && entry.name !== 'Research') walk(p); }
    else if (entry.name.endsWith('.md')) all.push(p);
  }
})(root);
all.sort();

// GitHub's heading anchor, near enough for "## Turn 12" and "## Owner · 2026-09-26 19:20 UTC"; the link audit checks it.
function slugger() {
  const seen = new Map();
  return (text) => {
    const base = text.toLowerCase().replace(/[`*]/g, '').replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '').replace(/ /g, '-');
    let s = base; let n = seen.get(base) ?? 0;
    if (seen.has(base)) { do { n++; s = `${base}-${n}`; } while (seen.has(s)); seen.set(base, n); } else seen.set(base, 0);
    seen.set(s, seen.get(s) ?? 0);
    return s;
  };
}

const omitted = { quoted: 0, pasted: 0, harness: 0, messagesWithNoTypedWords: 0 };
function clean(text) {
  let t = text.replace(/\r/g, '');
  t = t.replace(/<(ide_opened_file|ide_selection|ide_diagnostics|system-reminder|attachment|context|environment_info|user_info|editorContext|reminderInstructions|attachments)\b[^>]*>[\s\S]*?<\/\1>/g, () => { omitted.harness++; return '[harness context omitted]'; });
  const lines = t.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const fence = lines[i].match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fence) {
      let j = i + 1;
      for (; j < lines.length; j++) { const c = lines[j].match(/^\s{0,3}(`{3,}|~{3,})\s*$/); if (c && c[1][0] === fence[1][0] && c[1].length >= fence[1].length) break; }
      out.push('[pasted block omitted]'); omitted.pasted++; i = j; continue;
    }
    if (/^\s*>/.test(lines[i])) {
      if (out[out.length - 1] !== '[quoted lines omitted]') { out.push('[quoted lines omitted]'); omitted.quoted++; }
      continue;
    }
    out.push(lines[i]);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
const typed = (t) => t.replace(/\[(quoted lines|pasted block|harness context) omitted\]/g, '').trim().length > 0;

const messages = [];
const unknownLabels = new Map();
const add = (m) => { m.text = clean(m.raw); delete m.raw; if (typed(m.text)) messages.push(m); else omitted.messagesWithNoTypedWords++; };

// A label names the owner, names the agent, or names nobody (a time, a line number, a harness note). The records of
// November 12 and 19 also introduce the owner's words with "Quoting root's line …", "Received at … verbatim" and
// "Sent while root worked …".
const ownerLabel = /^(?:\*\*|_)?\s*(?:User|Owner|Quoting\b|Received\b.*(?:verbatim|session's log)|Sent while root worked)/i;
const rootLabel = /^(?:\*\*|_)?\s*(?:Root|Assistant|Agent|Claude|Codex|Copilot|GPT|Delivered|The reply|Reply|Final reply)\b/i;
const roleOf = (line) => (!line ? null : ownerLabel.test(line) ? 'owner' : rootLabel.test(line) ? 'root' : null);
const isFence = (line) => /^ {0,3}(`{3,}|~{3,})/.test(line ?? '');
const isPicture = (line) => /^!\[/.test(line.trim());

function records(file, rel, stem) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const anchor = slugger();
  let h2 = null; let h2Anchor = null; let h3 = null; let lastText = null; let prevRole = null; let n = 0;
  const nextContent = (from) => { let k = from; while (k < lines.length && (!lines[k].trim() || isPicture(lines[k]))) k++; return k; };
  const sectionHasFence = (from) => { for (let k = from; k < lines.length && !/^#{1,6}\s/.test(lines[k]); k++) if (isFence(lines[k])) return true; return false; };
  // The owner's words written as prose rather than fenced: after an owner heading whose section holds no fence, or
  // after an introducing line that ends in a colon or says "verbatim", up to the next heading or the next label.
  const prose = (from, label) => {
    let k = nextContent(from);
    if (k >= lines.length || isFence(lines[k]) || /^#{1,6}\s/.test(lines[k])) return null;
    const start = k; const body = [];
    for (; k < lines.length; k++) {
      if (/^#{1,6}\s/.test(lines[k]) || (k > start && /^\*\*[^*]+\*\*/.test(lines[k]) && (ownerLabel.test(lines[k]) || rootLabel.test(lines[k])))) break;
      if (isFence(lines[k])) { const f = lines[k].match(/^ {0,3}(`{3,}|~{3,})/)[1]; body.push(lines[k]); for (k++; k < lines.length; k++) { body.push(lines[k]); const c = lines[k].match(/^ {0,3}(`{3,}|~{3,})\s*$/); if (c && c[1][0] === f[0] && c[1].length >= f.length) break; } continue; }
      body.push(lines[k]);
    }
    n++;
    add({ id: `${stem}:${n}`, source: 'records', file: rel, date: stem.slice(0, 10), turn: h2, anchor: h2Anchor, label, line: start + 1, raw: body.join('\n') });
    return k - 1;
  };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (h2 && /^Turn\b/.test(h2) && !isFence(l) && !/^#/.test(l) && ownerLabel.test(l.trim()) && (/:\**\s*$/.test(l.trim()) || /verbatim/.test(l))) {
      const end = prose(i + 1, l.trim());
      if (end !== null) { i = end; lastText = null; prevRole = null; continue; }
    }
    const ownerHeading = l.match(/^###+\s+((?:User|Owner)\b.*)$/);
    if (ownerHeading && h2 && /^Turn\b/.test(h2) && !sectionHasFence(i + 1)) {
      anchor(ownerHeading[1].trim()); h3 = l.trim();
      const end = prose(i + 1, ownerHeading[1].trim());
      if (end !== null) { i = end; lastText = null; prevRole = null; continue; }
    }
    const fence = l.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      let j = i + 1;
      for (; j < lines.length; j++) { const c = lines[j].match(/^ {0,3}(`{3,}|~{3,})\s*$/); if (c && c[1][0] === fence[1][0] && c[1].length >= fence[1].length) break; }
      const role = roleOf(lastText) ?? roleOf(h3?.replace(/^#+\s*/, '')) ?? prevRole;
      if (role === 'owner' && h2 && /^Turn\b/.test(h2)) {
        n++;
        add({ id: `${stem}:${n}`, source: 'records', file: rel, date: stem.slice(0, 10), turn: h2, anchor: h2Anchor, label: lastText ?? h3, line: i + 1, raw: lines.slice(i + 1, j).join('\n') });
      } else if (role === 'owner') {
        unknownLabels.set(`owner-outside-turn ${rel}:${i + 1} [${h2}] ${lastText ?? h3}`, 1);
      } else if (!role && h2 && /^Turn\b/.test(h2)) {
        const key = `${(lastText ?? h3 ?? '').replace(/\d+/g, 'N').slice(0, 100)}`;
        unknownLabels.set(key, (unknownLabels.get(key) ?? 0) + 1);
      }
      prevRole = role; lastText = null; i = j; continue;
    }
    const heading = l.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const a = anchor(heading[2].trim());
      if (heading[1].length <= 2) { h2 = heading[2].trim(); h2Anchor = a; h3 = null; } else h3 = l.trim();
      lastText = heading[1].length >= 3 ? heading[2].trim() : null; prevRole = null; continue;
    }
    if (l.trim() && !isPicture(l)) { lastText = l.trim(); prevRole = null; }
  }
}

function claudeCode(file, rel, stem) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const anchor = slugger();
  let current = null; let n = 0;
  const close = () => { if (current) { add(current); current = null; } };
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^(#{1,2})\s+(.*)$/);
    if (h) {
      const a = anchor(h[2].trim());
      close();
      if (/^Owner\b/.test(h[2])) { n++; current = { id: `${stem}:${n}`, source: 'claude-code', file: rel, date: stem.slice(0, 10), turn: h[2].trim(), anchor: a, label: h[2].trim(), line: i + 1, raw: '' }; }
      continue;
    }
    if (/^#{3,6}\s/.test(lines[i])) anchor(lines[i].replace(/^#+\s+/, '').trim());
    if (current) current.raw += lines[i] + '\n';
  }
  close();
}

function copilot(file, rel, stem) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let current = null; let n = 0;
  for (let i = 0; i < lines.length; i++) {
    const owner = lines[i].match(/^(?:jfjordanfarr|User): ?(.*)$/);
    const agent = /^GitHub Copilot:/.test(lines[i]);
    if (agent) { if (current) { add(current); current = null; } continue; }
    if (owner && !current) { n++; current = { id: `${stem}:${n}`, source: 'copilot', file: rel, date: stem.slice(0, 10), turn: null, anchor: null, label: null, line: i + 1, raw: owner[1] + '\n' }; continue; }
    if (current) current.raw += lines[i] + '\n';
  }
  if (current) add(current);
}

function antigravity(file, rel, stem) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const anchor = slugger();
  let current = null; let n = 0;
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const a = anchor(h[2].trim());
      if (current) { add(current); current = null; }
      if (/^User Input$/.test(h[2].trim())) { n++; current = { id: `${stem}:${n}`, source: 'antigravity', file: rel, date: stem.slice(0, 10), turn: h[2].trim(), anchor: a, label: h[2].trim(), line: i + 1, raw: '' }; }
      continue;
    }
    if (current && /^\*[^*].*\*\s*$/.test(lines[i])) { add(current); current = null; continue; } // the agent's first action line
    if (current) current.raw += lines[i] + '\n';
  }
  if (current) add(current);
}

const coverage = {};
for (const file of all) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  const base = path.basename(file, '.md');
  const before = messages.length;
  let kind = null;
  const text = fs.readFileSync(file, 'utf8');
  if (base.endsWith('.record')) { kind = 'records'; records(file, rel, base.replace(/\.record$/, '')); }
  else if (/^## Owner · /m.test(text)) { kind = 'claude-code'; claudeCode(file, rel, base); }
  else if (rel.includes('/Antigravity/')) {
    // One Antigravity conversation folder can hold two exports, so the export's own title is part of its label.
    kind = 'antigravity';
    antigravity(file, rel, `${rel.split('/')[2]}.antigravity.${rel.split('/')[4].slice(0, 8)}.${base.split(' ').map((w) => w[0]).join('').toLowerCase()}`);
  }
  else if (/^(?:jfjordanfarr|User): /m.test(text) && /^GitHub Copilot:/m.test(text)) { kind = 'copilot'; copilot(file, rel, base); }
  if (!kind) { coverage[rel] = { kind: 'not read', messages: 0 }; continue; }
  coverage[rel] = { kind, messages: messages.length - before };
}

fs.writeFileSync(outFile, JSON.stringify({ extractedAt: new Date().toISOString(), omitted, coverage, unknownLabels: [...unknownLabels].map(([k, v]) => ({ label: k, fences: v })), messages }, null, 1) + '\n');
const bySource = {};
for (const m of messages) { bySource[m.source] = bySource[m.source] ?? { messages: 0, chars: 0 }; bySource[m.source].messages++; bySource[m.source].chars += m.text.length; }
const files = {};
for (const c of Object.values(coverage)) files[c.kind] = (files[c.kind] ?? 0) + 1;
console.log(JSON.stringify({ messages: messages.length, bySource, files, omitted }, null, 1));
