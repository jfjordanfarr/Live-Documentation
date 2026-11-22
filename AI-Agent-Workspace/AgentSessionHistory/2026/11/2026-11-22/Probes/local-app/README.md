# Can a page on disk behave like an app?

Historical evidence, made on November 22, 2026 by a builder for the root on the day branch at `8bc5736cd`. It changed no product code. The page, [`probe.html`](probe.html), is for you to open on a Windows machine of your own; this file says what to click and what each answer would mean.

## Why

The product is to arrive as one HTML file you open from disk: it scans a folder you pick, shows the map, and saves a copy of itself. On November 21 you turned down an installed web app as the way to get there ([Turn 12](../../../2026-11-21/2026-11-21.1.record.md#turn-12)): "I definitely don't like the idea that re-launching Live Documentation _like an app_ actually causes it to reach out to a URL. That is no better than an old-school browser bookmark."; "I was hoping that a local copy could be launched like an app." Earlier that day you asked for a button that updates every scanned folder still reachable ([Turn 6](../../../2026-11-21/2026-11-21.1.record.md#turn-6)): "That would make the documentation very live indeed!" The root answered from what it remembered of Chromium, and said it had tested none of it. Only a person can test it, because no automation can press a folder picker.

## The five questions

1. Does a page opened from disk get a window and a taskbar icon of its own when a shortcut starts Edge or Chrome in app mode on the file?
2. Does a page opened from disk remember a folder between launches? The page keeps the folder's handle in IndexedDB. On the next launch it asks `queryPermission` what state the folder is in. A press then calls `requestPermission`, and the page sees whether the folder comes back without being picked again.
3. Does a second copy of the same file, at another path, see the first copy's storage (IndexedDB, localStorage)? In other words, do all files opened from disk share one storage, or does each path get its own?
4. How long does the browser take to list a large picked folder lazily, folder by folder? The trial page of November 21 took 65 to 71 s to hand over a 103,329-file folder through the older folder input. The lazy walk through a picked folder has never been timed.
5. Can the page save a file where you choose (the save picker)? And does a file Windows marks as downloaded from the internet behave any differently when opened?

## The steps, about five minutes

Do these in Edge. Then, if you have time, repeat steps 2 to 6 in Chrome; Chrome keeps storage of its own, so its first launch starts fresh.

1. **Get the file.** Put `probe.html` in a folder of its own, for example `Downloads\probe-a\`. If you downloaded it, it is probably marked. To check, run `Get-Item .\probe.html -Stream Zone.Identifier` in PowerShell (an error means it is not marked), or look for an Unblock box under Properties. Double-click the file. At the top it should say *This page was opened from a file on disk*. In section 5, answer whether this copy is marked.
2. **List a large folder (question 4).** In section 4, press *Pick a folder* and choose a big one, such as your clone with its packages. When Edge asks, let the page view the folder. While it works it shows *Listing Files... (count)*, and when it finishes it shows the count and the time. If you also want the older folder input timed, use *The older way* with the same folder. Its time includes your own clicks and the browser's "upload" question, so read it only roughly.
3. **Save a copy (question 5).** In section 5, press *Save a copy of this page* and save it into a different folder, for example `Documents\probe-b\`. It should say where it went. Check that copy's mark the same way as in step 1.
4. **Close and reopen (question 2).** Close every Edge window. If Edge keeps running in the background (startup boost or background apps), it is enough that every window is closed; note in your reply that it may still have been running. Double-click `probe.html` in `probe-a` again. Section 2 now gives the answer. If it says Edge asks before giving the folder back, press *Ask for them again*, see whether Edge asks you, and read the section again. If Edge offers "Allow on every visit", choose it, then close and reopen once more.
5. **The shortcut (question 1).** In section 1, press *Copy for Edge*. Right-click the desktop, choose New, then Shortcut, paste, and finish. Close the page, then open the shortcut. It worked if the page opens with no address bar and with a taskbar icon of its own, apart from Edge's. Section 1 then says *This page is in a window of its own*. Tick what you saw. Section 2 now also tells you whether the app window remembers the folder. If Windows cannot find `msedge.exe`, change `Program Files (x86)` to `Program Files` in the target. For a per-user install of Chrome, the program is under `%LOCALAPPDATA%\Google\Chrome\Application\`.
6. **The second copy (question 3).** Double-click the saved copy in `probe-b`. Section 3 says whether it sees the first copy's mark. In section 5, answer whether this copy is marked, and see whether anything else on its page differs from the first copy's.
7. **Bring the results back.** In *Results*, press *Copy the results*. The lines leave out folder and file names unless you tick the box; at work, keep the box clear or do not paste them anywhere. *Start over* forgets everything the page kept in this browser.

## What each answer would mean for the product

| Question | If yes | If no |
| --- | --- | --- |
| 1. Own window and own icon | The "app" is a shortcut that runs the browser in app mode on the local file. It never reaches out to a URL. We can generate the shortcut's target the way this page does. | It stays a page in a tab: the file, or a shortcut or bookmark to it. Launching it like an app would need something more: an installed web app, which you turned down, or a wrapper such as Electron, which root advised against that day (installers, code signing, a shipped browser of over 100 MB) and you have not asked for. |
| 2. Folder kept and given back without asking | *Update all* can run on launch, or at one press, with no picker. | If it asks again at one press for all folders, *Update all* is one press and one permission prompt. If it needs a press for each folder (the page reports "needs another press"), *Update all* becomes one press per folder. If it had forgotten, *Update all* must ask you to pick each folder again, and the remembered list is a list of names, not of handles. |
| 3. A second copy sees the first copy's storage | Every file opened from disk shares one storage per browser profile. Anything the product keeps (folders, preferences) is visible to every copy and every other local HTML file, so it must carry its own name and must not trust what it finds there. Two versions of the product side by side would also share it. | Each copy keeps to itself. A copy saved elsewhere starts with nothing remembered, and moving the file loses its folders. |
| 4. Time to list | This sets the wording and pacing of "Listing Files... (count)". If the lazy walk is much faster than the older input's 65 to 71 s, the product walks lazily and can leave package folders out before entering them. | Listing is the long wait, and the leave-out rules must be applied while walking. |
| 5. Save picker, and a marked file | The page can save a copy of itself, or a map, where you choose. If a marked copy behaves no differently, downloading the file is no barrier. | Saving falls back to a download into the Downloads folder. If a marked copy is blocked or limited, the guidance must say to unblock it. |

## What automation tested here

[`check.mjs`](check.mjs) ran in headless Chromium 149 (Playwright, Linux) through the browser lane, and all 22 checks held:

- The page opens from a `file://` address with no console error, warning or page error, and makes no request other than its own file. Its policy is `default-src 'none'` with hashed inline script and style, so it cannot fetch anything. `node check.mjs seal` rewrites the hashes after an edit.
- It says it was opened from a file on disk. It offers an Edge target of the form `"…\msedge.exe" --app="file:///…/probe.html"`.
- Its marks persist across two launches of one profile: the second launch counts as launch 2.
- A copy at another path, opened in the same profile, sees the first copy's mark, so the two share one storage. localStorage and IndexedDB agree. A fresh profile opening that copy sees only itself, so the mark belongs to the browser profile and not to the file. All of this is in headless Chromium on Linux. Whether Edge on Windows does the same is the person's question 3.
- The older folder input counts a folder of known shape: 153 files in 30 folders. The lazy walk counts the same shape, shows *Listing Files... (n)* as it goes, and finishes with the same count. Two things stood in for real folders here:
  - Headless Chromium offers `showDirectoryPicker` but aborts it at once, and Playwright cannot intercept it.
  - The browser's private file system, whose handles are real, refuses a page on disk with a `SecurityError`.

  So the walk was handed an in-memory folder that answers as a handle does. That stand-in cannot be stored in IndexedDB, and the page then says so (*would not let this page keep the folder*); the pictures show that state. The page never claims to have remembered a folder it failed to keep.
- The save button writes a copy of the page whose script and style are unchanged. That saved copy opens from disk under its own policy, with no error. The save picker itself was a stand-in.
- The copied results leave out folder and file names unless the box is ticked. Copying reports *Copied.*
- There is no sideways scroll at 390 px.

## What only you can do

Everything with a real folder picker, permission prompt, save dialog, shortcut, taskbar, Windows mark or a real large folder. That is each of the five answers on Edge and Chrome on Windows:

- whether an app-mode window gets its own icon;
- what `queryPermission` says after a real restart, and whether one press gives several folders back;
- whether Edge's storage for files opened from disk behaves as headless Chromium's does;
- the time of a lazy walk over 100,000 files;
- whether the save picker and marked files behave.

## The files

| File | What it is |
| --- | --- |
| [`probe.html`](probe.html) | The probe page: one file, nothing fetched, nothing sent |
| [`check.mjs`](check.mjs) | `node <this file> seal` after an edit; `node scripts/browser-lane.mjs --label <who> -- node <this file> check <scratch folder>` to run the checks |
| [`probe-desktop.png`](probe-desktop.png), [`probe-narrow.png`](probe-narrow.png) | The page at 1280 and 390 px wide on the second copy's first launch, with the stand-ins' results |
