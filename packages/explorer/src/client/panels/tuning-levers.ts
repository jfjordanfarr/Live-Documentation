/**
 * What each tuning control does, in one short sentence: the one source of the help the Tuning block gives. The panel
 * writes each sentence into its control's `title`, for a pointer, and into a visually hidden element the control names
 * by `aria-describedby`, for a screen reader (`describeTuningControls` in `tuning.ts`). No sentence is drawn on screen:
 * text we author there is the last resort, and a control explains itself by its tooltip (the owner, 2026-10-30).
 *
 * Each sentence says what changing the control does to the picture, read from the code that uses the setting, not how
 * the code does it. The keys are the controls' element ids in `template.html`; a unit test holds the two to each other.
 *
 * Pure-function module: no DOM.
 *
 * @module tuning-levers
 */

/** One short sentence per tuning control, keyed by the control's element id. */
export const TUNING_HELP: Readonly<Record<string, string>> = {
  // 2D wires: the curve every wire between two pins follows (`curveTo` in branch-routing.ts).
  "tuning-stub-factor":               "Higher keeps a wire level for longer as it leaves and enters its pins.",
  "tuning-stub-min":                  "The least distance a wire runs level from its pin before it bends.",
  "tuning-stub-max-offset":           "Higher makes wires across narrow gaps bend sooner.",
  "tuning-vertical-offset":           "Higher makes a wire leave its pin already leaning toward its partner.",

  // 2D layout: the scene's geometry (branch-scene.ts), the price of each picture (branch-restarts.ts) and the search.
  "tuning-column-gap":                "Widens or narrows the space between columns of cards.",
  "tuning-membrane-evenness":         "Higher evens a directory's outline toward a rectangle; zero lets it follow its files.",
  "tuning-item-gap":                  "The least space between cards, and between wire lanes, in a column.",
  "tuning-band-gap":                  "The least space between neighbouring directories' outlines.",
  "tuning-height-cost":               "Higher prefers a shorter picture over shorter wires.",
  "tuning-membrane-simplicity":       "Higher prefers directory outlines with fewer steps; zero has no preference.",
  "tuning-row-levelness":             "Higher stands a directory's cards in level rows; zero lets each stand where its wires are shortest.",
  "tuning-hover-dim-symbols":         "How visible symbols and cards unrelated to the hovered symbol stay; lower is fainter.",
  "tuning-hover-dim-connections":     "How visible wires unrelated to the hovered symbol stay; lower is fainter.",
  "tuning-lace-reach":                "How far a lace of a symbol used on its own card sweeps beyond the card's edge.",
  "tuning-lace-curl":                 "How far along the card's edge, toward its partner, a lace comes back.",
  "tuning-lace-width":                "How wide a lace is where it leaves its pin.",
  "tuning-self-loop-taper":           "How much a lace thins toward the card's edge: zero keeps its width, one ends in a hairline.",
  "tuning-symbol-order":              "Orders a card's symbols by where their wires lead, alphabetically, or as the file lists them.",
  "tuning-move-ms":                   "How long the picture takes to move to a new arrangement; zero jumps.",
  "tuning-hold-still":                "Which card stays put on screen while the picture moves around it.",
  "tuning-order-starts":              "More tries before the first picture may find a better one, and draw it later.",
  "tuning-search-starts":             "How many more arrangements are tried, one at a time while idle, after the picture is drawn; zero stops the search.",
  "tuning-search-patience":           "How many tries in a row may fail to improve the picture before the search rests.",
  "tuning-churn-cost":                "How much better a found picture must be before the cards on screen move to it; zero moves to any better one.",

  // 3D forces: the field and its motion (forceGraphPhysics.ts, forceGraphLayout.ts).
  "tuning-force-charge":              "How strongly spheres push one another apart.",
  "tuning-force-link-strength":       "How strongly connected spheres pull toward their preferred gap; zero turns the pull off.",
  "tuning-force-gravity":             "How strongly spheres are drawn to the centre, so that clusters pushed apart come back.",
  "tuning-force-tether":              "How strongly spheres hold to where they stood when the picture began to move; more keeps your bearings.",
  "tuning-force-cited-by-pull":       "How strongly a citing document and the file it cites pull together; zero draws the line and moves nothing.",
  "tuning-force-charge-range":        "How far a sphere's push reaches; zero reaches every sphere.",
  "tuning-force-update-energy":       "How hard a change to what is shown moves the picture; zero places new spheres and moves nothing.",
  "tuning-force-approximation":       "Higher keeps large pictures quick to move and less exact; zero is exact.",

  // 3D spacing: the gaps the springs and the overlaps keep (`spatialLinkDistance` in forceGraphLayout.ts).
  "tuning-force-link-gap":            "The space kept between two files joined by one reference.",
  "tuning-force-coupling":            "How much closer files with more references between them stand.",
  "tuning-force-collision-gap":       "The least space kept between any two spheres.",

  // 3D appearance: the spheres' and wires' sizes (forceGraphLayout.ts, forceGraphSizing.ts, forceGraphView.ts).
  "tuning-force-node-size":           "The size of every sphere, as that of a file with no public symbols.",
  "tuning-force-symbol-scale":        "How much a sphere grows with its public symbols; zero makes every file the same size.",
  "tuning-force-link-width":          "How thick wires are; wires carrying more references stay thicker.",
  "tuning-force-node-zoom-resistance": "How much spheres keep their size on screen as you zoom: zero scales them with the view, one holds them.",
  "tuning-force-wire-zoom-resistance": "How much wires keep their width on screen as you zoom: zero scales them with the view, one holds them.",

  // History: the scrubber (history/tick-model.ts, history/history-control.ts).
  "tuning-history-axis":              "Lays the scrubber's steps out by date, where a quiet stretch shows as a gap, or evenly by step.",
  "tuning-history-granularity":       "Which ticks the scrubber draws and the step key moves between; automatic chooses by the number of steps.",
  "tuning-history-play-rate":         "How many steps play passes in a second."
};

/** The id of the visually hidden element that carries a control's sentence. */
export const tuningHelpId = (controlId: string): string => `${controlId}-help`;
