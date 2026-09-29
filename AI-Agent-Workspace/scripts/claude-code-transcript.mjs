#!/usr/bin/env node
/**
 * Rebuilds the chat record of the Claude Code sessions held in this workspace: one markdown file
 * per session, both sides of the conversation in order.
 *
 *   node AI-Agent-Workspace/scripts/claude-code-transcript.mjs [--logs <dir>] [--out <dir>]
 *
 * Claude Code keeps a log of every session outside the repository, one JSON object per line, and
 * deletes it after its retention period. The transcript written here is what stays. It holds the
 * owner's prompts, Claude's messages and one line for the work between; it leaves out commands,
 * tool output, reasoning, subagent reports and compaction summaries. Reasoning blocks are never read.
 *
 * What this script relies on in the log, none of it documented by the vendor:
 *
 * - An entry has a `uuid`. A log that was resumed repeats its entries, so the same `uuid` appears
 *   many times; the copies agree on everything a transcript needs.
 * - Entries are ordered by `timestamp`, not by their place in the file.
 * - A prompt is a `user` entry whose `origin.kind` is `human`. A prompt sent while Claude was
 *   working is an `attachment` of type `queued_command` instead, with the same origin.
 * - Claude's side is `assistant` entries, one content block each; this script reads the `text` and
 *   `tool_use` blocks. An API error, a stop by the model's safeguards among them, is an `assistant`
 *   entry of Claude Code's own, marked `isApiErrorMessage`.
 * - A subagent's report is an entry whose `origin.kind` is `peer`; a wakeup Claude scheduled for
 *   itself is a `user` entry whose `turnOrigin` is `scheduled`.
 *
 * An entry this script does not recognise is reported, never dropped in silence.
 */
import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const INTERRUPTED = /^\[Request interrupted by user/;
const OPENED_FILE = /^<ide_opened_file>The user opened the file (.+?) in the IDE\./;
const SELECTION   = /^<ide_selection>The user selected the lines (\d+) to (\d+) from (.+?):/;
const PASTED      = /(^|\n)([ \t]*>[ \t]*)?\n*<pasted_content id="[^"]*">\n?([\s\S]*?)\n?<\/pasted_content id="[^"]*">/g;
const COMMAND     = /<command-name>(.*?)<\/command-name>[\s\S]*?<command-args>([\s\S]*?)<\/command-args>/;
const STDOUT      = /<local-command-stdout>([\s\S]*?)<\/local-command-stdout>/;

/** How a run of tool calls is counted in a work line: singular, plural. */
const TOOL_WORDS = {
  Bash:           ["shell command",    "shell commands"],
  Read:           ["file read",        "files read"],
  Write:          ["file written",     "files written"],
  Edit:           ["file edit",        "file edits"],
  WebSearch:      ["web search",       "web searches"],
  WebFetch:       ["page fetched",     "pages fetched"],
  Artifact:       ["page published",   "pages published"],
  Skill:          ["skill loaded",     "skills loaded"],
  ScheduleWakeup: ["wakeup scheduled", "wakeups scheduled"],
  Monitor:        ["watch started",    "watches started"],
  ToolSearch:     ["tool lookup",      "tool lookups"],
  ListAgents:     ["subagent listing", "subagent listings"],
};

// ---------------------------------------------------------------------------------------------
// Reading a log
// ---------------------------------------------------------------------------------------------

/**
 * Reads one session log into events in the order they happened, plus what Claude wrote that a
 * transcript does not show (tool descriptions, the files it wrote), kept only so that a quote in a
 * prompt can be traced to where it came from.
 */
async function readLog(logPath) {
  const entries = new Map();
  let line = 0;
  let end  = "";
  for await (const text of createInterface({ input: createReadStream(logPath, "utf8"), crlfDelay: Infinity })) {
    line += 1;
    if (text.length === 0) continue;
    const entry = JSON.parse(text);
    if (!entry.uuid) continue;
    if (entry.timestamp > end) end = entry.timestamp;
    if (isToolResult(entry)) continue;
    const seen = entries.get(entry.uuid);
    entries.set(entry.uuid, { line: seen ? seen.line : line, entry });
  }

  const inFileOrder = [...entries.values()].sort((a, b) => a.line - b.line);
  const events      = [];
  const unseen      = [];
  const unknown     = [];
  const modelNames  = new Map();
  let   command     = null;

  for (const { line: at, entry } of inFileOrder) {
    const time = entry.timestamp;
    const add  = (event) => events.push({ time, at, ...event });

    if (entry.type === "assistant") {
      const model = entry.message.model;
      if (entry.isApiErrorMessage || model === "<synthetic>") {
        add({ kind: "notice", text: textOf(entry.message.content) });
        continue;
      }
      for (const block of entry.message.content ?? []) {
        if (block.type === "text" && block.text.trim()) add({ kind: "say", model, text: block.text });
        if (block.type === "tool_use") {
          const input = block.input ?? {};
          add({ kind: "tool", model, name: block.name, subject: input.description ?? input.to ?? "" });
          if (input.description) unseen.push({ time, what: "description", text: input.description });
          for (const written of [input.content, input.new_string]) {
            if (typeof written === "string" && input.file_path) unseen.push({ time, what: "file", file: inRepo(input.file_path), text: written });
          }
          if (typeof input.command === "string") unseen.push({ time, what: "command", text: input.command });
        }
      }
      continue;
    }

    if (entry.type === "system") {
      if      (entry.subtype === "compact_boundary")          add({ kind: "compaction", ...entry.compactMetadata });
      else if (entry.subtype === "informational")             add({ kind: "notice", text: entry.content });
      else if (entry.subtype === "model_refusal_no_fallback") continue; // the API error beside it says so
      else if (entry.subtype === "local_command" && command)  { command.output = outputOf(entry.content); command = null; }
      else unknown.push(`system entry of subtype ${entry.subtype} at line ${at}`);
      continue;
    }

    if (entry.type === "attachment") {
      const attachment = entry.attachment;
      if (attachment.type === "model" && attachment.identity) {
        modelNames.set(attachment.identity.modelId, attachment.identity.marketingName);
      }
      if (attachment.type !== "queued_command") continue;
      const origin = attachment.origin?.kind;
      if (origin === "human") add({ kind: "prompt", steering: true, ...promptOf(attachment.prompt, unknown) });
      if (origin === "peer")  add({ kind: "report", agent: attachment.origin.from });
      continue;
    }

    if (entry.type !== "user") continue;
    const content = entry.message.content;
    const origin  = entry.origin?.kind;
    const words   = textOf(content);

    if      (origin === "human")               add({ kind: "prompt", steering: false, ...promptOf(content, unknown) });
    else if (origin === "peer")                add({ kind: "report", agent: entry.origin.from });
    else if (origin === "task-notification")   continue;
    else if (entry.isCompactSummary)           continue;
    else if (entry.turnOrigin === "scheduled") add({ kind: "wakeup", text: words });
    else if (INTERRUPTED.test(words))          add({ kind: "interrupt" });
    else if (COMMAND.test(words)) {
      const [, name, args] = COMMAND.exec(words);
      command = { time, at, kind: "command", name, args: args.trim(), output: "" };
      events.push(command);
    }
    else if (STDOUT.test(words)) { if (command) { command.output = outputOf(words); command = null; } }
    else if (entry.isMeta)       continue;
    else unknown.push(`user entry at line ${at}: ${words.slice(0, 80)}`);
  }

  events.sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : a.at - b.at));
  return { events: withoutRepeatedPrompts(events), unseen, unknown, modelNames, end };
}

function isToolResult(entry) {
  const content = entry.type === "user" ? entry.message?.content : null;
  return Array.isArray(content) && content.length > 0 && content.every((block) => block.type === "tool_result");
}

function textOf(content) {
  if (typeof content === "string") return content;
  return (content ?? []).filter((block) => block.type === "text").map((block) => block.text).join("\n\n");
}

function outputOf(text) {
  const found = STDOUT.exec(text ?? "");
  return (found ? found[1] : "").trim();
}

/**
 * Splits a prompt into the owner's words, the pictures pasted with them, and what the editor added.
 * The editor wraps a long paste in a tag the owner never sees; the paste stays and the tag goes, and
 * a paste that follows a bare ">" is the quote that mark opened.
 */
function promptOf(content, unknown) {
  const blocks = typeof content === "string" ? [{ type: "text", text: content }] : (content ?? []);
  const words = [], images = [], editor = [];
  for (const block of blocks) {
    if (block.type === "image") { images.push(block.source); continue; }
    if (block.type !== "text")  continue;
    const opened   = OPENED_FILE.exec(block.text);
    const selected = SELECTION.exec(block.text);
    if      (opened)                        editor.push(`\`${inRepo(opened[1])}\` open in the editor`);
    else if (selected)                      editor.push(`lines ${selected[1]} to ${selected[2]} of \`${inRepo(selected[3])}\` selected in the editor`);
    else if (block.text.startsWith("<ide_")) unknown.push(`editor context not recognised: ${block.text.slice(0, 80)}`);
    else                                    words.push(block.text.replace(PASTED, (whole, start, mark, pasted) => (mark ? `${start}${mark}${pasted}` : `${start}${pasted}`)));
  }
  return { text: words.join("\n\n"), images, editor };
}

/** A prompt that waited in the queue can be logged both as a queued command and as a prompt. */
function withoutRepeatedPrompts(events) {
  const kept = [];
  for (const event of events) {
    const twin = event.kind === "prompt" && kept.find((other) =>
      other.kind === "prompt" && other.text === event.text && Math.abs(Date.parse(other.time) - Date.parse(event.time)) < 60_000);
    if (twin) twin.steering = twin.steering && event.steering;
    else      kept.push(event);
  }
  return kept;
}

/** A path as the repository names it; a file outside the repository keeps its own path. */
function inRepo(file) {
  if (!path.isAbsolute(file))             return file;
  if (file.startsWith(repoRoot + path.sep)) return path.relative(repoRoot, file);
  return file.replace(os.homedir(), "~");
}

// ---------------------------------------------------------------------------------------------
// What the log does not hold
// ---------------------------------------------------------------------------------------------

/** The commits that landed between two moments, from git, by the time each was committed. */
function commitsBetween(start, end) {
  const log = execFileSync("git", ["log", "--abbrev=8", "--format=%h%x09%cI%x09%s"], { cwd: repoRoot, encoding: "utf8" });
  return log.split("\n").filter(Boolean)
    .map((row) => row.split("\t"))
    .map(([hash, committed, subject]) => ({ kind: "commit", time: new Date(committed).toISOString(), at: 0, hash, subject }))
    .filter((commit) => commit.time >= start && commit.time <= end);
}

/** What each subagent of a session was launched to do, from the notes Claude Code keeps beside the log. */
function subagentsOf(logPath) {
  const folder = path.join(logPath.replace(/\.jsonl$/, ""), "subagents");
  const tasks  = new Map();
  if (!existsSync(folder)) return tasks;
  for (const file of readdirSync(folder)) {
    const named = /^agent-(.+)\.meta\.json$/.exec(file);
    if (named) tasks.set(named[1], JSON.parse(readFileSync(path.join(folder, file), "utf8")).description);
  }
  return tasks;
}

/** The captions a person wrote for a session's pictures: lines of the form "- `name.png`: caption". */
function captionsIn(folder) {
  const captions = new Map();
  const readme   = path.join(folder, "README.md");
  if (!existsSync(readme)) return captions;
  for (const row of readFileSync(readme, "utf8").split("\n")) {
    const found = /^- `([^`]+)`: (.+)$/.exec(row);
    if (found) captions.set(found[1], found[2]);
  }
  return captions;
}

// ---------------------------------------------------------------------------------------------
// Quotes
// ---------------------------------------------------------------------------------------------

/** Text as it reads once rendered, so that a quote copied from the screen matches its source. */
function plain(text) {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[`*_#>|~\\]/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** The lines a prompt quotes, each long enough to be told from any other. */
function quotesIn(text) {
  return text.split("\n")
    .map((row) => /^\s*>\s?(.*)$/.exec(row)?.[1] ?? "")
    .filter((quote) => plain(quote).length >= 12);
}

/**
 * For each prompt, finds the quotes that are not from anything this record shows. The editor shows
 * the description of each tool call as well, and the owner quotes those, and quotes the pages
 * Claude wrote; the transcript says where such a quote came from. The editor also shows lines the
 * log holds only as reasoning, which this script does not read, so a quote found nowhere else is
 * said to be from the editor and no more.
 */
function traceQuotes(events, unseen) {
  const readable   = (passage) => ({ ...passage, plain: plain(passage.text) });
  const shown      = events.filter((event) => ["say", "notice"].includes(event.kind)).map(readable);
  const notShown   = unseen.map(readable);
  const unresolved = [];

  for (const prompt of events.filter((event) => event.kind === "prompt")) {
    const origins = new Map();
    for (const quote of quotesIn(prompt.text)) {
      // A page can put a label before its words, so the end of a quote is tried as well as its start.
      const ends  = [plain(quote).slice(0, 80), plain(quote).slice(-60)];
      const holds = (passage) => passage.time <= prompt.time && ends.some((end) => passage.plain.includes(end));
      if (shown.some(holds)) continue;

      const origin = ["description", "file", "command"]
        .map((what) => notShown.findLast((passage) => passage.what === what && holds(passage)))
        .find(Boolean);
      const when  = origin && under(prompt.time, origin.time);
      if (!origin) {
        unresolved.push({ time: prompt.time, quote });
        origins.set("editor", "words the editor showed while Claude worked, which this record does not keep");
      }
      else if (origin.what === "description") origins.set(origin.text, `the description of a tool call Claude made at ${when} UTC, which the editor shows and this record leaves out: "${origin.text}"`);
      else if (origin.what === "file")        origins.set(origin.file, `\`${origin.file}\`, which Claude wrote at ${when} UTC`);
      else                                    origins.set(origin.text, `a command Claude ran at ${when} UTC, which the editor shows and this record leaves out`);
    }
    prompt.origins = [...origins.values()];
  }
  return unresolved;
}

// ---------------------------------------------------------------------------------------------
// Writing a transcript
// ---------------------------------------------------------------------------------------------

const day   = (time) => time.slice(0, 10);
const clock = (time) => time.slice(11, 16);
const stamp = (time) => `${day(time)} ${clock(time)} UTC`;

/** A time as it reads under a heading that already gave the date. */
const under = (heading, time) => (day(time) === day(heading) ? clock(time) : `${day(time)} ${clock(time)}`);

function count(n, [one, many]) {
  return `${n} ${n === 1 ? one : many}`;
}

function listed(items) {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/** Claude's words with their headings two levels deeper and their links resolving from the transcript. */
function settled(text, toRoot) {
  let fenced = false;
  return text.split("\n").map((row) => {
    if (/^\s*(```|~~~)/.test(row)) { fenced = !fenced; return row; }
    if (fenced) return row;
    const deeper = row.replace(/^(#{1,6})(?=\s)/, (marks) => "#".repeat(Math.min(6, marks.length + 2)));
    return deeper.split(/(`+[^`]*`+)/).map((part, i) => (i % 2 === 1 ? part : relinked(part, toRoot))).join("");
  }).join("\n");
}

function relinked(text, toRoot) {
  return text.replace(/\]\((<?)([^)\s>]+)(>?)([^)]*)\)/g, (whole, open, target, close, rest) => {
    if (/^([a-z][a-z0-9+.-]*:|#|\.\.?\/)/i.test(target)) return whole;
    const local = path.isAbsolute(target) ? (target.startsWith(repoRoot) ? path.relative(repoRoot, target) : null) : target;
    return local === null ? whole : `](${open}${toRoot}/${local}${close}${rest})`;
  });
}

function render(session, transcriptPath) {
  const { events, modelNames, tasks, captions, imageFolder } = session;
  const toRoot   = path.relative(path.dirname(transcriptPath), repoRoot).split(path.sep).join("/");
  const toImages = path.basename(imageFolder);
  const modelOf  = (id) => modelNames.get(id) ?? id;
  const taskOf   = (id) => (tasks.has(id) ? `"${tasks.get(id)}"` : "a subagent");

  const out    = [];
  const images = [];
  let heading  = session.start;
  let speaker  = null;
  let model    = null;
  let work     = [];

  const put = (...blocks) => out.push(...blocks.flatMap((block) => [block, ""]));

  const workLine = () => {
    if (work.length === 0) return;
    const tools   = new Map();
    const launched = [], messaged = [], reported = [], committed = [];
    for (const item of work) {
      if      (item.kind === "report")      reported.push(taskOf(item.agent));
      else if (item.kind === "commit")      committed.push(`${item.hash} "${item.subject}"`);
      else if (item.name === "Agent")       launched.push(`"${item.subject}"`);
      else if (item.name === "SendMessage") messaged.push(taskOf(item.subject));
      else                                  tools.set(item.name, (tools.get(item.name) ?? 0) + 1);
    }
    const counted = [...tools].map(([name, n]) => (TOOL_WORDS[name] ? count(n, TOOL_WORDS[name]) : `${n} × ${name}`));
    const parts   = [];
    if (counted.length)   parts.push(counted.join(", "));
    if (launched.length)  parts.push(`launched ${launched.length === 1 ? "subagent" : "subagents"} ${listed(launched)}`);
    if (messaged.length)  parts.push(`wrote to ${listed([...new Set(messaged)])}`);
    if (reported.length)  parts.push(`received the ${reported.length === 1 ? "report" : "reports"} of ${listed(reported)}`);
    if (committed.length) parts.push(`committed ${listed(committed)}`);

    const from = under(heading, work[0].time), to = under(heading, work.at(-1).time);
    put(`_Work, ${from === to ? from : `${from} to ${to}`} UTC: ${parts.join("; ")}._`);
    work = [];
  };

  const claude = (event) => {
    if (speaker === "claude" && (!event.model || event.model === model)) return;
    workLine();
    model   = event.model ?? model;
    heading = event.time;
    speaker = "claude";
    put(`## Claude${model ? ` (${modelOf(model)})` : ""} · ${stamp(event.time)}`);
  };

  const aside = (event, text) => {
    workLine();
    speaker = null;
    put(`_${stamp(event.time)}: ${text}_`);
  };

  events.forEach((event, i) => {
    const previous = events[i - 1];
    switch (event.kind) {
      case "prompt": {
        workLine();
        const how = event.steering ? " · sent while Claude was working"
                  : previous?.kind === "interrupt" ? " · sent after interrupting Claude"
                  : "";
        heading = event.time;
        speaker = "owner";
        put(`## Owner · ${stamp(event.time)}${how}`);
        if (event.editor.length) put(`_With ${listed(event.editor)}._`);
        for (const origin of event.origins) put(`_Quoted below: ${origin}_`);
        event.images.forEach((source, n) => {
          const name = `${day(event.time)}-${clock(event.time).replace(":", "")}-${n + 1}.${source.media_type.split("/")[1]}`;
          images.push({ name, data: Buffer.from(source.data, "base64") });
          put(`![${captions.get(name) ?? `Picture ${n + 1} pasted with this prompt`}](${toImages}/${name})`);
        });
        put(event.text);
        break;
      }
      case "say":
        claude(event);
        workLine();
        put(settled(event.text, toRoot));
        break;
      case "tool":
      case "report":
        claude(event);
        work.push(event);
        break;
      case "commit":
        if (speaker === "claude") work.push(event);
        else                      aside(event, `commit ${event.hash} landed, "${event.subject}".`);
        break;
      case "interrupt":
        aside(event, "the owner interrupted Claude.");
        break;
      case "notice":
        aside(event, "Claude Code said:");
        put(event.text.trim().split("\n").map((row) => `> ${row}`.trimEnd()).join("\n"));
        break;
      case "wakeup":
        aside(event, `a wakeup Claude had scheduled fired, with the note it had left itself: "${event.text}"`);
        break;
      case "command": {
        const next = events.slice(i + 1).find((later) => later.kind === "compaction" || later.kind === "prompt");
        if (event.name === "/compact" && next?.kind === "compaction") break;
        const ran = `the owner ran \`${[event.name, event.args].filter(Boolean).join(" ")}\``;
        aside(event, event.output ? `${ran}, which answered "${event.output}"` : `${ran}.`);
        break;
      }
      case "compaction": {
        const who = event.trigger === "manual" ? "the owner ran `/compact`" : "Claude Code compacted the context on its own";
        aside(event, `${who}. ${Number(event.preTokens).toLocaleString("en-US")} tokens of context became a summary, and Claude's working memory starts over here.`);
        break;
      }
    }
  });
  workLine();

  return { markdown: [...preamble(session, transcriptPath, modelOf), ...out].join("\n").trimEnd() + "\n", images };
}

/** The start of a transcript's first line, which names the session by the minute it began. */
const title = (start) => `# Claude Code session, ${stamp(start).replace(" UTC", "")} to `;

function preamble(session, transcriptPath, modelOf) {
  const { events } = session;
  const of      = (kind) => events.filter((event) => event.kind === kind);
  const prompts = of("prompt");
  const models  = [];
  for (const event of events) {
    if (event.model && event.model !== models.at(-1)?.id) models.push({ id: event.model, since: event.time });
  }
  const script   = path.relative(path.dirname(transcriptPath), fileURLToPath(import.meta.url)).split(path.sep).join("/");
  const steering = prompts.filter((prompt) => prompt.steering).length;
  const launched = of("tool").filter((tool) => tool.name === "Agent").length;

  return [
    `${title(session.start)}${under(session.start, session.end)} UTC`,
    "",
    `_Both sides of the session in order, rebuilt from Claude Code's session log by [${path.basename(script)}](${script}). The owner's prompts are verbatim; a line starting with \`>\` in one is the owner quoting Claude. Claude's messages are verbatim except in two places: their headings sit two levels deeper, so that the speakers stay the outline, and their links to files in the repository are rewritten to resolve from this folder. The work between is one line in italics: tool calls counted, subagents and commits named. What Claude Code itself said, an error or a notice, is quoted under an italic line. Commands, tool output, reasoning, the progress lines the editor showed while Claude worked, subagent reports and compaction summaries are not kept._`,
    "",
    `- Model: ${models.map((used, i) => (i === 0 ? modelOf(used.id) : `${modelOf(used.id)} from ${stamp(used.since)}`)).join(", ")}.`,
    `- The owner: ${count(prompts.length - steering, ["prompt", "prompts"])}, and ${count(steering, ["message", "messages"])} sent while Claude was working.`,
    `- Claude: ${count(of("say").length, ["message", "messages"])}, ${count(of("tool").length, ["tool call", "tool calls"])}, ${count(launched, ["subagent", "subagents"])} launched.`,
    `- The repository: ${count(of("commit").length, ["commit", "commits"])}. The context: compacted ${count(of("compaction").length, ["time", "times"])}.`,
    "",
  ];
}

// ---------------------------------------------------------------------------------------------
// Every session in the log folder
// ---------------------------------------------------------------------------------------------

/**
 * The number of a session's transcript among those of its day. A session keeps the number its
 * transcript already has and a new one takes the next free, so that no transcript is written over
 * by another session's once Claude Code has deleted an earlier log of the same day.
 */
function numberOf(folder, start) {
  const named   = new RegExp(`^${day(start)}\\.(\\d+)\\.md$`);
  let   highest = 0;
  for (const name of existsSync(folder) ? readdirSync(folder) : []) {
    const found = named.exec(name);
    if (!found) continue;
    if (readFileSync(path.join(folder, name), "utf8").startsWith(title(start))) return Number(found[1]);
    highest = Math.max(highest, Number(found[1]));
  }
  return highest + 1;
}

function option(name, fallback) {
  const at = process.argv.indexOf(name);
  return at === -1 ? fallback : path.resolve(process.argv[at + 1]);
}

async function main() {
  const logs = option("--logs", path.join(os.homedir(), ".claude", "projects", repoRoot.replace(/[^A-Za-z0-9]/g, "-")));
  const out  = option("--out",  path.join(repoRoot, "AI-Agent-Workspace", "ChatHistory"));

  const sessions = [];
  for (const file of readdirSync(logs).filter((name) => name.endsWith(".jsonl"))) {
    const logPath = path.join(logs, file);
    const session = await readLog(logPath);
    if (!session.events.some((event) => event.kind === "prompt")) continue;
    session.start = session.events[0].time;
    session.tasks = subagentsOf(logPath);
    session.file  = file;
    sessions.push(session);
  }
  sessions.sort((a, b) => (a.start < b.start ? -1 : 1));

  for (const session of sessions) {
    const date           = day(session.start);
    const folder         = path.join(out, date.slice(0, 4), date.slice(5, 7));
    const number         = numberOf(folder, session.start);
    const transcriptPath = path.join(folder, `${date}.${number}.md`);
    session.imageFolder  = path.join(folder, `${date}.${number}.images`);
    session.captions     = captionsIn(session.imageFolder);
    session.events       = [...session.events, ...commitsBetween(session.start, session.end)]
      .sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : a.at - b.at));

    const unresolved           = traceQuotes(session.events, session.unseen);
    const { markdown, images } = render(session, transcriptPath);

    mkdirSync(folder, { recursive: true });
    writeFileSync(transcriptPath, markdown);
    if (images.length) mkdirSync(session.imageFolder, { recursive: true });
    for (const image of images) writeFileSync(path.join(session.imageFolder, image.name), image.data);

    const said = session.events.filter((event) => event.kind === "say").length;
    console.log(`${path.relative(repoRoot, transcriptPath)}: ${count(said, ["message", "messages"])} of Claude's, ${count(images.length, ["picture", "pictures"])}, from ${session.file}`);
    for (const image of images.filter((each) => !session.captions.has(each.name))) {
      console.log(`  no caption for ${image.name} in ${path.relative(repoRoot, session.imageFolder)}/README.md`);
    }
    for (const entry of session.unknown) console.log(`  not recognised: ${entry}`);
    for (const { time, quote } of unresolved) console.log(`  quote not found in the log, ${stamp(time)}: ${quote.slice(0, 100)}`);
  }
}

await main();
