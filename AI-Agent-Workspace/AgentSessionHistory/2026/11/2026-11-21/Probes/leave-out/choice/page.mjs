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
  rememberedCase: remembered.ignoreCase, opened: new Set(), shown: new Map(), foundAnswered: undefined, foundSaid: undefined, leftAside: new Set()
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

async function decideAgain() {
  if (!state.source) return;
  const progress = $("#progress");
  // The walk hands the thread back every twenty folders, so that this word shows while it decides.
  progress.textContent = state.result ? "Deciding…" : "Listing…";
  const started = performance.now();
  state.result = await walk(state.source, { list: state.list, ignoreCase: state.ignoreCase }, (folders) => {
    if (!state.result) progress.textContent = `${count(folders, "folder")} listed`;
  });
  state.result.shownAfterMs = performance.now() - started;
  progress.textContent = "";
  draw();
}

function draw() {
  const result = state.result;
  $("#choice").hidden = !result;
  if (!result) return;
  const t = totals(result);
  $("#totals").textContent = [`${count(t.read, "file")} will be read`, t.leftOutFiles ? `${count(t.leftOutFiles, "file")} left out` : "",
    state.source.lazy && t.notLookedInside ? `${count(t.notLookedInside, "folder")} left out, not looked inside` : ""].filter(Boolean).join(" · ");
  $("#scan-result").textContent = "";
  if ($("#list").value !== state.list) $("#list").value = state.list;
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

function setList(text) {
  state.list = text;
  remember();
  void decideAgain();
}

/** A block added at the end of the list, led by its heading. */
function addBlock(heading, lines) {
  const body = state.list.replace(/\s+$/u, "");
  setList(`${body}${body ? "\n\n" : ""}### ${heading}\n${lines.join("\n")}\n`);
}

/** The person's own lines, added to their block "Yours" at the end, which is begun if the list does not end in it. */
function addYours(lines, comment) {
  const body = state.list.replace(/\s+$/u, "");
  const headings = body.split("\n").filter((line) => line.startsWith("### "));
  const inYours = headings.length > 0 && headings.at(-1) === "### Yours";
  setList(`${body}${body ? "\n" : ""}${inYours ? "" : `${body ? "\n" : ""}### Yours\n`}${comment ? `# ${comment}\n` : ""}${lines.join("\n")}\n`);
}

/** Lines taken out of the list, by their numbers from 1, first to last inclusive. */
function removeLines(first, last = first) {
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

/** The numbers beside the list's lines, so that a row's line number can be found in the text. */
function drawGutter() {
  const n = state.list.split("\n").length;
  $("#gutter").textContent = Array.from({ length: n }, (_, index) => index + 1).join("\n");
  $("#gutter").scrollTop = $("#list").scrollTop;
}

let typing;
$("#list").addEventListener("input", (event) => {
  // When an edit was made, so that the time until its answer is drawn can be told (`state.lastEditShownMs`).
  state.editedAt = performance.now();
  clearTimeout(typing);
  $("#progress").textContent = "…";
  typing = setTimeout(() => setList(event.target.value), 400);
});
$("#list").addEventListener("scroll", () => {
  $("#gutter").scrollTop = $("#list").scrollTop;
});
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

const VISUAL_STUDIO_HEADING = "GitHub's VisualStudio.gitignore (CC0)";
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
    const proposed = proposedBlock();
    addBlock(`From what the folders hold: ${count(proposed.count, "line")}`, proposed.lines);
  }
}
document.querySelectorAll("[data-prefill]").forEach((button) => button.addEventListener("click", () => offer(button.dataset.prefill)));

/** In the list's empty place, the starting lists as offers, each saying what it would do here; gone once the list acts. */
function drawOffers() {
  const empty = acting(state.list) === 0;
  $("#offers").hidden = !empty;
  if (!empty) return;
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
    const button = element("button", { type: "button", class: "offer", "data-offer": kind }, icon("prefill"), element("span", {}, element("strong", { text: title }), element("span", { class: "quiet", text: said })));
    button.addEventListener("click", () => offer(kind));
    return button;
  };
  $("#offers").replaceChildren(
    element("p", { class: "quiet", text: "Your list is empty: nothing is left out. Start from" }),
    card("what-it-holds", "What these folders hold", `${count(state.offers.proposed.lines, "line")} · ${count(state.offers.proposed.files, "file")} left out`),
    card("visual-studio", "GitHub's Visual Studio list", `${count(state.offers.visualStudio.lines, "line")} · ${count(state.offers.visualStudio.files, "file")} left out`),
    element("p", { class: "quiet", text: "or write lines below, as in a .gitignore." }));
}

// ---------------------------------------------------------------------------
// Ignore files found: one notice, three choices for all, a choice per file for whoever opens it
// ---------------------------------------------------------------------------

function drawFound(result) {
  const box = $("#found");
  if (result.found.length === 0 || state.foundAnswered === "ignore") {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  const kinds = [".gitignore", ".tfignore"].map((kind) => [kind, result.found.filter((file) => file.kind === kind).length]).filter(([, n]) => n > 0);
  const where = new Set(result.found.map((file) => (file.path.includes("/") ? file.path.slice(0, file.path.indexOf("/")) : "the top"))).size;
  $("#found-what").textContent = state.foundAnswered
    ? `Taken into your list: ${kinds.map(([kind, n]) => count(n, `${kind} file`)).join(" and ")}`
    : `Found ${kinds.map(([kind, n]) => count(n, `${kind} file`)).join(" and ")}, in ${count(where, "top folder")}`;
  document.querySelectorAll("[data-take]").forEach((button) => (button.hidden = Boolean(state.foundAnswered)));
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
document.querySelectorAll("[data-take]").forEach((button) => button.addEventListener("click", () => {
  const take = button.dataset.take;
  state.foundAnswered = take;
  // Answered: the notice folds back to its one line.
  $("#found-open").setAttribute("aria-expanded", "false");
  $("#found-open").setAttribute("aria-label", "Show the files found");
  if (take === "ignore") {
    draw();
    return;
  }
  const chosen = state.result.found.filter((file) => !state.leftAside.has(file.path));
  const git = fromGitignores(chosen.filter((file) => file.kind === ".gitignore"), { folders: listingNow().folders, ignoreCase: state.ignoreCase });
  const tf = fromTfignores(chosen.filter((file) => file.kind === ".tfignore"));
  const said = [...git.differences, ...tf.differences];
  if (tf.lines.length > 0 && !state.ignoreCase) {
    state.ignoreCase = true;
    said.unshift("A .tfignore matches names without case, so your list now does too.");
  }
  state.foundSaid = said.length ? said.join(" ") : undefined;
  const files = [[".gitignore", chosen.filter((file) => file.kind === ".gitignore").length], [".tfignore", chosen.filter((file) => file.kind === ".tfignore").length]].filter(([, n]) => n > 0);
  const heading = `Taken in from the folder: ${files.map(([kind, n]) => count(n, `${kind} file`)).join(" and ")}`;
  const lines = [...git.lines, ...tf.lines];
  if (take === "use") setList(`### ${heading}\n${lines.join("\n")}\n`);
  else addBlock(heading, lines);
}));

function drawNotes(result) {
  // One note at most, and the rest counted, so that the notes never push the list out of view.
  const shown = result.notes.slice(0, 1);
  $("#notes").replaceChildren(...shown.map((note) => element("li", { text: `Line ${note.number}, ${note.text}, cannot keep anything in ${note.folders[0]}/${note.folders.length > 1 ? ` or ${count(note.folders.length - 1, "more folder")}` : ""}, left out whole.` })),
    result.notes.length > shown.length ? element("li", { class: "quiet", text: `and ${(result.notes.length - shown.length).toLocaleString("en")} more like it` }) : "");
  $("#notes").hidden = result.notes.length === 0;
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
  const top = [...kinds].sort((a, b) => b[1] - a[1]).slice(0, 3);
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

/** The small sign beside a row that leaves out files a reader would read, named for whoever cannot see it. */
function codeSign(n) {
  if (n === 0) return null;
  const words = `Leaves out ${count(n, "file")} a reader would read`;
  return element("span", { class: "code-sign", role: "img", "aria-label": words, title: words }, icon("code"));
}

/** A line's text with places to break after each `/`, so that a long path breaks between names, never inside one. */
function pathText(text) {
  const span = element("code", { class: "line-text" });
  text.split("/").forEach((part, index, parts) => {
    span.append(part + (index < parts.length - 1 ? "/" : ""));
    if (index < parts.length - 1) span.append(document.createElement("wbr"));
  });
  return span;
}

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
    const lines = result.lines.filter((group) => group.line.number >= block.first && group.line.number <= block.last).sort((a, b) => b.leftOut - a.leftOut || b.folders.length - a.folders.length);
    const kinds = new Map();
    for (const group of lines) for (const [kind, n] of group.kinds) kinds.set(kind, (kinds.get(kind) ?? 0) + n);
    return { ...block, lines, kinds, leftOut: lines.reduce((sum, group) => sum + group.leftOut, 0), folders: lines.flatMap((group) => group.folders) };
  }).filter((block) => block.lines.length > 0).sort((a, b) => b.leftOut - a.leftOut || b.folders.length - a.folders.length);
  for (const block of blocks) {
    const key = `block ${block.first}`;
    const open = state.opened.has(key);
    const title = block.title || (blocks.length === 1 ? "Your list" : "Lines above the first heading");
    const row = element("li", { class: "line-row block" }, element("div", { class: "row" },
      opener(key, title, open, redraw),
      element("span", { class: "grow" }, element("span", { class: "block-title", text: title }), kindsOf(block.kinds)),
      codeSign(codeIn(block.kinds)),
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
    codeSign(codeIn(group.kinds)),
    element("span", { class: "counts", text: filesAndFolders(group) }),
    quietButton("keep", `everything line ${group.line.number} leaves out: take the line out of your list`, () => removeLines(group.line.number))));
  if (open) {
    const members = [...group.folders.map((folder) => ({ path: folder.path, folder: true, files: folder.files })), ...group.files.map((file) => ({ path: file, folder: false }))];
    const inner = element("ul", { class: "members" });
    paged(inner, key, members.map((member) => element("li", { class: "row" },
      element("span", { class: "grow" }, pathText(member.folder ? `${member.path}/` : member.path)),
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
        element("span", { class: "grow", text: depth === 0 ? child.name : `${child.name}/` }),
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
