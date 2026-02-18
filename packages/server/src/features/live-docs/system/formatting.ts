// ─────────────────────────────────────────────────────────────────────────────
// Number Formatting
// ─────────────────────────────────────────────────────────────────────────────

/** Rounds a number and formats it with locale-aware thousand separators (`en-US`). */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return Math.round(value).toLocaleString("en-US");
}

/** Formats a number with a fixed number of decimal digits (default 1). */
export function formatMean(value: number, digits = 1): string {
  if (!Number.isFinite(value)) {
    return "0.0";
  }
  return value.toFixed(digits);
}

/** Multiplies by 100 and appends `%`, with configurable decimal precision (default 1). */
export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) {
    return "0%";
  }
  return `${(value * 100).toFixed(digits)}%`;
}

// ─────────────────────────────────────────────────────────────────────────────
// P-Value Formatting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats a p-value for human-readable display.
 *
 * Values below `1e-4` use scientific notation; values at exactly `0` render
 * as `<1e-12`; `null` and non-finite inputs yield `"n/a"`.
 */
export function formatPValue(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "n/a";
  }
  if (value === 0) {
    return "<1e-12";
  }
  if (value < 1e-4) {
    return value.toExponential(2);
  }
  if (value < 0.01) {
    return trimTrailingZeros(value.toFixed(4));
  }
  return trimTrailingZeros(value.toFixed(3));
}

function trimTrailingZeros(candidate: string): string {
  return candidate.replace(/0+$/u, "").replace(/\.$/u, "");
}
