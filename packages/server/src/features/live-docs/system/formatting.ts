// ─────────────────────────────────────────────────────────────────────────────
// Number Formatting
// ─────────────────────────────────────────────────────────────────────────────

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return Math.round(value).toLocaleString("en-US");
}

export function formatMean(value: number, digits = 1): string {
  if (!Number.isFinite(value)) {
    return "0.0";
  }
  return value.toFixed(digits);
}

export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) {
    return "0%";
  }
  return `${(value * 100).toFixed(digits)}%`;
}

// ─────────────────────────────────────────────────────────────────────────────
// P-Value Formatting
// ─────────────────────────────────────────────────────────────────────────────

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
