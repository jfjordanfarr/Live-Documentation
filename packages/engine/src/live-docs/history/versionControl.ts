/**
 * The seam between the history command and a version control: the little the
 * command needs of one, so that git is its first implementation and not its
 * assumption (the plan's C13, the owner's question of 2026-10-17 whether the
 * machinery of change can be "sufficiently decoupled from the source control
 * mechanism that we can aim to support TFS and other versioning systems'
 * change formats later").
 *
 * @remarks
 * Five things and nothing more: where the mainline ends and whether the copy
 * holds all of it; the mainline's changes, oldest first; the changes a tag
 * names; a working tree at a change, removed after; and what happened between
 * two changes, the renames the version control infers and the files whose
 * content changed in place. Every path is relative to the workspace. Nothing
 * here reaches a remote or asks for credentials.
 *
 * @module
 */

import type { CommitInfo } from "./format";

/** One change on the mainline, with its author's name as the version control records it. */
export interface MainlineChange extends CommitInfo {
  author: string;
}

/** What the version control says happened between two changes, by workspace-relative path. */
export interface VersionChanges {
  /** The files it infers were renamed, from the old path to the new. */
  renamed: Array<[from: string, to: string]>;
  /** The files whose content changed in place. */
  modified: string[];
}

/** Where the mainline ends, and whether the copy holds all of it. */
export interface MainlineEnd {
  /** The name of the branch whose first parents are the mainline; `HEAD` when none is checked out. */
  branch: string;
  /** The change the mainline ends at. */
  head: string;
  /**
   * Whether the copy holds only part of the history, as a shallow clone does;
   * its knowledge then begins at the mainline's first change, whose parents it
   * lacks.
   */
  truncated: boolean;
}

/** A working tree at one change, in a directory of the caller's choosing, until it is removed. */
export interface WorkingTree {
  /** The workspace's root inside the tree. */
  root: string;
  /**
   * The environment a process run in the tree needs for the version control to answer of it as of a checkout, what it
   * tracks and what it ignores; empty when the tree is a checkout the version control already knows.
   */
  environment: Record<string, string>;
  /**
   * The change's files the tree does not hold, each with the reason: a symbolic link, which is never written, a path
   * that would leave the tree, a name the disk cannot hold, or an entry clashing with another; the summary says each
   * was not read. The files left out by the caller's choice are not among them.
   */
  unwritten: Array<{ path: string; reason: string }>;
  /** Removes the tree and whatever the version control kept of it. */
  remove(): Promise<void>;
}

/** What the history command needs of a version control. */
export interface VersionControl {
  /** The name written into the sequence's head as the system its history was read from. */
  readonly system: "git";
  /** Where the mainline ends, and whether the copy holds all of it. */
  mainlineEnd(): Promise<MainlineEnd>;
  /** Every change on the mainline, oldest first: the first is where the copy's knowledge begins. */
  mainline(): Promise<MainlineChange[]>;
  /** The ids of the changes a tag names. */
  tagged(): Promise<Set<string>>;
  /**
   * Writes the tree of a change into `directory`, which must not exist yet, but for the files `leaveOut` names by their
   * repository-relative paths: those the reader of the tree never opens, which are neither written nor named unwritten,
   * and which the tree's own listing still holds.
   */
  workingTree(change: string, directory: string, leaveOut?: (path: string) => boolean): Promise<WorkingTree>;
  /** What happened between two changes. */
  changesBetween(from: string, to: string): Promise<VersionChanges>;
}
