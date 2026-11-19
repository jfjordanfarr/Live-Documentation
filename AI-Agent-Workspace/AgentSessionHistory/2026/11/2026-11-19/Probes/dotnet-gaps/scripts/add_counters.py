"""Adds temporary operation counters to csharp.ts (never committed). Usage: add_counters.py <csharp.ts>"""
import sys
p = sys.argv[1]
s = open(p).read()
rep = [
("""    const records = table.byQualifiedName.get(joinNames(container, dotted));""",
"""    COUNT("type lookups");
    const records = table.byQualifiedName.get(joinNames(container, dotted));"""),
("""  for (const known of table.namespaces) {
    if (known.startsWith(`${namespace}.`)) return true;""",
"""  for (const known of table.namespaces) {
    COUNT("namespace comparisons");
    if (known.startsWith(`${namespace}.`)) return true;"""),
("""function isWorkspaceNamespace(namespace: string, table: TypeTable): boolean {
  if""",
"""function isWorkspaceNamespace(namespace: string, table: TypeTable): boolean {
  COUNT("namespace questions");
  if"""),
("""      const member = peer.type.members.find((candidate) => candidate.name === use.chain[0]);""",
"""      COUNT("peer member comparisons", peer.type.members.length);
      const member = peer.type.members.find((candidate) => candidate.name === use.chain[0]);"""),
("""async function toDependencies(""",
"""const COUNT = (name: string, by = 1): void => { const g = globalThis as { __csharpCounters?: Record<string, number> }; g.__csharpCounters ??= {}; g.__csharpCounters[name] = (g.__csharpCounters[name] ?? 0) + by; };

async function toDependencies("""),
]
for a, b in rep:
    assert s.count(a) == 1, a[:60]
    s = s.replace(a, b)
open(p, 'w').write(s)
