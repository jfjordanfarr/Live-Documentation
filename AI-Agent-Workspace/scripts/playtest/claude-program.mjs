// Finds the Claude Code program a tester or the grader runs: the newest installed VS Code extension that holds it.
// Made on 2026-11-21, after the launcher's fixed path named version 2.1.327 once 2.1.329 had replaced it and every run
// ended at once (AI-Agent-Workspace/scripts/playtest/README.md). `--claude <path>` still names another.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const extensions = path.join(os.homedir(), '.vscode-server', 'extensions');
const binary = path.join('resources', 'native-binary', 'claude');
const version = (name) => (name.match(/^anthropic\.claude-code-(\d+(?:\.\d+)*)/)?.[1] ?? '').split('.').map(Number);
const newer = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) if ((a[i] ?? 0) !== (b[i] ?? 0)) return (b[i] ?? 0) - (a[i] ?? 0); return 0; };

/** The `--claude` argument when given, else the newest `anthropic.claude-code-*` extension's binary, else an error. */
export function claudeProgram(args) {
  const i = args.indexOf('--claude');
  if (i >= 0) return args[i + 1];
  const found = (fs.existsSync(extensions) ? fs.readdirSync(extensions) : [])
    .filter((name) => version(name).length && fs.existsSync(path.join(extensions, name, binary)))
    .sort((a, b) => newer(version(a), version(b)));
  if (!found.length) throw new Error(`no Claude Code program under ${extensions}/anthropic.claude-code-*/${binary}; name one with --claude`);
  return path.join(extensions, found[0], binary);
}
