"""The files pytest's own discovery would collect as test modules under a project root, without importing any of them.

Usage: python3 -I pytest_files.py <pytest site-packages> <project root> [testpath ...]

pytest's collection walks from the given paths (the project's `testpaths`, else the root), never into a folder matching
`norecursedirs` (by pytest's own `fnmatch_ex`), nor `__pycache__`, and takes a `.py` file as a test module when
`path_matches_patterns(path, python_files)` holds. Both functions and both defaults are read from pytest's own modules;
the project's configuration of `python_files` and `norecursedirs` is read by the caller and passed through the
environment, never by running the project. Prints one path per line, relative to the root.
"""
import os
import sys
from pathlib import Path

site, root, *testpaths = sys.argv[1:]
sys.path.insert(0, site)
from _pytest.pathlib import fnmatch_ex  # noqa: E402
from _pytest.python import path_matches_patterns  # noqa: E402

python_files = os.environ.get("PYTEST_PYTHON_FILES", "test_*.py *_test.py").split()
norecursedirs = os.environ.get(
    "PYTEST_NORECURSEDIRS", "*.egg .* _darcs build CVS dist node_modules venv {arch}"
).split()

root_path = Path(root)
starts = [root_path / p for p in testpaths] or [root_path]
seen = set()
for start in starts:
    for folder, dirs, files in os.walk(start):
        dirs[:] = sorted(
            d for d in dirs
            if d != "__pycache__" and not any(fnmatch_ex(pattern, Path(folder) / d) for pattern in norecursedirs)
        )
        for name in sorted(files):
            path = Path(folder) / name
            if path.suffix == ".py" and path_matches_patterns(path, python_files):
                rel = path.relative_to(root_path).as_posix()
                if rel not in seen:
                    seen.add(rel)
                    print(rel)
