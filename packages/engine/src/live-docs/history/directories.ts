/**
 * The directories a step renamed whole, derived from the files the version
 * control says it renamed.
 *
 * @remarks
 * No version control records that a directory was renamed; git infers renames
 * of files only. The rule here is the one git itself documents for detecting a
 * directory's rename in a merge ("If a given directory still exists on both
 * sides of a merge, we do not consider it to have been renamed"; "If renames
 * split a directory into two or more others, the directory with the most
 * renames, wins"), with two conditions of this design: a directory that
 * already held files before the step is never the new name of another, since
 * a merge into an existing directory is the files' renames and the old
 * directory's death; and a tie names no winner, so that a split with no clear
 * destination is listed as the file renames it is.
 *
 * Each renamed file votes. Its old and new directories are one vote; when
 * their last names agree, their parents are another, and so on up, as
 * `a/b/c/x.ts` to `a/z/c/x.ts` votes for `a/b/c` to `a/z/c` and for `a/b` to
 * `a/z`. A vote counts when nothing is left under the old directory after the
 * step and nothing stood under the new one before it. Each old directory goes
 * to the new directory with strictly the most votes, and each new directory
 * is taken by at most one old directory, the one with strictly the most votes
 * for it. The workspace root is never renamed and never a new name.
 *
 * @module
 */

/**
 * The directories renamed whole by a step, from the old path to the new,
 * sorted by the old path. Every renamed directory is listed, its renamed
 * subdirectories too.
 *
 * @param before - Every file path before the step.
 * @param after - Every file path after the step.
 * @param renamed - The files the version control says the step renamed, from the old path to the new.
 */
export function directoryRenames(
  before: Iterable<string>,
  after: Iterable<string>,
  renamed: ReadonlyArray<readonly [string, string]>
): Array<[from: string, to: string]> {
  const stoodBefore = directoriesOf(before);
  const standsAfter = directoriesOf(after);

  const votes = new Map<string, Map<string, number>>();
  for (const [from, to] of renamed) {
    for (const [oldDirectory, newDirectory] of votesOf(from, to)) {
      if (standsAfter.has(oldDirectory) || stoodBefore.has(newDirectory)) {
        continue;
      }
      const forOld = votes.get(oldDirectory) ?? new Map<string, number>();
      forOld.set(newDirectory, (forOld.get(newDirectory) ?? 0) + 1);
      votes.set(oldDirectory, forOld);
    }
  }

  const claims = new Map<string, Map<string, number>>();
  for (const [oldDirectory, forOld] of votes) {
    const winner = strictWinner(forOld);
    if (winner !== undefined) {
      const claimants = claims.get(winner) ?? new Map<string, number>();
      claimants.set(oldDirectory, forOld.get(winner)!);
      claims.set(winner, claimants);
    }
  }

  const renames: Array<[string, string]> = [];
  for (const [newDirectory, claimants] of claims) {
    const oldDirectory = strictWinner(claimants);
    if (oldDirectory !== undefined) {
      renames.push([oldDirectory, newDirectory]);
    }
  }
  return renames.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}

/** The directory pairs one file's rename votes for, innermost first. */
function votesOf(from: string, to: string): Array<[string, string]> {
  let oldSegments = from.split("/").slice(0, -1);
  let newSegments = to.split("/").slice(0, -1);
  const pairs: Array<[string, string]> = [];
  while (oldSegments.length > 0 && newSegments.length > 0) {
    const oldDirectory = oldSegments.join("/");
    const newDirectory = newSegments.join("/");
    if (oldDirectory === newDirectory) {
      break;
    }
    pairs.push([oldDirectory, newDirectory]);
    if (oldSegments[oldSegments.length - 1] !== newSegments[newSegments.length - 1]) {
      break;
    }
    oldSegments = oldSegments.slice(0, -1);
    newSegments = newSegments.slice(0, -1);
  }
  return pairs;
}

/** Every directory that holds at least one of the paths, at any depth; the root is not among them. */
function directoriesOf(paths: Iterable<string>): Set<string> {
  const directories = new Set<string>();
  for (const path of paths) {
    for (let slash = path.indexOf("/"); slash !== -1; slash = path.indexOf("/", slash + 1)) {
      directories.add(path.slice(0, slash));
    }
  }
  return directories;
}

/** The key with strictly the most votes, or undefined when two or more share the most. */
function strictWinner(votes: ReadonlyMap<string, number>): string | undefined {
  let winner: string | undefined;
  let most = 0;
  let tied = false;
  for (const [key, count] of votes) {
    if (count > most) {
      winner = key;
      most = count;
      tied = false;
    } else if (count === most) {
      tied = true;
    }
  }
  return tied ? undefined : winner;
}
