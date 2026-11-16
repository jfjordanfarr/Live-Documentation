/** What the player can ask of the game. */
export type Command =
  | { kind: "move"; dx: number; dy: number }
  | { kind: "feed" }
  | { kind: "pause" };

const KEYS: Record<string, Command> = {
  ArrowUp: { kind: "move", dx: 0, dy: -1 },
  ArrowDown: { kind: "move", dx: 0, dy: 1 },
  ArrowLeft: { kind: "move", dx: -1, dy: 0 },
  ArrowRight: { kind: "move", dx: 1, dy: 0 },
  " ": { kind: "feed" },
  p: { kind: "pause" }
};

/** The command a key stands for, if any. */
export function readCommand(key: string): Command | undefined {
  return KEYS[key];
}

/** Calls back with a command for every key the player presses that means one. */
export function bindInput(target: Window, onCommand: (command: Command) => void): void {
  target.addEventListener("keydown", (event) => {
    const command = readCommand(event.key);
    if (command) onCommand(command);
  });
}
