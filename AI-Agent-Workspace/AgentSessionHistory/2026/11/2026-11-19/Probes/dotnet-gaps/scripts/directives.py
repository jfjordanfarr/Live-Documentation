"""An independent reading of ASP.NET directives, from Microsoft's documented syntax.

<%@ [Directive] attribute="value" ... %>, attributes in double quotes, single quotes or bare;
a directive with no name is the file type's default (Page in .aspx, Control in .ascx, ...).
For every attribute that names a file, the written path is resolved against the disk four ways:
relative to the markup's folder, `~/` against the nearest application root (closest ancestor holding
Web.config or a web project), `~/` against the repository root, and without regard to case.
Writes one JSON line per directive attribute that names a file.
"""
import json, os, re, sys

root = os.path.abspath(sys.argv[1])
out = open(sys.argv[2], 'w')
MARKUP = {'.aspx': 'Page', '.ascx': 'Control', '.master': 'Master', '.ashx': 'WebHandler', '.asmx': 'WebService',
          '.asax': 'Application', '.svc': 'ServiceHost'}
DIRECTIVE = re.compile(r'<%@(.*?)%>', re.S)
ATTR = re.compile(r'([A-Za-z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s"\'%>]+))')
FILE_ATTRS = {
    'page': ['codefile', 'codebehind', 'src', 'masterpagefile'],
    'control': ['codefile', 'codebehind', 'src'],
    'master': ['codefile', 'codebehind', 'src', 'masterpagefile'],
    'application': ['codefile', 'codebehind', 'src'],
    'webhandler': ['codebehind'], 'webservice': ['codebehind'], 'servicehost': ['codebehind'],
    'register': ['src'], 'reference': ['page', 'control', 'virtualpath'],
    'mastertype': ['virtualpath'], 'previouspagetype': ['virtualpath'], 'assembly': ['src'],
}

all_files = []
for d, dirs, files in os.walk(root):
    dirs[:] = [x for x in dirs if x not in ('.git', '.live-documentation', 'node_modules')]
    for f in files:
        all_files.append(os.path.relpath(os.path.join(d, f), root).replace('\\', '/'))
exact = set(all_files)
folded = {}
for f in all_files:
    folded.setdefault(f.lower(), []).append(f)

def app_roots(rel_dir):
    """Ancestors of a folder that hold a Web.config (any case) or a web project, nearest first."""
    parts = rel_dir.split('/') if rel_dir else []
    roots = []
    for i in range(len(parts), -1, -1):
        d = '/'.join(parts[:i])
        prefix = (d + '/') if d else ''
        if (prefix + 'web.config') in folded:
            roots.append(d)
    return roots

def norm(p):
    out = []
    for seg in p.split('/'):
        if seg in ('', '.'):
            continue
        if seg == '..':
            if not out:
                return None
            out.pop()
        else:
            out.append(seg)
    return '/'.join(out)

def look(candidate):
    if candidate is None:
        return {'exact': False, 'fold': []}
    return {'exact': candidate in exact, 'fold': folded.get(candidate.lower(), [])}

for rel in all_files:
    ext = os.path.splitext(rel)[1].lower()
    if ext not in MARKUP:
        continue
    text = open(os.path.join(root, rel), encoding='utf-8', errors='replace').read()
    rel_dir = os.path.dirname(rel)
    roots = app_roots(rel_dir)
    for m in DIRECTIVE.finditer(text):
        body = m.group(1).strip()
        name_match = re.match(r'([A-Za-z]+)\b(?!\s*=)', body)
        directive = name_match.group(1) if name_match else MARKUP[ext]
        attrs_text = body[name_match.end():] if name_match else body
        attrs = {}
        for a in ATTR.finditer(attrs_text):
            attrs[a.group(1).lower()] = next(v for v in a.groups()[1:] if v is not None)
        line = text.count('\n', 0, m.start()) + 1
        rec_base = {'file': rel, 'line': line, 'directive': directive, 'attrs': attrs}
        out.write(json.dumps({**rec_base, 'kind': 'directive'}) + '\n')
        for key in FILE_ATTRS.get(directive.lower(), []):
            if key not in attrs:
                continue
            written = attrs[key].strip().replace('\\', '/')
            res = {}
            if written.startswith('~/'):
                tail = written[2:]
                res['appRoot'] = look(norm(((roots[0] + '/') if roots and roots[0] else '') + tail)) if roots else None
                res['appRootAny'] = [r for r in roots if look(norm(((r + '/') if r else '') + tail))['fold']]
                res['repoRoot'] = look(norm(tail))
            elif written.startswith('/'):
                res['repoRoot'] = look(norm(written[1:]))
            else:
                res['relative'] = look(norm(((rel_dir + '/') if rel_dir else '') + written))
            out.write(json.dumps({**rec_base, 'kind': 'path', 'attr': key, 'written': written,
                                  'appRoots': roots, 'resolution': res}) + '\n')
