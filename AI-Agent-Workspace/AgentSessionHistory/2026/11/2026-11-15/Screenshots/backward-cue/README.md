# The 3D button's cue, November 15, 2026

The 3D button lights while the 2D Local Map draws connections against its left-to-right order: a cycle's returning references, counted once each, and the rare forward wire whose route doubles back. Built from the round's branch on its own port; toolbar close-ups are 400 by 120 CSS px at device scale 2, the page at 1440 by 900 at scale 1. Chromium in the container, which draws a fallback for Segoe UI; the toolbar's labels fit either way.

- `toolbar-1-none.png`: `Portal/Services/GatewayClient.cs` of the estate sample, in no cycle: 2D pressed in blue, 3D plain.
- `toolbar-2-some.png`: `PaymentService/PaymentService.cs` of the estate sample, a ring of three files, one returning connection: amber border and label, a soft glow. Tooltip: "1 connection runs backward in 2D. Explore this scope in 3D."
- `toolbar-3-many.png`: `branch-renderer.ts` opened alone, the owner's case, eight returning connections (five or more is the stronger strength): a wider, brighter glow and an amber-tinted face. Tooltip: "8 connections run backward in 2D. Explore this scope in 3D."
- `toolbar-5-many-focus.png`: the same, the 3D button reached by Tab: the blue focus ring stands outside the amber border, and both read.
- `pulse-some-0000ms.png`, `pulse-some-0720ms.png`, `pulse-some-1300ms.png`: the one pulse as the cue lights on the estate's ring, the animation held at its start, its fullest swell (40% of its 1.8 s) and on its way back; it plays once, and not under reduced motion.
- `page-branch-renderer-cue-lit.png`: the whole page of `branch-renderer.ts` with the cue lit at the bottom centre, the card's six returns drawn as laces at its pins and its foot saying "6 connections return in a cycle".

No picture of the pointer on the button: the toolbar has no hover style of its own, so the page draws the hovered button exactly as `toolbar-3-many.png`; what the pointer adds is the browser's tooltip, which a page screenshot cannot hold.
