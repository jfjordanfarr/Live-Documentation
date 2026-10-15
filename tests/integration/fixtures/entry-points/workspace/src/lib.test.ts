import { fixture } from "./helper";
import { summarize } from "./lib";

/** A test, an entry by its archetype: a runner starts it. */
export const observed = summarize(fixture());
