import type { Species } from "../creatures";

/** Where a creature sits on the sprite sheet: sixteen-pixel cells, one row. */
export interface Frame {
  x: number;
  y: number;
  size: number;
}

const ORDER: Species[] = ["crab", "anemone", "shrimp", "starfish"];

export function frameFor(species: Species): Frame {
  return { x: ORDER.indexOf(species) * 16, y: 0, size: 16 };
}

/** The sprite sheet the page loads, `sheet.png` beside this file. */
export function spriteSheet(): HTMLImageElement {
  return document.getElementById("sprite-sheet") as HTMLImageElement;
}
