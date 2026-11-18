#!/usr/bin/env node
// Lists the user-facing conversation of a Claude Code root session from its log: what the owner typed and what the
// root's turn showed as a message. Made on 2026-11-16, after a root had noted eight replies as told to the owner that
// the harness never showed (AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-15/2026-11-15.1.record.md, the notes after Turn 12).
//
// Usage:
//   node AI-Agent-Workspace/scripts/visible-messages.mjs <session-log.jsonl> [sinceISO] [untilISO] [index|full]
//
//   index  one line a message: time, speaker, length, first words. Use it after a reply to see that it was shown.
//   full   every message whole, for copying root's replies into the day's record.
//
// The session's log is the harness's own file, outside the repository, named for the session's id under the
// harness's folder for this project (for Claude Code in this container, ~/.claude/projects/<project>/<session>.jsonl).
//
// What it admits, and nothing else (the archive's rule: AI-Agent-Workspace/AgentSessionHistory/README.md, Source captures):
//   - from the root session only, never a delegated thread (entries marked as a side chain are skipped);
//   - an assistant entry's text blocks: what the turn showed;
//   - a user entry's typed text, and a message the owner sent while the root worked, which the harness keeps as a
//     queued command; harness notices among them are named as notices and not printed.
// It never reads or prints reasoning, a tool's input or a tool's result.
import fs from 'node:fs';
import readline from 'node:readline';

const [file, since = '', until = '9999', mode = 'index'] = process.argv.slice(2);
if (!file || !fs.existsSync(file) || !['index', 'full'].includes(mode)) {
  console.error('usage: visible-messages.mjs <session-log.jsonl> [sinceISO] [untilISO] [index|full]');
  process.exit(2);
}

const notice = /^\s*<(task-notification|system-reminder|local-command|command-name|command-message|command-args|local-command-stdout|user-prompt-submit-hook|bash-input|bash-stdout|ide_|fork)/;
const messages = [];
const lines = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
for await (const line of lines) {
  if (!line) continue;
  let entry;
  try { entry = JSON.parse(line); } catch { continue; }
  if (entry.isSidechain) continue;
  const at = entry.timestamp || '';
  if (at < since || at > until) continue;
  const content = entry.message && entry.message.content;
  if (entry.type === 'assistant' && Array.isArray(content)) {
    for (const block of content) if (block && block.type === 'text' && typeof block.text === 'string' && block.text.trim()) messages.push({ at, who: 'root', text: block.text });
  } else if (entry.type === 'user' && !entry.isMeta && !entry.isCompactSummary && !entry.isVisibleInTranscriptOnly) {
    const texts = typeof content === 'string' ? [content] : Array.isArray(content) ? content.filter(block => block && block.type === 'text' && typeof block.text === 'string').map(block => block.text) : [];
    for (const text of texts) messages.push({ at, who: 'owner', text });
  } else if (entry.type === 'attachment' && entry.attachment && entry.attachment.type === 'queued_command' && entry.attachment.origin && entry.attachment.origin.kind === 'human') {
    const prompt = entry.attachment.prompt;
    const texts = typeof prompt === 'string' ? [prompt] : Array.isArray(prompt) ? prompt.filter(block => block && block.type === 'text' && typeof block.text === 'string').map(block => block.text) : [];
    for (const text of texts) messages.push({ at, who: 'owner, while root worked', text });
  }
}
messages.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
for (const { at, who, text } of messages) {
  const isNotice = who !== 'root' && notice.test(text);
  if (mode === 'index') console.log(`${at}\t${who}\t${text.length}\t${isNotice ? '[harness notice]' : JSON.stringify(text.slice(0, 110))}`);
  else if (isNotice) console.log(`\n===== ${at} ${who} [harness notice, ${text.length} characters, not printed] =====`);
  else console.log(`\n===== ${at} ${who} (${text.length} characters) =====\n${text}`);
}
console.error(`${messages.length} messages`);
