/**
 * Utility helpers for the Rosetta benchmark fixture.
 * 
 * Pure functions with no external dependencies - testing
 * that adapters correctly identify leaf nodes in the graph.
 */

/** Formats a numeric value for display. */
export function format(value: number): string {
  return value.toLocaleString("en-US", { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  });
}

/** Validates that a string is a valid identifier. */
export function validate(input: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(input);
}

/** Computes the sum of numeric values. */
export function sum(values: number[]): number {
  return values.reduce((acc, val) => acc + val, 0);
}

/** Computes the average of numeric values. */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}
