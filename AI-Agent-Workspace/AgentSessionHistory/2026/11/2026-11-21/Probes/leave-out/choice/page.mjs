// The trial page's script: give it a folder (pick, drop, or a folder input), and see what a scan would read and what
// it would leave out, by the line of one list the person sees and edits: the list is the truth, every act on the
// preview is an edit of it, ignore files found in the folder are offered to use, add or ignore, and starting lists are
// prefills the person chooses. Everything stays on the machine: the page reads names, and the text of ignore files, and
// nothing else. A trial, not the product: `Probes/leave-out/README.md`, the eighth leg.
import { fromGitignores, fromTfignores, proposeLines } from "../../../../../../../../packages/engine/src/tooling/leaveOut";
import VISUAL_STUDIO from "../starting-lists/VisualStudio-ignore.txt";
import { byKind, filePattern, folderPattern, listingOf, totals, walk } from "./model.mjs";

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
  progress.textContent = "Listing…";
  state.result = await walk(state.source, { list: state.list, ignoreCase: state.ignoreCase }, (folders) => {
    progress.textContent = `${count(folders, "folder")} listed`;
  });
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
  $("#ignore-case").checked = state.ignoreCase;
  drawFound(result);
  drawNotes(result);
  drawByLine(result);
  drawRead(result);
  const time = result.timings;
  $("#timings").textContent = `${state.source.lazy ? "walked lazily" : "listed by the browser first"} · ${count(time.listings, "folder listing")} · listing ${Math.round(time.listMs)} ms · deciding ${Math.round(time.decideMs)} ms · in all ${Math.round(time.totalMs)} ms`;
}

// ---------------------------------------------------------------------------
// The list: the one truth, edited as text or by any act on the preview
// ---------------------------------------------------------------------------

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

/** Lines added at the end of the list, under a comment saying what they are when there is more than one. */
function addLines(lines, comment) {
  const body = state.list.replace(/\s+$/u, "");
  setList(`${body}${body ? "\n" : ""}${comment ? `# ${comment}\n` : ""}${lines.join("\n")}\n`);
}

/** A line taken out of the list by its number, from 1. */
function removeLine(number) {
  const lines = state.list.split("\n");
  lines.splice(number - 1, 1);
  setList(lines.join("\n"));
}

let typing;
$("#list").addEventListener("input", (event) => {
  clearTimeout(typing);
  typing = setTimeout(() => setList(event.target.value), 400);
});
$("#ignore-case").addEventListener("change", (event) => {
  state.ignoreCase = event.target.checked;
  remember();
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
  // The file is made here and saved by the browser; nothing leaves the machine. The object's address lives until the
  // page closes, which a list of a few kilobytes can afford.
  const link = element("a", { href: URL.createObjectURL(new Blob([state.list], { type: "text/plain" })), download: "leave-out.gitignore" });
  link.click();
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
document.querySelectorAll("[data-prefill]").forEach((button) => button.addEventListener("click", () => {
  $("#prefill-menu").hidden = true;
  $("#prefill").setAttribute("aria-expanded", "false");
  if (button.dataset.prefill === "visual-studio") addLines(VISUAL_STUDIO.replace(/\s+$/u, "").split(/\r?\n/u), "GitHub's VisualStudio.gitignore (CC0)");
  else {
    const listing = state.source.lazy ? listingOf(state.source) : { folders: state.source.folders, names: state.source.names };
    const proposed = proposeLines(listing.folders, listing.names, state.ignoreCase);
    const lines = [];
    for (const rule of [...new Set(proposed.map((each) => each.rule))]) lines.push(`# ${rule}`, ...proposed.filter((each) => each.rule === rule).map((each) => each.line));
    addLines(lines, `From what the folders hold: ${count(proposed.length, "line")}`);
  }
}));

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
  const listing = state.source.lazy ? listingOf(state.source) : { folders: state.source.folders, names: state.source.names };
  const git = fromGitignores(chosen.filter((file) => file.kind === ".gitignore"), { folders: listing.folders, ignoreCase: state.ignoreCase });
  const tf = fromTfignores(chosen.filter((file) => file.kind === ".tfignore"));
  const said = [...git.differences, ...tf.differences];
  if (tf.lines.length > 0 && !state.ignoreCase) {
    state.ignoreCase = true;
    said.unshift("A .tfignore matches names without case, so your list now does too.");
  }
  state.foundSaid = said.length ? said.join(" ") : undefined;
  const lines = [...git.lines, ...tf.lines];
  if (take === "use") setList(`${lines.join("\n")}\n`);
  else addLines(lines);
}));

function drawNotes(result) {
  const shown = result.notes.slice(0, 4);
  $("#notes").replaceChildren(...shown.map((note) => element("li", { text: `Line ${note.number}, ${note.text}, cannot keep anything in ${note.folders[0]}/${note.folders.length > 1 ? ` or ${count(note.folders.length - 1, "more folder")}` : ""}, left out whole.` })),
    result.notes.length > shown.length ? element("li", { class: "quiet", text: `and ${count(result.notes.length - shown.length, "more like these")}` }) : "");
  $("#notes").hidden = result.notes.length === 0;
}

// ---------------------------------------------------------------------------
// Left out, by the line of the list that left each thing out
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

const kindsText = (kinds) => [...kinds].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([kind, n]) => `${kind} ${n.toLocaleString("en")}`).join(" · ");

function drawByLine(result) {
  const redraw = () => drawByLine(result);
  const list = $("#by-line");
  list.replaceChildren();
  const said = (group) => [group.folders.length ? count(group.folders.length, "folder") : "", group.leftOut ? count(group.leftOut, "file") : "", group.folders.some((folder) => folder.files === null) ? "not looked inside" : ""].filter(Boolean).join(" · ");
  for (const group of result.fixed) {
    list.append(element("li", { class: "line-row" }, element("div", { class: "row" },
      element("span", { class: "twisty-space" }),
      element("span", { class: "grow", text: group.fixed === "version control" ? "Version control's own folder" : "The tool's own output" }),
      element("span", { class: "counts", text: said(group) }),
      element("span", { class: "quiet", text: "always" }))));
  }
  for (const group of result.lines) {
    const key = `line ${group.line.number}`;
    const open = state.opened.has(key);
    const row = element("li", { class: "line-row" }, element("div", { class: "row" },
      opener(key, `line ${group.line.number}`, open, redraw),
      element("span", { class: "number", text: String(group.line.number) }),
      element("span", { class: "grow" }, element("code", { text: group.line.text }), group.kinds.size ? element("span", { class: "kinds", text: kindsText(group.kinds) }) : null),
      element("span", { class: "counts", text: said(group) }),
      quietButton("keep", `everything line ${group.line.number} leaves out: take the line out of your list`, () => removeLine(group.line.number))));
    if (open) {
      const members = [...group.folders.map((folder) => ({ path: folder.path, folder: true, files: folder.files })), ...group.files.map((file) => ({ path: file, folder: false }))];
      const inner = element("ul", { class: "members" });
      paged(inner, key, members.map((member) => element("li", { class: "row" },
        element("span", { class: "grow path", text: member.folder ? `${member.path}/` : member.path }),
        element("span", { class: "counts", text: member.folder ? (member.files === null ? "not looked inside" : count(member.files, "file")) : "" }),
        quietButton("keep", member.folder ? `${member.path}/` : member.path, () => addLines([`!${member.folder ? folderPattern(member.path) : filePattern(member.path)}`])))), redraw);
      row.append(inner);
    }
    list.append(row);
  }
  const written = state.list.split("\n").filter((line) => line.trim() !== "" && !line.trim().startsWith("#")).length;
  const deciding = result.lines.length;
  if (written > deciding) list.append(element("li", { class: "quiet", text: `${count(written - deciding, "other line")} of your list ${written - deciding === 1 ? "leaves" : "leave"} out nothing here` }));
  if (written === 0 && result.fixed.length === 0) list.append(element("li", { class: "quiet", text: "Nothing is left out." }));
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
        quietButton("leave", `${child.path}/`, () => addLines([folderPattern(child.path)]))));
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
        quietButton("leave", `the ${count(files.length, "file")} in ${where}`, () => addLines(files.map(filePattern), `the ${count(files.length, "file")} in ${where}`))));
    }
    return rows;
  };
  const folders = element("ul", {});
  paged(folders, "read", folderRows(result.root, 0), redraw);
  const kinds = element("ul", {});
  paged(kinds, "kinds", byKind(result.kept).map(([kind, n]) => element("li", { class: "row" },
    element("span", { class: "grow path", text: kind }),
    element("span", { class: "counts", text: n.toLocaleString("en") }),
    kind.startsWith(".") ? quietButton("leave", `every ${kind} file`, () => addLines([`*${kind.replace(/[\\*?[\]]/gu, (c) => `\\${c}`)}`])) : element("span", { class: "icon-space" }))), redraw, 12);
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
  prefill: "M4 6h16M4 12h10M4 18h7M17 15v6M14 18h6"
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
