import { Game } from "../src/game";

describe("Game", () => {
  it("moves the hand by the command's step", () => {
    const game = new Game("rockpool", 3);
    game.apply({ kind: "move", dx: 1, dy: 0 });
    game.apply({ kind: "move", dx: 0, dy: 1 });
    expect(game.hand).toEqual({ x: 1, y: 1 });
  });

  it("stops the clock while paused", () => {
    const game = new Game("rockpool", 3);
    game.apply({ kind: "pause" });
    game.tick();
    expect(game.minute).toBe(0);
  });
});
