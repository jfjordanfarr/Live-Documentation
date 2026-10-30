/**
 * The contrast of text against what stands behind it, as WCAG 2 defines it, from the colours a browser computes:
 * the backgrounds of an element and its ancestors are laid over one another, the text's colour over them, and the
 * two relative luminances give the ratio. Pure, so that a spec reads the computed colours in the page and judges
 * them here; WCAG AA asks 4.5:1 of small text.
 */

/** A colour as red, green and blue from 0 to 255 and an alpha from 0 to 1. */
export type Rgba = [number, number, number, number];

/** The smallest ratio WCAG AA accepts for text under 18 px, or under 14 px bold. */
export const AA_SMALL_TEXT = 4.5;

/** A computed CSS colour, `rgb(…)` or `rgba(…)` with numbers as `getComputedStyle` writes them. */
export function parseColour(css: string): Rgba {
  const numbers = css.match(/-?[\d.]+/gu)?.map(Number);
  if (!/^rgba?\(/u.test(css.trim()) || !numbers || numbers.length < 3) throw new Error(`Not a computed rgb colour: ${css}`);
  return [numbers[0], numbers[1], numbers[2], numbers[3] ?? 1];
}

/** One colour laid over an opaque one by its alpha. */
export function over(top: Rgba, below: Rgba): Rgba {
  const alpha = top[3];
  return [0, 1, 2].map(i => top[i] * alpha + below[i] * (1 - alpha)).concat(1) as Rgba;
}

/**
 * The opaque colour behind an element: its ancestors' backgrounds and its own, outermost first, laid over the
 * browser's white canvas.
 */
export function backdrop(layers: readonly string[]): Rgba {
  return layers.reduce<Rgba>((below, layer) => over(parseColour(layer), below), [255, 255, 255, 1]);
}

/** WCAG 2's relative luminance of an opaque colour. */
export function luminance(colour: Rgba): number {
  const linear = (channel: number): number => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(colour[0]) + 0.7152 * linear(colour[1]) + 0.0722 * linear(colour[2]);
}

/** The contrast ratio of a text colour, laid over its opaque backdrop when translucent, against that backdrop: 1 to 21. */
export function contrastRatio(text: Rgba, behind: Rgba): number {
  const a = luminance(over(text, behind));
  const b = luminance(behind);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
