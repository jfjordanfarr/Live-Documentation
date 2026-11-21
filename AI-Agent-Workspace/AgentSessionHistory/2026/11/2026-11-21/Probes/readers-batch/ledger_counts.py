"""Count, by a plain search, the places in the corpora that hold each known difference's spelling: python3 -I ledger_counts.py <folder>..."""
import os
import re
import sys

SQL = (".sql",)
MARKUP = (".html", ".htm", ".aspx", ".ascx", ".master", ".cshtml", ".razor")
POWERSHELL = (".ps1", ".psm1")
PATTERNS = {
    "sql: a name in the schema public": (SQL, r"(?i)\bpublic\.[A-Za-z_\"]"),
    "sql: a dollar-quoted string": (SQL, r"\$[A-Za-z_]*\$"),
    "sql: MySQL's # comment": (SQL, r"(?m)^[ \t]*#[ \t]"),
    "sql: MySQL's executable comment /*!": (SQL, r"/\*!"),
    "sql: a backslash-escaped quote": (SQL, r"\\'"),
    "sql: CREATE DEFINER=": (SQL, r"(?i)\bCREATE\s+(?:ALGORITHM\s*=\s*\w+\s+)?DEFINER\s*="),
    "sql: DELIMITER": (SQL, r"(?im)^\s*DELIMITER\s"),
    "sql: a materialized view": (SQL, r"(?i)\bCREATE\s+(?:OR\s+REPLACE\s+)?MATERIALIZED\s+VIEW"),
    "sql: a table in the temp schema": (SQL, r"(?i)\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?temp\."),
    "markup: <!-- inside a <noscript>": (MARKUP, r"(?is)<noscript[^>]*>(?:(?!</noscript).)*<!--"),
    "markup: a C# comment inside a Razor code block": (MARKUP, r"(?s)@\{[^}]*?(?://|/\*)"),
    "markup: <!-- or --> inside a server block's or Razor block's string": (MARKUP, r"(?s)(?:<%|@\{)[^%}]*?\"[^\"\n]*(?:<!--|-->)[^\"\n]*\""),
    "markup: Razor's escaped @@": (MARKUP, r"@@"),
    "powershell: <# or #> inside an expandable here-string": (POWERSHELL, r"(?s)@\"\r?\n(?:(?!\n\"@).)*?(?:<#|#>)"),
}
counts = {name: [0, 0] for name in PATTERNS}
for root in sys.argv[1:]:
    for folder, dirs, names in os.walk(root):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules", ".live-documentation", "bin", "obj")]
        for name in names:
            lower = name.lower()
            text = None
            for key, (extensions, pattern) in PATTERNS.items():
                if not lower.endswith(extensions):
                    continue
                if text is None:
                    with open(os.path.join(folder, name), encoding="utf-8", errors="replace") as handle:
                        text = handle.read()
                found = len(re.findall(pattern, text))
                if found:
                    counts[key][0] += 1
                    counts[key][1] += found
for key, (files, places) in counts.items():
    print(f"{key}: {places} places in {files} files")
