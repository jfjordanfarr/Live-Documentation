"""Configuration reads in C#, from the Roslyn probe, against the projects that would host them.

For each read of ConfigurationManager/WebConfigurationManager .AppSettings[...] / .ConnectionStrings[...]:
- the reading file's project (nearest folder holding a .csproj/.vbproj), and that project's kind (web, program, library);
- the hosts: the web and program projects that reach the reading project through ProjectReference, followed backward
  transitively, plus the project itself when it is a host;
- which of those hosts' configuration files (Web.config / App.config, any case, in the host's folder) define the key.
Prints the cases the brief asks about.
"""
import json, os, re, sys, collections
probe = [json.loads(l) for l in open(sys.argv[1])]
root = os.path.abspath(sys.argv[2])
SKIP = {'.' + 'git', '.live-documentation', 'node_modules'}
allf = []
for d, dirs, files in os.walk(root):
    dirs[:] = [x for x in dirs if x not in SKIP]
    for f in files:
        allf.append(os.path.relpath(os.path.join(d, f), root).replace('\\', '/'))
folded = collections.defaultdict(list)
for f in allf:
    folded[f.lower()].append(f)

projects = {}
for f in allf:
    if f.lower().endswith(('.csproj', '.vbproj')):
        text = open(os.path.join(root, f), encoding='utf-8', errors='replace').read()
        web = '349c5851-65df-11da-9384-00065b846f21' in text.lower() or re.search(r'Sdk\s*=\s*"[^"]*\.Web"', text) is not None
        ot = re.search(r'<OutputType>\s*([^<]+?)\s*</OutputType>', text, re.I)
        kind = 'web' if web else ('program' if ot and ot.group(1).lower() in ('exe', 'winexe') else 'library')
        refs = []
        for m in re.finditer(r'<ProjectReference\b[^>]*?\bInclude\s*=\s*"([^"]+)"', text, re.I):
            target = os.path.normpath(os.path.join(os.path.dirname(f), m.group(1).replace('\\', '/'))).replace('\\', '/')
            hit = folded.get(target.lower())
            if hit:
                refs.append(hit[0])
        projects[f] = {'kind': kind, 'refs': refs, 'dir': os.path.dirname(f)}
by_dir = collections.defaultdict(list)
for p, v in projects.items():
    by_dir[v['dir']].append(p)
referrers = collections.defaultdict(set)
for p, v in projects.items():
    for r in v['refs']:
        referrers[r].add(p)

def project_of(rel):
    d = os.path.dirname(rel)
    while True:
        if d in by_dir:
            return by_dir[d][0]
        if not d:
            return None
        d = os.path.dirname(d)

def hosts_of(proj):
    seen, stack, hosts = {proj}, [proj], set()
    while stack:
        p = stack.pop()
        if projects[p]['kind'] in ('web', 'program'):
            hosts.add(p)
        for q in referrers[p]:
            if q not in seen:
                seen.add(q); stack.append(q)
    return sorted(hosts)

def config_keys(proj):
    d = projects[proj]['dir']
    keys = {'AppSettings': set(), 'ConnectionStrings': set()}
    files = []
    for name in ('web.config', 'app.config'):
        for f in folded.get((((d + '/') if d else '') + name).lower(), []):
            files.append(f)
            text = open(os.path.join(root, f), encoding='utf-8', errors='replace').read()
            app = re.search(r'<appSettings\b[^>]*>(.*?)</appSettings>', text, re.S | re.I)
            if app:
                keys['AppSettings'].update(re.findall(r'<add\b[^>]*?\bkey\s*=\s*"([^"]+)"', app.group(1), re.I))
            cs = re.search(r'<connectionStrings\b[^>]*>(.*?)</connectionStrings>', text, re.S | re.I)
            if cs:
                keys['ConnectionStrings'].update(re.findall(r'<add\b[^>]*?\bname\s*=\s*"([^"]+)"', cs.group(1), re.I))
    return files, keys

cases = collections.Counter(); examples = {}
for p in probe:
    for r in p['configReads']:
        if not re.search(r'ConfigurationManager$', r['owner']):
            cases['owner not ConfigurationManager: ' + r['owner'][:40]] += 1
            continue
        if r['key'] is None:
            cases['key not a literal'] += 1
            continue
        proj = project_of(p['path'])
        if proj is None:
            cases['no project'] += 1
            continue
        kind = projects[proj]['kind']
        hosts = hosts_of(proj)
        defining = [h for h in hosts if r['key'] in config_keys(h)[1][r['collection']]]
        with_config = [h for h in hosts if config_keys(h)[0]]
        own_files = config_keys(proj)[0]
        label = f"{kind} project; hosts={min(len(hosts), 3)}{'+' if len(hosts) > 3 else ''}; hosts with a config={min(len(with_config), 3)}; hosts defining key={min(len(defining), 3)}; own config file={'yes' if own_files else 'no'}"
        cases[label] += 1
        examples.setdefault(label, (p['path'], r['collection'], r['key'], hosts[:4]))
total = sum(cases.values())
print('reads:', total)
for k, v in cases.most_common():
    print(v, k, examples.get(k, ''))
