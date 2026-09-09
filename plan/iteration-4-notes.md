# Iteration 4 — image sizing

Synced from `~/projects/Prajj-10/README.md`, so your movie fix and the `contact@` email are
carried through untouched.

---

## What was actually wrong

`width="100%"` was the wrong fix, and it made the sharpness worse rather than better.

A GIF is raster — it has a fixed number of real pixels. The files are **880px wide**. At
`width="100%"` they were being displayed at about **830 CSS px**, which is nearly 1:1 — fine
on an old 1× monitor. But almost every current laptop is a **HiDPI / 2× display**, where one
CSS pixel is two physical pixels. So 830 CSS px asks for **1660 physical pixels** and the file
only has 880. The browser invents the missing 780, and everything goes soft.

That is exactly the "doesn't scale well on the resolution" you were seeing. The SVGs on the
page (header, snake) were never affected, because vector art has no fixed pixel count and
redraws sharp at any size.

I measured it by rendering the same GIF at three widths on a simulated 2× display and cropping
the finest text in the frame:

| Displayed at | Pixels available vs needed | Density | Result |
|---|---|---|---|
| 830px (what you had) | 880 of 1660 | **1.06×** | visibly blurry |
| 560px | 880 of 1120 | 1.57× | good |
| **440px** | 880 of 880 | **2.00×** | pixel-perfect |

## The fix

The three GIFs are now **centered at `width="440"`** — exactly half their 880px pixel width, so
they land at true 2× on a HiDPI screen and are never upscaled on any screen.

This solves both halves of your complaint at once:

- **Sharp.** 2.00× density instead of 1.06×.
- **Not too big.** The rendered README went from ~4850px tall to **~3610px**, a quarter
  shorter. The demos now read as figures inside the page rather than dominating it.
- Centered, so there is no lopsided gutter at any window width.

Nothing was re-encoded — these are the same files from last time, just displayed at the size
they were always meant for. So no extra download weight, and no quality lost in a re-compress.

The header and snake stay at `width="100%"`. They're SVG, so they scale perfectly and should
stay full-width.

## If 440 feels too small

It's one number per image — three lines, `width="440"`. Change it and nothing else breaks. But
the trade is real, so here's the table:

| `width=` | Density on a 2× screen | Verdict |
|---|---|---|
| 380 | 2.32× | sharper than necessary, quite small |
| **440** | **2.00×** | **current — the sweet spot** |
| 500 | 1.76× | still looks clean |
| 560 | 1.57× | slight softening on fine text |
| 620 | 1.42× | noticeable |
| 830 | 1.06× | what you had |

**If you want them bigger *and* still perfectly sharp**, the files have to be re-encoded at 2×
whatever width you pick. I measured the cost on Cue, which is the heavy one at 92 frames:

| Asset width | File size | Displays sharp at |
|---|---|---|
| 640px | 992 KB | 320px |
| 760px | 1.2 MB | 380px |
| **880px** | **1.5 MB** | **440px ← current** |
| 1000px | 1.7 MB | 500px |

So 500px display would cost about 200 KB more on Cue. Say the word and I'll re-cut all three
at whatever width you land on — it's a one-command change to the capture pipeline.

There's a hard ceiling worth knowing: a full-width-and-sharp GIF would need to be ~1660px wide,
which for Cue lands around 4–5 MB. That's why full-width raster demos aren't really viable
here, and why the sensible move is a smaller, sharper figure.

## Unchanged from your copy

Your wording, the `contact@prajjwalveerbasnet.com` badge, and the *Elephants in the fog*
correction are all exactly as you left them. The only edit in this iteration is the three
`<img>` tags.
