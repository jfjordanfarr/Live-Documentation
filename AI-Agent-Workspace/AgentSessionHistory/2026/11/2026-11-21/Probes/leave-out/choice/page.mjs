// The trial page's script: give it a folder (pick, drop, or a folder input), and see what a scan would read and what
// it would leave out, by the line of one list the person sees and edits: the list is the truth, every act on the
// preview is an edit of it, ignore files found in the folder are offered to use, add or ignore, and starting lists are
// prefills the person chooses. Everything stays on the machine: the page reads names, and the text of ignore files, and
// nothing else. A trial, not the product: `Probes/leave-out/README.md`, the eighth leg.
import { hasReader } from "../../../../../../../../packages/engine/src/config/liveDocumentationConfig";
import { fromGitignores, fromTfignores, leaveOut, proposeLines } from "../../../../../../../../packages/engine/src/tooling/leaveOut";
import VISUAL_STUDIO from "../starting-lists/VisualStudio-ignore.txt";
import { byKind, filePattern, folderPattern, listingOf, OWN_OUTPUT, totals, walk } from "./model.mjs";

const $ = (selector) => document.querySelector(selector);
const element = (tag, attributes = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (name === "text") node.textContent = value;
    else if (value !== undefined && value !== false) node.setAttribute(name, value === true ? "" : value);
  }
  for (const child of children) if (child !== undefined && child !== null) node.append(child);
  return node;
};
const count = (n, one, many = `${one}s`) => `${n.toLocaleString("en")} ${n === 1 ? one : many}`;

// The list and its case setting, as the page remembers them for the next folder where it can.
const remembered = (() => {
  try {
    return { list: localStorage.getItem("leave-out-list") ?? "", ignoreCase: localStorage.getItem("leave-out-ignore-case") ?? undefined };
  } catch {
    return { list: "", ignoreCase: undefined };
  }
})();
const state = {
  source: null, result: null, list: remembered.list, ignoreCase: remembered.ignoreCase === undefined ? true : remembered.ignoreCase === "true",
  rememberedCase: remembered.ignoreCase, opened: new Set(), shown: new Map(), foundAnswered: undefined, foundSaid: undefined, leftAside: new Set(),
  // The list's earlier texts and those undone, for undo and redo; the list as it stood before a choice on the notice;
  // whether the starting lists' offers, once shown for this folder, are kept in place.
  history: [], future: [], beforeFound: undefined, offersKept: false,
  // How many decisions were begun, so that an answer for a list since changed is dropped; whether the field is to be
  // written from the list at the next drawing (only after a change the page made).
  decisions: 0, writeField: true
};

// ---------------------------------------------------------------------------
// Sources: a directory handle, walked lazily; or the files of a folder input, listed by the browser beforehand
// ---------------------------------------------------------------------------

function handleSource(root) {
  const folders = new Map([["", root]]);
  const folderOf = (path) => (path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "");
  return {
    lazy: true,
    label: root.name,
    async list(path) {
      const dir = folders.get(path);
      const entries = [];
      for await (const [name, handle] of dir.entries()) {
        if (handle.kind === "directory") folders.set(path ? `${path}/${name}` : name, handle);
        entries.push({ name, kind: handle.kind === "directory" ? "folder" : "file" });
      }
      return entries;
    },
    async text(path) {
      try {
        const parts = path.split("/");
        let dir = folders.get(folderOf(path));
        if (!dir) {
          dir = root;
          for (const part of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(part);
        }
        return await (await (await dir.getFileHandle(parts.at(-1))).getFile()).text();
      } catch {
        return undefined;
      }
    }
  };
}

function filesSource(fileList) {
  const children = new Map([["", new Map()]]);
  const files = new Map();
  let label = "";
  for (const file of fileList) {
    const parts = file.webkitRelativePath.split("/");
    label = parts[0];
    const path = parts.slice(1).join("/");
    files.set(path, file);
    let folder = "";
    for (const [index, part] of parts.slice(1).entries()) {
      const isFile = index === parts.length - 2;
      const at = folder ? `${folder}/${part}` : part;
      if (!children.has(folder)) children.set(folder, new Map());
      children.get(folder).set(part, isFile ? "file" : "folder");
      if (!isFile && !children.has(at)) children.set(at, new Map());
      folder = at;
    }
  }
  const names = (folder) => [...(children.get(folder) ?? new Map())].map(([name, kind]) => (kind === "folder" ? `${name}/` : name));
  return {
    lazy: false,
    label,
    allFiles: [...files.keys()],
    folders: [...children.keys()].filter((folder) => folder !== ""),
    names,
    async list(path) {
      return [...(children.get(path) ?? new Map())].map(([name, kind]) => ({ name, kind }));
    },
    async text(path) {
      return files.get(path)?.text();
    }
  };
}

// ---------------------------------------------------------------------------
// Walking and drawing
// ---------------------------------------------------------------------------

/**
 * Decides the list as it stands and draws the answer. A decision is numbered: an answer decided for a list that has
 * since changed (more typing taken in, an undo, a choice) is dropped, and only the newest is drawn.
 */
async function decideAgain() {
  if (!state.source) return;
  const progress = $("#progress");
  const decision = ++state.decisions;
  // The walk hands the thread back as it goes, so that this word shows while it decides.
  progress.textContent = state.result ? "Deciding…" : "Listing…";
  const started = performance.now();
  const result = await walk(state.source, { list: state.list, ignoreCase: state.ignoreCase }, (folders) => {
    if (!state.result) progress.textContent = `${count(folders, "folder")} listed`;
  });
  if (decision !== state.decisions) return;
  state.result = result;
  state.result.shownAfterMs = performance.now() - started;
  progress.textContent = "";
  draw();
}

function draw() {
  const result = state.result;
  $("#choice").hidden = !result;
  if (!result) return;
  const t = totals(result);
  // Beside the totals, how many of the files left out look like the folder's own code: files a reader would read that
  // lie outside every folder the evidence calls build output or downloaded packages, the sum of the rows' signs. Where
  // the eye already is, so that an edit that raises it is seen (strangers typed `packages/` and missed the 11 `.cs`
  // files of `Installer/Packages` it took, behind 457 downloaded ones that are rightly left out).
  const code = result.lines.reduce((sum, group) => sum + group.restCode, 0);
  // Said inside the files left out, joined to them by "of which", so that it cannot be read as a part of the files read
  // (three strangers of twelve read "· 865 of them are code" so).
  const leftOut = t.leftOutFiles ? element("span", {}, `${count(t.leftOutFiles, "file")} left out`,
    code ? element("span", { class: "totals-code" }, ", ", codeSign(code), element("span", { text: " of which look like your own code" })) : "") : "";
  $("#totals").replaceChildren(`${count(t.read, "file")} will be read`, leftOut ? " · " : "", leftOut,
    state.source.lazy && t.notLookedInside ? ` · ${count(t.notLookedInside, "folder")} left out, not looked inside` : "");
  $("#undo").disabled = state.history.length === 0;
  $("#scan-result").textContent = "";
  // The field is written only when the page itself changed the list (an offer, a choice, a plus or minus, undo, a
  // file loaded): while a person types, the field is the truth for the text, and the page never writes into it or
  // moves its caret.
  if (state.writeField) {
    state.writeField = false;
    if ($("#list").value !== state.list) $("#list").value = state.list;
  }
  // Each part's drawing timed, so that a slow one can be named (`state.drawTimes`).
  const times = {};
  const timed = (name, part) => {
    const started = performance.now();
    part();
    times[name] = Math.round(performance.now() - started);
  };
  timed("gutter", drawGutter);
  $("#ignore-case").checked = state.ignoreCase;
  timed("found", () => drawFound(result));
  timed("offers", drawOffers);
  timed("notes", () => drawNotes(result));
  timed("leftOut", () => drawByBlock(result));
  timed("read", () => drawRead(result));
  state.drawTimes = times;
  const time = result.timings;
  $("#timings").textContent = `${state.source.lazy ? "walked lazily" : "listed by the browser first"} · ${count(time.listings, "folder listing")} · listing ${Math.round(time.listMs)} ms · deciding ${Math.round(time.decideMs)} ms · in all ${Math.round(time.totalMs)} ms`;
  if (state.editedAt !== undefined) {
    state.lastEditShownMs = Math.round(performance.now() - state.editedAt);
    state.editedAt = undefined;
  }
}

// ---------------------------------------------------------------------------
// The list: the one truth, edited as text or by any act on the preview, in blocks each led by a `###` heading
// ---------------------------------------------------------------------------

/** The lines that act: neither blank nor a comment. */
const acting = (text) => text.split("\n").filter((line) => line.trim() !== "" && !line.trim().startsWith("#")).length;

function remember() {
  try {
    localStorage.setItem("leave-out-list", state.list);
    localStorage.setItem("leave-out-ignore-case", String(state.ignoreCase));
  } catch {
    // A page that cannot keep anything still works; the list is only not remembered.
  }
}

/**
 * Every change to the list, the page's own (a choice on the notice, a starting list, a plus, a minus, Empty) and the
 * person's typing alike, keeps what it replaced, so that it can be taken back: Control+Z in the list, or the undo tool.
 * Designers call this forgiveness: an action with a way back needs no warning. Typing is kept as one change per pause.
 * What is kept is the list and the notice together, so that a choice taken back takes its notice back with it.
 * `fromField` says the text came from the person's typing, which the page then never writes back into the field;
 * `notice` is the notice as it stood before a choice that changes it.
 */
function setList(text, { fromField = false, notice = noticeNow() } = {}) {
  if (text !== state.list) {
    state.history.push({ list: state.list, notice });
    state.future = [];
  }
  state.list = text;
  if (!fromField) state.writeField = true;
  remember();
  void decideAgain();
}

/** The notice's own state: which choice was taken, and the list as it stood before it. */
const noticeNow = () => ({ answered: state.foundAnswered, before: state.beforeFound });

/** Typing not yet taken into the list (the 400 ms pause has not passed) is taken in first, so that a change begins there. */
function takeTyping() {
  clearTimeout(typing);
  if ($("#list").value !== state.list) setList($("#list").value, { fromField: true });
}

/** One step back, or forward: the list and the notice as they stood together. */
function step(from, to) {
  takeTyping();
  if (from.length === 0) return;
  to.push({ list: state.list, notice: noticeNow() });
  const back = from.pop();
  state.list = back.list;
  state.foundAnswered = back.notice.answered;
  state.beforeFound = back.notice.before;
  state.writeField = true;
  remember();
  void decideAgain();
}
const undo = () => step(state.history, state.future);
const redo = () => step(state.future, state.history);

/** A block added at the end of the list, led by its heading. */
function addBlock(heading, lines) {
  takeTyping();
  const body = state.list.replace(/\s+$/u, "");
  setList(`${body}${body ? "\n\n" : ""}### ${heading}\n${lines.join("\n")}\n`);
}

/** The person's own lines, added to their block "Yours" at the end, which is begun if the list does not end in it. */
function addYours(lines, comment) {
  takeTyping();
  const body = state.list.replace(/\s+$/u, "");
  const headings = body.split("\n").filter((line) => line.startsWith("### "));
  const inYours = headings.length > 0 && headings.at(-1) === "### Yours";
  setList(`${body}${body ? "\n" : ""}${inYours ? "" : `${body ? "\n" : ""}### Yours\n`}${comment ? `# ${comment}\n` : ""}${lines.join("\n")}\n`);
}

/** Lines taken out of the list, by their numbers from 1, first to last inclusive. */
function removeLines(first, last = first) {
  takeTyping();
  const lines = state.list.split("\n");
  lines.splice(first - 1, last - first + 1);
  setList(lines.join("\n"));
}

/** The list's blocks: each from a `###` heading to the line before the next; the lines above the first are a block too. */
function blocksOf(text) {
  const lines = text.split("\n");
  const blocks = [];
  lines.forEach((line, index) => {
    if (line.startsWith("### ") || blocks.length === 0) blocks.push({ title: line.startsWith("### ") ? line.slice(4).trim() : "", first: index + 1, last: index + 1 });
    else blocks.at(-1).last = index + 1;
  });
  return blocks;
}

/** The numbers beside the field's lines, as the field stands, so that a row's line number can be found in the text. */
function drawGutter() {
  const n = $("#list").value.split("\n").length;
  if ($("#gutter").dataset.lines !== String(n)) {
    $("#gutter").textContent = Array.from({ length: n }, (_, index) => index + 1).join("\n");
    $("#gutter").dataset.lines = String(n);
  }
  $("#gutter").scrollTop = $("#list").scrollTop;
}

let typing;
$("#list").addEventListener("input", () => {
  // When an edit was made, so that the time until its answer is drawn can be told (`state.lastEditShownMs`).
  state.editedAt = performance.now();
  drawGutter();
  clearTimeout(typing);
  $("#progress").textContent = "…";
  // The text is read from the field when the pause ends, not when the key was pressed.
  typing = setTimeout(() => setList($("#list").value, { fromField: true }), 400);
});
$("#list").addEventListener("scroll", () => {
  $("#gutter").scrollTop = $("#list").scrollTop;
});
// Control+Z and Control+Y (or Control+Shift+Z) in the list take a change back and forward, the page's changes included.
$("#list").addEventListener("keydown", (event) => {
  if (!(event.ctrlKey || event.metaKey)) return;
  const key = event.key.toLowerCase();
  if (key === "z" && !event.shiftKey) undo();
  else if (key === "y" || (key === "z" && event.shiftKey)) redo();
  else return;
  event.preventDefault();
});
$("#undo").addEventListener("click", undo);
$("#ignore-case").addEventListener("change", (event) => {
  state.ignoreCase = event.target.checked;
  remember();
  state.offers = undefined;
  void decideAgain();
});
$("#clear").addEventListener("click", () => setList(""));
$("#copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(state.list);
    $("#list-said").textContent = "Copied";
  } catch {
    $("#list").select();
    $("#list-said").textContent = "Selected: copy with Ctrl+C";
  }
});
$("#save").addEventListener("click", () => {
  // The file is made here and saved by the browser; nothing leaves the machine.
  const link = element("a", { href: URL.createObjectURL(new Blob([state.list], { type: "text/plain" })), download: "leave-out.gitignore" });
  link.click();
  URL.revokeObjectURL(link.href);
});
$("#load").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (file) setList(await file.text());
  event.target.value = "";
});
$("#prefill").addEventListener("click", () => {
  const menu = $("#prefill-menu");
  menu.hidden = !menu.hidden;
  $("#prefill").setAttribute("aria-expanded", String(!menu.hidden));
});

// ---------------------------------------------------------------------------
// Starting lists: offers, each with what it would do on this folder before it is pressed
// ---------------------------------------------------------------------------

// The headings the page writes into the list: short, since each is a row's title in "Left out".
const VISUAL_STUDIO_HEADING = "Visual Studio's list (GitHub, CC0)";
const listingNow = () => (state.source.lazy ? listingOf(state.source) : { folders: state.source.folders, names: state.source.names });

function proposedBlock() {
  const listing = listingNow();
  const proposed = proposeLines(listing.folders, listing.names, state.ignoreCase);
  const lines = [];
  for (const rule of [...new Set(proposed.map((each) => each.rule))]) lines.push(`# ${rule}`, ...proposed.filter((each) => each.rule === rule).map((each) => each.line));
  return { lines, count: proposed.length };
}
const visualStudioLines = () => VISUAL_STUDIO.replace(/\s+$/u, "").split(/\r?\n/u);

/** How many files a list would leave out of what the page has listed: the same function, asked of every file known. */
function wouldLeaveOut(text) {
  const decide = leaveOut({ list: text, ignoreCase: state.ignoreCase, ownOutput: [OWN_OUTPUT] });
  const files = state.source.lazy ? [...state.source.listed].flatMap(([folder, entries]) => entries.filter((entry) => entry.kind === "file").map((entry) => (folder ? `${folder}/${entry.name}` : entry.name))) : state.source.allFiles;
  let n = 0;
  for (const file of files) {
    const verdict = decide.file(file);
    if (!verdict.kept && !verdict.fixed) n += 1;
  }
  return n;
}

function offer(kind) {
  $("#prefill-menu").hidden = true;
  $("#prefill").setAttribute("aria-expanded", "false");
  if (kind === "visual-studio") addBlock(VISUAL_STUDIO_HEADING, visualStudioLines());
  else {
    addBlock("What the folders hold", proposedBlock().lines);
  }
}
document.querySelectorAll("[data-prefill]").forEach((button) => button.addEventListener("click", () => offer(button.dataset.prefill)));

/**
 * Nothing a person may be about to press moves or goes away as a side effect of a press on something else. Once the
 * offers have been shown for a folder they stay where they are, whatever the list then holds: an offer whose block is
 * in the list reads "In your list" and cannot be pressed (it can again once that block is gone, by undo or by hand),
 * the other stays pressable. They go only when the person puts them away with their own button, or gives another folder.
 */
const OFFERED_HEADINGS = { "what-it-holds": "What the folders hold", "visual-studio": VISUAL_STUDIO_HEADING };
const inList = (kind) => state.list.split("\n").some((line) => line.trim() === `### ${OFFERED_HEADINGS[kind]}`);

/** In the list's empty place, the starting lists as offers, each saying what it would do here; kept once shown. */
function drawOffers() {
  const empty = acting(state.list) === 0;
  if (empty) state.offersKept = true;
  $("#offers").hidden = !state.offersKept;
  if ($("#offers").hidden) return;
  if (!state.offers) {
    $("#offers").replaceChildren(element("p", { class: "quiet", text: "Counting what each starting list would leave out here…" }));
    // Counted after the page has drawn, the thread handed back first.
    setTimeout(() => {
      const proposed = proposedBlock();
      state.offers = {
        proposed: { lines: proposed.count, files: wouldLeaveOut(proposed.lines.join("\n")) },
        visualStudio: { lines: acting(VISUAL_STUDIO), files: wouldLeaveOut(VISUAL_STUDIO) }
      };
      drawOffers();
    }, 0);
    return;
  }
  const card = (kind, title, said) => {
    const taken = inList(kind);
    const button = element("button", { type: "button", class: `offer${taken ? " taken" : ""}`, "data-offer": kind, disabled: taken },
      icon(taken ? "tick" : "prefill"), element("span", {}, element("strong", { text: title }), element("span", { class: "quiet", text: taken ? "In your list" : said })));
    button.addEventListener("click", () => offer(kind));
    return button;
  };
  const away = element("button", { type: "button", class: "icon-button tip offers-away", "aria-label": "Put the starting lists away", "data-tip": "Put the starting lists away" }, icon("remove"));
  away.addEventListener("click", () => {
    state.offersKept = false;
    drawOffers();
  });
  $("#offers").replaceChildren(
    element("div", { class: "offers-head" }, element("p", { class: "quiet", text: empty ? "Your list is empty: nothing is left out. Start from" : "Starting lists" }), empty ? "" : away),
    card("what-it-holds", "What these folders hold", `${count(state.offers.proposed.lines, "line")} · ${count(state.offers.proposed.files, "file")} left out`),
    card("visual-studio", "GitHub's Visual Studio list", `${count(state.offers.visualStudio.lines, "line")} · ${count(state.offers.visualStudio.files, "file")} left out`),
    element("p", { class: "quiet", text: "or write lines below, as in a .gitignore." }));
}
// ---------------------------------------------------------------------------
// Ignore files found: one notice, three choices for all, a choice per file for whoever opens it
// ---------------------------------------------------------------------------

/**
 * The choices on the notice, said as what each does to the list, in the owner's verbs (use: replace; integrate: add;
 * ignore: no change). While the list is empty, replacing and adding are one act, so there are two choices. After a
 * choice the others stay, worked from the list as it stood before it: a person who took the wrong one takes the other.
 */
function choicesNow() {
  const before = state.foundAnswered === undefined ? state.list : state.beforeFound;
  const held = acting(before);
  if (held === 0) {
    return state.foundAnswered === undefined
      ? [["use", "Take them in", "Your list is empty: their lines become your list"], ["ignore", "Ignore them", "Leave your list as it is"]]
      : [["ignore", "Take them out again", "Your list goes back to empty"]];
  }
  const all = [
    ["use", `Replace your list (removes ${count(held, "line")})`, `Their lines in place of your ${count(held, "line")}`],
    ["add", "Add them to your list", `Their lines after your ${count(held, "line")}`],
    ["ignore", state.foundAnswered === undefined ? "Leave your list alone" : "Put your list back", "Your list as it was"]
  ];
  return all.filter(([take]) => take !== state.foundAnswered);
}

function drawFound(result) {
  const box = $("#found");
  if (result.found.length === 0) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  // A choice taken back (by undo, or by hand) leaves the notice as it was before it: it says what the list now is.
  if (state.foundAnswered !== undefined && state.list === state.beforeFound) state.foundAnswered = undefined;
  const kinds = [".gitignore", ".tfignore"].map((kind) => [kind, result.found.filter((file) => file.kind === kind).length]).filter(([, n]) => n > 0);
  const where = new Set(result.found.map((file) => (file.path.includes("/") ? file.path.slice(0, file.path.indexOf("/")) : "the top"))).size;
  const files = kinds.map(([kind, n]) => count(n, `${kind} file`)).join(" and ");
  const done = { use: `Your list is now their lines: ${files}`, add: `Added to your list: ${files}`, ignore: `Not taken in: ${files}` }[state.foundAnswered];
  $("#found-what").textContent = done ?? `Found ${files}, in ${count(where, "top folder")}`;
  $("#found-choices").replaceChildren(...choicesNow().map(([take, label, tip]) => {
    const button = element("button", { type: "button", class: "tip", "data-take": take, "data-tip": tip }, label);
    button.addEventListener("click", () => take === "ignore" ? leaveFound() : takeFound(take));
    return button;
  }));
  const open = $("#found-open").getAttribute("aria-expanded") === "true";
  $("#found-open").replaceChildren(icon(open ? "open" : "closed"));
  $("#found-files").hidden = !open;
  $("#found-files").replaceChildren(...result.found.map((file) => {
    const box = element("input", { type: "checkbox", "aria-label": `Take ${file.path}` });
    box.checked = !state.leftAside.has(file.path);
    box.disabled = Boolean(state.foundAnswered);
    box.addEventListener("change", () => {
      if (box.checked) state.leftAside.delete(file.path);
      else state.leftAside.add(file.path);
    });
    const lines = file.text.split(/\r?\n/u).filter((line) => line.trim() && !line.trim().startsWith("#")).length;
    return element("li", {}, box, element("code", { text: file.path }), element("span", { class: "quiet", text: count(lines, "line") }));
  }));
  $("#found-said").hidden = !state.foundSaid;
  $("#found-said").textContent = state.foundSaid ?? "";
}

$("#found-open").addEventListener("click", () => {
  const open = $("#found-open").getAttribute("aria-expanded") === "true";
  $("#found-open").setAttribute("aria-expanded", String(!open));
  $("#found-open").setAttribute("aria-label", open ? "Show the files found" : "Hide the files found");
  drawFound(state.result);
});
/** The notice folded back to its one line, the choice remembered and the list as it stood before kept. */
function answerFound(take) {
  if (state.foundAnswered === undefined) state.beforeFound = state.list;
  state.foundAnswered = take;
  $("#found-open").setAttribute("aria-expanded", "false");
  $("#found-open").setAttribute("aria-label", "Show the files found");
}

/** Ignore: the list as it stood before any choice; before one, nothing changes. */
function leaveFound() {
  takeTyping();
  const notice = noticeNow();
  const before = state.foundAnswered === undefined ? undefined : state.beforeFound;
  answerFound("ignore");
  if (before !== undefined && before !== state.list) setList(before, { notice });
  else draw();
}

function takeFound(take) {
  takeTyping();
  // The notice as it stood before this choice, kept with the list it replaces, so that undo takes both back.
  const notice = noticeNow();
  answerFound(take);
  const chosen = state.result.found.filter((file) => !state.leftAside.has(file.path));
  const git = fromGitignores(chosen.filter((file) => file.kind === ".gitignore"), { folders: listingNow().folders, ignoreCase: state.ignoreCase });
  const tf = fromTfignores(chosen.filter((file) => file.kind === ".tfignore"));
  const said = [...git.differences, ...tf.differences];
  if (tf.lines.length > 0 && !state.ignoreCase) {
    state.ignoreCase = true;
    said.unshift("A .tfignore matches names without case, so your list now does too.");
  }
  state.foundSaid = said.length ? said.join(" ") : undefined;
  const heading = "The folder's own ignore files";
  const lines = [...git.lines, ...tf.lines];
  // Each choice is worked from the list as it stood before the first, so that one choice can be traded for another.
  const before = state.beforeFound.replace(/\s+$/u, "");
  if (take === "use") setList(`### ${heading}\n${lines.join("\n")}\n`, { notice });
  else setList(`${before}${before ? "\n\n" : ""}### ${heading}\n${lines.join("\n")}\n`, { notice });
}

/** One line saying how many `!` lines cannot keep what they name, opened on demand to the lines themselves. */
function drawNotes(result) {
  const notes = $("#notes");
  notes.hidden = result.notes.length === 0;
  if (notes.hidden) return;
  const open = state.opened.has("notes");
  const head = element("li", { class: "row" }, opener("notes", "the lines that cannot keep what they name", open, () => drawNotes(result)),
    element("span", { class: "grow", text: `${count(result.notes.length, "! line")} cannot keep what ${result.notes.length === 1 ? "it names" : "they name"}: a folder above is left out whole` }));
  notes.replaceChildren(head, ...(open ? result.notes.map((note) => element("li", { class: "note" }, element("span", { class: "number", text: String(note.number) }), " ", pathText(note.text),
    element("span", { class: "quiet", text: ` · ${note.folders[0]}/${note.folders.length > 1 ? ` and ${count(note.folders.length - 1, "more folder")}` : ""}` }))) : []));
}

// ---------------------------------------------------------------------------
// Left out: a row a block of the list, largest first; opened, its lines that act, largest first
// ---------------------------------------------------------------------------

const PAGE = 50;

function quietButton(kind, label, act) {
  const words = `${kind === "keep" ? "Keep" : "Leave out"} ${label}`;
  const button = element("button", { type: "button", class: "icon-button quiet-act", "aria-label": words, title: words }, icon(kind));
  button.addEventListener("click", act);
  return button;
}

function opener(key, label, open, redraw) {
  const button = element("button", { type: "button", class: "twisty", "aria-expanded": String(open), "aria-label": `${open ? "Close" : "Open"} ${label}` }, icon(open ? "open" : "closed"));
  button.addEventListener("click", () => {
    if (open) state.opened.delete(key);
    else state.opened.add(key);
    redraw();
  });
  return button;
}

/** Rows drawn 50 at a time under a key (`first` at first), and the rest said, with a button for the next fifty. */
function paged(list, key, rows, redraw, first = PAGE) {
  const shown = state.shown.get(key) ?? first;
  list.append(...rows.slice(0, shown));
  if (rows.length > shown) {
    const more = element("button", { type: "button", class: "text-button", text: `${(rows.length - shown).toLocaleString("en")} more not shown: show ${Math.min(PAGE, rows.length - shown)}` });
    more.addEventListener("click", () => {
      state.shown.set(key, shown + PAGE);
      redraw();
    });
    list.append(element("li", {}, more));
  }
}

/** Whether a reader reads files of this kind: the engine's own list of what its readers read, asked of a file of the kind. */
const isCode = (kind) => kind.startsWith(".") && hasReader(`file${kind}`);

/** The three largest kinds left out, those a reader reads set in weight, with their meaning in words for a screen reader. */
function kindsOf(kinds) {
  // The kinds a reader reads first, whatever their size (eleven `.cs` files among four thousand downloaded ones went
  // unseen behind `.dll · .xml · .pdb`), then the largest others: four in all, more where code needs them.
  const sorted = [...kinds].sort((a, b) => b[1] - a[1]);
  const codeKinds = sorted.filter(([kind]) => isCode(kind));
  const top = [...codeKinds, ...sorted.filter(([kind]) => !isCode(kind)).slice(0, Math.max(1, 4 - codeKinds.length))];
  const said = top.map(([kind, n]) => `${kind} ${n.toLocaleString("en")}${isCode(kind) ? ", read by a reader" : ""}`).join("; ");
  const span = element("span", { class: "kinds", "aria-label": said });
  top.forEach(([kind, n], index) => {
    if (index > 0) span.append(" · ");
    span.append(element("span", { class: isCode(kind) ? "code" : "", text: `${kind} ${n.toLocaleString("en")}` }));
  });
  return span;
}

/** How many files of the kinds a reader reads these kinds hold. */
const codeIn = (kinds) => [...kinds].reduce((sum, [kind, n]) => sum + (isCode(kind) ? n : 0), 0);

/**
 * The small sign beside a row that leaves out files a reader would read outside build output and downloaded packages,
 * with how many, named for whoever cannot see it.
 */
function codeSign(n) {
  if (!n) return null;
  const words = `Leaves out ${count(n, "file")} a reader would read, outside build output and downloaded packages`;
  return element("span", { class: "code-sign", role: "img", "aria-label": words, title: words }, icon("code"), element("span", { text: n.toLocaleString("en") }));
}

/** Text with places to break after each `/` and each `.` before a letter, so that a long path or name breaks between its parts, never inside one. */
function breakable(tag, attributes, text) {
  const node = element(tag, attributes);
  for (const part of text.split(/(?<=\/|\.(?=[A-Za-z]))/u)) {
    if (node.childNodes.length > 0) node.append(document.createElement("wbr"));
    node.append(part);
  }
  return node;
}
const pathText = (text) => breakable("code", { class: "line-text" }, text);

const filesAndFolders = (group) => [group.folders.length ? count(group.folders.length, "folder") : "", group.leftOut ? count(group.leftOut, "file") : "", group.folders.some((folder) => folder.files === null) ? "not looked inside" : ""].filter(Boolean).join(" · ");

function drawByBlock(result) {
  const redraw = () => drawByBlock(result);
  const list = $("#by-line");
  list.replaceChildren();
  for (const group of result.fixed) {
    list.append(element("li", { class: "line-row" }, element("div", { class: "row" },
      element("span", { class: "twisty-space" }),
      element("span", { class: "grow", text: group.fixed === "version control" ? "Version control's own folder" : "The tool's own output" }),
      element("span", { class: "counts", text: filesAndFolders(group) }),
      element("span", { class: "quiet", text: "always" }))));
  }
  const blocks = blocksOf(state.list).map((block) => {
    // The lines that leave out what looks like the folder's own code first, most such files first; then those that
    // leave out other files a reader would read; then the rest, largest first.
    const lines = result.lines.filter((group) => group.line.number >= block.first && group.line.number <= block.last)
      .sort((a, b) => b.restCode - a.restCode || codeIn(b.kinds) - codeIn(a.kinds) || b.leftOut - a.leftOut || b.folders.length - a.folders.length);
    const kinds = new Map();
    for (const group of lines) for (const [kind, n] of group.kinds) kinds.set(kind, (kinds.get(kind) ?? 0) + n);
    return { ...block, lines, kinds, restCode: lines.reduce((sum, group) => sum + group.restCode, 0), leftOut: lines.reduce((sum, group) => sum + group.leftOut, 0), folders: lines.flatMap((group) => group.folders) };
  }).filter((block) => block.lines.length > 0).sort((a, b) => b.leftOut - a.leftOut || b.folders.length - a.folders.length);
  for (const block of blocks) {
    const key = `block ${block.first}`;
    const open = state.opened.has(key);
    const title = block.title || (blocks.length === 1 ? "Your list" : "Lines above the first heading");
    const row = element("li", { class: "line-row block" }, element("div", { class: "row" },
      opener(key, title, open, redraw),
      element("span", { class: "grow" }, element("span", { class: "block-title", text: title }), kindsOf(block.kinds)),
      codeSign(block.restCode),
      element("span", { class: "counts", text: filesAndFolders(block) }),
      quietButton("keep", `everything ${title} leaves out: take its lines ${block.first} to ${block.last} out of your list`, () => removeLines(block.first, block.last))));
    if (open) {
      const inner = element("ul", { class: "members" });
      paged(inner, key, block.lines.map((group) => drawLine(group, redraw)), redraw);
      row.append(inner);
    }
    list.append(row);
  }
  const written = acting(state.list);
  const deciding = result.lines.length;
  if (written > deciding) list.append(element("li", { class: "quiet", text: `${count(written - deciding, "other line")} of your list ${written - deciding === 1 ? "leaves" : "leave"} out nothing here` }));
  if (written === 0 && result.fixed.length === 0) list.append(element("li", { class: "quiet", text: "Nothing is left out." }));
}

function drawLine(group, redraw) {
  const key = `line ${group.line.number}`;
  const open = state.opened.has(key);
  const row = element("li", {}, element("div", { class: "row" },
    opener(key, `line ${group.line.number}`, open, redraw),
    element("span", { class: "number", text: String(group.line.number) }),
    element("span", { class: "grow" }, pathText(group.line.text), group.kinds.size ? kindsOf(group.kinds) : null),
    codeSign(group.restCode),
    element("span", { class: "counts", text: filesAndFolders(group) }),
    quietButton("keep", `everything line ${group.line.number} leaves out: take the line out of your list`, () => removeLines(group.line.number))));
  if (open) {
    // What looks like the folder's own code first, most of it first, each with its sign, so that the one folder to
    // keep is not paged away behind the downloaded ones (`Installer/Packages` among the NuGet folders `[Pp]ackages/*` takes).
    const rest = new Set(group.restCodeFiles);
    const members = [...group.folders.map((folder) => ({ path: folder.path, folder: true, files: folder.files, restCode: folder.restCode })),
      ...group.files.map((file) => ({ path: file, folder: false, restCode: rest.has(file) ? 1 : 0 }))]
      .map((member, index) => ({ member, index })).sort((a, b) => b.member.restCode - a.member.restCode || a.index - b.index).map(({ member }) => member);
    const inner = element("ul", { class: "members" });
    paged(inner, key, members.map((member) => element("li", { class: "row" },
      element("span", { class: "grow" }, pathText(member.folder ? `${member.path}/` : member.path)),
      codeSign(member.restCode),
      element("span", { class: "counts", text: member.folder ? (member.files === null ? "not looked inside" : count(member.files, "file")) : "" }),
      quietButton("keep", member.folder ? `${member.path}/` : member.path, () => addYours([`!${member.folder ? folderPattern(member.path) : filePattern(member.path)}`])))), redraw);
    row.append(inner);
  }
  return row;
}

// ---------------------------------------------------------------------------
// What will be read, answered as what is left out is; each minus adds a line
// ---------------------------------------------------------------------------

function drawRead(result) {
  const redraw = () => drawRead(result);
  const kept = new Set(result.kept);
  const folderRows = (node, depth) => {
    const rows = node.folders.filter((child) => child.filesKept > 0).map((child) => {
      const key = `read/${child.path}`;
      const open = state.opened.has(key);
      const item = element("li", {}, element("div", { class: "row" },
        opener(key, child.path, open, redraw),
        breakable("span", { class: "grow" }, depth === 0 ? child.name : `${child.name}/`),
        element("span", { class: "counts", text: child.filesKept.toLocaleString("en") }),
        quietButton("leave", `${child.path}/`, () => addYours([folderPattern(child.path)]))));
      if (open) {
        const inner = element("ul", { class: "members" });
        paged(inner, key, folderRows(child, depth + 1), redraw);
        item.append(inner);
      }
      return item;
    });
    if (node.looseKept > 0) {
      const files = (state.source.listed.get(node.path) ?? []).filter((entry) => entry.kind === "file").map((entry) => (node.path ? `${node.path}/${entry.name}` : entry.name)).filter((file) => kept.has(file));
      const where = node.path ? `${node.path}/` : "the top folder";
      rows.push(element("li", { class: "row" },
        element("span", { class: "twisty-space" }),
        element("span", { class: "grow", text: node.path ? `${count(files.length, "file")} here` : "At the top" }),
        element("span", { class: "counts", text: files.length.toLocaleString("en") }),
        quietButton("leave", `the ${count(files.length, "file")} in ${where}`, () => addYours(files.map(filePattern), `the ${count(files.length, "file")} in ${where}`))));
    }
    return rows;
  };
  const folders = element("ul", {});
  paged(folders, "read", folderRows(result.root, 0), redraw);
  const kinds = element("ul", {});
  paged(kinds, "kinds", byKind(result.kept).map(([kind, n]) => element("li", { class: "row" },
    element("span", { class: `grow path${isCode(kind) ? " code" : ""}`, text: kind, "aria-label": isCode(kind) ? `${kind}, read by a reader` : undefined }),
    element("span", { class: "counts", text: n.toLocaleString("en") }),
    kind.startsWith(".") ? quietButton("leave", `every ${kind} file`, () => addYours([`*${kind.replace(/[\\*?[\]]/gu, (c) => `\\${c}`)}`])) : element("span", { class: "icon-space" }))), redraw, 12);
  $("#read").replaceChildren(element("h3", { text: "By folder" }), folders, element("h3", { text: "By kind" }), kinds);
}

// ---------------------------------------------------------------------------
// Icons: a few strokes each, named for what they do
// ---------------------------------------------------------------------------

const ICONS = {
  pick: "M3 6h6l2 2h10v10H3z",
  drop: "M12 3v12M7 10l5 5 5-5M4 19h16",
  input: "M4 5h16v14H4zM8 9h8M8 13h8",
  // A plus, "back into what is read"; a minus, its opposite, "out of what is read".
  keep: "M12 5v14M5 12h14",
  leave: "M5 12h14",
  remove: "M6 6l12 12M18 6L6 18",
  open: "M6 9l6 6 6-6",
  closed: "M9 6l6 6-6 6",
  scan: "M8 5l11 7-11 7z",
  copy: "M8 8h11v11H8zM5 16V5h11",
  save: "M12 4v11M7 10l5 5 5-5M5 20h14",
  load: "M12 20V9M7 14l5-5 5 5M5 4h14",
  prefill: "M4 6h16M4 12h10M4 18h7M17 15v6M14 18h6",
  tick: "M5 12l4 4 10-10",
  // A curved arrow back: the last change taken back.
  undo: "M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",
  // Angle brackets, for what a reader reads.
  code: "M8 7l-5 5 5 5M16 7l5 5-5 5"
};
function icon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("icon");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", ICONS[name]);
  svg.append(path);
  return svg;
}
document.querySelectorAll("[data-icon]").forEach((node) => node.prepend(icon(node.dataset.icon)));

// ---------------------------------------------------------------------------
// The three ways in, and Scan
// ---------------------------------------------------------------------------

async function start(source) {
  state.source = source;
  state.result = null;
  state.opened = new Set();
  state.shown = new Map();
  state.foundAnswered = undefined;
  state.foundSaid = undefined;
  state.beforeFound = undefined;
  state.offersKept = false;
  state.leftAside = new Set();
  state.offers = undefined;
  $("#folder-name").textContent = source.label;
  // The list's case: as remembered, else the repository's own setting, else without case, as on Windows.
  if (state.rememberedCase === undefined) {
    const config = source.lazy ? undefined : await source.text(".git/config");
    state.ignoreCase = config === undefined ? true : /^\s*ignorecase\s*=\s*true\s*$/imu.test(config);
  }
  await decideAgain();
}

$("#pick").addEventListener("click", async () => {
  if (!window.showDirectoryPicker) {
    $("#progress").textContent = "This browser cannot pick a folder; use Choose.";
    return;
  }
  try {
    await start(handleSource(await window.showDirectoryPicker({ mode: "read" })));
  } catch (error) {
    if (error.name !== "AbortError") $("#progress").textContent = String(error);
  }
});
$("#folder-input").addEventListener("change", (event) => {
  if (event.target.files.length) void start(filesSource(event.target.files));
});
const zone = $("#drop");
zone.addEventListener("dragover", (event) => {
  event.preventDefault();
  zone.classList.add("over");
});
zone.addEventListener("dragleave", () => zone.classList.remove("over"));
zone.addEventListener("drop", async (event) => {
  event.preventDefault();
  zone.classList.remove("over");
  const item = event.dataTransfer.items[0];
  const handle = item?.getAsFileSystemHandle ? await item.getAsFileSystemHandle() : null;
  if (handle?.kind === "directory") await start(handleSource(handle));
  else $("#progress").textContent = "Drop a folder; this browser gave no folder.";
});
$("#scan").addEventListener("click", () => {
  if (state.result) $("#scan-result").textContent = `A scan would read ${count(state.result.kept.length, "file")}. This trial reads none.`;
});

window.choicePage = { state, ready: true };
