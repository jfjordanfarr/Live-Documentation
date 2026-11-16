# How Tidepool is put together

The page, [index.html](../index.html), carries the canvas, the audio elements and the sprite sheet; [main.ts](../src/main.ts) starts a [Game](../src/game.ts) and redraws it twice a second.

A game owns a [Pool](../src/pool.ts), which owns its creatures and the tide. Everything random comes from one seeded source, [rng.ts](../src/rng.ts), so that a seed replays a game exactly.

Drawing lives in `src/render/`: [canvas.ts](../src/render/canvas.ts) paints the pool from the colours in [palette.ts](../src/render/palette.ts) and the frames in [sprites.ts](../src/render/sprites.ts). Sound lives in `src/audio/`; see [the sound notes](../src/audio/SOUNDS.md).

The look of the page, its font and its tiled wave, is in [main.css](../styles/main.css). How the tide behaves is in [tides.md](tides.md); the creatures are in [creatures.md](creatures.md).
