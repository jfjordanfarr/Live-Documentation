/**
 * The grammar of a board.
 *
 * @remarks
 * A board is the text a person writes about an estate: the things on it, what
 * each one is and where its docs come from, what it holds, the doors it
 * promises, the connections no scan can see, how each kind is drawn, and where
 * each thing sits. It is a markdown file in the Live Doc family, and this
 * module is the only place that knows its shape: {@link renderBoard} writes a
 * {@link Board} out and {@link parseBoard} reads one back, refusing anything the
 * grammar does not describe, and the two are inverses as `renderLiveDoc` and
 * `parseLiveDoc` are. The strict sections carry no `LIVE-DOC` markers, because
 * a person writes them; {@link lintBoard} checks what the grammar alone cannot.
 * Nothing here reads the docs: `boardGraph.ts` joins a board to the graph.
 *
 * @module
 */

import { LiveDocSyntaxError, Reader } from "./document";
import { ADDRESS_KIND, ROUTE_KIND, SQL_OBJECT_KINDS } from "./openings";

// ============================================================================
// The model
// ============================================================================

/** A board, as written to disk: everything the file says and nothing else. */
export interface Board {
  /** The title line. */
  title: string;
  /** The `Layer` line: one above a file's doc. */
  layer: number;
  /** The authored block, verbatim, with no leading or trailing blank lines. */
  authored: string;
  /** The `Things` section, in order. */
  things: Thing[];
  /** The `Connections` section, in order. */
  connections: Connection[];
  /** The `Legend` section; empty when the section is absent. */
  legend: LegendEntry[];
  /** The `Layout` section; empty when the section is absent. */
  layout: Placement[];
}

/** Anything on the board: a system, a database, a person, a region that holds others. */
export interface Thing {
  /** Unique on the board; letters, digits, `_` and `-`. */
  name: string;
  /** Any word, drawn through the legend. */
  kind?: string;
  /** A folder, live or a snapshot, as a plain path relative to the board. Absent on an imagined thing. */
  from?: string;
  /** Doors the thing promises, whether or not a scan finds them. */
  serves: Door[];
  /** The things inside this one, which is drawn around them. */
  holds: string[];
}

/** An opening a thing serves: its name and the opening kind the docs use. */
export interface Door {
  name: string;
  kind: string;
}

/** A connection no scan can see, with `declared` as its basis. */
export interface Connection {
  from: string;
  to: string;
  /** An opening the target serves or declares. */
  door?: string;
  /** The technology, when the door does not say it. */
  over?: string;
}

/** How a kind is drawn: a shape for a thing that holds nothing, a tint for one that holds things. */
export interface LegendEntry {
  kind: string;
  as: string;
}

/** Where a thing sits on the board plane, in board units. */
export interface Placement {
  name: string;
  x: number;
  y: number;
}

/** The shapes the tool ships. */
export const SHAPES: ReadonlySet<string> = new Set(["cube", "tile", "drum", "figure", "sheet", "cloud"]);

/** The tints the tool ships, drawn light on the white board and deep on the dark one. */
export const TINTS: ReadonlySet<string> = new Set(["blue", "orange", "green", "grey", "violet", "rose"]);

/** The opening kinds a door may have: the kinds the docs already publish. */
export const DOOR_KINDS: ReadonlySet<string> = new Set([ROUTE_KIND, ADDRESS_KIND, ...SQL_OBJECT_KINDS]);

/** How the tool draws the kinds it knows when the legend does not say. */
export const DEFAULT_LEGEND: ReadonlyArray<LegendEntry> = [
  { kind: "web",      as: "cube"   },
  { kind: "service",  as: "cube"   },
  { kind: "program",  as: "cube"   },
  { kind: "library",  as: "tile"   },
  { kind: "database", as: "drum"   },
  { kind: "person",   as: "figure" },
  { kind: "cloud",    as: "blue"   },
  { kind: "on-prem",  as: "orange" }
];

// ============================================================================
// Vocabulary
// ============================================================================

const NO_THINGS = "_No things declared_";
const NO_CONNECTIONS = "_No connections declared_";

const NAME = "[A-Za-z0-9_-]+";
const THING_HEADING = new RegExp(`^#### \`(${NAME})\`$`, "u");
const KIND_LINE = /^- Kind: ([A-Za-z0-9_-]+)$/u;
const FROM_LINE = /^- From: `([^`]+)`$/u;
const SERVES_LINE = /^- Serves: (.+)$/u;
const SERVES_ITEM = /^`([^`]+)` \(([A-Za-z-]+)\)$/u;
const HOLDS_LINE = /^- Holds: (.+)$/u;
const HOLDS_ITEM = new RegExp(`^\`(${NAME})\`$`, "u");
const CONNECTION_LINE = new RegExp(`^- \`(${NAME})\` to \`(${NAME})(?:\\.([^\`]+))?\`(?: over \`([^\`]+)\`)?$`, "u");
const LEGEND_LINE = new RegExp(`^- \`(${NAME})\` as ([a-z]+)$`, "u");
const NUMBER = "-?\\d+(?:\\.\\d+)?";
const PLACEMENT_LINE = new RegExp(`^- \`(${NAME})\` at (${NUMBER}), (${NUMBER})$`, "u");

// ============================================================================
// Rendering
// ============================================================================

/** Writes a board as markdown. The output always ends with one newline. */
export function renderBoard(board: Board): string {
  const lines: string[] = [];
  lines.push(`# ${board.title}`, "", "## Metadata", `- Layer: ${board.layer}`, "", "## Authored", ...board.authored.split("\n"), "", "## Declared", "", "### Things");
  if (board.things.length === 0) {
    lines.push(NO_THINGS);
  }
  for (const thing of board.things) {
    lines.push("", `#### \`${thing.name}\``);
    if (thing.kind) {
      lines.push(`- Kind: ${thing.kind}`);
    }
    if (thing.from) {
      lines.push(`- From: \`${thing.from}\``);
    }
    if (thing.serves.length) {
      lines.push(`- Serves: ${thing.serves.map((door) => `\`${door.name}\` (${door.kind})`).join(", ")}`);
    }
    if (thing.holds.length) {
      lines.push(`- Holds: ${thing.holds.map((name) => `\`${name}\``).join(", ")}`);
    }
  }
  lines.push("", "### Connections", ...(board.connections.length ? board.connections.map(renderConnection) : [NO_CONNECTIONS]));
  if (board.legend.length) {
    lines.push("", "## Legend", ...board.legend.map((entry) => `- \`${entry.kind}\` as ${entry.as}`));
  }
  if (board.layout.length) {
    lines.push("", "## Layout", ...board.layout.map((placement) => `- \`${placement.name}\` at ${placement.x}, ${placement.y}`));
  }
  return `${lines.join("\n")}\n`;
}

function renderConnection(connection: Connection): string {
  const target = connection.door ? `${connection.to}.${connection.door}` : connection.to;
  return `- \`${connection.from}\` to \`${target}\`${connection.over ? ` over \`${connection.over}\`` : ""}`;
}

// ============================================================================
// Parsing
// ============================================================================

/** Reads a board back from markdown, refusing anything outside the grammar. */
export function parseBoard(text: string): Board {
  const reader = new Reader(text);
  const title = reader.expect(/^# (.+)$/u, "the title")[1];
  reader.expectBlank();
  reader.expectLine("## Metadata");
  const layer = Number(reader.expect(/^- Layer: (\d+)$/u, "the Layer line")[1]);
  reader.expectBlank();
  reader.expectLine("## Authored");
  const authored = reader.until((line) => line === "## Declared", "the Declared heading");
  if (authored.length === 0 || authored[authored.length - 1] !== "") {
    reader.fail("the authored block must end with one blank line");
  }
  authored.pop();
  if (authored.length === 0 || authored[0] === "" || authored[authored.length - 1] === "") {
    reader.fail("the authored block must not start or end with a blank line");
  }
  reader.expectLine("## Declared");
  reader.expectBlank();
  reader.expectLine("### Things");
  const things = parseThings(reader);
  reader.expectLine("### Connections");
  const connections = parseListSection(reader, NO_CONNECTIONS, parseConnection);

  const board: Board = { title, layer, authored: authored.join("\n"), things, connections, legend: [], layout: [] };
  if (reader.atEnd()) {
    return board;
  }
  reader.expectBlank();
  if (reader.peek(0) === "## Legend") {
    reader.expectLine("## Legend");
    board.legend = parseListSection(reader, undefined, parseLegendEntry);
    if (reader.atEnd()) {
      return board;
    }
    reader.expectBlank();
  }
  reader.expectLine("## Layout");
  board.layout = parseListSection(reader, undefined, parsePlacement);
  if (!reader.atEnd()) {
    reader.fail("text after the Layout section");
  }
  return board;
}

/** The `Things` section: each thing a heading and its detail lines, separated by blank lines, up to the Connections heading. */
function parseThings(reader: Reader): Thing[] {
  const things: Thing[] = [];
  if (reader.peek(0) === NO_THINGS) {
    reader.expectLine(NO_THINGS);
    reader.expectBlank();
    return things;
  }
  while (reader.peek(0) !== "### Connections") {
    reader.expectBlank();
    if (reader.peek(0) === "### Connections") {
      break;
    }
    const heading = reader.expect(THING_HEADING, "a thing heading");
    const thing: Thing = { name: heading[1], serves: [], holds: [] };
    const kind = reader.take(KIND_LINE);
    if (kind) {
      thing.kind = kind[1];
    }
    const from = reader.take(FROM_LINE);
    if (from) {
      thing.from = from[1];
    }
    const serves = reader.take(SERVES_LINE);
    if (serves) {
      thing.serves = serves[1].split(", ").map((item) => {
        const door = SERVES_ITEM.exec(item);
        if (!door) {
          throw new LiveDocSyntaxError(reader.lineNumber() - 1, `unexpected door ${JSON.stringify(item)} on ${thing.name}`);
        }
        return { name: door[1], kind: door[2] };
      });
    }
    const holds = reader.take(HOLDS_LINE);
    if (holds) {
      thing.holds = holds[1].split(", ").map((item) => {
        const held = HOLDS_ITEM.exec(item);
        if (!held) {
          throw new LiveDocSyntaxError(reader.lineNumber() - 1, `unexpected name ${JSON.stringify(item)} held by ${thing.name}`);
        }
        return held[1];
      });
    }
    if (reader.peek(0) !== "") {
      reader.fail(`unexpected line ${JSON.stringify(reader.peek(0))} under ${thing.name}`);
    }
    things.push(thing);
  }
  if (things.length === 0) {
    reader.fail(`the Things section is empty; say ${NO_THINGS}`);
  }
  return things;
}

/** A section of `- ` lines running to a blank line or the end; `placeholder` is what an empty section says, when it may be empty. */
function parseListSection<T>(reader: Reader, placeholder: string | undefined, parse: (line: string, lineNumber: number) => T): T[] {
  const entries: T[] = [];
  if (placeholder !== undefined && reader.peek(0) === placeholder) {
    reader.expectLine(placeholder);
    return entries;
  }
  while (!reader.atEnd() && reader.peek(0) !== "") {
    const lineNumber = reader.lineNumber();
    entries.push(parse(reader.take(/^.*$/u)![0], lineNumber));
  }
  if (entries.length === 0) {
    reader.fail("the section is empty");
  }
  return entries;
}

function parseConnection(line: string, lineNumber: number): Connection {
  const match = CONNECTION_LINE.exec(line);
  if (!match) {
    throw new LiveDocSyntaxError(lineNumber, `unexpected connection line ${JSON.stringify(line)}`);
  }
  const connection: Connection = { from: match[1], to: match[2] };
  if (match[3]) {
    connection.door = match[3];
  }
  if (match[4]) {
    connection.over = match[4];
  }
  return connection;
}

function parseLegendEntry(line: string, lineNumber: number): LegendEntry {
  const match = LEGEND_LINE.exec(line);
  if (!match) {
    throw new LiveDocSyntaxError(lineNumber, `unexpected legend line ${JSON.stringify(line)}`);
  }
  return { kind: match[1], as: match[2] };
}

function parsePlacement(line: string, lineNumber: number): Placement {
  const match = PLACEMENT_LINE.exec(line);
  if (!match) {
    throw new LiveDocSyntaxError(lineNumber, `unexpected layout line ${JSON.stringify(line)}`);
  }
  return { name: match[1], x: Number(match[2]), y: Number(match[3]) };
}

// ============================================================================
// Lint
// ============================================================================

/** Something wrong with a board that the grammar alone cannot refuse. */
export interface BoardIssue {
  message: string;
}

/**
 * Checks what the grammar cannot: names unique and declared, a thing held by
 * at most one other and never by itself through any chain, door kinds and
 * legend words the tool knows, and a layout that names each thing once. What
 * needs the docs, a `From` that resolves and a door that is served, is checked
 * where the board meets the graph.
 */
export function lintBoard(board: Board): BoardIssue[] {
  const issues: BoardIssue[] = [];
  const names = new Set<string>();
  for (const thing of board.things) {
    if (names.has(thing.name)) {
      issues.push({ message: `${thing.name} is declared twice` });
    }
    names.add(thing.name);
  }
  const declared = (name: string, where: string): void => {
    if (!names.has(name)) {
      issues.push({ message: `${where} names ${name}, which is not declared` });
    }
  };

  const heldBy = new Map<string, string>();
  const holds = new Map<string, string[]>();
  for (const thing of board.things) {
    const doors = new Set<string>();
    for (const door of thing.serves) {
      if (!DOOR_KINDS.has(door.kind)) {
        issues.push({ message: `${thing.name} serves ${door.name} as ${door.kind}, which is not an opening kind` });
      }
      if (doors.has(door.name)) {
        issues.push({ message: `${thing.name} serves ${door.name} twice` });
      }
      doors.add(door.name);
    }
    for (const held of thing.holds) {
      declared(held, thing.name);
      const other = heldBy.get(held);
      if (other !== undefined) {
        issues.push({ message: `${held} is held by both ${other} and ${thing.name}` });
      }
      heldBy.set(held, thing.name);
      holds.set(thing.name, [...(holds.get(thing.name) ?? []), held]);
    }
  }
  for (const name of names) {
    const through = holdsItself(name, holds);
    if (through) {
      issues.push({ message: `${name} holds itself through ${through.join(", ")}` });
    }
  }

  for (const connection of board.connections) {
    declared(connection.from, "a connection");
    declared(connection.to, "a connection");
    if (connection.from === connection.to) {
      issues.push({ message: `${connection.from} connects to itself` });
    }
  }
  for (const entry of board.legend) {
    if (!SHAPES.has(entry.as) && !TINTS.has(entry.as)) {
      issues.push({ message: `the legend draws ${entry.kind} as ${entry.as}, which is neither a shape nor a tint` });
    }
  }
  const placed = new Set<string>();
  for (const placement of board.layout) {
    declared(placement.name, "the layout");
    if (placed.has(placement.name)) {
      issues.push({ message: `the layout places ${placement.name} twice` });
    }
    placed.add(placement.name);
  }
  return issues;
}

/** The things a thing reaches by holding, if they lead back to it: the ones in between, or nothing. */
function holdsItself(name: string, holds: Map<string, string[]>): string[] | undefined {
  const visited = new Set<string>();
  const walk = (current: string, path: string[]): string[] | undefined => {
    for (const held of holds.get(current) ?? []) {
      if (held === name) {
        return path;
      }
      if (!visited.has(held)) {
        visited.add(held);
        const found = walk(held, [...path, held]);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  };
  return walk(name, []);
}

/** The legend entry for a kind: the board's own, or the tool's default, or nothing. */
export function legendFor(board: Board, kind: string | undefined): LegendEntry | undefined {
  if (kind === undefined) {
    return undefined;
  }
  return board.legend.find((entry) => entry.kind === kind) ?? DEFAULT_LEGEND.find((entry) => entry.kind === kind);
}
