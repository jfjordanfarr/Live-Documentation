#!/usr/bin/env node
/**
 * Reads a board, checks it, joins it to the workspace's docs, and prints what
 * the World Map would draw: each thing with its files and doors, every wire
 * between things with its basis, and what the join found wanting.
 *
 * Usage:
 *   npm run live-docs:board -- <board.md> [--workspace <dir>] [--config <file>]
 *
 * A fault in the board's text or its names exits 1; a `From` with no docs or a
 * declared door nothing serves is printed and exits 0, because a board may name
 * what is not beside it.
 */
import * as fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { normalizeLiveDocumentationConfig, type LiveDocumentationConfigInput } from "@live-documentation/engine/config/liveDocumentationConfig";
import { lintBoard, parseBoard } from "@live-documentation/engine/live-docs/board";
import { deriveBoardGraph, type BoardGraph } from "@live-documentation/engine/live-docs/boardGraph";
import { LiveDocSyntaxError } from "@live-documentation/engine/live-docs/document";
import { readLiveDocGraph } from "@live-documentation/engine/live-docs/graphFiles";

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
        parsed.workspace = expectValue(argv, ++index, current);
        break;
      case "--config":
        parsed.configPath = expectValue(argv, ++index, current);
        break;
      default:
        if (current.startsWith("-")) {
          throw new Error(`Unknown option: ${current}`);
        }
        if (parsed.board !== undefined) {
          throw new Error(`Unexpected argument: ${current}`);
        }
        parsed.board = current;
    }
  }
  return parsed;
}

function expectValue(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (!value || value.startsWith("-")) {
    throw new Error(`Option ${flag} requires a value.`);
  }
  return value;
}

function usage(): string {
  return [
    "Usage: npm run live-docs:board -- <board.md> [options]",
    "",
    "Options:",
    "  --workspace <path>   Workspace root (defaults to the current directory).",
    "  --config <file>      Load configuration from a JSON file.",
    "  --help               Show this help message."
  ].join("\n");
}

/** The lines the report prints. */
export function renderBoardReport(boardPath: string, title: string, derived: BoardGraph): string[] {
  const lines: string[] = [`${title} (${boardPath})`, ""];
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
  }
  lines.push("", `Wires (${derived.wires.length}):`);
  for (const wire of derived.wires) {
    const door = wire.door ? `  ${wire.door.name}${wire.door.kind ? ` (${wire.door.kind})` : ""}` : "";
    const over = wire.over ? `  over ${wire.over}` : "";
    const count = wire.edges > 1 ? `  x${wire.edges}` : "";
    lines.push(`  ${wire.from} -> ${wire.to}${door}${over}  [${wire.basis}]${count}`);
  }
  if (derived.issues.length) {
    lines.push("", `Wanting (${derived.issues.length}):`);
    for (const issue of derived.issues) {
      lines.push(`  ${issue.message}`);
    }
  }
  return lines;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.board === undefined) {
    console.log(usage());
    process.exit(args.help ? 0 : 1);
  }

  const workspaceRoot = path.resolve(args.workspace ?? process.cwd());
  let configInput: LiveDocumentationConfigInput = {};
  if (args.configPath) {
    configInput = JSON.parse(await fs.readFile(path.resolve(args.configPath), "utf8")) as LiveDocumentationConfigInput;
  }
  const config = normalizeLiveDocumentationConfig(configInput);

  const boardAbsolute = path.resolve(args.board);
  const boardPath = path.relative(workspaceRoot, boardAbsolute).split(path.sep).join("/");
  if (boardPath.startsWith("../")) {
    throw new Error(`${args.board} is outside the workspace ${workspaceRoot}`);
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

  const graph = await readLiveDocGraph({ workspaceRoot, config });
  const derived = deriveBoardGraph(board, graph, boardPath);
  console.log(renderBoardReport(boardPath, board.title, derived).join("\n"));
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
