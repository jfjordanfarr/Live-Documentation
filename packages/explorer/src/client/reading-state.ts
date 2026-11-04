/** Deliberately opened or folded descriptions, independent of retained connections and temporary hover. */
export interface ReadingChoice {
  nodeId: string;
  /** Omitted for the whole card; an exact documented heading for a single description. */
  symbol?: string;
  open: boolean;
}

/** An explicit symbol choice wins over its card's choice, which wins over the pin-derived default. */
export function descriptionIsOpen(choices: readonly ReadingChoice[], nodeId: string, symbol: string | undefined, defaultOpen: boolean): boolean {
  const own = choices.find(choice => choice.nodeId === nodeId && choice.symbol === symbol);
  if (own) return own.open;
  return choices.find(choice => choice.nodeId === nodeId && choice.symbol === undefined)?.open ?? defaultOpen;
}

/** A deliberate whole-card action replaces its individual overrides; a symbol action changes only that symbol. */
export function chooseReading(choices: readonly ReadingChoice[], nodeId: string, symbol: string | undefined, open: boolean): ReadingChoice[] {
  return [
    ...choices.filter(choice => choice.nodeId !== nodeId || symbol !== undefined && choice.symbol !== symbol),
    { nodeId, ...(symbol !== undefined ? { symbol } : {}), open }
  ];
}

/** Files explicitly kept available to read, without retaining any of their neighbors. */
export function readingFiles(choices: readonly ReadingChoice[]): Set<string> {
  return new Set(choices.filter(choice => choice.open).map(choice => choice.nodeId));
}

/** Remove a closed card's deliberate reading choices; this changes no pins or other cards. */
export function releaseReading(choices: readonly ReadingChoice[], nodeId: string): ReadingChoice[] {
  return choices.filter(choice => choice.nodeId !== nodeId);
}

/** Validate externally stored choices, preserving exact headings and the last choice for each target. */
export function readReadingChoices(value: unknown): ReadingChoice[] {
  if (!Array.isArray(value)) return [];
  const choices = new Map<string, ReadingChoice>();
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const { nodeId, symbol, open } = item as Record<string, unknown>;
    if (typeof nodeId !== "string" || !nodeId || typeof open !== "boolean") continue;
    if (symbol !== undefined && (typeof symbol !== "string" || !symbol)) continue;
    const choice: ReadingChoice = { nodeId, ...(typeof symbol === "string" ? { symbol } : {}), open };
    choices.set(JSON.stringify([nodeId, symbol ?? null]), choice);
  }
  return [...choices.values()];
}

/** Drop stale file or symbol choices without turning them into a different reading target. */
export function scrubReadingChoices(choices: readonly ReadingChoice[], nodes: ReadonlyMap<string, unknown>): ReadingChoice[] {
  return choices.filter(choice => {
    if (!nodes.has(choice.nodeId)) return false;
    if (choice.symbol === undefined) return true;
    const symbols = (nodes.get(choice.nodeId) as { publicSymbols?: unknown } | undefined)?.publicSymbols;
    return Array.isArray(symbols) && symbols.includes(choice.symbol);
  });
}
