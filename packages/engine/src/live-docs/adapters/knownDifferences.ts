/**
 * The readers' ledger of known differences (`known-differences.json`): cases in which a reader reads a text otherwise
 * than its language does, each kept as a test that states the language's answer, and listed in the ledger under its
 * cause until a reader is changed to read it so. A test runs such a case through {@link heldToLedger}: a case the
 * ledger lists must still be wrong, so that a mend takes it out of the ledger in the same change, and a case it does
 * not list must be right. The form is the oracles' comparison's (`compiler-differences.json`): one line a cause, what
 * the reader reads, what is true and by what source, and how many places the corpora hold. Made on 2026-11-21, when an
 * independent review of the comment guard brought 64 cases, of which those that need a reader to know a script's
 * dialect or a markup's own code were ledgered rather than mended.
 *
 * @module
 */
import { readFileSync } from "node:fs";
import path from "node:path";

/** One cause of known differences, as the ledger states it. */
export interface KnownCause {
  cause: string;
  truth: string;
  corpora: string;
  /** Each case as `<test file> > <the test's full name>`. */
  cases: string[];
}

/** The ledger's causes, read beside this module's source; only the readers' tests ask for them. */
export const KNOWN_CAUSES: readonly KnownCause[] = (JSON.parse(readFileSync(path.join(__dirname, "known-differences.json"), "utf8")) as { causes: KnownCause[] }).causes;

const LISTED = new Set(KNOWN_CAUSES.flatMap((cause) => cause.cases));

/** The cases a test file has run through the ledger, so that it can say none it lists went unrun. */
const RUN = new Set<string>();

/**
 * Runs a case's check, held to the ledger: a listed case's check must fail, and one that passes throws, saying that
 * the case is no longer wrong and is to be taken out of the ledger; an unlisted case's failure is thrown as it is.
 */
export async function heldToLedger(name: string, check: () => unknown): Promise<void> {
  RUN.add(name);
  let failure: unknown;
  let failed = false;
  try {
    await check();
  } catch (error) {
    failure = error;
    failed = true;
  }
  if (LISTED.has(name) && !failed) throw new Error(`${name} is no longer wrong: take it out of known-differences.json`);
  if (!LISTED.has(name) && failed) throw failure;
}

/** The cases the ledger lists for a test file that the file has not run through {@link heldToLedger}. */
export function listedButNotRun(file: string): string[] {
  return Array.from(LISTED).filter((name) => name.startsWith(`${file} > `) && !RUN.has(name)).sort();
}
