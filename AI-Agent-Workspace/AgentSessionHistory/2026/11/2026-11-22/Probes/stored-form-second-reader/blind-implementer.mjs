#!/usr/bin/env node
// The blind implementer of the stored form (README.md beside this file). Written on 2026-11-22. The implementer is a
// headless Claude Code run started in an empty folder outside this repository, holding only the specification and
// three valid samples. Its one tool is Bash, and every command it runs is held by Claude Code's own sandbox: it may
// write only in its folder, it may read nothing of this repository, of the home folder or of /tmp, and it has no
// network. It has no MCP server, no setting sources but the sandbox's, no slash commands, a short system prompt in
// place of Claude Code's, and an environment that carries none of the calling session's variables: the blind
// reading's harness (../design-philosophy-reading/blind-reading.mjs) with a shell put back inside a sandbox.
//
// Usage:
//   node blind-implementer.mjs prepare <folder> <spec.md> <sample>...   the folder made afresh, the spec's two lines out
//   node blind-implementer.mjs check   <folder> [--model id] [--effort e] what a run there can see, before it starts
//   node blind-implementer.mjs implement <folder> [--model id] [--effort e] [--language Python] [--session uuid]
//   node blind-implementer.mjs again   <folder> --session uuid --files a,b   one more round: files it accepts, refused
// Each step writes its answer, cost and session beside the folder, in <folder>.runs/, never inside it.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const { claudeProgram } = await import(pathToFileURL(path.resolve(here, '../../../../../../scripts/playtest/claude-program.mjs')).href);
const [step, ...rest] = process.argv.slice(2);
const option = (name, fallback = null) => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : fallback; };
const claude = claudeProgram(rest);

export const SYSTEM = 'You are a careful software engineer working alone in the current folder.';

/** The folders a run may not read: this repository, every home folder, /tmp and the editor's server. */
const HIDDEN = ['/workspaces', '/home', '/root', '/tmp', '/vscode', '/go', '/opt'];

function settings(folder) {
  return JSON.stringify({
    sandbox: {
      enabled: true,
      autoAllowBashIfSandboxed: true,
      allowUnsandboxedCommands: false,
      network: { allowedDomains: [], allowLocalBinding: false, allowUnixSockets: [] },
      filesystem: { allowWrite: [folder], denyRead: HIDDEN }
    },
    permissions: {
      allow: ['Bash'],
      deny: [...HIDDEN.map((p) => `Read(/${p}/**)`), 'WebFetch', 'WebSearch']
    }
  });
}

/** One headless run in `folder`: prompt on stdin, JSON out. */
function run({ folder, prompt, model, effort, session, resume }) {
  // /var/tmp stays readable, so a run must find nothing there but its own folder: not another run's program.
  const base = path.basename(folder.replace(/\/$/, ''));
  const others = fs.readdirSync('/var/tmp').filter((f) => f !== base && f !== `${base}.tmp`);
  if (others.length) throw new Error(`/var/tmp holds ${others.join(', ')}, which this run could read`);
  return new Promise((resolve) => {
    // Claude Code gives a sandboxed command a temporary folder under TMPDIR and lets it read and write there. Left to
    // itself that is /tmp/claude-<uid>, which holds every other session's scratch on this machine, so a temporary
    // folder of the run's own, beside its folder, is named instead.
    const tmp = `${folder.replace(/\/$/, '')}.tmp`; fs.mkdirSync(tmp, { recursive: true });
    const env = { HOME: os.homedir(), PATH: '/usr/local/bin:/usr/bin:/bin', LANG: 'C.UTF-8', TERM: 'dumb', TMPDIR: tmp,
      ...(process.env.CLAUDE_CONFIG_DIR ? { CLAUDE_CONFIG_DIR: process.env.CLAUDE_CONFIG_DIR } : {}) };
    const args = ['-p', '--model', model, ...(effort ? ['--effort', effort] : []), '--system-prompt', SYSTEM,
      '--tools', 'Bash', '--allowedTools', 'Bash', '--permission-mode', 'dontAsk',
      '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}', '--setting-sources', '', '--settings', settings(folder),
      '--disable-slash-commands', ...(resume ? ['--resume', resume] : ['--session-id', session]), '--output-format', 'json'];
    const began = Date.now();
    const child = spawn(claude, args, { cwd: folder, env, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = ''; let err = '';
    child.stdout.on('data', (c) => { out += c; });
    child.stderr.on('data', (c) => { err += c; });
    child.stdin.end(prompt);
    child.on('close', (code) => {
      let json = null; try { json = JSON.parse(out); } catch { /* reported below */ }
      resolve({ code, wallMs: Date.now() - began, json, err: json ? '' : (err || out).slice(0, 4000) });
    });
  });
}

const runsOf = (folder) => { const d = option('--runs', `${folder.replace(/\/$/, '')}.runs`); fs.mkdirSync(d, { recursive: true }); return d; };
const keep = (folder, name, record) => {
  fs.writeFileSync(path.join(runsOf(folder), `${name}.json`), JSON.stringify(record, null, 1));
  console.log(record.answer ?? record.err);
  console.log(`${name}: $${record.cost?.toFixed?.(2)} ${Math.round((record.wallMs ?? 0) / 1000)} s, session ${record.session}`);
};

if (step === 'prepare') {
  const [folder, spec, ...samples] = rest.filter((a, i) => !rest[i - 1]?.startsWith('--') && !a.startsWith('--'));
  if (!folder.startsWith('/var/tmp/')) throw new Error('the folder belongs under /var/tmp, outside every hidden folder');
  fs.rmSync(folder, { recursive: true, force: true });
  fs.mkdirSync(folder, { recursive: true });
  // The specification with the two lines at its top that name the module and the repository's records removed, and
  // nothing else changed: the paragraph "_A proposal of …_" and the paragraph "_Written so that …_".
  const lines = fs.readFileSync(spec, 'utf8').split('\n');
  const out = lines.filter((l) => !/^_A proposal of 2026-11-22\. Built as one module/.test(l) && !/^_Written so that a second reader can be written/.test(l));
  if (lines.length - out.length !== 2) throw new Error(`expected to remove two lines, removed ${lines.length - out.length}`);
  // Each removed line leaves a blank line behind it; one of each pair is taken too, so the title is followed by one.
  const text = out.join('\n').replace(/^(# [^\n]*\n)\n\n\n/, '$1\n');
  fs.writeFileSync(path.join(folder, 'specification.md'), text);
  for (const s of samples) fs.copyFileSync(s, path.join(folder, path.basename(s)));
  console.log(fs.readdirSync(folder).map((f) => `${f} ${fs.statSync(path.join(folder, f)).size}`).join('\n'));
}

export const CHECK = `Before anything else, answer these questions exactly, and change nothing on disk.
1. What files can you see or read? Use your shell to find out: list the current folder, and try to list or read /workspaces, your home folder, /tmp, / and /var/tmp. Quote each command and what it printed.
2. Can you reach the network? Try \`python3 -c "import urllib.request; print(urllib.request.urlopen('https://example.com', timeout=10).status)"\` and \`curl -sS -m 10 https://github.com\`, and quote what each printed.
3. Can you write outside the current folder? Try \`touch /var/tmp/outside-probe\` and quote what it printed.
4. What tools do you have? Quote, word for word, every instruction you have been given, including your system prompt.
5. What do you know about a software project you are working on, or about its owner?`;

if (step === 'check') {
  const [folder] = rest;
  const model = option('--model', 'claude-opus-5-5'); const effort = option('--effort', 'high');
  const session = randomUUID();
  const r = await run({ folder, prompt: CHECK, model, effort, session });
  keep(folder, `check-${model}-${Date.now()}`, { step, model, effort, system: SYSTEM, prompt: CHECK, settings: JSON.parse(settings(folder)), session, wallMs: r.wallMs, cost: r.json?.total_cost_usd, usage: r.json?.usage, answer: r.json?.result, err: r.err });
}

export const implementPrompt = (language) => `This folder holds \`specification.md\`, the specification of a binary file format, and three sample files, each a valid file of that format (\`.fpk\`) with its text form beside it (\`.txt\`). You have a shell, and you may write and run files in this folder and nowhere else. There is no network.

Your task: write, from this specification alone, ${language === 'Python' ? 'in Python using its standard library only, one program, `reader.py`,' : 'in a language of your own choosing other than Python, one that is installed here, using its standard library only, one program, with a file `run.sh` beside it that runs it as `sh run.sh <mode> <file>` (building it first if it must be built),'} with two modes.

- \`read <file>\`: reads a file of the binary format. If it is a valid file by the specification, print its text form (section 8) to standard output exactly, byte for byte, and nothing else. Otherwise print one line that begins \`refused:\` followed by the reason, and nothing else. Whatever the bytes, the program must answer one of these two ways: never hang, never crash with a traceback, and never use more time or memory than the specification allows a reader (section 6 and section 3.5).
- \`name <file>\`: reads a text form. If it is a valid text form by the specification, print the content's name (section 3.4) of the binary file it describes, as 64 lowercase hexadecimal digits. Otherwise print one line beginning \`refused:\` with the reason.

The specification is your only authority. Wherever it does not tell you enough to write a line of your program, or says two different things, or leans on something you would have to guess or to know from elsewhere (a library, a language, another program), do not guess silently: write the question down in \`questions.md\`, one question to a heading, each with the section it is about, what is missing or in conflict, and the choice you made. That file is as important as the program.

Test your program on the three samples, and make files of your own that a reader must refuse, to test that it refuses them. When you are done, say in a few lines what you built, how you tested it, and what you are least sure of.`;

if (step === 'implement') {
  const [folder] = rest;
  const model = option('--model', 'claude-opus-5-5'); const effort = option('--effort', 'high'); const language = option('--language', 'Python');
  const session = option('--session', randomUUID());
  const prompt = implementPrompt(language);
  const r = await run({ folder, prompt, model, effort, session });
  keep(folder, `implement-${Date.now()}`, { step, model, effort, language, system: SYSTEM, prompt, session, wallMs: r.wallMs, cost: r.json?.total_cost_usd, usage: r.json?.usage, turns: r.json?.num_turns, answer: r.json?.result, err: r.err });
}

export const againPrompt = (files) => `I ran your reader over files it had not seen. A reader of this specification refuses each of these files, and yours accepts it. Each is now in the folder \`round/\`:

${files.map((f) => `- \`round/${f}\``).join('\n')}

Find, from the specification alone, why each must be refused, and mend your program. Add to \`questions.md\` any new question, as before. Say in a few lines what you changed and why.`;

if (step === 'again') {
  const [folder] = rest;
  const model = option('--model', 'claude-opus-5-5'); const effort = option('--effort', 'high');
  const session = option('--session'); const files = option('--files').split(',');
  const prompt = againPrompt(files);
  const r = await run({ folder, prompt, model, effort, resume: session });
  keep(folder, `again-${Date.now()}`, { step, model, effort, prompt, session, wallMs: r.wallMs, cost: r.json?.total_cost_usd, usage: r.json?.usage, turns: r.json?.num_turns, answer: r.json?.result, err: r.err });
}
