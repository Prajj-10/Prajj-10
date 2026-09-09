# Iteration 2 — what's in the zip

## Files

```
README.md                          the new profile README
images/readme/header-dark.svg      animated header, dark
images/readme/header-light.svg     animated header, light
images/readme/cue.gif              1.2 MB
images/readme/slipstream.gif       217 KB
images/readme/shobha.gif           138 KB
.github/workflows/snake.yml        contribution snake (runs itself on push)
.github/workflows/metrics.yml      optional: accurate language stats (needs a token)
plan/site-bug-cue-csp.md           ⚠️ read this one first
plan/stats-options.md              stats review, updated with live test results
plan/README-content-plan.md        iteration 1 plan, for reference
plan/README-current-backup.md      your old README
```

To install: copy `README.md`, `images/readme/`, and `.github/` into your `Prajj-10/Prajj-10`
repo and push to `master`.

---

## Your decisions, and what I did with them

| You said | What I did |
|---|---|
| Demo GIFs are the greatest asset — capture them | Captured all three from the live site by driving a real browser. Details below. |
| Positioning line: *"I love building on ideas that I find interesting."* | It's the subtitle in the animated header, rendered as text in the SVG, so it always shows. |
| "What went wrong" is wrong for the README — too little context | Dropped entirely. Your reasoning is right: those sections work because the case study around them supplies the context, and a glance-level page can't. |
| SRN is part of something separate you're working on | Moved out of the flagship slots into "Also on the bench", described as in progress and in the open. |
| Snake graph / typing SVG: yes | Both in. The snake workflow triggers on push, so it needs nothing from you. |
| Custom animated SVG header: yes | Built. Dark and light variants. |
| Bio is fine | Untouched. |
| Remove all pinned repos | Nothing for me to do in the repo — it's a profile setting. Just unpin them from your profile page. The README no longer depends on pins for anything. |

---

## The three GIFs

Captured with Playwright against the live site: a real Chromium at 1400×1150, 2× device pixel
ratio, clipped to the demo figure, then assembled with ffmpeg and optimised with gifsicle. The
capture script is reproducible, not a one-off screen recording.

**Cue** — Load, play, and nine taps on the space bar timed to where each word actually ends,
plus 150 ms of human reaction lag, because that lag is the entire point of the project. Then
snapping goes on. The clip ends on the line that states the thesis:

> *Moved back 227ms at the median, 254ms at the furthest.*

**Slipstream** — Abu Dhabi 2021, lap 52 to 53 at 8×, ending as the safety car comes out. Full
leaderboard, tyre strategy and scrub bar all in frame.

**Shobha's** — Seven days run through the shelf simulator. The demo randomises which product
it shows, and some products start with an already-expired batch, which makes FIFO throw things
away too and muddies the comparison. The capture script re-runs until it gets a week where
FIFO wastes **nothing** and LIFO wastes **five** — so the rotation rule is visibly the only
variable. It ends on *"5 more batches of Buff Mo:Mo in the bin on the right."*

### ⚠️ Before you publish: the Cue demo is broken in production

I could not record Cue at first because it does not play — a CSP header blocks the audio for
every visitor, silently. I patched the header locally to record the GIF. **Read
[`plan/site-bug-cue-csp.md`](site-bug-cue-csp.md)** — the fix is one token. Ship it before the
README, or your best asset links to a dead button.

---

## The header

An animated SVG built from scratch, in your palette (`#0d1117` / `#30363d` / `#58a6ff` /
`#3fb950`). A waveform band with bars that breathe, a playhead sweeping on a 7-second loop,
and green onset ticks below it that flash as the playhead reaches them — Cue's mechanism used
as decoration. Your name, your line, and your domain with a blinking cursor.

- Pure declarative CSS animation inside the SVG, no script, so GitHub renders it. Verified in
  a real browser inside an `<img>` tag, which is exactly how GitHub serves it.
- Honours `prefers-reduced-motion`.
- Dark and light versions swapped by `<picture>`, so it follows the reader's GitHub theme.
- Regenerate or retune it any time with the generator, which is parameterised — colours,
  bar count, sweep speed are all at the top of the file.

---

## Stats — short version

The full review, with measurements, is in [`plan/stats-options.md`](stats-options.md). The
headline is that **I tested every option instead of trusting the docs, and most of the popular
ones are dead.**

1. **Your live README currently has a broken image on it.** The top-languages donut is served
   by `github-readme-stats.vercel.app`, which returns **503**. It was also the wrong card for
   you — it reads public repos only, so it weights your 2021–24 Java and C# coursework against
   the TypeScript, Dart and Astro you actually write now. Gone.
2. **`github-readme-activity-graph`, my pick last iteration, returns 402** — out of quota.
3. I replaced it with a themed streak card, confirmed it working (**951 contributions, current
   streak 20, longest 20**), and then **removed that too** when it began returning 503 on
   three consecutive retries half an hour later.

The pattern behind all three: any third-party card that queries GitHub's API on demand is
rate-limited or out of quota. Pure renderers are fine — shields.io averaged 38 ms and the
typing SVG 561 ms, both 3/3.

**So the README ships with zero GitHub-API-backed third-party images.** Every image in it is
either a local file, a verified-reliable renderer, or generated by your own Actions.

### The snake needs nothing from you
`snake.yml` triggers on push to `master`, so it runs the moment you push and the images appear
a minute or two later. (You can also fire it by hand from the Actions tab.)

### The accurate language breakdown — optional, 5 minutes
`metrics.yml` is included but **not referenced from the README yet**, because it needs a token
first. It runs `lowlighter/metrics` inside your Actions, so it cannot be rate-limited by other
people's traffic and — with `repo` scope — it can finally see your private work. That is the
only way a language breakdown tells the truth about you. Setup steps are in the comment block
at the top of the file, including the exact line to paste into the README when it's ready.

### One checkbox worth ticking
**GitHub → Settings → Profile → "Include private contributions on my profile."** Your recent
work is private, and both the snake and the isocalendar draw from your contribution graph.
Your graph does look dense since July, which suggests this may already be on — worth
confirming rather than assuming.

---

## Two small things I left alone but noticed

- **Email.** The README uses `prajjwalveer2001@gmail.com`, carried over from your old one.
  Your site's contact route may point somewhere else now — worth a check.
- **The Nepal relief dialog** on your site is a modal on every page load. It's your call
  entirely, and I did not put anything about it in the README, but if you wanted a line in the
  profile pointing to it, that would be a reasonable place for it. Say the word and I'll add
  it in whatever wording you want — or leave it as is.

---

## Suggested iteration 3

1. The custom SVG panel generated from your site's own `CURRENTLY` and `LATEST CHANGES`
   content, on a scheduled Action, so the README updates itself in your design language. This
   is the idea with the most character left on the table.
2. Actually wiring up `metrics.yml` (already written and included) so the language breakdown
   finally counts the private work.
3. Start WakaTime now so it has data to show in a month.
