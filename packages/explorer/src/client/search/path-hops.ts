/**
 * Disambiguates colliding filenames on the path strip.
 *
 * When two or more distinct files in one path share a basename (for example
 * `PaymentService/App.config` and `Hub/App.config`, or
 * `Portal/Controllers/PaymentsController.cs` and
 * `Gateway/Controllers/PaymentsController.cs`), each colliding hop receives the
 * shortest trailing directory path suffix that separates it from every other
 * hop in its basename group. Hops whose basename is unique in the path receive
 * no entry so the strip stays uncluttered.
 *
 * @module path-hops
 */

function basenameOf(id: string): string {
  const slash = id.lastIndexOf("/");
  return slash >= 0 ? id.slice(slash + 1) : id;
}

function directorySegmentsOf(id: string): string[] {
  const slash = id.lastIndexOf("/");
  if (slash <= 0) return [];
  return id.slice(0, slash).split("/").filter(Boolean);
}

function trailingSuffix(segments: readonly string[], depth: number): string {
  if (segments.length === 0) return "/";
  return segments.slice(Math.max(0, segments.length - depth)).join("/");
}

/**
 * Computes the shortest distinguishing directory suffix for every hop ID in
 * `ids` whose basename collides with another distinct hop ID in `ids`.
 *
 * Root-level files colliding with a nested file of the same name are labeled
 * `"/"`. Unique basenames are omitted from the returned map.
 */
export function disambiguateHopContexts(ids: readonly string[]): ReadonlyMap<string, string> {
  const byBase = new Map<string, string[]>();
  for (const id of ids) {
    const base = basenameOf(id);
    const group = byBase.get(base);
    if (!group) {
      byBase.set(base, [id]);
    } else if (!group.includes(id)) {
      group.push(id);
    }
  }

  const contexts = new Map<string, string>();
  for (const group of byBase.values()) {
    if (group.length < 2) continue;
    const entries = group.map(id => ({ id, segments: directorySegmentsOf(id) }));
    for (const entry of entries) {
      if (entry.segments.length === 0) {
        contexts.set(entry.id, "/");
        continue;
      }
      let chosen = entry.segments.join("/");
      for (let depth = 1; depth <= entry.segments.length; depth += 1) {
        const candidate = trailingSuffix(entry.segments, depth);
        const collides = entries.some(
          other => other.id !== entry.id && trailingSuffix(other.segments, depth) === candidate
        );
        if (!collides) {
          chosen = candidate;
          break;
        }
      }
      contexts.set(entry.id, chosen);
    }
  }
  return contexts;
}
