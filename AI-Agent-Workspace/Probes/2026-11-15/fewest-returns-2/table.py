"""The table the root asked for: per changed picture, the least return cost at which it leaves the greedy order (path
candidates, and with candidates that return no more than greedy), beside the lab's signals of the fewest-returns
picture against the greedy one (first milestone, captured from the page)."""
import json
import re
import sys

costs = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20]


def states(path):
    out = {}
    for line in open(path):
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if len(cells) != len(costs) + 1 or cells[0] in ('picture',) or cells[0].startswith('more') or cells[0].startswith('greedy'):
            continue
        out[cells[0]] = cells[1:]
    return out


def leaves(row):
    for cost, state in zip(costs, row):
        if state != 'G':
            return f"{cost:g}" + ('' if state == 'F' else f" ({state})")
    return '>20'


path_states = states('fine.md')
mono_states = states('fine-monotone.md')
lab = {}
for line in open(sys.argv[1]):
    cells = [c.strip() for c in line.strip().strip('|').split('|')]
    if not cells[0].startswith('repository/') or cells[0] in ('repository/five files', 'repository/chain'):
        continue
    name = cells[0].split('/')[-1]

    def pct(cell):
        if '→' not in cell:
            return '0%'
        b, a = [float(x) for x in cell.split('→')]
        return f"{100 * (a / b - 1):+.0f}%" if b else f"{b:g}→{a:g}"

    lab[name] = dict(length=pct(cells[3]), crossings=cells[4].replace(' ', ''), width=pct(cells[6]), height=pct(cells[7]))
readings = json.load(open('readings.json')) if len(sys.argv) > 2 else {}
print('| picture | leaves greedy at (path) | (no more returns) | wire | crossings | width | height | reading |')
print('| --- | --- | --- | --- | --- | --- | --- | --- |')
for name, row in path_states.items():
    key = name if name != 'localView/' else None
    l = lab.get(name, {})
    print(f"| {name} | {leaves(row)} | {leaves(mono_states.get(name, row))} | {l.get('length', '')} | {l.get('crossings', '')} | {l.get('width', '')} | {l.get('height', '')} | {readings.get(name, '')} |")
