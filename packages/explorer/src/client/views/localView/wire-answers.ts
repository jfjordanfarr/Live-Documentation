/**
 * Wire Answers (Tuning's 2D Wires; a trial of 2026-11-21, on by default since 2026-11-22), on strangers' top-ranked
 * stumble: which way a line runs, and what it carries. With it on, every 2D wire, ordinary and gathered, and a bundle's shared run, answers
 * a pointer that rests on it, a press and the keyboard's focus. It stands out only by the others fading, as a returning
 * connection's lace makes it stand out (`lightConnections`): its own rows and its two cards keep their look, and nothing
 * is raised above rest. Its words (wire-words.ts) stand beside it in the World Map wire panel's form, so that one thing
 * is learned at both scales: a rested pointer shows them and they go when it leaves; a press pins them, with a close
 * control, until a press elsewhere or Escape. A pointer that only passes over draws nothing (`pointerRest.ts`, the
 * product's one rule of hover intent). A drag begun on a wire still pans the map: the wire's band takes the pointer
 * only to be found, and passes every press on to the map's own pan.
 *
 * The words can be entered (2026-11-22, the owner: "the ability to mouse into those popovers so I can copy some text
 * out"; WCAG 2.1, 1.4.13 Content on Hover or Focus). *Hoverable*: the panel takes the pointer, and the words stay while
 * the pointer is on the panel or on its way there from the point they were asked at (`onTheWay`), so no gap drops them;
 * their text can be selected and copied, and a press in the panel neither pans the map nor lets go of anything.
 * *Dismissible*: Escape takes a rested pointer's words away without the pointer moving, and they do not come back until
 * the pointer has been elsewhere. *Persistent*: nothing but the pointer's leaving, Escape or the wire's own going takes
 * them away; no clock does.
 *
 * The wire's band is drawn by connections.ts, an undrawn stroke as wide as twelve of the screen's pixels or the wire,
 * whichever is wider, over the wire, which takes the pointer, the focus (not a stop of Tab: `tabindex="-1"`) and the
 * wire's spoken name, the same sentence as its words.
 *
 * The keyboard: from a focused card, the right arrow goes to the first wire leaving it on the right (to what uses it),
 * the left arrow to the first entering it on the left (what it uses); on a wire, up and down go to the card's next and
 * previous wire on that side, right and left go on to the card at that end, Enter or Space pins its words, and Escape
 * lets go of a pin, then goes back to the card the walk came from.
 *
 * @module wire-answers
 */

import { CLOSE_ICON, iconButton } from "../../panels/icon-button";
import { NO_REST, onTheWay, restAt, restedOn, restsAt, type PointerRest } from "../pointerRest";
import { panelBeside, type Avoid } from "../worldMap/layout";
import { clearSymbolHighlightDOM, lightConnections } from "./symbol-highlight";
import type { LocalEdge } from "./types";
import { headText, listText, referencesText, sentence, type WireWords } from "./wire-words";

/** What a wire's band answers with: its words, and the references it carries, which a rest or a press keeps lit. */
export interface WireAnswer {
  words: WireWords;
  carries: readonly LocalEdge[];
}

/** The class that marks a highlight as the wire answers' own; the highlight's clearing takes it off (symbol-highlight.ts). */
export const WIRE_LIT = "wire-lit";

/** How far a press may travel and still be a press (the 2D map's slop, controller.ts). */
const PRESS_SLOP = 6;

const answers = new WeakMap<Element, WireAnswer>();

/** Gives a wire's band its answer, and its spoken name the same sentence, written only when it changes. */
export function setAnswer(band: SVGElement, answer: WireAnswer): void {
  answers.set(band, answer);
  const name = sentence(answer.words);
  if (band.getAttribute("aria-label") !== name) band.setAttribute("aria-label", name);
}

/** The answer a band carries; undefined for anything else. */
export function answerOf(element: Element): WireAnswer | undefined {
  return answers.get(element);
}

/** The point where the words were asked for, in the map's own units, so that they move with the picture. */
interface Anchor {
  x: number;
  y: number;
}

/** What the wire answers need of the 2D map: its view and layers, the camera's scale, and whether they are on. */
export interface WireAnswersHost {
  /** The map's view, which holds the panel and takes the pointer: `#view-map`. */
  view: HTMLElement;
  /** The layer the camera transforms, holding the cards and the wires. */
  layer: () => HTMLElement | null;
  container: HTMLElement;
  overlay: HTMLElement;
  scale: () => number;
  enabled: () => boolean;
  dragging: () => boolean;
}

/** The wires' answers on one 2D map: the panel, and the pointer, the press and the keyboard that ask for it. */
export class WireAnswers {
  readonly panel: HTMLDivElement;
  private rest: PointerRest = NO_REST;
  private restTimer = 0;
  private touched: SVGElement | null = null;
  private touchedAt: { x: number; y: number } | null = null;
  /**
   * The band whose words stand, rested on, focused or pinned, where they were asked for, and where the panel stands from
   * that point on the screen, chosen once so that it keeps its side as the picture moves.
   */
  private shown: { band: SVGElement; anchor: Anchor; pinned: boolean; offset: { x: number; y: number } | null } | null = null;
  private press: { pointerId: number; x: number; y: number; band: SVGElement | null } | null = null;
  /** The card a keyboard's walk along wires began from, to which Escape returns. */
  private walkFrom: HTMLElement | null = null;
  /** A press that began in the panel and is still held: a selection of its text, dragged wherever, keeps the words. */
  private pressInPanel = false;
  /** The band whose words Escape took away under a resting pointer: they stay away until the pointer has been elsewhere. */
  private dismissed: SVGElement | null = null;

  constructor(private readonly host: WireAnswersHost) {
    this.panel = document.createElement("div");
    this.panel.className = "wire-answer";
    this.panel.hidden = true;
    host.view.append(this.panel);
    const view = host.view;
    view.addEventListener("pointermove", this.pointerMove, { passive: true });
    view.addEventListener("pointerleave", this.pointerLeave);
    // A press on a wire gives it no focus, which would hold its words after the pointer left; the pan, on pointer
    // events, goes on.
    view.addEventListener("mousedown", event => { if (this.bandAt(event.target)) event.preventDefault(); });
    // A press in the panel is the panel's own, to select its words: the map's pan, which listens below it, never hears it.
    this.panel.addEventListener("pointerdown", event => event.stopPropagation());
    window.addEventListener("pointerdown", this.pointerDown, { capture: true, passive: true });
    window.addEventListener("pointerup", this.pointerUp, { capture: true, passive: true });
    window.addEventListener("pointercancel", this.pointerCancel, { capture: true, passive: true });
    view.addEventListener("focusin", this.focusIn);
    view.addEventListener("focusout", this.focusOut);
    view.addEventListener("keydown", this.keyDown);
    window.addEventListener("keydown", this.escape);
    // Before any other surface's Escape: a rested pointer's words are the surface on top.
    window.addEventListener("keydown", this.dismiss, { capture: true });
  }

  /** Whose words stand: the band, and whether a press pinned them. */
  get state(): { band: SVGElement; pinned: boolean } | null {
    return this.shown;
  }

  /** Puts the words where their wire now stands, after the camera moved; a band the drawing took away takes them with it. */
  follow(): void {
    const shown = this.shown;
    if (!shown) return;
    if (!shown.band.isConnected || !this.host.enabled()) { this.close(); return; }
    this.place(shown.anchor);
  }

  /** After a drawing of the wires: a band the drawing kept is lit again, a band it took away takes its words with it. */
  redrawn(): void {
    const shown = this.shown;
    if (!shown) return;
    const fresh = shown.band.isConnected ? shown.band : this.bandByKey(shown.band.dataset.connectionKey);
    if (!fresh || !this.host.enabled()) { this.close(); return; }
    if (fresh !== shown.band) shown.band = fresh;
    const answer = answerOf(fresh);
    if (answer) this.write(answer, shown.pinned);
    this.place(shown.anchor);
  }

  /** Lights a shown answer's wire again, after another hover, of a card crossed on the way to the panel, put its light out. */
  relight(): void {
    const shown = this.shown;
    if (!shown || this.host.container.classList.contains("symbol-hover-active")) return;
    const answer = answerOf(shown.band);
    if (answer) this.light(answer);
  }

  /** Takes the words away and puts out the wire's light, if it is still the answers' own. */
  close(): void {
    const leaving = this.shown;
    this.shown = null;
    this.panel.hidden = true;
    this.panel.replaceChildren();
    this.panel.classList.remove("pinned");
    this.panel.removeAttribute("role");
    this.panel.removeAttribute("aria-label");
    if (leaving) leaving.band.classList.remove("wire-shown");
    this.release();
  }

  private bandByKey(key: string | undefined): SVGElement | null {
    if (!key) return null;
    return [...this.host.overlay.querySelectorAll<SVGElement>(".wire-band")].find(band => band.dataset.connectionKey === key) ?? null;
  }

  private release(): void {
    const { container, overlay } = this.host;
    if (container.classList.contains(WIRE_LIT)) clearSymbolHighlightDOM(container, overlay, () => {});
  }

  private light(answer: WireAnswer): void {
    const { container, overlay } = this.host;
    lightConnections(container, overlay, answer.carries);
    container.classList.add(WIRE_LIT);
  }

  /** The map's own units at a point of the screen, by the transformed layer's box. */
  private anchorAt(clientX: number, clientY: number): Anchor {
    const rect = this.host.layer()?.getBoundingClientRect();
    const k = this.host.scale() || 1;
    return rect ? { x: (clientX - rect.left) / k, y: (clientY - rect.top) / k } : { x: clientX, y: clientY };
  }

  /** The anchor for a band asked about by the keyboard: the middle of its wire. */
  private anchorOfBand(band: SVGElement): Anchor {
    const path = band as unknown as SVGGeometryElement;
    const matrix = path.getScreenCTM?.();
    if (matrix && typeof path.getTotalLength === "function") {
      const point = path.getPointAtLength(path.getTotalLength() / 2).matrixTransform(matrix);
      return this.anchorAt(point.x, point.y);
    }
    const rect = band.getBoundingClientRect();
    return this.anchorAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  /**
   * Shows a band's words at an anchor and keeps its wire lit: a peek, or pinned with a close control. Another band's
   * words are taken away first; a band already shown is only re-placed, or pinned.
   */
  private show(band: SVGElement, anchor: Anchor, pinned: boolean): void {
    const answer = answerOf(band);
    if (!answer) return;
    const same = this.shown?.band === band;
    if (this.shown && !same) this.close();
    if (same && this.shown!.pinned && !pinned) return;
    this.shown = { band, anchor, pinned, offset: same ? this.shown!.offset : null };
    band.classList.add("wire-shown");
    this.write(answer, pinned);
    this.light(answer);
    this.place(anchor);
  }

  /** The words in the World Map wire panel's form: the head that names the two ends, then what is used and its count. */
  private write(answer: WireAnswer, pinned: boolean): void {
    const { words } = answer;
    const head = document.createElement("div");
    head.className = "head";
    const title = document.createElement("div");
    title.className = "h";
    const name = (text: string): HTMLElement => { const span = document.createElement("span"); span.className = "name"; span.textContent = text; return span; };
    title.append(name(words.subject), ` ${words.verb} `, name(listText(words.objects)));
    head.append(title);
    const used = document.createElement("div");
    used.className = "via";
    const symbols = listText(words.used);
    if (symbols) used.append(name(symbols), " · ");
    used.append(referencesText(words.references));
    this.panel.replaceChildren(head, used);
    this.panel.hidden = false;
    this.panel.classList.toggle("pinned", pinned);
    if (pinned) {
      const close = iconButton("Close", CLOSE_ICON);
      close.className = "close";
      close.title = "Close (Esc)";
      close.setAttribute("aria-keyshortcuts", "Escape");
      close.addEventListener("click", () => this.close());
      head.append(close);
      this.panel.setAttribute("role", "region");
      this.panel.setAttribute("aria-label", headText(words));
    } else {
      this.panel.removeAttribute("role");
      this.panel.removeAttribute("aria-label");
    }
  }

  /**
   * Stands the panel beside the point where its words were asked for, by the World Map's rule for a panel beside its
   * subject (`panelBeside`): of the sides of that point, the one that covers least of the cards, the wire's own two
   * cards counted four times, so that the panel does not hide the names it speaks of. The side is chosen when the words
   * first show and kept while the picture moves, inside the view.
   */
  private place(anchor: Anchor): void {
    const shown = this.shown;
    const rect = this.host.layer()?.getBoundingClientRect();
    const view = this.host.view.getBoundingClientRect();
    if (!rect || !shown) return;
    const k = this.host.scale() || 1;
    const x = rect.left + anchor.x * k - view.left, y = rect.top + anchor.y * k - view.top;
    const size = { width: this.panel.offsetWidth, height: this.panel.offsetHeight };
    if (!shown.offset) {
      const ends = new Set([shown.band.dataset.sourceId, shown.band.dataset.targetId]);
      const avoid: Avoid[] = [...this.host.container.querySelectorAll<HTMLElement>(".node-card")].flatMap(card => {
        const box = card.getBoundingClientRect();
        if (box.right < view.left || box.left > view.right || box.bottom < view.top || box.top > view.bottom) return [];
        return [{ box: { left: box.left - view.left, top: box.top - view.top, right: box.right - view.left, bottom: box.bottom - view.top }, weight: ends.has(card.dataset.id) ? 4 : 1 }];
      });
      const room = { left: 12, top: 12, right: view.width - 12, bottom: view.height - 12 };
      const at = panelBeside({ left: x - 6, top: y - 6, right: x + 6, bottom: y + 6 }, size, room, avoid);
      shown.offset = { x: at.left - x, y: at.top - y };
    }
    const clamp = (value: number, low: number, high: number): number => Math.max(low, Math.min(high, value));
    this.panel.style.left = `${clamp(x + shown.offset.x, 12, view.width - size.width - 12)}px`;
    this.panel.style.top = `${clamp(y + shown.offset.y, 12, view.height - size.height - 12)}px`;
  }

  private bandAt(target: EventTarget | null): SVGElement | null {
    return target instanceof Element ? target.closest<SVGElement>(".wire-band") : null;
  }

  /** A rest begins, goes on or ends as the pointer moves; a drag is no rest, and takes a peek away. */
  private readonly pointerMove = (event: PointerEvent): void => {
    if (!this.host.enabled()) return;
    if (this.host.dragging()) {
      window.clearTimeout(this.restTimer);
      this.rest = NO_REST;
      if (this.shown && !this.shown.pinned) this.close();
      return;
    }
    this.lookAtRest(this.bandAt(event.target), { x: event.clientX, y: event.clientY });
  };

  /**
   * Whether a rested pointer's words stay though the pointer is off their wire: it is on the panel, a press begun in the
   * panel is still held, or it is on its way to the panel from the point the words were asked at (pointerRest.ts).
   */
  private keepsWords(at: { x: number; y: number } | null): boolean {
    const shown = this.shown;
    if (!shown || shown.pinned || !at) return false;
    if (this.pressInPanel) return true;
    const panel = this.panel.getBoundingClientRect();
    const rect = this.host.layer()?.getBoundingClientRect();
    if (!rect) return false;
    const k = this.host.scale() || 1;
    return onTheWay(at, { x: rect.left + shown.anchor.x * k, y: rect.top + shown.anchor.y * k }, panel);
  }

  private readonly pointerLeave = (): void => {
    if (!this.host.enabled()) return;
    this.lookAtRest(null, null);
  };

  private lookAtRest(band: SVGElement | null, at: { x: number; y: number } | null): void {
    const now = performance.now();
    this.touched = band;
    if (at) this.touchedAt = at;
    if (band !== this.dismissed) this.dismissed = null;
    this.rest = at ? restAt(this.rest, band?.dataset.connectionKey ?? null, at, now) : NO_REST;
    window.clearTimeout(this.restTimer);
    const due = restsAt(this.rest);
    const rested = restedOn(this.rest, now) !== null ? band : null;
    if (!rested && due !== null && band) this.restTimer = window.setTimeout(() => this.lookAtRest(this.touched, this.touchedAt), Math.max(0, due - now) + 1);
    const shown = this.shown;
    if (shown?.pinned) {
      // A pin's light outlives another hover's: once nothing else is lit, it is lit again.
      this.relight();
      if (!rested || rested === shown.band) return;
    }
    if (rested && rested !== shown?.band && rested !== this.dismissed && this.touchedAt) this.show(rested, this.anchorAt(this.touchedAt.x, this.touchedAt.y), false);
    else if (!rested && shown && !shown.pinned && shown.band !== document.activeElement && !this.keepsWords(at)) this.close();
    else if (!rested && shown && !shown.pinned) this.relight();
  }

  /** A press begins: on a band, or elsewhere; either way the map's own pan goes on as before. */
  private readonly pointerDown = (event: PointerEvent): void => {
    if (!this.host.enabled() || !event.isPrimary) return;
    if (event.target instanceof Node && this.panel.contains(event.target)) { this.press = null; this.pressInPanel = true; return; }
    this.press = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, band: this.bandAt(event.target) };
  };

  /** A press ends: one that did not travel pins a band's words, or lets go of a pin when it was made elsewhere. */
  private readonly pointerUp = (event: PointerEvent): void => {
    const press = this.press;
    this.pressInPanel = false;
    if (!press || press.pointerId !== event.pointerId) return;
    this.press = null;
    if (!this.host.enabled() || Math.hypot(event.clientX - press.x, event.clientY - press.y) > PRESS_SLOP) return;
    if (press.band && press.band.isConnected) this.show(press.band, this.anchorAt(press.x, press.y), true);
    else if (this.shown?.pinned) this.close();
  };

  private readonly pointerCancel = (): void => { this.press = null; this.pressInPanel = false; };

  /** The keyboard's focus on a band shows its words at once, at the middle of its wire. */
  private readonly focusIn = (event: FocusEvent): void => {
    const band = this.bandAt(event.target);
    if (!band || !this.host.enabled()) return;
    if (this.shown?.band === band) return;
    this.show(band, this.anchorOfBand(band), false);
  };

  private readonly focusOut = (event: FocusEvent): void => {
    const band = this.bandAt(event.target);
    if (!band || this.shown?.band !== band || this.shown.pinned) return;
    if (event.relatedTarget instanceof Element && this.bandAt(event.relatedTarget)) return;
    this.close();
  };

  /** The bands at one side of a card, top to bottom by where they meet it. */
  private bandsOf(cardId: string, side: "right" | "left"): SVGElement[] {
    const end = side === "right" ? "targetId" : "sourceId";
    const y = side === "right" ? "fromY" : "toY";
    return [...this.host.overlay.querySelectorAll<SVGElement>(".wire-band:not(.run-band)")]
      .filter(band => band.dataset[end] === cardId)
      .sort((a, b) => Number(a.dataset[y]) - Number(b.dataset[y]));
  }

  private cardOf(id: string | undefined): HTMLElement | null {
    return id ? this.host.container.querySelector<HTMLElement>(`.node-card[data-id="${CSS.escape(id)}"]`) : null;
  }

  private readonly keyDown = (event: KeyboardEvent): void => {
    if (!this.host.enabled() || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const band = this.bandAt(target);
    if (!band && target.matches(".node-card") && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
      const side = event.key === "ArrowRight" ? "right" : "left";
      const first = this.bandsOf((target as HTMLElement).dataset.id ?? "", side)[0];
      if (!first) return;
      event.preventDefault();
      this.walkFrom = target as HTMLElement;
      first.dataset.walk = side;
      (first as unknown as HTMLElement).focus({ preventScroll: true });
      return;
    }
    if (!band) return;
    const side = band.dataset.walk === "left" ? "left" : "right";
    const cardId = side === "right" ? band.dataset.targetId : band.dataset.sourceId;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.show(band, this.anchorOfBand(band), true);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const bands = this.bandsOf(cardId ?? "", side);
      const at = bands.indexOf(band);
      const next = bands[Math.max(0, Math.min(bands.length - 1, at + (event.key === "ArrowDown" ? 1 : -1)))];
      if (next && next !== band) { next.dataset.walk = side; (next as unknown as HTMLElement).focus({ preventScroll: true }); }
    } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      // On to the card at that end: right to the file that uses, left to the file that offers.
      const card = this.cardOf(event.key === "ArrowRight" ? band.dataset.sourceId : band.dataset.targetId);
      if (!card) return;
      event.preventDefault();
      this.close();
      card.focus();
    } else if (event.key === "Escape") {
      if (this.shown?.pinned) return; // the window's Escape lets go of the pin first
      const card = this.walkFrom?.isConnected ? this.walkFrom : this.cardOf(cardId);
      if (!card) return;
      event.preventDefault();
      this.close();
      card.focus();
    }
  };

  /**
   * Escape takes a rested pointer's words away where the pointer stands (*dismissible*), and nothing else with them:
   * the reader, a pin or a menu below stays for the next Escape. Words shown for the keyboard's focus are the walk's
   * own Escape's, above.
   */
  private readonly dismiss = (event: KeyboardEvent): void => {
    const shown = this.shown;
    if (event.key !== "Escape" || !shown || shown.pinned || shown.band === document.activeElement) return;
    event.preventDefault();
    event.stopPropagation();
    this.dismissed = shown.band;
    this.close();
  };

  /** Escape lets go of a pinned answer, unless a surface above took it. */
  private readonly escape = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || event.defaultPrevented || !this.shown?.pinned) return;
    event.preventDefault();
    const band = this.shown.band;
    const focused = document.activeElement === band && band.matches(":focus-visible");
    this.close();
    if (focused) this.show(band, this.anchorOfBand(band), false);
  };
}
