# Tidepool fixture

_Current, November 16, 2026._ A small invented browser game in TypeScript: keep the creatures of a rock pool fed as the tide comes and goes. It exists to be looked at. Its directories hold visibly different mixes of the kinds of file the Live Docs know, so that the Explorer's colour by kind can be judged on a project that has all of them: implementation, tests, assets (real binary files) and documents that enter the map by their links.

Build its Explorer with `npm run live-docs:visualize:tidepool`, which writes `dist/explorer/samples/tidepool`. The Live Docs are generated into a temporary copy; this folder is never written to.

## What is where

| Directory | What it holds |
| --- | --- |
| `src/` | Nearly all implementation: the game, the pool, the tide, the creatures, scoring, input and the seeded random source, with one test beside [rng.ts](src/rng.ts). |
| `src/render/` | Three kinds: the drawing code, two tests and the sprite sheet. |
| `src/audio/` | Implementation, two sound cues and a document. |
| `tests/` | Mostly tests, a helper (a test by its folder) and one binary test asset, `snapshot.png`. |
| `assets/images/`, `assets/fonts/`, `assets/sounds/` | Only assets. |
| `styles/` | One file, [main.css](styles/main.css). |
| `levels/` | Two level files, JSON data the pool imports. |
| `docs/` | Documents: [design](docs/design.md), [tides](docs/tides.md), [creatures](docs/creatures.md). |

The page, [index.html](index.html), names the stylesheet, the script, the images and every sound; the stylesheet names the font and two images. Those are the only ways the generator records a use of an asset: an attribute in HTML (`src`, `href`, `srcset`, `poster`) and a `url()` in CSS. Code that names an asset another way is not seen: the canvas test reads `tests/snapshot.png` with `readFileSync`, so the snapshot stands unconnected, as a real project's would.

`.live-documentation/source/` holds the authored blocks of five Live Docs, nothing else; the generator carries them into the docs it writes, so that their links to the documents give Show Related Docs something to show. The documents' own links to source files give Show Citing Docs its share.

## How the binary files were made

Every binary file here was computed from nothing on November 16, 2026, by two throwaway scripts; nothing was copied.

- The PNG images (`logo.png`, `shell.png`, `wave.png`, `src/render/sheet.png`, `tests/snapshot.png`): pixels from small geometric rules (circles, a sine crest, a fan, a five-armed star), written as RGBA PNG chunks with Node's `zlib`.
- `favicon.ico`: a 16-pixel PNG of the same kind inside a one-image ICO header.
- `crab.gif`: a two-frame GIF89a of the crab sprite stepping sideways, its LZW stream written by hand with a clear code before every pixel.
- The WAV sounds, 8 kHz, 8-bit mono: `chime.wav` two decaying sines (880 and 1,320 Hz), `splash.wav` a decaying burst of pseudo-random noise, `surf.wav` low-passed noise that swells, `gulls.wav` a falling sine sweep.
- `tide.ttf` and `tide.woff`: a font named Tide whose seven letters, T, I, D, E, P, O and L, are drawn as squares on a five-by-seven grid, built with the fontTools library's `FontBuilder`.
