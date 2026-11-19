"""How often files in other repositories open with a file-level comment, by extension, by the rules of lib.py.

Usage (each argument a checkout on disk; the walk skips `.git`, `node_modules`, `bin`, `obj` and any `.mdmd` or
`.live-documentation` folder, so a mirror generated into the checkout is not read; version control is not asked, since
this probe's builder may run it only inside its own worktree):
    python3 -I .../authored-section/scripts/corpora.py <checkout> [<checkout> ...] [--ext .ps1,.sql,.cs]
"""
import collections
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib  # noqa: E402

SKIP = {".git", "node_modules", ".mdmd", ".live-documentation", "bin", "obj"}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    exts = None
    if "--ext" in sys.argv:
        exts = set(sys.argv[sys.argv.index("--ext") + 1].lower().split(","))
        args = [a for a in args if a != sys.argv[sys.argv.index("--ext") + 1]]
    for checkout in args:
        files = []
        for folder, dirs, names in os.walk(checkout):
            dirs[:] = [d for d in dirs if d not in SKIP]
            files.extend(os.path.relpath(os.path.join(folder, n), checkout) for n in names)
        by = collections.defaultdict(collections.Counter)
        comments = collections.defaultdict(list)
        for rel in files:
            if not rel:
                continue
            ext = lib.ext_of(rel)
            if exts and ext not in exts:
                continue
            path = os.path.join(checkout, rel)
            if not os.path.isfile(path):
                continue
            raw = open(path, "rb").read()
            if raw.startswith(b"\xff\xfe") or raw.startswith(b"\xfe\xff"):
                text = raw.decode("utf-16", errors="replace")
            else:
                text = raw.decode("utf-8", errors="replace")
            state, words = lib.opening_comment(rel, text)
            by[ext][state] += 1
            if state in ("file", "help", "function-help"):
                comments[ext].append(words)
        print(f"== {os.path.basename(os.path.normpath(checkout))}")
        print(f"   {'ext':18} files  file-level  help-at-top  help-in-first-function  attached  directive  none  |  describing")
        for ext, c in sorted(by.items(), key=lambda kv: -sum(kv[1].values())):
            total = sum(c.values())
            print(f"   {ext:18} {total:5}  {c['file']:10}  {c['help']:11}  {c['function-help']:22}  {c['attached']:8}  {c['directive']:9}  {c['none']:4}"
                  f"  |  {describing(comments[ext], total):10}")


def norm(line):
    return " ".join(line.replace("*", " ").split()).lower()


def describing(texts, total):
    """How many of the comments still say something once boilerplate is struck: a line is boilerplate when ten or more
    files of the kind, and at least one in fifty, carry it word for word (a licence, a banner, a run-me note). A
    comment that keeps three words or more describes its file."""
    seen = collections.Counter()
    for text in texts:
        seen.update({norm(line) for line in text.split("\n") if norm(line)})
    floor = max(10, total // 50)
    return sum(1 for text in texts
               if len(" ".join(norm(l) for l in text.split("\n") if norm(l) and seen[norm(l)] < floor).split()) >= 3)


if __name__ == "__main__":
    main()
