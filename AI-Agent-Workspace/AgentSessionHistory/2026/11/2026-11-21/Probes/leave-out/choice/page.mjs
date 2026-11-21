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

// The screen is By reason. A link can open the folder tree instead (`?layout=folders`), kept for the owner's eye,
// draw the switch between the two (`&switch=on`), and choose what the tree's boxes say (`&boxes=mixed`, or
// `&boxes=choice`). The evidence rules are always applied: a person keeps build output or packages back by the Keep
// on their reason, the switch strangers misread as the reason itself being gone.
const query = new URLSearchParams(location.search);
const state = { source: null, result: null, layout: query.get("layout") === "folders" ? "tree" : "reason", boxes: query.get("boxes") === "choice" ? "choice" : "mixed", person: [], opened: new Set([""]), openedGroups: new Set(), shown: new Map(), focused: "" };
document.querySelector(".segmented").hidden = query.get("switch") !== "on";

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
  state.result = await walk(state.source, { evidenceApplied: true, person: state.person }, (folders) => {
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
  // "Not looked inside" belongs to a lazy walk, and like "left out" is said only when there is some.
  $("#totals").textContent = [`${count(t.read, "file")} will be read`, t.leftOutFiles ? `${count(t.leftOutFiles, "file")} left out` : "",
    state.source.lazy && t.notLookedInside ? `${count(t.notLookedInside, "folder")} left out, not looked inside` : ""].filter(Boolean).join(" · ");
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

const keepPattern = (member) => `!${member.folder ? folderPattern(member.path) : folderPattern(member.path).slice(0, -1)}`;
const filePattern = (file) => folderPattern(file).slice(0, -1);

/**
 * A person's choices: each entry the patterns one action wrote, with a label where it wrote more than one (a reason's
 * Keep, the files at one level), so that "Your patterns" lists and removes it as one. The function reads them flat.
 */
function choose(patterns, label) {
  state.person.push({ patterns, label });
  void decideAgain();
}

/** The reason's own Keep, a word and an icon; on a reason that is the person's own, it takes that choice back. */
function keepButton(group, patterns) {
  const button = element("button", { type: "button", class: "keep", "aria-label": `Keep everything left out as ${group.reason}` }, icon("keep"), element("span", { text: "Keep" }));
  button.addEventListener("click", () => {
    if (group.rule.kind === "person") {
      state.person.splice(group.entry, 1);
      void decideAgain();
    } else choose(patterns, patterns.length > 1 ? `${group.reason}, ${count(patterns.length, "folder")}` : undefined);
  });
  return button;
}

/** A row's own action, quiet: an icon alone, named and explained on hover and focus, blue when the row is pointed at. */
function quietButton(kind, label, patterns, entryLabel) {
  const words = `${kind === "keep" ? "Keep" : "Leave out"} ${label}`;
  const button = element("button", { type: "button", class: "icon-button quiet-act", "aria-label": words, title: words }, icon(kind));
  button.addEventListener("click", () => choose(patterns, entryLabel));
  return button;
}

function opener(key, label, open, redraw) {
  const button = element("button", { type: "button", class: "twisty", "aria-expanded": String(open), "aria-label": `${open ? "Close" : "Open"} ${label}` }, icon(open ? "open" : "closed"));
  button.addEventListener("click", () => {
    if (open) state.openedGroups.delete(key);
    else state.openedGroups.add(key);
    redraw();
  });
  return button;
}

const PAGE = 50;

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

/**
 * Where an ignore file also names a folder: the file, its lines and their words, said on the folder's own row; a file
 * in the folder the row names is "this folder's", since its path would repeat the row's.
 */
function alsoText(alsos, folder) {
  const byFile = new Map();
  for (const also of alsos.filter(Boolean)) byFile.set(also.path, new Map([...(byFile.get(also.path) ?? []), [also.line, also.pattern]]));
  return [...byFile].map(([file, lines]) => {
    const name = file.slice(file.lastIndexOf("/") + 1);
    const where = file === `${folder}/${name}` ? `this folder's ${name}` : file;
    return `Also ${where}, ${[...lines].sort((a, b) => a[0] - b[0]).map(([line, pattern]) => `line ${line}: ${pattern}`).join(" · ")}`;
  }).join(" · ");
}

function drawByReason(result) {
  const list = $("#reasons");
  list.replaceChildren();
  const redraw = () => drawByReason(result);
  if (result.groups.length === 0) list.append(element("li", { class: "quiet", text: "Nothing is left out." }));
  for (const group of result.groups) {
    // Opened by its reason, not its place: a Keep reorders the reasons.
    const key = group.reason;
    const open = state.openedGroups.has(key);
    const unseen = group.folders.filter((folder) => folder.files === null).length;
    const files = group.files.length + group.folders.reduce((sum, folder) => sum + (folder.files ?? 0), 0);
    const counts = [group.folders.length ? count(group.folders.length, "folder") : "", unseen ? "not looked inside" : "", files ? count(files, "file") : ""].filter(Boolean).join(" · ");
    const fixed = group.rule.kind === "own output" || group.rule.kind === "version control";
    const members = [...group.folders.map((folder) => ({ path: folder.path, folder: true, files: folder.files, also: folder.also })), ...group.files.map((file) => ({ path: file, folder: false }))];
    const row = element("li", { class: "reason" }, element("div", { class: "row" },
      opener(key, group.reason, open, redraw),
      element("span", { class: "why", text: group.reason }),
      element("span", { class: "counts", text: counts }),
      fixed ? element("span", { class: "quiet", text: "always" }) : keepButton(group, members.map(keepPattern))));
    // An ignore file that also names some of these folders, said once and quietly; each folder's row names its line.
    for (const [file, { folders }] of group.also ?? []) {
      const n = folders === group.folders.length ? `all ${folders.toLocaleString("en")}` : `${folders.toLocaleString("en")} of ${group.folders.length.toLocaleString("en")}`;
      row.append(element("div", { class: "also", text: `Also ignored by ${file}: ${n}` }));
    }
    if (open) row.append(drawMembers(key, members, fixed, redraw));
    list.append(row);
  }
  drawRead(result);
}

/**
 * A reason's members under their top folders, each opened on demand, so that a reason of many folders is not a wall;
 * the folders of one parent (a project's `bin` and `obj`) are one row.
 */
function drawMembers(key, members, fixed, redraw) {
  const byParent = new Map();
  for (const member of members) {
    const parent = member.folder && member.path.includes("/") ? member.path.slice(0, member.path.lastIndexOf("/")) : `\u0000${member.path}`;
    byParent.set(parent, [...(byParent.get(parent) ?? []), member]);
  }
  const rows = [...byParent].map(([parent, inParent]) => (inParent.length === 1 ? { path: inParent[0].path, label: inParent[0].folder ? `${inParent[0].path}/` : inParent[0].path, members: inParent }
    : { path: parent, label: `${parent}/ ${inParent.map((member) => `${member.path.slice(parent.length + 1)}/`).sort().join(" ")}`, members: inParent }));
  const byTop = new Map();
  for (const each of rows) {
    const top = each.path.includes("/") ? each.path.slice(0, each.path.indexOf("/")) : "(top)";
    byTop.set(top, [...(byTop.get(top) ?? []), each]);
  }
  const leaf = (each, shortLabel) => {
    const files = each.members.reduce((sum, member) => (member.files === null || sum === null ? null : sum + (member.files ?? 0)), 0);
    // The folder the row names first: the project of a `bin` and an `obj`, or the one folder.
    const also = alsoText(each.members.map((member) => member.also), each.path);
    return element("li", { class: "row" },
      element("span", { class: "twisty-space" }),
      element("span", { class: "path" }, element("span", { text: shortLabel ?? each.label, title: each.label }), also ? element("span", { class: "also-line", text: also }) : null),
      element("span", { class: "counts", text: each.members[0].folder ? (files === null ? "not looked inside" : count(files, "file")) : "" }),
      fixed ? null : quietButton("keep", each.label, each.members.map(keepPattern), each.members.length > 1 ? each.label : undefined));
  };
  const inner = element("ul", { class: "members" });
  for (const [top, inTop] of [...byTop].sort((a, b) => b[1].length - a[1].length)) {
    if (inTop.length === 1 && byTop.size > 1) {
      inner.append(leaf(inTop[0]));
      continue;
    }
    const topKey = `${key}/${top}`;
    const topOpen = state.openedGroups.has(topKey) || byTop.size === 1;
    const inTopMembers = inTop.flatMap((each) => each.members);
    const folders = inTopMembers.filter((member) => member.folder).length;
    const said = [folders ? count(folders, "folder") : "", inTopMembers.length - folders ? count(inTopMembers.length - folders, "file") : ""].filter(Boolean).join(" · ");
    const where = top === "(top)" ? "the top folder" : `${top}/`;
    const topRow = element("li", {}, element("div", { class: "row" },
      byTop.size === 1 ? element("span", { class: "twisty-space" }) : opener(topKey, top, topOpen, redraw),
      element("span", { class: "path", text: top === "(top)" ? "At the top" : `${top}/` }),
      element("span", { class: "counts", text: said }),
      fixed || byTop.size === 1 ? null : quietButton("keep", `these ${said} in ${where}`, inTopMembers.map(keepPattern), `${said} in ${where}`)));
    if (topOpen) {
      const leaves = element("ul", { class: "members" });
      paged(leaves, topKey, inTop.map((each) => leaf(each, top === "(top)" ? each.label : each.label.slice(top.length + 1))), redraw);
      topRow.append(leaves);
    }
    inner.append(topRow);
  }
  return inner;
}

/**
 * What will be read, answered as what is left out is: by kind, each with a quiet control to leave that kind out
 * (`*.png`); by folder, each folder opening to its own folders and the files at its level, 50 at a time, each with a
 * quiet control to leave it out, which writes what the tree's box wrote (`/a/b/`).
 */
function drawRead(result) {
  const redraw = () => drawRead(result);
  const summary = readSummary(result.kept);
  const kinds = element("ul", { class: "counts-list" });
  paged(kinds, "kinds", summary.byKind.map(([kind, n]) => element("li", { class: "row" },
    element("span", { class: "path", text: kind }),
    element("span", { class: "counts", text: n.toLocaleString("en") }),
    kind.startsWith(".") ? quietButton("leave", `every ${kind} file`, [`*${kind.replace(/[\\*?[\]!#]/gu, (c) => `\\${c}`)}`]) : element("span", { class: "icon-space" }))), redraw, 12);
  const kept = new Set(result.kept);
  const folderRows = (node, depth) => {
    const rows = node.folders.filter((child) => child.kept && child.filesKept > 0).sort((a, b) => b.filesKept - a.filesKept).map((child) => {
      const key = `read/${child.path}`;
      const open = state.openedGroups.has(key);
      const item = element("li", {}, element("div", { class: "row" },
        opener(key, child.path, open, redraw),
        element("span", { class: "path", text: depth === 0 ? child.name : `${child.name}/` }),
        element("span", { class: "counts", text: child.filesKept.toLocaleString("en") }),
        quietButton("leave", `${child.path}/`, [folderPattern(child.path)])));
      if (open) {
        const inner = element("ul", { class: "members" });
        paged(inner, key, folderRows(child, depth + 1), redraw);
        item.append(inner);
      }
      return item;
    });
    if (node.looseKept > 0) {
      // The files at this level, as a row of their own, left out together as one choice.
      const files = (state.source.listed.get(node.path) ?? []).filter((entry) => entry.kind === "file").map((entry) => (node.path ? `${node.path}/${entry.name}` : entry.name)).filter((file) => kept.has(file));
      const where = node.path ? `${node.path}/` : "the top folder";
      rows.push(element("li", { class: "row" },
        element("span", { class: "twisty-space" }),
        element("span", { class: "path", text: node.path ? `${count(files.length, "file")} here` : "At the top" }),
        element("span", { class: "counts", text: files.length.toLocaleString("en") }),
        quietButton("leave", `the ${count(files.length, "file")} in ${where}`, files.map(filePattern), `the ${count(files.length, "file")} in ${where}`)));
    }
    return rows;
  };
  const folders = element("ul", { class: "counts-list" });
  paged(folders, "read", folderRows(result.root, 0), redraw);
  // By folder first, as the left column goes by folder.
  $("#read").replaceChildren(element("h3", { text: "By folder" }), folders, element("h3", { text: "By kind" }), kinds);
}

// The folder tree: a box per folder and per folder's own files, only opened rows drawn, one tab stop, arrows inside.
const LOOSE = "\u0000files";
const looseKey = (path) => `${path}${LOOSE}`;

function rowsOf(node, depth, rows) {
  for (const child of node.folders) {
    rows.push({ node: child, depth });
    if (state.opened.has(child.path) && child.kept) rowsOf(child, depth + 1, rows);
  }
  // The files at this level, a row of their own after its folders.
  if (node.looseKept + node.looseLeftOut > 0) rows.push({ loose: node, depth });
  return rows;
}

/** The present boxes: a folder's box is half-ticked whenever anything beneath it is left out, by any rule. */
function checkedMixed(node) {
  if (!node.kept) return "false";
  return node.filesLeftOut > 0 || node.foldersLeftOut > 0 ? "mixed" : "true";
}

/**
 * The alternative (`?boxes=choice`): a box says the person's own choice. A folder is half-ticked only for what they or
 * their ignore files left out beneath it; what the starting rules leave out (build output, packages) is a quiet count
 * beside it. A folder left out itself is clear whichever rule left it out, since a tick there would say it is read.
 */
function checkedChoice(node) {
  if (!node.kept) return "false";
  return node.byChoice > 0 || node.foldersByChoice > 0 ? "mixed" : "true";
}

const checked = (node) => (state.boxes === "choice" ? checkedChoice(node) : checkedMixed(node));

/** A folder's counts, and in the alternative a quieter count of what the starting rules took out beneath it. */
function countsOf(node) {
  if (!node.kept) return [node.unlisted ? "not looked inside" : `${count(node.filesLeftOut, "file")} left out`, ""];
  const kept = `${node.filesKept.toLocaleString("en")} kept`;
  if (state.boxes !== "choice") return [`${kept}${node.filesLeftOut ? ` · ${node.filesLeftOut.toLocaleString("en")} left out` : ""}`, ""];
  const chosen = node.byChoice ? ` · ${node.byChoice.toLocaleString("en")} left out` : node.foldersByChoice ? ` · ${count(node.foldersByChoice, "folder")} left out` : "";
  return [`${kept}${chosen}`, node.foldersByStart ? `${count(node.foldersByStart, "build or package folder")} left out` : ""];
}

function boxMark(box) {
  return element("span", { class: `box ${box}`, "aria-hidden": "true" }, box === "true" ? icon("tick") : box === "mixed" ? icon("dash") : null);
}

const opensOf = (node) => node.kept && (node.folders.length > 0 || node.looseKept + node.looseLeftOut > 0);

function drawTree(result) {
  const tree = $("#tree");
  const rows = rowsOf(result.root, 1, []);
  const keyOf = (row) => (row.loose ? looseKey(row.loose.path) : row.node.path);
  if (!rows.some((row) => keyOf(row) === state.focused)) state.focused = rows[0] ? keyOf(rows[0]) : "";
  const indent = (depth) => element("span", { class: "indent", style: `width:${(depth - 1) * 18}px` });
  tree.replaceChildren(...rows.map((row) => {
    const key = keyOf(row);
    const focus = key === state.focused ? "0" : "-1";
    if (row.loose) {
      const node = row.loose;
      const box = node.looseLeftOut === 0 ? "true" : node.looseKept === 0 ? "false" : "mixed";
      const total = node.looseKept + node.looseLeftOut;
      const item = element("li", { role: "treeitem", "aria-level": String(row.depth), "aria-checked": box, tabindex: focus, "data-path": key, class: `loose${box === "false" ? " left-out" : ""}` },
        indent(row.depth),
        element("span", { class: "twisty-mark", "aria-hidden": "true" }),
        boxMark(box),
        element("span", { class: "name", text: `${count(total, "file")} here` }),
        element("span", { class: "counts", text: box === "mixed" ? `${node.looseKept.toLocaleString("en")} kept · ${node.looseLeftOut.toLocaleString("en")} left out` : box === "false" ? "left out" : "" }));
      item.addEventListener("click", () => {
        state.focused = key;
        toggleLoose(node);
      });
      return item;
    }
    const { node, depth } = row;
    const [counts, start] = countsOf(node);
    const item = element("li", {
      role: "treeitem", "aria-level": String(depth), "aria-checked": checked(node), "aria-expanded": opensOf(node) ? String(state.opened.has(node.path)) : undefined,
      tabindex: focus, "data-path": key, class: node.kept ? "" : "left-out"
    },
    indent(depth),
    element("span", { class: "twisty-mark", "aria-hidden": "true" }, opensOf(node) ? icon(state.opened.has(node.path) ? "open" : "closed") : null),
    boxMark(checked(node)),
    element("span", { class: "name", text: node.name }),
    element("span", { class: "counts", text: counts }),
    start ? element("span", { class: "start", text: start }) : null,
    !node.kept && node.rule ? element("span", { class: "why", text: reasonText(node) }) : null);
    item.addEventListener("click", (event) => {
      state.focused = key;
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
  state.person = state.person.filter((each) => each.patterns.length !== 1 || (each.patterns[0] !== pattern && each.patterns[0] !== `!${pattern}`));
  state.person.push({ patterns: [node.kept ? pattern : `!${pattern}`] });
  state.focused = node.path;
  void decideAgain();
}

// The files at one level, kept or left out together, each by its own pattern (`/a/b.cs`, `!/a/b.cs`). Git's patterns
// have no way to name a level's files and none of its folders: `/a/*` with `!/a/*/` would keep, being the person's,
// every folder there that build output, packages or an ignore file left out.
function toggleLoose(node) {
  const files = (state.source.listed.get(node.path) ?? []).filter((entry) => entry.kind === "file").map((entry) => (node.path ? `${node.path}/${entry.name}` : entry.name));
  const own = new Set(files.flatMap((file) => [filePattern(file), `!${filePattern(file)}`]));
  // The person's earlier choices for these files are taken back, and what is left of each entry stays.
  state.person = state.person.map((each) => ({ ...each, patterns: each.patterns.filter((pattern) => !own.has(pattern)) })).filter((each) => each.patterns.length > 0);
  const leftOut = new Set(state.result.groups.flatMap((group) => group.files));
  // All kept: leave each out. Some or all left out: keep each that is left out now. One choice, listed as one.
  const where = node.path ? `${node.path}/` : "the top folder";
  const patterns = node.looseLeftOut === 0 ? files.map(filePattern) : files.filter((file) => leftOut.has(file)).map((file) => `!${filePattern(file)}`);
  state.person.push({ patterns, label: `the ${count(patterns.length, "file")} in ${where}` });
  state.focused = looseKey(node.path);
  void decideAgain();
}

$("#tree").addEventListener("keydown", (event) => {
  const items = [...$("#tree").querySelectorAll('[role="treeitem"]')];
  const at = items.findIndex((item) => item.dataset.path === state.focused);
  const move = (index) => {
    if (index < 0 || index >= items.length) return;
    state.focused = items[index].dataset.path;
    items[at]?.setAttribute("tabindex", "-1");
    items[index].setAttribute("tabindex", "0");
    items[index].focus();
  };
  const looseOf = state.focused.endsWith(LOOSE) ? find(state.result.root, state.focused.slice(0, -LOOSE.length)) : undefined;
  const current = looseOf ? undefined : find(state.result.root, state.focused);
  if (event.key === "ArrowDown") move(at + 1);
  else if (event.key === "ArrowUp") move(at - 1);
  else if (event.key === "Home") move(0);
  else if (event.key === "End") move(items.length - 1);
  else if (event.key === "ArrowRight") {
    if (current && opensOf(current) && !state.opened.has(current.path)) toggleOpen(current);
    else move(at + 1);
  } else if (event.key === "ArrowLeft") {
    if (current && state.opened.has(current.path)) toggleOpen(current);
    else {
      const path = looseOf ? looseOf.path : current?.path ?? "";
      const parent = looseOf ? path : path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
      if (parent) {
        state.focused = parent;
        drawTree(state.result);
      }
    }
  } else if (event.key === " ") {
    if (looseOf) toggleLoose(looseOf);
    else if (current) toggleKeep(current);
  } else if (event.key === "Enter" && current) toggleOpen(current);
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
  // One row a choice: a typed pattern as it was typed, and a choice of many patterns by what it named, its patterns in
  // its tooltip; each removed as one.
  list.replaceChildren(...state.person.map((entry, index) => {
    const said = entry.label ?? entry.patterns.join("  ");
    const remove = element("button", { type: "button", class: "icon-button", "aria-label": `Remove ${said}`, title: "Remove" }, icon("remove"));
    remove.addEventListener("click", () => {
      state.person.splice(index, 1);
      void decideAgain();
    });
    const keeps = entry.patterns.every((pattern) => pattern.startsWith("!"));
    return element("li", {}, entry.label ? element("span", { text: entry.label, title: entry.patterns.join("\n") }) : element("code", { text: said }),
      element("span", { class: "quiet", text: entry.label ? (keeps ? "kept" : "left out") : keeps ? "keeps" : "leaves out" }), remove);
  }));
}

function drawNotes(result) {
  const shown = result.notes.slice(0, 5);
  $("#notes").replaceChildren(...shown.map(({ text }) => element("li", { text })), result.notes.length > shown.length ? element("li", { class: "quiet", text: `and ${count(result.notes.length - shown.length, "more like these")}` }) : "");
  $("#notes").hidden = result.notes.length === 0;
}

// ---------------------------------------------------------------------------
// Icons: a few strokes each, named for what they do
// ---------------------------------------------------------------------------

const ICONS = {
  pick: "M3 6h6l2 2h10v10H3z",
  drop: "M12 3v12M7 10l5 5 5-5M4 19h16",
  input: "M4 5h16v14H4zM8 9h8M8 13h8",
  // A plus, "back into what is read": a tick beside something left out would read as already read, as the tree's box does.
  keep: "M12 5v14M5 12h14",
  // The plus's opposite: out of what is read.
  leave: "M5 12h14",
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
  state.shown = new Map();
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
$("#pattern-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const field = $("#pattern");
  const pattern = field.value.trim();
  if (!pattern) return;
  state.person.push({ patterns: [pattern] });
  field.value = "";
  void decideAgain();
});
$("#scan").addEventListener("click", () => {
  if (state.result) $("#scan-result").textContent = `A scan would read ${count(state.result.kept.length, "file")}. This trial reads none.`;
});

window.choicePage = { state, ready: true };
