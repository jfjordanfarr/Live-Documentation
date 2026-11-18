#!/usr/bin/env node
// Moves the agent workspace's history into one directory per dev day, by one rule, and re-points the links that the
// move would break. Made on 2026-11-18 at the owner's request ("I want to see the "ChatHistory/" directory become
// "AgentSessionHistory/" ... all of the contents of "Probes/", "Research/" and "Screenshots/" to be relocated into the
// "AgentSessionHistory" _directory_ for each calendar day"); the convention it carries out is written in the record of
// November 17-18 (AI-Agent-Workspace/ChatHistory/2026/11/2026-11-17.1.record.md, "Work notes, Turn 14").
//
// The rule, with no judgment per file:
//   ChatHistory/<y>/<m>/<date><rest>    ->  AgentSessionHistory/<y>/<m>/<date>/<date><rest>   (a capture or record
//                                            named for a date goes into that date's directory under its own name)
//   ChatHistory/<anything else>         ->  AgentSessionHistory/<same>   (README.md, month README.md, Summarized/)
//   Probes/<date>/<rest>                ->  AgentSessionHistory/<y>/<m>/<date>/Probes/<rest>
//   Screenshots/<date>/<rest>           ->  AgentSessionHistory/<y>/<m>/<date>/Screenshots/<rest>
//   Research/<date>-<topic><rest>       ->  AgentSessionHistory/<y>/<m>/<date>/Research/<topic><rest>
// Anything else under the old folders fits no rule: `plan` lists it and nothing moves it.
//
// Usage, from anywhere inside the repository:
//   node AI-Agent-Workspace/scripts/move-session-history.mjs plan     changes nothing; prints every phase's work
//   node AI-Agent-Workspace/scripts/move-session-history.mjs move     renames on disk, whole directories, then stages
//   node AI-Agent-Workspace/scripts/move-session-history.mjs relink   re-points links in markdown; writes the table
//   node AI-Agent-Workspace/scripts/move-session-history.mjs verify   proves the result against the commit before
//   node AI-Agent-Workspace/scripts/move-session-history.mjs mentions rewrites paths named outside links in current
//                                                                      documents and code; prints every change
// `relink` and `verify` compare with the last commit that still had the old folders (HEAD, HEAD^ or HEAD^^, the first
// that has them), or with `--base <commit>`.
//
// What is never altered: a capture as received (every file of the archive that is not a *.record.md, a *.SUMMARIZED.md
// or a README.md), the fenced blocks of any document (in a record they are what was said), and every heading. A link
// is re-pointed only when it resolved before the move; one that did not stays byte for byte. Links are read in
// markdown files only, outside fenced blocks and code spans; paths in source comments are not links here.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const posix = path.posix;
const WS = 'AI-Agent-Workspace';
const CHAT = `${WS}/ChatHistory`;
const PROBES = `${WS}/Probes`;
const RESEARCH = `${WS}/Research`;
const SHOTS = `${WS}/Screenshots`;
const NEW = `${WS}/AgentSessionHistory`;
const OLD_FOLDERS = [CHAT, PROBES, RESEARCH, SHOTS];
const TABLE = `${NEW}/old-paths.md`;
const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATED = /^((\d{4})-(\d{2})-\d{2})(?=[.-]|$)/;
// A directory belongs to a dev day, named for the date it was opened; everything that day makes goes there, also after
// midnight. These two harness exports are named for the calendar day after their session began, and collide with
// nothing in their session's day, so they go there. Each is the whole list of such files, checked against the month
// inventories on 2026-11-18 (the other 20 harness-named exports name their session's own day).
const DEV_DAY_OF = new Map([
  // 2026/10/README.md: "[October 7–8 Claude Code terminal export](...2026-10-08-035441-...txt): placed in this folder by
  // the owner before their Turn 7 message of [the October 7–8 session](...2026-10-07.1.record.md)"
  ['2026-10-08-035441-please-begin-a-new-1072026-chat-following-the-c.txt', '2026-10-07'],
  // 2026/11/README.md, under "## November 7–8, session 1 — Claude Code, Fable 5.1": "[Owner-supplied terminal
  // capture](...2026-11-08-003022-...txt): received under this name and preserved without agent edits"
  ['2026-11-08-003022-welcome-back-i-know-its-a-little-late-on-this-f.txt', '2026-11-07']
]);
// The Antigravity captures of November 2025 came in folders named <mm>-<dd>; each goes into its day as Antigravity/.
const ANTIGRAVITY = 'Antigravity';
const MONTH_DAY = /^(\d{2})-(\d{2})$/;

const git = (args, opts = {}) => {
  const r = spawnSync('git', args, { cwd: ROOT, maxBuffer: 2 ** 31, encoding: opts.encoding ?? 'utf8', input: opts.input, env: { ...process.env, ...opts.env } });
  if (r.status !== 0 && !opts.allowFail) die(`git ${args.join(' ')} failed:\n${r.stderr}`);
  return r;
};
const die = message => { console.error(`move-session-history: ${message}`); process.exit(1); };
const ROOT = (() => {
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' });
  if (r.status !== 0) die('run it inside the repository');
  return r.stdout.trim();
})();
const abs = p => path.join(ROOT, ...p.split('/'));
const under = (p, folder) => p === folder || p.startsWith(`${folder}/`);

// ---------------------------------------------------------------------------------------------------------------
// The rule, on paths alone. Returns the new path, the same path when the rule leaves it where it is, or null when the
// path lies under an old folder and fits no rule (it then stays where it is, and plan lists it).

// The archive's month-level entries take the date rule under either name, so that a record added at month level after
// the move (a later run) still goes into its day. An entry named for a date of another month keeps its place: it
// fits no rule, and plan lists it (misfiled).
function archiveRest(p) {
  for (const top of [CHAT, NEW]) if (under(p, top)) return p === top ? [] : p.slice(top.length + 1).split('/');
  return null;
}
function misfiled(p) {
  const rest = archiveRest(p);
  if (!rest || rest.length < 3 || !/^\d{4}$/.test(rest[0]) || !/^\d{2}$/.test(rest[1])) return false;
  const dated = DATED.exec(rest[2]);
  return Boolean(dated && !DAY.test(rest[2]) && (dated[2] !== rest[0] || dated[3] !== rest[1]));
}
function newPathOf(p) {
  const rest = archiveRest(p);
  if (rest) {
    const [y, m, name, ...tail] = rest;
    if (rest.length >= 3 && /^\d{4}$/.test(y) && /^\d{2}$/.test(m) && !misfiled(p)) {
      if (DEV_DAY_OF.has(name)) return [NEW, y, m, DEV_DAY_OF.get(name), name, ...tail].join('/');
      if (DAY.test(name) && DEV_DAY_OF.has(tail[0]) && DEV_DAY_OF.get(tail[0]) !== name) return [NEW, y, m, DEV_DAY_OF.get(tail[0]), ...tail].join('/');
      const md = name === ANTIGRAVITY ? MONTH_DAY.exec(tail[0] ?? '') : null;
      if (md && md[1] === m) return [NEW, y, m, `${y}-${m}-${md[2]}`, ANTIGRAVITY, ...tail.slice(1)].join('/');
      const dated = DATED.exec(name);
      if (dated && !DAY.test(name)) return [NEW, y, m, dated[1], name, ...tail].join('/');
    }
    return [NEW, ...rest].join('/');
  }
  for (const [folder, kind] of [[PROBES, 'Probes'], [SHOTS, 'Screenshots']]) {
    if (!under(p, folder)) continue;
    const [day, ...tail] = p === folder ? [] : p.slice(folder.length + 1).split('/');
    const d = DAY.exec(day ?? '');
    if (!d) return null;
    return [NEW, d[1], d[2], day, kind, ...tail].join('/');
  }
  if (under(p, RESEARCH)) {
    const [name, ...tail] = p === RESEARCH ? [] : p.slice(RESEARCH.length + 1).split('/');
    const d = /^((\d{4})-(\d{2})-\d{2})-(.+)$/.exec(name ?? '');
    if (!d) return null;
    return [NEW, d[2], d[3], d[1], 'Research', d[4], ...tail].join('/');
  }
  return p;
}
const mapped = p => newPathOf(p) ?? p;

// The units the move renames: the smallest old entry whose whole subtree moves to one new place.
function unitOf(p) {
  const rest = archiveRest(p);
  if (rest) {
    const top = under(p, CHAT) ? CHAT : NEW;
    const [y, m, name, next] = rest;
    if (rest.length >= 3 && /^\d{4}$/.test(y) && /^\d{2}$/.test(m) && !misfiled(p)) {
      if (name === ANTIGRAVITY && rest.length >= 4 && MONTH_DAY.exec(next)?.[1] === m) return `${top}/${y}/${m}/${name}/${next}`;
      if (DAY.test(name) && DEV_DAY_OF.has(next) && DEV_DAY_OF.get(next) !== name) return `${top}/${y}/${m}/${name}/${next}`;
      if (DATED.test(name) && !DAY.test(name)) return `${top}/${y}/${m}/${name}`;
    }
    return top === CHAT ? CHAT : null;
  }
  for (const folder of [PROBES, SHOTS, RESEARCH]) {
    if (under(p, folder) && p !== folder) return `${folder}/${p.slice(folder.length + 1).split('/')[0]}`;
  }
  return null;
}

// ---------------------------------------------------------------------------------------------------------------
// Repository state: git's index, a commit's tree and blobs, and the disk with exact case (the mount ignores case).

const lsFiles = (...pathspecs) => git(['ls-files', '-z', '--', ...pathspecs]).stdout.split('\0').filter(Boolean);
const lsTree = rev => git(['ls-tree', '-r', '-z', '--name-only', rev]).stdout.split('\0').filter(Boolean);
const dirsOf = files => {
  const dirs = new Set(['']);
  for (const f of files) for (let d = posix.dirname(f); d !== '.' && !dirs.has(d); d = posix.dirname(d)) dirs.add(d);
  return dirs;
};

function catFiles(rev, paths) {
  if (paths.length === 0) return new Map();
  const r = spawnSync('git', ['cat-file', '--batch'], { cwd: ROOT, input: paths.map(p => `${rev}:${p}\n`).join(''), maxBuffer: 2 ** 31 });
  if (r.status !== 0) die(`git cat-file failed:\n${r.stderr}`);
  const out = r.stdout;
  const result = new Map();
  let at = 0;
  for (const p of paths) {
    const eol = out.indexOf(10, at);
    const header = out.subarray(at, eol).toString('utf8');
    if (header.endsWith(' missing')) { at = eol + 1; continue; }
    const size = Number(header.split(' ')[2]);
    result.set(p, out.subarray(eol + 1, eol + 1 + size));
    at = eol + 1 + size + 1;
  }
  return result;
}

const listing = new Map();
function existsExact(p) {
  if (p === '') return true;
  const parent = posix.dirname(p) === '.' ? '' : posix.dirname(p);
  if (!existsExact(parent)) return false;
  if (!listing.has(parent)) {
    let names = [];
    try { names = fs.readdirSync(abs(parent) || ROOT); } catch { names = []; }
    listing.set(parent, new Set(names));
  }
  return listing.get(parent).has(posix.basename(p));
}

function findBase(explicit) {
  if (explicit) return git(['rev-parse', '--verify', `${explicit}^{commit}`]).stdout.trim();
  // The newest of the three that still has a file the rule would move.
  for (const rev of ['HEAD', 'HEAD^', 'HEAD^^']) {
    const r = git(['rev-parse', '--verify', '-q', `${rev}^{commit}`], { allowFail: true });
    if (r.status !== 0) break;
    const files = git(['ls-tree', '-r', '-z', '--name-only', rev, '--', ...OLD_FOLDERS, NEW]).stdout.split('\0').filter(Boolean);
    if (files.some(f => { const to = newPathOf(f); return to !== null && to !== f; })) return r.stdout.trim();
  }
  die('no commit among HEAD, HEAD^ and HEAD^^ has the old folders; name the commit before the move with --base');
}

// ---------------------------------------------------------------------------------------------------------------
// Markdown: where its links are. Fenced blocks and code spans hold no links; a link is an inline destination after
// "](" or a reference definition's destination.

function fencedRanges(text) {
  const ranges = [];
  let open = null;
  let at = 0;
  for (const line of text.split('\n')) {
    const start = at;
    at += line.length + 1;
    const fence = /^[ \t>]*(`{3,}|~{3,})(.*)$/.exec(line);
    if (open) {
      if (fence && fence[1][0] === open.char && fence[1].length >= open.length && fence[2].trim() === '') {
        ranges.push([open.start, Math.min(at, text.length)]);
        open = null;
      }
    } else if (fence && !(fence[1][0] === '`' && fence[2].includes('`'))) {
      open = { char: fence[1][0], length: fence[1].length, start };
    }
  }
  if (open) ranges.push([open.start, text.length]);
  return ranges;
}

// The text with fenced blocks and code spans blanked to spaces, offsets kept.
function prose(text) {
  const chars = text.split('');
  for (const [a, b] of fencedRanges(text)) for (let i = a; i < b; i++) if (chars[i] !== '\n') chars[i] = ' ';
  const blanked = chars.join('');
  const out = blanked.split('');
  const runs = [...blanked.matchAll(/`+/g)];
  for (let i = 0; i < runs.length; i++) {
    const run = runs[i];
    for (let j = i + 1; j < runs.length; j++) {
      const between = blanked.slice(run.index + run[0].length, runs[j].index);
      if (/\n[ \t]*\n/.test(between)) break;
      if (runs[j][0].length === run[0].length) {
        for (let k = run.index; k < runs[j].index + runs[j][0].length; k++) if (out[k] !== '\n') out[k] = ' ';
        i = j;
        break;
      }
    }
  }
  return out.join('');
}

// Every link destination outside code: { start, end } of its raw text in the document.
function linkTargets(text) {
  const p = prose(text);
  const found = [];
  for (const m of p.matchAll(/\]\(/g)) {
    let i = m.index + 2;
    while (p[i] === ' ' || p[i] === '\t' || p[i] === '\n') i++;
    const start = i;
    if (p[i] === '<') {
      const close = p.indexOf('>', i);
      if (close < 0 || p.slice(i, close).includes('\n')) continue;
      i = close + 1;
    } else {
      let depth = 0;
      for (; i < p.length; i++) {
        const c = p[i];
        if (c === '\\') { i++; continue; }
        if (c === ' ' || c === '\t' || c === '\n' || c === '<') break;
        if (c === '(') depth++;
        if (c === ')') { if (depth === 0) break; depth--; }
      }
      if (depth !== 0) continue;
    }
    const end = i;
    const rest = /^[ \t\n]*(?:("[^"]*"|'[^']*'|\([^)]*\))[ \t\n]*)?\)/.exec(p.slice(end));
    if (!rest || end === start) continue;
    found.push({ start, end });
  }
  for (const m of p.matchAll(/^ {0,3}\[[^\]\n]+\]:[ \t]*(<[^>\n]*>|\S+)/gm)) {
    const start = m.index + m[0].length - m[1].length;
    found.push({ start, end: start + m[1].length });
  }
  return found.sort((a, b) => a.start - b.start);
}

// A raw destination taken apart: angle brackets, the path, and the suffix (#anchor or ?query) kept as written.
function parseTarget(raw) {
  const angled = raw.startsWith('<') && raw.endsWith('>');
  const inner = angled ? raw.slice(1, -1) : raw;
  const cut = inner.search(/[#?]/);
  const pathPart = cut < 0 ? inner : inner.slice(0, cut);
  const suffix = cut < 0 ? '' : inner.slice(cut);
  return { angled, pathPart, suffix };
}

// The repository path a destination names from a file, or null for a URL, an anchor alone, a root path or one
// outside the repository.
function resolveFrom(file, pathPart) {
  if (pathPart === '' || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(pathPart) || pathPart.startsWith('/') || pathPart.startsWith('\\')) return null;
  let decoded = pathPart.replace(/\\([()\\])/g, '$1');
  try { decoded = decodeURIComponent(decoded); } catch { /* kept as written */ }
  const joined = posix.normalize(posix.join(posix.dirname(file), decoded));
  if (joined === '..' || joined.startsWith('../')) return null;
  return joined === '.' ? '' : joined.replace(/\/+$/, '');
}

// The destination written again from where the file is now, in the style it was written in.
function writeTarget(newFile, target, parsed) {
  let rel = posix.relative(posix.dirname(newFile), target);
  const original = parsed.pathPart;
  if (rel === '') rel = '.';
  if (original.endsWith('/') && !rel.endsWith('/')) rel += '/';
  if (original.startsWith('./') && !rel.startsWith('.')) rel = `./${rel}`;
  if (/%[0-9a-fA-F]{2}/.test(original)) rel = rel.split('/').map(s => encodeURIComponent(s)).join('/');
  else if (!parsed.angled && /[ ()]/.test(rel)) rel = rel.replace(/ /g, '%20').replace(/[()]/g, c => `\\${c}`);
  const inner = rel + parsed.suffix;
  return parsed.angled ? `<${inner}>` : inner;
}

// One document's links re-pointed. `was(target)` says whether a repository path existed before the move.
function relinkText(text, oldFile, newFile, was) {
  const counts = { links: 0, repointed: 0, unresolved: 0, lost: [] };
  let out = '';
  let at = 0;
  for (const { start, end } of linkTargets(text)) {
    const raw = text.slice(start, end);
    const parsed = parseTarget(raw);
    const target = resolveFrom(oldFile, parsed.pathPart);
    if (target === null) continue;
    counts.links++;
    if (!was(target)) { counts.unresolved++; continue; }
    const moved = newPathOf(target);
    if (moved === null) { if (!existsAfter(target)) counts.lost.push(raw); }
    const dest = moved ?? target;
    if (posix.dirname(oldFile) === posix.dirname(newFile) && dest === target) continue;
    const written = writeTarget(newFile, dest, parsed);
    if (written === raw) continue;
    out += text.slice(at, start) + written;
    at = end;
    counts.repointed++;
  }
  return { text: out + text.slice(at), counts };
}
let existsAfter = p => existsExact(p);

// ---------------------------------------------------------------------------------------------------------------
// What a file is.

const isMarkdown = p => /\.(md|mdmd)$/i.test(p);
const inArchive = p => under(p, CHAT) || under(p, NEW);
const dayEvidence = p => new RegExp(`^${NEW}/\\d{4}/\\d{2}/\\d{4}-\\d{2}-\\d{2}/(Probes|Research|Screenshots)/`).test(p);
const isCapture = p => inArchive(p) && !dayEvidence(p) && !/\.record\.md$/.test(p) && !/\.SUMMARIZED\.md$/.test(p) && posix.basename(p) !== 'README.md' && p !== TABLE;
function kindOf(p) {
  if (inArchive(p)) {
    if (/\/(Probes|Research|Screenshots)\//.test(p.slice(NEW.length)) && under(p, NEW)) return 'probe, research and screenshot documents';
    if (/\.record\.md$/.test(p)) return 'records';
    if (/\.SUMMARIZED\.md$/.test(p)) return 'summaries';
    if (posix.basename(p) === 'README.md') return 'archive READMEs';
    return 'captures';
  }
  if ([PROBES, RESEARCH, SHOTS].some(f => under(p, f))) return 'probe, research and screenshot documents';
  if (under(p, `${WS}/Memory`)) return 'Memory';
  if (under(p, `${WS}/Notes`)) return 'Notes';
  if (under(p, `${WS}/Gallery`)) return 'Gallery';
  if (/^\.mdmd\/layer-[123]\//.test(p)) return 'design documents (.mdmd layers 1 to 3)';
  if (/^\.mdmd\/layer-4\//.test(p)) return 'Live Docs (.mdmd layer 4)';
  return 'other documents';
}
const tally = (map, key, n = 1) => map.set(key, (map.get(key) ?? 0) + n);
const printTally = (title, map) => {
  console.log(`\n${title}`);
  for (const [k, v] of [...map].sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(6)}  ${k}`);
};

function shapeOf(name) {
  return name
    .replace(/^\d{4}-\d{2}-\d{2}-\d{6}-[a-z0-9-]+\.txt$/, '<date>-<time>-<first words>.txt')
    .replace(/export-\d{4}-\d{2}-\d{2}-\d{6}/, 'export-<date>-<time>')
    .replace(/snapshot-\d{4}-\d{2}-\d{2}(-\d+)?/, (_, n) => `snapshot-<date>${n ? '-<n>' : ''}`)
    .replace(/^\d{4}-\d{2}-\d{2}/, '<date>')
    .replace(/^<date>\.\d+\./, '<date>.<session>.');
}

// ---------------------------------------------------------------------------------------------------------------
// The move: units found on disk (so that ignored files beside tracked ones travel with them), merged into what is
// already there, stopping before anything moves if a file would land on another.

function diskEntries(dir) {
  try { return fs.readdirSync(abs(dir), { withFileTypes: true }); } catch { return []; }
}

function moveUnits() {
  const units = [];
  const noRule = [];
  if (fs.existsSync(abs(CHAT))) {
    units.push({ from: CHAT, to: NEW });
  }
  // Month-level dated entries, found wherever the archive is now (old name, new name, or both while merging).
  for (const top of [CHAT, NEW]) {
    for (const y of diskEntries(top).filter(e => e.isDirectory() && /^\d{4}$/.test(e.name))) {
      for (const m of diskEntries(`${top}/${y.name}`).filter(e => e.isDirectory() && /^\d{2}$/.test(e.name))) {
        for (const e of diskEntries(`${top}/${y.name}/${m.name}`)) {
          const from = `${top}/${y.name}/${m.name}/${e.name}`;
          if (DAY.test(e.name) && e.isDirectory()) {
            for (const c of diskEntries(from)) {
              const to = newPathOf(`${from}/${c.name}`);
              if (to !== `${from}/${c.name}` && to !== null) units.push({ from: `${from}/${c.name}`, to, monthLevel: true });
            }
            continue;
          }
          if (e.name === ANTIGRAVITY && e.isDirectory()) {
            for (const c of diskEntries(from)) {
              const to = newPathOf(`${from}/${c.name}`);
              if (MONTH_DAY.test(c.name) && to !== null && !to.startsWith(`${from}/`)) units.push({ from: `${from}/${c.name}`, to });
              else noRule.push(`${from}/${c.name}${c.isDirectory() ? '/' : ''}`);
            }
            continue;
          }
          if (e.name === 'README.md' || e.name === 'Summarized') continue;
          if (misfiled(from) || !DATED.test(e.name)) { noRule.push(`${from}${e.isDirectory() ? '/' : ''}`); continue; }
          units.push({ from, to: newPathOf(from), monthLevel: true });
        }
      }
    }
    for (const e of diskEntries(top)) {
      if (!(e.isDirectory() && /^\d{4}$/.test(e.name)) && e.name !== 'README.md' && `${top}/${e.name}` !== TABLE) noRule.push(`${top}/${e.name}${e.isDirectory() ? '/' : ''}`);
    }
  }
  for (const folder of [PROBES, SHOTS, RESEARCH]) {
    for (const e of diskEntries(folder)) {
      const from = `${folder}/${e.name}`;
      const to = newPathOf(from);
      if (to === null) { noRule.push(`${from}${e.isDirectory() ? '/' : ''}`); continue; }
      units.push({ from, to });
    }
  }
  return { units, noRule };
}

// Conflicts the whole move would meet, from every file on disk and its final place, before anything moves: two files
// bound for one place (ignoring case, as the mount does), a file bound for where one stays, or a file where a
// directory must be.
function conflicts() {
  const files = [];
  const walk = d => { for (const e of diskEntries(d)) { const p = `${d}/${e.name}`; if (e.isDirectory()) walk(p); else files.push(p); } };
  [...OLD_FOLDERS, NEW].forEach(walk);
  const places = new Map();
  for (const f of files) {
    const to = newPathOf(f) ?? f;
    const key = to.toLowerCase();
    if (places.has(key)) places.get(key).push(f); else places.set(key, [f]);
  }
  const found = [];
  for (const [key, from] of places) {
    if (from.length > 1) found.push(`${from.join(' and ')} -> ${newPathOf(from[0]) ?? from[0]}`);
    for (let d = posix.dirname(key); d !== '.' && d !== WS.toLowerCase(); d = posix.dirname(d)) {
      if (places.has(d)) found.push(`${places.get(d).join(', ')} is a file where ${from[0]} needs a directory`);
    }
  }
  return found;
}

function moveInto(from, to) {
  if (!fs.existsSync(abs(to))) {
    fs.mkdirSync(path.dirname(abs(to)), { recursive: true });
    fs.renameSync(abs(from), abs(to));
    return;
  }
  for (const e of fs.readdirSync(abs(from))) moveInto(`${from}/${e}`, `${to}/${e}`);
  fs.rmdirSync(abs(from));
}

// ---------------------------------------------------------------------------------------------------------------
// The phases.

function plan() {
  const tracked = lsFiles(...OLD_FOLDERS);
  console.log(`Tracked files under the old folders: ${tracked.length}`);
  const perFolder = new Map();
  for (const f of tracked) tally(perFolder, OLD_FOLDERS.find(o => under(f, o)));
  printTally('By folder:', perFolder);

  const shapes = new Map();
  const seenUnits = new Set();
  for (const f of tracked.filter(f => under(f, CHAT))) {
    const u = unitOf(f);
    if (u === CHAT || seenUnits.has(u)) continue;
    seenUnits.add(u);
    const isDir = u !== f;
    tally(shapes, shapeOf(posix.basename(u)) + (isDir ? '/' : ''));
  }
  printTally('Shapes of the archive\'s dated names at month level (each moves into its date\'s directory):', shapes);

  const fitsNoRule = tracked.filter(f => newPathOf(f) === null);
  const stays = tracked.filter(f => under(f, CHAT) && unitOf(f) === CHAT);
  const stayKinds = new Map();
  for (const f of stays) {
    const rest = f.slice(CHAT.length + 1).split('/');
    tally(stayKinds, rest.length === 1 ? rest[0] : rest.length >= 3 && rest[2] === 'Summarized' ? '<y>/<m>/Summarized/*' : rest.length === 3 ? `<y>/<m>/${rest[2]}` : `<y>/<m>/${rest[2]}/... (${rest.slice(0, 3).join('/')})`);
  }
  printTally('Under the archive, not named for a date: they keep their place, under the new name:', stayKinds);
  console.log(`\nTracked files that fit no rule (nothing moves them): ${fitsNoRule.length}`);
  for (const f of fitsNoRule) console.log(`  ${f}`);

  const { units, noRule } = moveUnits();
  const dates = new Set(units.map(u => /\/(\d{4}-\d{2}-\d{2})(\/|$)/.exec(u.to)?.[1]).filter(Boolean));
  const sessionDays = new Set(units.filter(u => u.monthLevel).map(u => /\/(\d{4}-\d{2}-\d{2})\//.exec(u.to)[1]));
  console.log(`\nmove: ${units.length} renames on disk, into ${dates.size} day directories (${[...dates].filter(d => !sessionDays.has(d)).length} of them hold no record or capture: ${[...dates].filter(d => !sessionDays.has(d)).sort().join(', ')})`);
  if (noRule.length) {
    console.log('  Entries on disk the date rule does not move (an archive entry keeps its place under the new name; any other is left where it is):');
    for (const n of noRule) console.log(`    ${n}`);
  }
  const clash = conflicts();
  console.log(`  Conflicts (a file where one already is): ${clash.length}`);
  for (const c of clash) console.log(`    ${c}`);

  const untracked = git(['ls-files', '-z', '--others', '--', ...OLD_FOLDERS]).stdout.split('\0').filter(Boolean);
  console.log(`  Files on disk that git does not track, travelling with their directories: ${untracked.length}`);
  for (const f of untracked.slice(0, 20)) console.log(`    ${f}`);

  // The links, as relink would re-point them from this state.
  const all = lsFiles();
  const before = new Set(all);
  const beforeDirs = dirsOf(all);
  const was = p => before.has(p) || beforeDirs.has(p) || existsExact(p);
  const afterFiles = new Set(all.map(f => mapped(f)));
  const afterDirs = dirsOf(afterFiles);
  existsAfter = p => afterFiles.has(p) || afterDirs.has(p);
  const docs = all.filter(f => isMarkdown(f) && !isCapture(f));
  const blobs = catFiles('HEAD', docs);
  const byKind = new Map();
  const lost = [];
  let unresolved = 0;
  let generated = 0;
  for (const f of docs) {
    const text = blobs.get(f)?.toString('utf8') ?? '';
    const { text: next, counts } = relinkText(text, f, mapped(f), was);
    if (counts.repointed) tally(byKind, kindOf(f), counts.repointed);
    unresolved += counts.unresolved;
    for (const raw of counts.lost) lost.push(`${f}: ${raw}`);
    if (next !== text && /LIVE-DOC:BEGIN/.test(text)) generated += changedInsideGenerated(text, next);
  }
  printTally('relink: links that would be re-pointed, by kind of file:', byKind);
  console.log(`  Links that did not resolve before and stay byte for byte: ${unresolved}`);
  console.log(`  Re-pointed links inside generated LIVE-DOC regions: ${generated}`);
  console.log(`  Links that resolve before and to nothing after (their target fits no rule): ${lost.length}`);
  for (const l of lost) console.log(`    ${l}`);

  const captures = all.filter(isCapture);
  const brokenInCaptures = brokenCaptureLinks(captures, was, afterFiles, afterDirs);
  console.log(`\nCaptures, never altered: ${captures.length}; links inside them that resolve before and not after: ${brokenInCaptures.length}`);
  for (const b of brokenInCaptures) console.log(`  ${b}`);

  mentions(all, was);
}

function changedInsideGenerated(text, next) {
  const regions = t => [...t.matchAll(/<!-- LIVE-DOC:BEGIN[\s\S]*?LIVE-DOC:END[^>]*-->/g)].map(m => m[0]);
  const a = regions(text);
  const b = regions(next);
  return a.filter((r, i) => r !== b[i]).length;
}

function brokenCaptureLinks(captures, was, afterFiles, afterDirs) {
  const texts = catFiles('HEAD', captures.filter(isMarkdown));
  const broken = [];
  for (const [f, buf] of texts) {
    const text = buf.toString('utf8');
    for (const { start, end } of linkTargets(text)) {
      const parsed = parseTarget(text.slice(start, end));
      const before = resolveFrom(f, parsed.pathPart);
      if (before === null || !was(before)) continue;
      const after = resolveFrom(mapped(f), parsed.pathPart);
      if (after !== null && (afterFiles.has(after) || afterDirs.has(after)) && after === mapped(before)) continue;
      broken.push(`${f}: ${text.slice(start, end)}`);
    }
  }
  return broken;
}

// Paths named outside links: counted for the fork the root decides; nothing is changed here.
function mentions(all, was) {
  const re = /(?<![\w./-])((?:\.\.?\/)*(?:AI-Agent-Workspace\/)?(?:ChatHistory|Probes|Research|Screenshots)\/[^\s`'"()[\]<>,;*|]*)/g;
  const text = all.filter(f => !/\.(png|jpe?g|gif|webm|gz|zip|ico|woff2?|ttf|pdf|webp|mp4|wav|cpuprofile)$/i.test(f));
  const blobs = catFiles('HEAD', text);
  const buckets = new Map();
  for (const [f, buf] of blobs) {
    if (buf.includes(0)) continue;
    const t = buf.toString('utf8');
    const md = isMarkdown(f);
    const linkSpans = md ? linkTargets(t) : [];
    const fences = md ? fencedRanges(t) : [];
    const generated = [...t.matchAll(/<!-- LIVE-DOC:BEGIN[\s\S]*?LIVE-DOC:END[^>]*-->/g)].map(m => [m.index, m.index + m[0].length]);
    for (const m of t.matchAll(re)) {
      if (linkSpans.some(s => m.index >= s.start && m.index < s.end)) continue;
      const raw = m[1].replace(/[.:]+$/, '');
      const candidates = [resolveFrom(f, raw), raw.startsWith('AI-Agent-Workspace/') ? raw.replace(/\/+$/, '') : `${WS}/${raw.replace(/^(\.\.?\/)+/, '').replace(/\/+$/, '')}`];
      const resolves = candidates.some(c => c !== null && was(c) && OLD_FOLDERS.some(o => under(c, o)));
      const where = isCapture(f) ? 'captures (never altered)'
        : !md ? (under(f, WS) ? `workspace scripts and evidence code (${posix.dirname(f).split('/').slice(0, 2).join('/')})` : 'source code and configuration')
        : ['records', 'summaries'].includes(kindOf(f)) || under(f, `${WS}/Notes`) ? 'historical: records, summaries, Notes'
        : kindOf(f) === 'probe, research and screenshot documents' ? 'historical: probe, research and screenshot documents'
        : kindOf(f) === 'archive READMEs' ? 'archive READMEs (convention and month inventories)'
        : 'current: guide, READMEs, Memory, Gallery, .mdmd';
      const inFence = fences.some(([a, b]) => m.index >= a && m.index < b);
      const inGenerated = generated.some(([a, b]) => m.index >= a && m.index < b);
      tally(buckets, `${where}${inGenerated ? ', inside generated regions' : ''}${inFence ? ', inside fences' : ''} | ${resolves ? 'names an existing path' : 'names no existing path'}`);
    }
  }
  printTally('Path mentions outside links (not changed by this script):', buckets);
}

function move() {
  // Changes since HEAD in the history folders are allowed only where they are this move, done earlier and interrupted:
  // an old path gone whose file is at its new place, or a new path that is an old one's place.
  const headFiles = git(['ls-tree', '-r', '-z', '--name-only', 'HEAD', '--', ...OLD_FOLDERS, NEW]).stdout.split('\0').filter(Boolean);
  const places = new Set(headFiles.map(mapped));
  const diff = git(['diff', '--name-status', '-z', '--no-renames', 'HEAD', '--', ...OLD_FOLDERS, NEW]).stdout.split('\0').filter(Boolean);
  const dirty = [];
  for (let i = 0; i < diff.length; i += 2) {
    const [status, f] = [diff[i], diff[i + 1]];
    const to = newPathOf(f);
    const ours = (status === 'D' && to !== null && to !== f && existsExact(to)) || (status === 'A' && places.has(f) && newPathOf(f) === f);
    if (!ours) dirty.push(`${status} ${f}`);
  }
  if (dirty.length) die(`the history folders have changes that are not this move; commit or set them aside first:\n  ${dirty.join('\n  ')}`);
  const clash = conflicts();
  if (clash.length) die(`a file would land where one already is, or on a directory; nothing was moved:\n  ${clash.join('\n  ')}`);
  // The archive's rename first, then its month-level entries (found again under the new name), then the rest.
  let renames = 0;
  if (fs.existsSync(abs(CHAT))) { moveInto(CHAT, NEW); renames++; }
  for (const u of moveUnits().units.filter(u => u.from !== CHAT)) { moveInto(u.from, u.to); renames++; }
  const emptied = [PROBES, RESEARCH, SHOTS, CHAT];
  for (const y of diskEntries(NEW)) for (const m of diskEntries(`${NEW}/${y.name}`)) emptied.push(`${NEW}/${y.name}/${m.name}/${ANTIGRAVITY}`);
  for (const folder of emptied) {
    try { if (fs.readdirSync(abs(folder)).length === 0) fs.rmdirSync(abs(folder)); } catch { /* absent */ }
  }
  // Staged from the index's own entries, each with its mode and blob, so that git sees pure renames by construction;
  // the refresh then confirms that the files on disk are those blobs.
  const entries = git(['ls-files', '-s', '-z', '--', ...OLD_FOLDERS, NEW]).stdout.split('\0').filter(Boolean).map(l => {
    const tab = l.indexOf('\t');
    const [mode, sha] = l.slice(0, tab).split(' ');
    return { mode, sha, from: l.slice(tab + 1) };
  });
  const moves = entries.map(e => ({ ...e, to: newPathOf(e.from) })).filter(e => e.to !== null && e.to !== e.from);
  const missing = moves.filter(m => !existsExact(m.to));
  if (missing.length) die(`after the renames these are not at their new place (the index is unchanged):\n  ${missing.map(m => `${m.from} -> ${m.to}`).join('\n  ')}`);
  const zero = '0'.repeat(moves[0]?.sha.length ?? 40);
  const info = moves.flatMap(m => [`0 ${zero}\t${m.from}`, `${m.mode} ${m.sha}\t${m.to}`]);
  if (info.length) git(['update-index', '-z', '--index-info'], { input: `${info.join('\0')}\0` });
  const stale = git(['update-index', '-q', '--refresh'], { allowFail: true }).stdout.split('\n').filter(l => moves.some(m => l.startsWith(`${m.to}:`)));
  if (stale.length) die(`staged, but these files on disk differ from the blobs they had:\n  ${stale.join('\n  ')}`);
  console.log(`Renamed ${renames} entries on disk; staged ${moves.length} tracked files as renames, each with its mode and blob.`);
}

function relink(baseArg) {
  const base = findBase(baseArg);
  const baseFiles = lsTree(base);
  const baseSet = new Set(baseFiles);
  const baseDirs = dirsOf(baseFiles);
  const was = p => baseSet.has(p) || baseDirs.has(p) || existsExact(mapped(p));
  const now = lsFiles();
  const nowSet = new Set(now);
  const nowDirs = dirsOf(now);
  existsAfter = p => nowSet.has(p) || nowDirs.has(p) || existsExact(p);
  const inverse = new Map(baseFiles.map(f => [mapped(f), f]));
  const docs = now.filter(f => isMarkdown(f) && !isCapture(f) && f !== TABLE);
  const olds = docs.map(f => (inverse.has(f) ? inverse.get(f) : null));
  const baseBlobs = catFiles(base, olds.filter(Boolean));
  const byKind = new Map();
  const changedFiles = new Map();
  const lost = [];
  let done = 0;
  const strays = [];
  const writes = [];
  const notText = [];
  docs.forEach((f, i) => {
    const old = olds[i];
    if (!old || isCapture(old)) return;
    const raw = baseBlobs.get(old);
    const original = raw.toString('utf8');
    if (!Buffer.from(original, 'utf8').equals(raw)) { notText.push(f); return; }
    const current = fs.readFileSync(abs(f), 'utf8');
    const { text: next, counts } = relinkText(original, old, f, was);
    if (current === next) { if (next !== original) done++; return; }
    if (current !== original) { strays.push(f); return; }
    tally(byKind, kindOf(f), counts.repointed);
    tally(changedFiles, kindOf(f));
    for (const l of counts.lost) lost.push(`${f}: ${l}`);
    writes.push([f, next]);
  });
  if (strays.length) die(`these files are neither as they were at ${base.slice(0, 8)} nor as relink leaves them; nothing was written:\n  ${strays.join('\n  ')}`);
  if (notText.length) console.log(`Documents that are not valid UTF-8, left as they are: ${notText.join(', ')}`);
  for (const [f, next] of writes) fs.writeFileSync(abs(f), next);
  writeTable(baseFiles);
  printTally('Links re-pointed, by kind of file:', byKind);
  printTally('Files written, by kind:', changedFiles);
  console.log(`Already re-pointed before this run: ${done} files.`);
  console.log(`Links that resolved before and to nothing now (their target fits no rule): ${lost.length}`);
  for (const l of lost) console.log(`  ${l}`);
  console.log(`Table of old paths written: ${TABLE}`);
}

// The table a later reader uses to find a file from an old path a reply names: one row per entry the move renamed.
function writeTable(baseFiles) {
  const rows = new Map();
  const isDir = new Set();
  let since = new Date().toISOString().slice(0, 10);
  // A later run adds its rows to the table; it never drops one.
  if (fs.existsSync(abs(TABLE))) {
    const old = fs.readFileSync(abs(TABLE), 'utf8');
    since = /generated on (\d{4}-\d{2}-\d{2})/.exec(old)?.[1] ?? since;
    for (const m of old.matchAll(/^\| `([^`]+)` \| `([^`]+)` \|$/gm)) {
      const [from, to] = [`${WS}/${m[1].replace(/\/$/, '')}`, `${WS}/${m[2].replace(/\/$/, '')}`];
      rows.set(from, to);
      if (m[1].endsWith('/')) isDir.add(from);
    }
  }
  for (const f of baseFiles) {
    const u = unitOf(f);
    if (!u || u === CHAT || newPathOf(f) === null) continue;
    rows.set(u, newPathOf(u));
  }
  baseFiles.forEach(f => { const u = unitOf(f); if (u && u !== CHAT && u !== f) isDir.add(u); });
  // An entry moved again by a later rule is listed from its first old path: a row from the archive's new name joins the
  // row that put it there, or, when the first move carried it with the archive's rename, takes the old name.
  for (const [from, to] of [...rows]) {
    if (!under(from, NEW)) continue;
    rows.delete(from);
    const earlier = [...rows].find(([, t]) => t === from);
    if (earlier) rows.set(earlier[0], to);
    else { const old = CHAT + from.slice(NEW.length); rows.set(old, to); if (isDir.has(from)) isDir.add(old); }
  }
  const show = (p, dir) => `\`${p.slice(WS.length + 1)}${dir ? '/' : ''}\``;
  const lines = [
    '# Old paths',
    '',
    `Historical, generated on ${since} by [move-session-history.mjs](../scripts/move-session-history.mjs) when the workspace's history moved into one directory per dev day. Each row is one entry the move renamed, under \`${WS}/\`; everything inside an entry kept its name and its place within it. \`ChatHistory/\` itself became \`AgentSessionHistory/\`, and the archive's month READMEs and \`Summarized/\` folders kept their places under the new name. Paths written before the move, in captures, in what was said and in older notes, are found here.`,
    '',
    '| Old path | New path |',
    '| --- | --- |',
    ...[...rows].sort((a, b) => a[0].localeCompare(b[0])).map(([from, to]) => `| ${show(from, isDir.has(from))} | ${show(to, isDir.has(from))} |`),
    ''
  ];
  fs.writeFileSync(abs(TABLE), lines.join('\n'));
}

function verify(baseArg) {
  const base = findBase(baseArg);
  const baseFiles = lsTree(base);
  const baseSet = new Set(baseFiles);
  const baseDirs = dirsOf(baseFiles);
  const now = lsFiles();
  const nowSet = new Set(now);
  const nowDirs = dirsOf(now);
  const failures = [];
  const fail = m => { if (failures.length < 200) failures.push(m); };
  const sha = buf => crypto.createHash('sha256').update(buf).digest('hex');

  // Every file of the base is somewhere now: where the rule puts it, or where it was if the rule leaves it.
  const placeOf = new Map();
  for (const f of baseFiles) {
    const to = newPathOf(f) ?? f;
    if (!nowSet.has(to)) fail(`missing after the move: ${f} (expected at ${to})`);
    placeOf.set(f, to);
  }
  const newBlobs = p => fs.readFileSync(abs(p));
  const oldText = catFiles(base, baseFiles.filter(f => isMarkdown(f) || isCapture(f)));

  // (b) Captures are unchanged, byte for byte.
  let captures = 0;
  for (const f of baseFiles.filter(isCapture)) {
    if (!nowSet.has(placeOf.get(f))) continue;
    captures++;
    if (sha(oldText.get(f)) !== sha(newBlobs(placeOf.get(f)))) fail(`capture changed: ${f}`);
  }

  // (a) and (c): every markdown document's links, fences and headings, before against after.
  const was = p => baseSet.has(p) || baseDirs.has(p) || existsExact(placeOf.get(p) ?? newPathOf(p) ?? p);
  const sameThing = (oldTarget, newTarget) => {
    if (baseSet.has(oldTarget)) return nowSet.has(newTarget) && placeOf.get(oldTarget) === newTarget;
    if (baseDirs.has(oldTarget)) return nowDirs.has(newTarget) && (newPathOf(oldTarget) ?? oldTarget) === newTarget;
    return existsExact(newTarget) && (newPathOf(oldTarget) ?? oldTarget) === newTarget;
  };
  const crudeBroken = [];
  const stats = { documents: 0, links: 0, resolvedKept: 0, repointed: 0, unresolvedIdentical: 0, fences: 0, headings: 0, rewrittenGenerated: 0 };
  // The table is generated, and a later run adds rows to it.
  for (const f of baseFiles.filter(f => isMarkdown(f) && !isCapture(f) && f !== TABLE)) {
    const to = placeOf.get(f);
    if (!nowSet.has(to)) continue;
    stats.documents++;
    const rawBefore = oldText.get(f);
    const rawAfter = newBlobs(to);
    const before = rawBefore.toString('utf8');
    const after = rawAfter.toString('utf8');
    if (!Buffer.from(before, 'utf8').equals(rawBefore) || !Buffer.from(after, 'utf8').equals(rawAfter)) {
      if (!rawBefore.equals(rawAfter)) fail(`a document that is not valid UTF-8 changed: ${to}`);
      continue;
    }
    // A cruder reading than the parser's, blind to code, so that a link the parser does not see is still counted.
    const crude = t => [...t.matchAll(/\]\(\s*<?([^)\s>]+)|^[ \t>]*\[[^\]\n]+\]:[ \t]*<?([^\s>]+)/gm)].map(m => m[1] ?? m[2]);
    const ca = crude(before);
    const cb = crude(after);
    ca.forEach((t, i) => {
      const ta = resolveFrom(f, parseTarget(t).pathPart);
      if (ta === null || !was(ta)) return;
      const tb = cb[i] === undefined ? null : resolveFrom(to, parseTarget(cb[i]).pathPart);
      if (tb === null || !(nowSet.has(tb) || nowDirs.has(tb) || existsExact(tb))) crudeBroken.push(`${to}: ${t}`);
    });
    const a = linkTargets(before);
    const b = linkTargets(after);
    const masked = (t, spans) => { let s = ''; let at = 0; for (const x of spans) { s += t.slice(at, x.start) + '\0'; at = x.end; } return s + t.slice(at); };
    if (a.length !== b.length || masked(before, a) !== masked(after, b)) { fail(`text other than link targets changed: ${to}`); continue; }
    a.forEach((x, i) => {
      const rawA = before.slice(x.start, x.end);
      const rawB = after.slice(b[i].start, b[i].end);
      const pa = parseTarget(rawA);
      const pb = parseTarget(rawB);
      const ta = resolveFrom(f, pa.pathPart);
      if (ta === null) { if (rawA !== rawB) fail(`a URL or anchor changed in ${to}: ${rawA} -> ${rawB}`); return; }
      stats.links++;
      if (!was(ta)) { if (rawA === rawB) stats.unresolvedIdentical++; else fail(`an unresolved link changed in ${to}: ${rawA} -> ${rawB}`); return; }
      const tb = resolveFrom(to, pb.pathPart);
      if (pa.suffix !== pb.suffix) fail(`anchor changed in ${to}: ${rawA} -> ${rawB}`);
      if (tb !== null && sameThing(ta, tb)) { stats.resolvedKept++; if (rawA !== rawB) stats.repointed++; }
      else if (newPathOf(ta) === null && !(nowSet.has(ta) || nowDirs.has(ta))) fail(`link to a path that fits no rule, now unresolved, in ${to}: ${rawA}`);
      else fail(`link no longer reaches its target in ${to}: ${rawA} -> ${rawB}`);
    });
    const fencesOf = t => fencedRanges(t).map(([s, e]) => t.slice(s, e));
    const fa = fencesOf(before);
    const fb = fencesOf(after);
    if (fa.length !== fb.length || fa.some((x, i) => x !== fb[i])) fail(`a fenced block changed: ${to}`);
    stats.fences += fa.length;
    // Headings read with link destinations masked: a heading's anchor comes from its text, which must be the same.
    const headingsOf = (t, spans) => { const m = masked(t, spans); const pl = prose(m).split('\n'); return m.split('\n').filter((l, i) => /^ {0,3}#{1,6}\s/.test(pl[i])); };
    const ha = headingsOf(before, a);
    const hb = headingsOf(after, b);
    if (ha.length !== hb.length || ha.some((x, i) => x !== hb[i])) fail(`a heading changed: ${to}`);
    stats.headings += ha.length;
    const regions = t => [...t.matchAll(/<!-- LIVE-DOC:BEGIN[\s\S]*?LIVE-DOC:END[^>]*-->/g)].map(m => m[0]);
    const ra = regions(before);
    const rb = regions(after);
    stats.rewrittenGenerated += ra.filter((r, i) => r !== rb[i]).length;
  }

  // (d) Nothing is left in the old folders, tracked or on disk, but what fits no rule.
  const leftTracked = now.filter(f => OLD_FOLDERS.some(o => under(f, o)));
  const leftDisk = [];
  const walk = d => { for (const e of diskEntries(d)) { const p = `${d}/${e.name}`; if (e.isDirectory()) walk(p); else leftDisk.push(p); } };
  OLD_FOLDERS.forEach(walk);
  const unexpected = leftDisk.filter(p => newPathOf(p) !== null);
  for (const p of unexpected) fail(`left in an old folder: ${p}`);
  for (const f of leftTracked) if (newPathOf(f) !== null) fail(`still tracked at its old path: ${f}`);
  const places = new Set(placeOf.values());
  const added = now.filter(f => !baseSet.has(f) && !places.has(f));

  // Every file but the re-pointed documents keeps its git blob at its new place.
  const blobsOf = (lines, shaAt) => new Map(lines.split('\0').filter(Boolean).map(l => { const tab = l.indexOf('\t'); const w = l.slice(0, tab).split(' '); return [l.slice(tab + 1), `${w[0]} ${w[shaAt]}`]; }));
  const baseBlobIds = blobsOf(git(['ls-tree', '-r', '-z', base]).stdout, 2);
  const indexBlobIds = blobsOf(git(['ls-files', '-s', '-z']).stdout, 1);
  // And on disk each is what the index holds, but the documents relink has written and not yet staged.
  const unstaged = git(['diff', '--name-only', '-z', '--', NEW, ...OLD_FOLDERS]).stdout.split('\0').filter(Boolean);
  for (const f of unstaged) if (!(isMarkdown(f) && !isCapture(f))) fail(`differs on disk from the index: ${f}`);
  let sameBlob = 0;
  let otherFiles = 0;
  for (const f of baseFiles) {
    if (isMarkdown(f) && !isCapture(f)) continue;
    otherFiles++;
    if (baseBlobIds.get(f) === indexBlobIds.get(placeOf.get(f))) sameBlob++;
    else fail(`mode or content changed, or not staged, at its new place: ${f} -> ${placeOf.get(f)}`);
  }

  console.log(`Base: ${base.slice(0, 12)} (${baseFiles.length} files); now: ${now.length} files in the index.`);
  console.log(`Files of the base found at their place: ${baseFiles.length - failures.filter(f => f.startsWith('missing')).length} of ${baseFiles.length}`);
  console.log(`Files in the index that the base did not have: ${added.length}${added.length ? ` (${added.slice(0, 5).join(', ')})` : ''}`);
  console.log(`Link-shaped text read without regard to code that resolved before and not now: ${crudeBroken.length} (each for a reader to judge: in a fence or code span it was never a link)`);
  for (const c of crudeBroken.slice(0, 30)) console.log(`    ${c}`);
  console.log(`Files other than markdown documents with the same mode and blob at their place in the index: ${sameBlob} of ${otherFiles}`);
  console.log(`(b) captures with the same SHA-256: ${captures - failures.filter(f => f.startsWith('capture')).length} of ${captures}`);
  console.log(`(a) markdown documents compared: ${stats.documents}; links to repository paths: ${stats.links}`);
  console.log(`    resolved before and reach the same file or directory now, same anchor: ${stats.resolvedKept} (re-pointed: ${stats.repointed})`);
  console.log(`    did not resolve before and are byte for byte as they were: ${stats.unresolvedIdentical}`);
  console.log(`(c) fenced blocks identical: ${stats.fences}; headings identical: ${stats.headings}; generated regions rewritten: ${stats.rewrittenGenerated}`);
  console.log(`(d) tracked files left in the old folders: ${leftTracked.length}${leftTracked.length ? ` (${leftTracked.join(', ')})` : ''}; files on disk left there: ${leftDisk.length}, of which a rule would move ${unexpected.length}`);
  if (failures.length) {
    console.log(`\nFailures (${failures.length}${failures.length === 200 ? ', first 200' : ''}):`);
    for (const f of failures) console.log(`  ${f}`);
    process.exit(1);
  }
  console.log('\nverify: passed');
}

// Paths named outside links, in current documents and in code, brought to the new places. Historical documents,
// captures and the evidence inside a day keep their words. A mention is rewritten only when it is outside a fence, a
// generated region and a quoted line (a line beginning with ">" is somebody's words), and names something the move
// renamed, or something inside it, that existed at the base and exists at its new place; never one of the four folder
// names alone. It keeps its form: a path from the repository's root stays from the root, a relative one relative.
function isCurrent(f) {
  if (f === `${WS}/scripts/move-session-history.mjs` || f === TABLE) return false;
  if (inArchive(f)) return posix.basename(f) === 'README.md' && !/\/\d{4}-\d{2}-\d{2}\//.test(f.slice(NEW.length));
  if (under(f, WS)) {
    if (OLD_FOLDERS.some(o => under(f, o)) || under(f, `${WS}/Notes`)) return false;
    return under(f, `${WS}/Memory`) || under(f, `${WS}/scripts`) || f === `${WS}/README.md` || f === `${WS}/Gallery/README.md`;
  }
  if (/^\.mdmd\/layer-[1-4]\//.test(f)) return isMarkdown(f);
  return true;
}

function mentionsPhase(baseArg) {
  const base = findBase(baseArg);
  const baseFiles = lsTree(base);
  const baseSet = new Set(baseFiles);
  const baseDirs = dirsOf(baseFiles);
  const now = lsFiles();
  const nowSet = new Set(now);
  const nowDirs = dirsOf(now);
  const re = /(?<![\w./-])((?:\.\.?\/)*(?:AI-Agent-Workspace\/)?(?:ChatHistory|Probes|Research|Screenshots)\/[^\s`'"()[\]<>,;*|{}]*)/g;
  const binary = /\.(png|jpe?g|gif|webm|gz|zip|ico|woff2?|ttf|pdf|webp|mp4|wav|wasm|cpuprofile)$/i;
  const files = now.filter(f => !binary.test(f) && isCurrent(f));
  let changed = 0;
  let files_ = 0;
  const lines = [];
  for (const f of files) {
    const buf = fs.readFileSync(abs(f));
    if (buf.includes(0)) continue;
    const t = buf.toString('utf8');
    if (!Buffer.from(t, 'utf8').equals(buf)) continue;
    const md = isMarkdown(f);
    const skip = [
      ...(md ? linkTargets(t).map(x => [x.start, x.end]) : []),
      ...(md ? fencedRanges(t) : []),
      ...[...t.matchAll(/<!-- LIVE-DOC:BEGIN[\s\S]*?LIVE-DOC:END[^>]*-->/g)].map(m => [m.index, m.index + m[0].length]),
      ...(md ? [...t.matchAll(/^[ \t]*>.*$/gm)].map(m => [m.index, m.index + m[0].length]) : [])
    ];
    let out = '';
    let at = 0;
    let here = 0;
    for (const m of t.matchAll(re)) {
      if (skip.some(([a, b]) => m.index >= a && m.index < b)) continue;
      const raw = m[1].replace(/[.:]+$/, '');
      const cut = raw.search(/[#?]/);
      const pathPart = cut < 0 ? raw : raw.slice(0, cut);
      const suffix = cut < 0 ? '' : raw.slice(cut);
      const slash = pathPart.endsWith('/') ? '/' : '';
      const relative = resolveFrom(f, pathPart);
      const fromRoot = posix.normalize(pathPart).replace(/\/+$/, '');
      const candidates = [[relative, 'relative'], [fromRoot, 'root']];
      const hit = candidates.find(([c]) => c !== null && OLD_FOLDERS.some(o => under(c, o)) && !OLD_FOLDERS.includes(c)
        && (baseSet.has(c) || baseDirs.has(c)) && newPathOf(c) !== null && newPathOf(c) !== c && (nowSet.has(newPathOf(c)) || nowDirs.has(newPathOf(c))));
      if (!hit) continue;
      const [target, form] = hit;
      let written = form === 'root' ? newPathOf(target) : posix.relative(posix.dirname(f), newPathOf(target));
      if (form === 'relative' && pathPart.startsWith('./') && !written.startsWith('.')) written = `./${written}`;
      written += slash + suffix;
      const line = t.slice(0, m.index).split('\n').length;
      lines.push(`${f}:${line}  ${raw} -> ${written}`);
      out += t.slice(at, m.index) + written;
      at = m.index + raw.length;
      here++;
    }
    if (here) {
      fs.writeFileSync(abs(f), out + t.slice(at));
      changed += here;
      files_++;
    }
  }
  for (const l of lines) console.log(l);
  console.log(`\nmentions: ${changed} paths rewritten in ${files_} files (base ${base.slice(0, 12)}); read every line above before committing.`);
}

const [phase, ...rest] = process.argv.slice(2);
const baseArg = rest[rest.indexOf('--base') + 1] && rest.includes('--base') ? rest[rest.indexOf('--base') + 1] : undefined;
const phases = { plan, move, relink: () => relink(baseArg), verify: () => verify(baseArg), mentions: () => mentionsPhase(baseArg) };
if (!phases[phase]) die('usage: move-session-history.mjs plan | move | relink [--base <commit>] | verify [--base <commit>] | mentions [--base <commit>]');
phases[phase]();
