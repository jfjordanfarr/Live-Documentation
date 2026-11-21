// Probe of November 21, 2026 (not product code): what is measured, the same code under Node and in the page. Newest
// first, as a person would be shown it: the head's first parents walked back, each commit's changed paths against its
// first parent, then the bytes of every file the walk saw added or changed, each checked by its id; optionally every
// file of the head's tree as well. Hands the thread back every `yieldEvery` commits and every 200 blobs, so that a page
// can draw, and says how far it has come.
import { objectId, openRepository } from "./git-reader.mjs";
import { withRenames } from "./renames.mjs";

export async function measure(host, options = {}) {
  const { gitDir = ".git", limit = Infinity, blobs = true, verify = true, headTree = false, yieldEvery = 25, progress = () => undefined, memory = () => null } = options;
  const now = () => performance.now();
  const breathe = () => new Promise((resolve) => setTimeout(resolve, 0));
  const t = {};
  let longestStallMs = 0;
  let lastBreath = now();
  const rest = async () => {
    longestStallMs = Math.max(longestStallMs, now() - lastBreath);
    await breathe();
    lastBreath = now();
  };
  let s = now();
  const repository = await openRepository(host, gitDir, { reach: options.reach, inflate: options.inflate });
  t.openMs = Math.round(now() - s);
  const head = await repository.resolve("HEAD");
  s = now();
  let commits = 0;
  let paths = 0;
  const changed = new Map();
  const lines = [];
  const renamed = [];
  let renameMs = 0;
  let slowestRename = { ms: 0 };
  for (let id = head.id; id !== undefined && commits < limit; ) {
    const commit = await repository.commit(id);
    const parentId = repository.shallow.has(id) ? undefined : commit.parents[0];
    const parent = parentId === undefined ? null : await repository.commit(parentId);
    const list = await repository.changes(parent?.tree ?? null, commit.tree);
    paths += list.length;
    if (options.renames) {
      // Git's renames against the first parent, as the history asks (`-M50% -l0`), handing the thread back as it goes.
      const started = now();
      const records = await withRenames(list, (blob) => repository.blob(blob), { size: (blob) => repository.size(blob), pause: rest });
      const ms = now() - started;
      renameMs += ms;
      if (ms > slowestRename.ms) slowestRename = { ms: Math.round(ms), commit: id, added: list.filter(([x]) => x === "A").length, deleted: list.filter(([x]) => x === "D").length };
      renamed.push(id, ...records.map((r) => r.join(" ")));
    }
    lines.push(id, ...list.map(([status, file]) => `${status} ${file}`).sort());
    for (const [status, , blob, mode] of list) if (status !== "D" && mode !== "160000") changed.set(blob, mode);
    commits += 1;
    if (commits === 1) t.firstCommitMs = Math.round(now() - s);
    if (commits % yieldEvery === 0) {
      progress({ stage: "commits", done: commits, date: commit.committer.seconds });
      await rest();
    }
    id = parentId;
  }
  t.commitsMs = Math.round(now() - s);
  // One fingerprint of every commit id and its sorted changes, newest first, to hold one host's answer to another's.
  t.changesDigest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(lines.join("\n")))), (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
  if (options.renames) {
    t.renameMs = Math.round(renameMs);
    t.slowestRename = slowestRename;
    // Every commit id and its records in git's order, renames with their scores, newest first: held to git's by one value.
    t.renamesDigest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(renamed.join("\n")))), (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
  }
  t.commits = commits;
  t.changedPaths = paths;
  t.changedBlobs = changed.size;
  t.memoryAfterCommits = memory();
  let bytes = 0;
  let wrong = 0;
  const readAll = async (ids, stage) => {
    let done = 0;
    for (const id of ids) {
      const data = await repository.blob(id);
      bytes += data.length;
      if (verify && (await objectId("blob", data)) !== id) wrong += 1;
      done += 1;
      if (done % 200 === 0) {
        progress({ stage, done, of: ids.length });
        await rest();
      }
    }
  };
  if (blobs) {
    s = now();
    await readAll([...changed.keys()], "blobs");
    t.blobsMs = Math.round(now() - s);
    t.blobMegabytes = +(bytes / 1048576).toFixed(1);
  }
  if (headTree) {
    s = now();
    const files = (await repository.files((await repository.commit(head.id)).tree)).filter(([, , mode]) => mode !== "160000");
    bytes = 0;
    await readAll(files.map(([, id]) => id), "head");
    t.headFiles = files.length;
    t.headMs = Math.round(now() - s);
    t.headMegabytes = +(bytes / 1048576).toFixed(1);
  }
  t.blobsFailingTheirId = wrong;
  t.longestStallMs = Math.round(longestStallMs);
  t.memoryAtEnd = memory();
  t.head = head.id;
  t.branch = head.branch;
  return t;
}

/** One line on what a folder holds of git, from its listing alone: whether `.git` is there, and its packs and refs. */
export async function describe(host) {
  const all = await host.list("");
  const inGit = all.filter((p) => p === ".git" || p.startsWith(".git/"));
  if (inGit.length === 0) return { line: `No .git in this folder (${all.length} files listed).`, hasGit: false, files: all.length };
  if (inGit.length === 1 && inGit[0] === ".git") {
    const text = new TextDecoder().decode(await host.read(".git"));
    return { line: `.git is a file pointing elsewhere: ${text.trim()} (${all.length} files listed).`, hasGit: false, files: all.length };
  }
  const packs = inGit.filter((p) => /^\.git\/objects\/pack\/pack-[0-9a-f]+\.pack$/u.test(p)).length;
  const loose = inGit.filter((p) => /^\.git\/objects\/[0-9a-f]{2}\/[0-9a-f]{38}$/u.test(p)).length;
  const looseRefs = inGit.filter((p) => p.startsWith(".git/refs/")).length;
  const packed = await host.read(".git/packed-refs");
  const packedRefs = packed === null ? 0 : new TextDecoder().decode(packed).split("\n").filter((line) => /^[0-9a-f]{40} /u.test(line)).length;
  const head = await host.read(".git/HEAD");
  return {
    line: `.git is here: ${packs} pack files, ${loose} loose objects, ${looseRefs + packedRefs} refs (${looseRefs} loose, ${packedRefs} packed); HEAD ${head === null ? "missing" : new TextDecoder().decode(head).trim()}; ${inGit.length} files under .git of ${all.length} listed.`,
    hasGit: true,
    files: all.length,
    gitFiles: inGit.length,
    packs,
    loose,
    refs: looseRefs + packedRefs
  };
}
