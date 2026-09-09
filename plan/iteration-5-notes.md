# Iteration 5 — larger, left-aligned

Done: the three demos are **left-aligned at `width="560"`**, up from 440, and re-encoded so
they're still perfectly sharp at that size. Centering is gone.

---

## One clarification: they're GIFs, not SVGs

Worth being precise about, because it's the reason this keeps being a trade-off.

The **header and the snake are SVG** — vector. Those genuinely scale to any size with no
quality loss, which is why they're at `width="100%"` and always will be.

The **three demos are GIFs** — raster, a fixed grid of pixels. There's no SVG version
available and no realistic way to make one: they're recordings of a live app, with a moving
waveform, twenty cars on a track, and text re-rendering every frame. Vector formats describe
shapes, not captured motion. Anything that records a screen comes out raster.

So for these three, size and sharpness are always linked: **the file needs twice as many
pixels as the width you display it at**, because most screens now are 2×.

## What I did

Re-encoded all three from the original captures at **1120px wide**, displayed at **560**.
That's exactly 2×, so they're pixel-perfect on a HiDPI screen and never upscaled anywhere.

| | Before (iter 4) | Now |
|---|---|---|
| Display width | 440, centered | **560, left-aligned** |
| File width | 880px | **1120px** |
| Density on a 2× screen | 2.00× | **2.00×** |
| Page height | 3610px | 3940px |

Verified in a browser at 2× — all three report exactly `2.00x` density.

File sizes: `cue.gif` 1.9 MB, `slipstream.gif` 360 KB, `shobha.gif` 312 KB.

Cue is the heavy one because it's 92 frames. I tried tuning it down — 64 vs 96 colours, lossy
55 through 95 — and it barely moves, between 1.8 and 2.0 MB. At this frame count the size is
driven by the number of frames, not the palette. It's fine for a README; GitHub caches images
through its own proxy, so visitors aren't refetching it.

## Optional: WebP, if you want them lighter

`images/readme/webp-alternative/` has the same three clips as animated WebP. GitHub officially
supports WebP in Markdown, so this should just work — but I can't verify GitHub's image proxy
from here, so I've left GIF as the default rather than ship your profile on a format I haven't
seen render.

| | GIF | WebP |
|---|---|---|
| cue | 1.9 MB | **1.2 MB** |
| slipstream | 360 KB | 348 KB |
| shobha | 312 KB | **180 KB** |
| **total** | **2.5 MB** | **1.7 MB** |

WebP has no 256-colour limit, so it's also slightly cleaner on the waveform gradients. To try
it: move the three files up into `images/readme/`, change `.gif` to `.webp` in the three `<img>`
tags, push, and look at the rendered profile. If anything fails to animate, change it back —
the GIFs stay where they are.

## If 560 is still not the right size

One number, three places. To stay sharp, the file has to be re-encoded at double it, so tell me
the width and I'll re-cut:

| Display | File needed | Cue would be | Note |
|---|---|---|---|
| 440 | 880px | 1.5 MB | iteration 4 |
| **560** | **1120px** | **1.9 MB** | **current** |
| 640 | 1280px | ~2.3 MB | |
| 720 | 1440px | ~2.8 MB | |
| 830 (full width) | 1660px | ~4 MB | too heavy to recommend |

The source captures are 1640px wide for Cue and Slipstream and 1338px for Shobha, so I can
re-cut sharply up to 820 display width for the first two and 669 for Shobha. Past that I'd need
to re-record at a higher device pixel ratio, which is also possible — just say so.

## Unchanged

Your wording, the `contact@` email, the *Elephants in the fog* fix. The only edits this round
are the three `<img>` tags and the image files behind them.
