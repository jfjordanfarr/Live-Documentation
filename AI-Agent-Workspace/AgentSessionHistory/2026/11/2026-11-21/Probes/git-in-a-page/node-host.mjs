// Probe of November 21, 2026 (not product code): the reader's four functions answered from a disk, under a folder.
import { promises as fs } from "node:fs";
import path from "node:path";

export function nodeHost(root) {
  const full = (relative) => path.join(root, ...relative.split("/").filter(Boolean));
  const handles = new Map();
  const counts = { list: 0, read: 0, size: 0, slice: 0, bytes: 0 };
  return {
    counts,
    async list(prefix) {
      counts.list += 1;
      const out = [];
      const walk = async (relative) => {
        let entries;
        try {
          entries = await fs.readdir(full(relative), { withFileTypes: true });
        } catch (error) {
          if (error.code === "ENOENT" || error.code === "ENOTDIR") return;
          throw error;
        }
        for (const entry of entries) {
          const child = relative === "" ? entry.name : `${relative}/${entry.name}`;
          if (entry.isDirectory()) await walk(child);
          else if (entry.isFile()) out.push(child);
        }
      };
      await walk(prefix);
      return out;
    },
    async read(relative) {
      counts.read += 1;
      try {
        const bytes = new Uint8Array(await fs.readFile(full(relative)));
        counts.bytes += bytes.length;
        return bytes;
      } catch (error) {
        if (error.code === "ENOENT" || error.code === "EISDIR" || error.code === "ENOTDIR") return null;
        throw error;
      }
    },
    async size(relative) {
      counts.size += 1;
      return (await fs.stat(full(relative))).size;
    },
    async slice(relative, start, end) {
      counts.slice += 1;
      let handle = handles.get(relative);
      if (handle === undefined) handles.set(relative, (handle = fs.open(full(relative), "r")));
      const bytes = new Uint8Array(end - start);
      const { bytesRead } = await (await handle).read(bytes, 0, bytes.length, start);
      counts.bytes += bytesRead;
      return bytesRead === bytes.length ? bytes : bytes.subarray(0, bytesRead);
    },
    async close() {
      for (const handle of handles.values()) await (await handle).close();
      handles.clear();
    }
  };
}
