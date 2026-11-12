#!/usr/bin/env node
/**
 * Reads a board, checks it, joins it to the docs of the scans its things name,
 * and prints what the World Map would draw: each thing with its files, doors,
 * what it stands on and its ghosts, every wire between things with its basis,
 * and what the reading and the join found wanting.
 *
 * Usage:
 *   npm run live-docs:board -- [<board.md>] [--workspace <dir>] [--config <file>]
 *
 * The configuration is the file given, else the workspace's own
 * `.live-docs.config.json` when it has one, else the shipped defaults; the
 * board is the one named, else the one the configuration names, as the
 * Explorer's build chooses it.
 *
 * A fault in the board's text or its names exits 1; a `From` with no docs or a
 * declared door nothing serves is printed and exits 0, because a board may name
 * what is not beside it.
 */
import * as fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { normalizeLiveDocumentationConfig } from "@live-documentation/engine/config/liveDocumentationConfig";
import { lintBoard, parseBoard } from "@live-documentation/engine/live-docs/board";
import { deriveBoardGraph, type BoardGraph } from "@live-documentation/engine/live-docs/boardGraph";
import { LiveDocSyntaxError } from "@live-documentation/engine/live-docs/document";
import { readEstateGraph } from "@live-documentation/engine/live-docs/graphFiles";

import { optionValue, readConfiguration, runCommand, UsageError } from "./cli";

interface ParsedArgs {
  help: boolean;
  board?: string;
  workspace?: string;
  configPath?: string;
}

function parseArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = { help: false };
  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    switch (current) {
      case "-h":
      case "--help":
        parsed.help = true;
        break;
      case "--workspace":
        parsed.workspace = optionValue(argv, ++index, current);
        break;
      case "--config":
        parsed.configPath = optionValue(argv, ++index, current);
        break;
      default:
        if (current.startsWith("-")) {
          throw new UsageError(`${current} is not an option.`);
        }
        if (parsed.board !== undefined) {
          throw new UsageError(`${current} is a second board; the command reads one.`);
        }
        parsed.board = current;
    }
  }
  return parsed;
}

function usage(): string {
  return [
    "Usage: npm run live-docs:board -- [<board.md>] [options]",
    "",
    "Reads a board, checks it, joins it to the docs of the scans its things name, and prints its",
    "things, doors and wires. Without <board.md>, the board the configuration names as \"board\".",
    "",
    "Options:",
    "  --workspace <path>   Workspace root (default: the current directory).",
    "  --config <file>      The configuration (default: the workspace's .live-docs.config.json",
    "                       when it has one, else the shipped defaults).",
    "  -h, --help           Print this help."
  ].join("\n");
}

/** The lines the report prints. */
function renderBoardReport(boardPath: string, title: string, scans: string[], derived: BoardGraph, wanting: string[]): string[] {
  const lines: string[] = [`${title} (${boardPath})`, ""];
  lines.push(`Scans (${scans.length}): ${scans.map((scan) => scan || "the workspace root").join(", ") || "none"}`, "");
  lines.push(`Things (${derived.things.length}):`);
  for (const entry of derived.things) {
    const kind = entry.thing.kind ? ` (${entry.thing.kind})` : "";
    const holds = entry.thing.holds.length ? `  holds ${entry.thing.holds.join(", ")}` : "";
    const source = entry.folder !== undefined ? `  from ${entry.folder}: ${entry.files.length} file${entry.files.length === 1 ? "" : "s"}` : entry.thing.from ? `  from ${entry.thing.from}` : holds ? "" : "  imagined";
    lines.push(`  ${entry.thing.name}${kind}${source}${holds}`);
    for (const door of entry.doors) {
      lines.push(`    serves ${door.name} (${door.kind})`);
    }
    if (entry.standsOn.length) {
      lines.push(`    stands on ${entry.standsOn.map((item) => item.label).join(", ")}`);
    }
    for (const ghost of entry.ghosts) {
      lines.push(`    ghost ${ghost.label} (${ghost.basis}) from ${ghost.files.join(", ")}`);
    }
  }
  lines.push("", `Wires (${derived.wires.length}):`);
  for (const wire of derived.wires) {
    const door = wire.door ? `  ${wire.door.name}${wire.door.kind ? ` (${wire.door.kind})` : ""}` : "";
    const over = wire.over ? `  over ${wire.over}` : "";
    const count = wire.edges > 1 ? `  x${wire.edges}` : "";
    lines.push(`  ${wire.from} -> ${wire.to}${door}${over}  [${wire.basis}]${count}`);
  }
  const issues = [...wanting, ...derived.issues.map((issue) => issue.message)];
  if (issues.length) {
    lines.push("", `Wanting (${issues.length}):`);
    for (const issue of issues) {
      lines.push(`  ${issue}`);
    }
  }
  return lines;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  const workspaceRoot = path.resolve(args.workspace ?? process.cwd());
  const config = normalizeLiveDocumentationConfig(await readConfiguration(workspaceRoot, args.configPath));
  const named = args.board ?? config.board;
  if (named === undefined) {
    throw new UsageError("Name the board file to read; the configuration names none as \"board\".");
  }

  // A board named here is a path from the current directory, the configuration's one a path from the workspace root.
  const boardAbsolute = path.resolve(args.board === undefined ? workspaceRoot : process.cwd(), named);
  const boardPath = path.relative(workspaceRoot, boardAbsolute).split(path.sep).join("/");
  if (boardPath.startsWith("../")) {
    throw new Error(`${named} is outside the workspace ${workspaceRoot}`);
  }
  const text = await fs.readFile(boardAbsolute, "utf8");
  let board;
  try {
    board = parseBoard(text);
  } catch (error) {
    if (error instanceof LiveDocSyntaxError) {
      console.error(`${boardPath}: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
  const faults = lintBoard(board);
  for (const fault of faults) {
    console.error(`${boardPath}: ${fault.message}`);
  }
  if (faults.length) {
    process.exit(1);
  }

  const reading = await readEstateGraph({ workspaceRoot, config, board, boardPath });
  const derived = deriveBoardGraph(board, reading.graph, boardPath);
  console.log(renderBoardReport(boardPath, board.title, reading.scans, derived, reading.issues).join("\n"));
}

if (require.main === module) {
  runCommand("live-docs:board", main);
}
