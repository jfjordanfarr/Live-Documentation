// Maps bundle positions (line:column, 1-based line, 0-based column as the trace gives them) back to the source.
const path = require('node:path');
const root = '/workspaces/Live-Documentation/.claude/worktrees/agent-a2e1671885ba40563';
const { SourceMapConsumer } = require(path.join(root, 'node_modules/source-map-js'));
const map = new SourceMapConsumer(JSON.parse(require('node:fs').readFileSync(path.join(root, 'dist/explorer/static/index.js.map'), 'utf8')));
for (const arg of process.argv.slice(2)) {
  const [line, column] = arg.split(':').map(Number);
  const at = map.originalPositionFor({ line, column });
  console.log(arg, '→', `${(at.source ?? '').split('/').slice(-3).join('/')}:${at.line}:${at.column} ${at.name ?? ''}`);
}
