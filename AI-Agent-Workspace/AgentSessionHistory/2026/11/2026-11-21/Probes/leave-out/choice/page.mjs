// The trial page's script: give it a folder (pick, drop, or a folder input), see what a scan would read and what it
// would leave out and why, in two layouts (by reason, or the folder tree), and change it before scanning. Everything
// stays on the machine: the page reads names, and the text of ignore files, and nothing else. A trial, not the product.
import { folderPattern, readSummary, totals, walk } from "./model.mjs";

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

const state = { source: null, result: null, layout: "reason", evidenceApplied: true, person: [], opened: new Set([""]), openedGroups: new Set(), shown: new Map(), focused: "" };

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
  return {
    lazy: false,
    label,
    allFiles: [...files.keys()],
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
  state.result = await walk(state.source, { evidenceApplied: state.evidenceApplied, person: state.person }, (folders) => {
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
  $("#totals").textContent = `${count(t.read, "file")} will be read · ${count(t.leftOutFiles, "file")} left out · ${count(t.notLookedInside, "folder")} not looked inside`;
  $("#scan-result").textContent = "";
  drawPatterns();
  drawNotes(result);
  $("#by-reason").hidden = state.layout !== "reason";
  $("#by-tree").hidden = state.layout !== "tree";
  document.querySelectorAll("[data-layout]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.layout === state.layout)));
  if (state.layout === "reason") drawByReason(result);
  else drawTree(result);
  const time = result.timings;
  $("#timings").textContent = `${state.source.lazy ? "walked lazily" : "listed by the browser first"} · ${count(time.listings, "folder listing")} · listing ${Math.round(time.listMs)} ms · deciding ${Math.round(time.decideMs)} ms · in all ${Math.round(time.totalMs)} ms`;
}

function keepButton(label, patterns) {
  const button = element("button", { type: "button", class: "keep", "aria-label": `Keep ${label}` }, icon("keep"), element("span", { text: "Keep" }));
  button.addEventListener("click", () => {
    state.person.push(...patterns);
    void decideAgain();
  });
  return button;
}

function drawByReason(result) {
  const list = $("#reasons");
  list.replaceChildren();
  if (result.groups.length === 0) list.append(element("li", { class: "quiet", text: "Nothing is left out." }));
  for (const [index, group] of result.groups.entries()) {
    const open = state.openedGroups.has(index);
    const unseen = group.folders.filter((folder) => folder.files === null).length;
    const files = group.files.length + group.folders.reduce((sum, folder) => sum + (folder.files ?? 0), 0);
    const counts = [group.folders.length ? count(group.folders.length, "folder") : "", unseen ? "not looked inside" : "", files ? count(files, "file") : ""].filter(Boolean).join(" · ");
    const toggle = element("button", { type: "button", class: "twisty", "aria-expanded": String(open), "aria-label": `${open ? "Close" : "Open"} ${group.reason}` }, icon(open ? "open" : "closed"));
    toggle.addEventListener("click", () => {
      if (open) state.openedGroups.delete(index);
      else state.openedGroups.add(index);
      drawByReason(result);
    });
    const fixed = group.rule.kind === "own output" || group.rule.kind === "version control";
    const keepAll = fixed ? null : keepButton(group.reason, [...group.folders.map((folder) => `!${folderPattern(folder.path)}`), ...group.files.map((file) => `!${folderPattern(file).slice(0, -1)}`)]);
    const row = element("li", { class: "reason" }, element("div", { class: "row" }, toggle, element("span", { class: "why", text: group.reason }), element("span", { class: "counts", text: counts }), fixed ? element("span", { class: "quiet", text: "always" }) : keepAll));
    if (open) {
      const inner = element("ul", { class: "members" });
      const members = [...group.folders.map((folder) => ({ path: folder.path, folder: true, files: folder.files })), ...group.files.map((file) => ({ path: file, folder: false }))];
      const shown = state.shown.get(index) ?? 100;
      for (const member of members.slice(0, shown)) {
        const label = member.folder ? `${member.path}/` : member.path;
        inner.append(element("li", { class: "row" }, element("span", { class: "path", text: label }), element("span", { class: "counts", text: member.folder ? (member.files === null ? "not looked inside" : count(member.files, "file")) : "" }), fixed ? null : keepButton(label, [`!${member.folder ? folderPattern(member.path) : folderPattern(member.path).slice(0, -1)}`])));
      }
      if (members.length > shown) {
        const more = element("button", { type: "button", class: "text-button", text: `Show ${Math.min(100, members.length - shown)} more of ${members.length.toLocaleString("en")}` });
        more.addEventListener("click", () => {
          state.shown.set(index, shown + 100);
          drawByReason(result);
        });
        inner.append(element("li", {}, more));
      }
      row.append(inner);
    }
    list.append(row);
  }
  const summary = readSummary(result.kept);
  const table = (rows) => element("ul", { class: "counts-list" }, ...rows.slice(0, 12).map(([name, n]) => element("li", {}, element("span", { text: name }), element("span", { class: "counts", text: n.toLocaleString("en") }))));
  $("#read").replaceChildren(element("h3", { text: "By kind" }), table(summary.byKind), element("h3", { text: "By folder" }), table(summary.byTop));
}

// The folder tree: a tri-state box per folder, only opened rows drawn, one tab stop, the arrow keys inside it.
function rowsOf(node, depth, rows) {
  for (const child of node.folders) {
    rows.push({ node: child, depth });
    if (state.opened.has(child.path) && child.kept) rowsOf(child, depth + 1, rows);
  }
  return rows;
}

function checked(node) {
  if (!node.kept) return "false";
  if (node.filesLeftOut > 0 || node.folders.some((child) => !child.kept)) return "mixed";
  return "true";
}

function drawTree(result) {
  const tree = $("#tree");
  const rows = rowsOf(result.root, 1, []);
  if (!rows.some((row) => row.node.path === state.focused)) state.focused = rows[0]?.node.path ?? "";
  tree.replaceChildren(...rows.map(({ node, depth }) => {
    const box = checked(node);
    const leftOut = !node.kept;
    const item = element("li", {
      role: "treeitem", "aria-level": String(depth), "aria-checked": box, "aria-expanded": node.folders.length || node.unlisted ? String(state.opened.has(node.path) && node.kept) : undefined,
      tabindex: node.path === state.focused ? "0" : "-1", "data-path": node.path, class: leftOut ? "left-out" : ""
    },
    element("span", { class: "indent", style: `width:${(depth - 1) * 18}px` }),
    element("span", { class: "twisty-mark", "aria-hidden": "true" }, node.folders.length && node.kept ? icon(state.opened.has(node.path) ? "open" : "closed") : null),
    element("span", { class: `box ${box}`, "aria-hidden": "true" }, box === "true" ? icon("tick") : box === "mixed" ? icon("dash") : null),
    element("span", { class: "name", text: node.name }),
    element("span", { class: "counts", text: leftOut ? (node.unlisted ? "not looked inside" : `${count(node.filesLeftOut, "file")} left out`) : `${node.filesKept.toLocaleString("en")} kept${node.filesLeftOut ? ` · ${node.filesLeftOut.toLocaleString("en")} left out` : ""}` }),
    leftOut && node.rule ? element("span", { class: "why", text: reasonText(node) }) : null);
    item.addEventListener("click", (event) => {
      state.focused = node.path;
      if (event.target.closest(".box")) toggleKeep(node);
      else toggleOpen(node);
    });
    return item;
  }));
  tree.querySelector('[tabindex="0"]')?.focus({ preventScroll: true });
}

function reasonText(node) {
  const group = state.result.groups.find((each) => each.folders.some((folder) => folder.path === node.path));
  return group ? group.reason : "";
}

function toggleOpen(node) {
  if (!node.kept) return;
  if (state.opened.has(node.path)) state.opened.delete(node.path);
  else state.opened.add(node.path);
  drawTree(state.result);
}

function toggleKeep(node) {
  const pattern = folderPattern(node.path);
  // Ticking a folder left out keeps it, and walks it then; clearing a kept one leaves it out.
  state.person = state.person.filter((each) => each !== pattern && each !== `!${pattern}`);
  state.person.push(node.kept ? pattern : `!${pattern}`);
  state.focused = node.path;
  void decideAgain();
}

$("#tree").addEventListener("keydown", (event) => {
  const items = [...$("#tree").querySelectorAll('[role="treeitem"]')];
  const at = items.findIndex((item) => item.dataset.path === state.focused);
  const node = (path) => find(state.result.root, path);
  const move = (index) => {
    if (index < 0 || index >= items.length) return;
    state.focused = items[index].dataset.path;
    items[at]?.setAttribute("tabindex", "-1");
    items[index].setAttribute("tabindex", "0");
    items[index].focus();
  };
  const current = node(state.focused);
  if (!current) return;
  if (event.key === "ArrowDown") move(at + 1);
  else if (event.key === "ArrowUp") move(at - 1);
  else if (event.key === "Home") move(0);
  else if (event.key === "End") move(items.length - 1);
  else if (event.key === "ArrowRight") {
    if (current.kept && current.folders.length && !state.opened.has(current.path)) toggleOpen(current);
    else move(at + 1);
  } else if (event.key === "ArrowLeft") {
    if (state.opened.has(current.path)) toggleOpen(current);
    else if (current.path.includes("/")) {
      state.focused = current.path.slice(0, current.path.lastIndexOf("/"));
      drawTree(state.result);
    }
  } else if (event.key === " ") toggleKeep(current);
  else if (event.key === "Enter") toggleOpen(current);
  else return;
  event.preventDefault();
});

function find(node, path) {
  if (node.path === path) return node;
  for (const child of node.folders) if (path === child.path || path.startsWith(`${child.path}/`)) return find(child, path);
  return undefined;
}

function drawPatterns() {
  const list = $("#patterns");
  list.replaceChildren(...state.person.map((pattern, index) => {
    const remove = element("button", { type: "button", class: "icon-button", "aria-label": `Remove the pattern ${pattern}` }, icon("remove"));
    remove.addEventListener("click", () => {
      state.person.splice(index, 1);
      void decideAgain();
    });
    return element("li", {}, element("code", { text: pattern }), element("span", { class: "quiet", text: pattern.startsWith("!") ? "keeps" : "leaves out" }), remove);
  }));
}

function drawNotes(result) {
  $("#notes").replaceChildren(...result.notes.slice(0, 8).map(({ note }) => element("li", { text: note })));
  $("#notes").hidden = result.notes.length === 0;
}

// ---------------------------------------------------------------------------
// Icons: a few strokes each, named for what they do
// ---------------------------------------------------------------------------

const ICONS = {
  pick: "M3 6h6l2 2h10v10H3z",
  drop: "M12 3v12M7 10l5 5 5-5M4 19h16",
  input: "M4 5h16v14H4zM8 9h8M8 13h8",
  keep: "M5 12l4 4 10-10",
  remove: "M6 6l12 12M18 6L6 18",
  open: "M6 9l6 6 6-6",
  closed: "M9 6l6 6-6 6",
  tick: "M5 12l4 4 10-10",
  dash: "M6 12h12",
  scan: "M8 5l11 7-11 7z"
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
// The three ways in, and the controls
// ---------------------------------------------------------------------------

async function start(source) {
  state.source = source;
  state.result = null;
  state.person = [];
  state.opened = new Set([""]);
  state.openedGroups = new Set();
  $("#folder-name").textContent = source.label;
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
document.querySelectorAll("[data-layout]").forEach((button) => button.addEventListener("click", () => {
  state.layout = button.dataset.layout;
  draw();
}));
$("#evidence").addEventListener("change", (event) => {
  state.evidenceApplied = event.target.checked;
  void decideAgain();
});
$("#pattern-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const field = $("#pattern");
  const pattern = field.value.trim();
  if (!pattern) return;
  state.person.push(pattern);
  field.value = "";
  void decideAgain();
});
$("#scan").addEventListener("click", () => {
  if (state.result) $("#scan-result").textContent = `A scan would read ${count(state.result.kept.length, "file")}. This trial reads none.`;
});

window.choicePage = { state, ready: true };
