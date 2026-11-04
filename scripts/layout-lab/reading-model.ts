import { layout, type PreparedTextWithSegments } from "@chenglou/pretext";
import { measureRichInlineStats, type PreparedRichInline } from "@chenglou/pretext/rich-inline";

/** A normal-flow reading box, with independently prepared mixed-font text and the stylesheet's spacing. */
export interface ReadingFlow {
  inline?: PreparedRichInline;
  pre?: PreparedTextWithSegments;
  lineHeight: number;
  children: ReadingFlow[];
  inset: { horizontal: number; vertical: number };
  margin: { top: number; bottom: number };
  maxHeight: number | null;
  more?: { flow: ReadingFlow; always: boolean };
}

/** Lay out serialized reading text at a new width without a browser, including lists and bounded prose. */
export function readingHeight(flow: ReadingFlow, width: number, forceMore = false): number {
  return readingMetrics(flow, width, forceMore).height;
}

function readingMetrics(flow: ReadingFlow, width: number, forceMore = false): { height: number; clipped: boolean } {
  const contentWidth = Math.max(1, width - flow.inset.horizontal);
  let height = 0, previousMargin = 0, clipped = false;
  if (flow.pre) {
    height = layout(flow.pre, contentWidth + 1 / 64, flow.lineHeight).height;
  } else if (flow.inline) {
    height = measureRichInlineStats(flow.inline, contentWidth + 1 / 64).lineCount * flow.lineHeight;
  } else {
    for (const child of flow.children) {
      const measured = readingMetrics(child, contentWidth);
      height += Math.max(previousMargin, child.margin.top) + measured.height;
      clipped ||= measured.clipped;
      previousMargin = child.margin.bottom;
    }
    height += previousMargin;
  }
  clipped ||= flow.maxHeight !== null && Math.round(height) > Math.round(flow.maxHeight) + 1;
  if (flow.more && (forceMore || flow.more.always || clipped)) {
    height += Math.max(previousMargin, flow.more.flow.margin.top) - previousMargin
      + readingMetrics(flow.more.flow, contentWidth).height + flow.more.flow.margin.bottom;
  }
  return { height: (flow.maxHeight === null ? height : Math.min(height, flow.maxHeight)) + flow.inset.vertical, clipped };
}
