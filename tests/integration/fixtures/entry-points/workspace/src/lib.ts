import { count } from "./util";

/** The package's main module. */
export function summarize(items: string[]): string {
  return `${count(items)} items`;
}
