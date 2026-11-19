# packages/explorer/src/client/history/moment-files.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/history/moment-files.ts
- Generated At: 2026-11-19T04:30:00.000Z

## Authored
### Purpose
Turn a moment of the history into what the 2D Local Map would draw of it at file level: the moment's graph in the shape the 2D map's builder takes, the directories that hold its files, and one line per pair of files each way with the pair's count of references, between the cards' node-level hubs as an opened directory's pair lines are.

### Notes
Groundwork, 2026-11-19, for the owner's request in [Turn 34 of the November 18 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-34) that the 2D Local Map explore the history in the same control as the 3D map, its state continuous between them. This is the first of three rungs the root set out: file level, which is all the history carries (files, directories, a count per directed pair of files, each file's symbol count, no symbol's name); symbol rows as they were, which needs the history to carry symbols; and the words of that day. Nothing draws this yet: the 2D map still shows only today, and the history control still belongs to the 3D map. The graph is `snapshotGraphOf`'s, the very one the 3D map draws, so that the two maps cannot disagree about a moment.

## Generated
