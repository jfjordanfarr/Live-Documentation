/** A file-pair summary for a connectivity overview; canonical symbol edges remain untouched. */
export interface FileConnection<T extends string = string> {
  source: string;
  target: string;
  kind: T;
  count: number;
}

/** Collapse parallel and reciprocal references to one undirected file-level relationship. */
export function fileConnections<T extends string>(links: readonly { source: string; target: string; kind: T }[]): FileConnection<T>[] {
  const pairs = new Map<string, FileConnection<T>>();
  for (const link of links) {
    const [source, target] = [link.source, link.target].sort();
    if (source === target) continue; // Internal symbols do not connect two files.
    const key = JSON.stringify([source, target]);
    const existing = pairs.get(key);
    if (existing) existing.count++;
    else pairs.set(key, { source, target, kind: link.kind, count: 1 });
  }
  return [...pairs.values()];
}
