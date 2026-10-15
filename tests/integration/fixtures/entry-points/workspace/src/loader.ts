/** Loads the plugin by a dynamic import with a literal path, which the docs record as an import. */
export async function loadPlugin(): Promise<{ name: string }> {
  const plugin = await import("./plugin");
  return { name: plugin.PLUGIN_NAME };
}
