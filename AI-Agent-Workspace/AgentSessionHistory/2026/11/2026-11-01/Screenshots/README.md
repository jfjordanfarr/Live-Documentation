# November 1 — Astra's end-user review

Historical review of the Explorer rebuilt from `6e613339`, following the owner's [request](../../ChatHistory/2026/11/2026-11-01.1.record.md#turn-1). These are firsthand observations and recommendations, not accepted implementation decisions. No product code was changed.

**My judgment:** discovery is a useful advance, but the Explorer still asks the person to manage too much of the view before it explains the software. The most consequential problems are keeping a discovered place, investigating the past, and getting an intelligible first picture. The renderer and controls have improved more than those journeys.

## What I used

I read all **27 October non-summary records in full**, then used the rebuilt repository, estate and pinned T3 sample. Main contains **910 files and every one of the 694 commits**, from October 16, 2025 through November 1, 2026. The estate has 36 files. T3 was rebuilt from its existing canonical docs with the current client: 28,145 files, 81,634 file-pair edges and 51 linked documents; no T3 history was generated.

I used ordinary search, inspection, pinning, directory Open, both Local Map representations, Connections and Structure, orbit, zoom, Fit, the reader, Knowledge Sources, and history playback/scrubbing. The full-root history played from step 0 through 693, with closer investigation around the January GraphStore removal. I compared all three history emphasis treatments at one settled step.

The integrated GPU browser was 1065×530. A separate fresh Chromium context used 1600×1000 and 1280×800. The smaller embedded viewport is a demanding case; desktop and laptop captures distinguish general problems from that constraint. No mobile or cross-browser compatibility claim is made. The headless journeys collected no page or console errors. This is a visual/interaction review, not a performance benchmark or a new full regression-suite run.

## The problems I would prioritize

### 1. History lets me watch a system I cannot properly investigate

At step 197, January 9, 2026, GraphStore still exists. Searching `graphStore` says **Nothing found**. Advancing one step reports 58 deleted files, including its implementation and tests. The displayed past and the search's available subjects disagree.

[The failed search in the historical graph](18-history-search-deleted-file.png).

I also expanded Deleted. It contains the right names, but they are plain, noninteractive entries. I cannot use that list to step into the removed subsystem. This is where I most wanted help: identify the old hub, hold it in view, and understand what its removal disconnected.

**Priority:** historical discovery, search and retained exploration must address the displayed moment. A missing historical document can be stated honestly; it should not make a known historical file undiscoverable.

### 2. Reading and discovery pull in opposite directions

Searching for the generator gives a useful neighborhood of **124 files**. Clicking its neighbor core opens the reader and grows the picture to **168**. The panel covers much of the newly relevant area. Closing it reduces the picture to 124 again.

Compare [the generator arrival](03-generator-arrival-small.png), [inspection in the embedded view](04-inspection-grows-behind-reader.png), and [the same conflict at desktop size](24-discovery-reader-desktop.png).

Pin, then Close, successfully keeps the new exploration. That is a working recovery, but it requires an extra retention operation whenever I want to read something and then look at what I discovered. I dislike that default experience. Closing a document feels like dismissing a panel; the graph treats it as withdrawing part of my question.

This criticizes how the approved rules combine in practice; it does not claim inspection was supposed to pin silently. I would revisit the lifetime of discovered context and the reader's relationship to the visible neighborhood together.

### 3. Ordinary directory navigation still produces a bad 2D arrival

At **1280×800**, opening Portal in the estate sends most of the directory beyond the right edge and leaves the canvas largely blank. Reset Zoom then fits the same directory at reading size. The content fits; the initial arrival is the problem.

[Open Portal](27-estate-portal-laptop.png) → [Reset Zoom](29-estate-portal-reset-laptop.png).

The repository's [root at 1600×1000](06-root-2d-desktop.png) has a separate problem: widely staggered columns leave a large empty center and push ordinary navigation below the viewport. It looks unfinished and makes basic folder browsing unnecessarily spatial.

**Priority:** a normal Open should give the useful framing Reset already knows how to produce. Root layout should use its space to present choices.

### 4. Two hops is a distance, not a useful amount of information

The current T3 start is **9,341 files**, displayed as an almost white knot. It provides little help in choosing where to begin. A startup inspection request was deferred before completing; I did not measure an exact startup time or establish a permanent lockup.

[T3's default start](26-t3-discovery-start.png).

Searching `delegate_task` still finds nothing. I then used **OrchestratorMcpService**, a name learned from the October record rather than discovered in this map. That produces **441 files**. Changing the public Hops Shown control to one produces **33**, with substantially more legible names and relationships.

[Known service, two hops](28-t3-known-service.png) → [the same service, one hop](30-t3-one-hop-service.png).

This is strong evidence for discovery's value and the remaining first-arrival problem. The person should not need prior source knowledge and a tuning session to reach the useful picture. Judge the next start/scope policy by useful context and an honest frontier, including high-degree hubs, rather than assume a fixed hop count generalizes. Input responded promptly at this point; this is not a repeat of the old claim that the whole T3 view cannot respond.

### 5. The full timeline needs better navigation and framing

Opening the root, going to the beginning and pressing Play lets the growing picture extend far outside its initial camera frame. During the first full traversal I ended up inside the web. Fit recovers an overview, but that is intervention the playback does not make apparent.

[December during playback](31-history-playback-outgrows-frame.png) and [the final moment after Fit](10-history-end-after-fit.png) are different moments, not a controlled before/after geometry comparison.

The date axis spends much of its width on the development gap while packing the recent active period into a small area. At the embedded size its visible labels end at September although the selected date is in November. By-step is available in Tuning; it helps distribution but does not replace selecting a useful range or finding a particular commit.

I want to investigate an event and move around it deliberately. The current experience favors watching an entire sequence or carefully stepping with the keyboard. Range navigation, a direct commit/date destination, and an explicit way to keep a whole-history overview framed deserve consideration. Automatic camera movement must still yield to a person's navigation.

### 6. Change emphasis attracts attention without reliably explaining the change

The January 12 GraphStore removal is informative: the giant central star breaks apart. The panel reports **58 deleted files and 824 removed wires**.

[Before](11-before-graphstore-removal.png) → [after one step](13-graphstore-removal-glow.png) → [step details](14-graphstore-removal-details.png).

With details hidden, changed survivors become pale, deleted files disappear, and I cannot readily name the missing hub. The spectacle is more legible than its explanation. The latest discovery commit repeats the naming problem: the panel lists six created files, while [the spatial view labels many unrelated fixture files](32-latest-work-in-full-history.png). That capture is a live settling picture, not final geometry.

At the same settled January step, my preference is **Dim the rest**:

| Treatment | My reading |
| --- | --- |
| [Glow](20-history-glow.png) | Makes affected objects pale and weakens their ordinary colour identity. |
| [Dim](21-history-dim.png) | Quieter; preserves familiar file colours. My preferred starting treatment. |
| [Both](22-history-both.png) | Stronger separation, but retains washed-out identities. |

A different emphasis default alone would not solve this. Changed identities need to remain readable, and removals need an understandable before/after relationship. I would prioritize those over stronger glow.

### 7. Structure's largest folders still obscure the structure

[The repository start](08-structure-start.png) is dominated by large orange ancestor spheres representing recursively contained files. Only a small part of those contents is shown. The hierarchy's junctions become obstacles over their members.

The [smaller estate after orbit and zoom](19-estate-structure-orbited.png) is easier to read. This reinforces finishing the discussed uniform-folder/label treatment and judging it through navigation, rather than merely reducing the displayed node count.

### 8. Names, evidence and scope still lose the competition for attention

The [initial repository 3D picture](07-discovery-start-desktop.png) names plenty of files at desktop size, but does not make its chosen starting subjects obvious. In the historical graph, peripheral configuration and fixture names get readable space while the central structural event remains unnamed. The footer knows the shown count, but at the embedded size it is below the sidebar's scroll.

The reader's new section order is better. Its content still exposes distracting artifacts: core's Purpose ends with a long literal bracketed archive path, and its dependencies repeat full paths beside lowercase `symbol-...` slugs. [Reader evidence](24-discovery-reader-desktop.png). Collapsed history groups have little visual indication that their headers are clickable; I initially read Deleted 58 as a count without a list, then discovered the header opens it.

These are smaller than the history/scope problems, but matter to everyday use. Directory cards' subdued text also looks disabled despite being the primary way forward.

## What is substantially better

- **Search ranking:** the generator filename is first for “generator.”
- **Path recovery:** the reverse-direction explanation is visible in 3D, its action works, and [the resulting two-file path](09-two-file-path-small.png) is easy to identify. This repairs a real obstruction from October 23.
- **History controls:** hiding details leaves the timeline available, and speed is beside Play. Created/Deleted is clear. The January structural break is a compelling use of this software.
- **Recovery and retention:** Fit, Reset Zoom and the pin tray provide real recovery; Pin then Close preserves the inspected neighborhood.
- **Inventory:** [Knowledge Sources](25-knowledge-sources.png) and the sidebar agree at 4,850 references, explain scope, and show the full 694-commit span.
- **Small 3D neighborhoods:** the estate and the 33-file T3 slice are usable. Discovery gives the renderer a more useful everyday workload.
- **The authored overview:** [the repository World Map](05-fresh-world-map.png) remains an immediately recognizable account of the project. Its authored structure does not establish that an unfamiliar computed map explains itself.

I would first fix historical discoverability and ordinary arrival framing, then reconcile inspection with retained discovery. Next I would make history's changed identities and time navigation useful, and test a start/scope policy against the estate, this repository and T3. Further tuning should follow those concrete journeys.

## Reopen the rebuilt work

The current task serves port 8900 while its terminal remains alive. To rebuild every mainline commit and host on your own terminal's port 8080:

```bash
npm run build && npm run live-docs:history -- --step commit --jobs 3 && npm run live-docs:visualize -- --history all && npx --offline http-server dist/explorer -p 8080 -c-1
```

[Open the whole-root history at the discovery commit](http://localhost:8080/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqARgAYn4BLAFwFMK7DIATABZ4AI0xUAJnygCAHPAAWXNgHNFHAMKoAzhygBWeBR6iAThK4BRMFypUuOnbOOmLDgMpsK%2BBG3ScAJ6yLPBmqADuADJctggOTrIAvvAAZqhm6Fw0FviKRH5UANYykABsrMSKmGaqXFAV8CQIfjpsqLT0kEbEqGS%2BbFSqjPBUqJJcXgBe9ZAiIDqBFKKkHlgIswzwqhZgQVBMAHRMAj3o1bVcAEoSdQfwBPjhAB7emBztVAeHcIiDRR4OGY7KoOPlIEcev1JO9rA5asFIFsQNwwVwzN8Tk1OFxJAAhQIABTILRGf2KAHU2JIwWSxhMAFqoVAUK6ONh6CRZb6-CJsYFMllstqcqjciGHACcSlQ%2BGcgjCsS42AAYhYTPKKkkUiAMZBUtgdFx4AArKAGhBG%2BCoKAAbRAtoAOiBJPyuOgOBlAs7YM7nQBdED%2B%2BAARygIGgkhA8CjkHtQaU4bkBnEZQYktSTFSZQEAkl6Dkkq40C4kvEwgMDAA7NBMFw5JhkwYhEx0NAQEkgA). This selects step 691 in the full 694-commit bundle. Home on the timeline returns to the beginning. [Estate](http://localhost:8080/samples/estate/) and [current T3](http://localhost:8080/samples/t3-code/) use the samples rebuilt during this review; the command above rebuilds main, not those samples.

## Capture inventory

All retained PNGs are unedited browser captures personally viewed by the reviewer. Number gaps are discarded intermediate or redundant pictures. The links above describe the evidence; this inventory names every retained file.

| Capture | Conditions |
| --- | --- |
| [03](03-generator-arrival-small.png) | Generator selected, Connections, 1065×530; 124 files. |
| [04](04-inspection-grows-behind-reader.png) | Core inspected from that neighborhood; 168 files. |
| [05](05-fresh-world-map.png) | Fresh storage, World Map, 1600×1000. |
| [06](06-root-2d-desktop.png) | Local Map from that arrival, 1600×1000. |
| [07](07-discovery-start-desktop.png) | Connections start, 187 of 909 eligible files, 1600×1000. |
| [08](08-structure-start.png) | Structure start, recursive folder sizes, 1600×1000. |
| [09](09-two-file-path-small.png) | Generator/document reverse recovery, 1065×530. |
| [10](10-history-end-after-fit.png) | Complete playback reached 693; Fit invoked, 1600×1000. |
| [11](11-before-graphstore-removal.png) | Root open, step 197, Fit, details hidden. |
| [13](13-graphstore-removal-glow.png) | One ArrowRight to 198; early post-change picture. |
| [14](14-graphstore-removal-details.png) | Step 198, details visible; Deleted still collapsed. |
| [18](18-history-search-deleted-file.png) | Back to 197, search graphStore. |
| [19](19-estate-structure-orbited.png) | Portal open, Structure, orbit/zoom, 1065×530. |
| [20](20-history-glow.png) | Step 198 settled, Glow. |
| [21](21-history-dim.png) | Same settled step/camera, Dim. |
| [22](22-history-both.png) | Same settled step/camera, Both. |
| [24](24-discovery-reader-desktop.png) | Generator retained, core inspected, 1600×1000. |
| [25](25-knowledge-sources.png) | Repository inventory, 1600×1000. |
| [26](26-t3-discovery-start.png) | Rebuilt T3 Connections start, two hops, 1065×530. |
| [27](27-estate-portal-laptop.png) | Open Portal in 2D, 1280×800, before recovery. |
| [28](28-t3-known-service.png) | Known MCP service, two hops, 441 files. |
| [29](29-estate-portal-reset-laptop.png) | Same Portal after Reset Zoom, 1280×800. |
| [30](30-t3-one-hop-service.png) | Same MCP service, one hop and Fit, 33 files. |
| [31](31-history-playback-outgrows-frame.png) | First full-root playback, step 101, December 2, 2025; 8 steps/s. |
| [32](32-latest-work-in-full-history.png) | Full root at 691, Glow, details open; still moving. |
