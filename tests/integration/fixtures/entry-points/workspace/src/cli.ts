import { summarize } from "./lib";
import { loadPlugin } from "./loader";

/** What `npm start` and the `demo` binary run. */
export async function main(argv: string[]): Promise<void> {
  const plugin = await loadPlugin();
  console.log(summarize(argv), plugin.name);
}
