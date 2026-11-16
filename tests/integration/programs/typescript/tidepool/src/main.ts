import { playCue, setAmbience } from "./audio/sounds";
import { Game } from "./game";
import { bindInput } from "./input";
import { drawPool } from "./render/canvas";

const canvas = document.getElementById("pool") as HTMLCanvasElement;
const scoreLabel = document.getElementById("score") as HTMLElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;
const game = new Game(new URLSearchParams(location.search).get("level") ?? "rockpool", Date.now());

bindInput(window, (command) => {
  const fed = game.apply(command);
  if (fed > 0) playCue("chime");
});

setInterval(() => {
  const wasRising = game.pool.tide.rising;
  game.tick();
  if (game.pool.tide.rising !== wasRising) playCue("splash");
  setAmbience(game.pool.tide);
  drawPool(context, game.pool, game.hand);
  scoreLabel.textContent = String(game.score);
}, 500);
