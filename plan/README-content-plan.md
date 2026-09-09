# README Content Plan — Iteration 1 (research + topics)

Scope of this iteration: read the whole site, read the current README, and propose what
the new profile README should contain. No README rewrite yet — that's iteration 2.

---

## 1. What I read

**Site:** `prajjwalveerbasnet.com` — Astro, Cloudflare Workers, GitHub's design language.
Pages read in full: Home, About, Projects (all 10), CV, and every major project case study
(Cue, Slipstream, Song Reference Network, Shobha's Delicacies, Temporal Reference
Resolution, TB Prediction, Portfolio).

**Current README:** `Prajj-10/Prajj-10` — icon walls, three old university projects,
Spotify widgets, tech-choices section, footer dated 2024.

---

## 2. The gap (this is the whole problem)

| | Website | Current README |
|---|---|---|
| Positioning | Engineer + independent researcher, shipping in production | "Recently graduated… currently taking a break" |
| Projects shown | Cue, Slipstream, SRN, Shobha's | Bhansa, Tomato Game, TB Prediction (2023–24 coursework) |
| Depth | Case studies with failure post-mortems and citations | One-line blurbs |
| Interactivity | 3 real playable demos | none |
| Visual identity | GitHub dark, 3 themes, token-driven | ~40 raw 70px icons in 3 rows |
| Last updated | 6 days ago | 2024 |

The README is currently advertising a *different, older person* than the site. Anyone who
lands on the profile gets the 2024 version of you and no reason to click through.

**Strategic conclusion:** the README should stop trying to be a mini-portfolio. It should be
a *trailer* — fast, visual, personal, and pointed at three specific playable things.

---

## 3. The three assets nobody else has

These are the strongest cards in the deck and the current README mentions none of them.
Every one is a live, in-browser, no-signup demo:

1. **Cue → onset detection on a real mix.** 20 s of *Edge of Desire*, decoded in the page.
   You tap space, then toggle snapping and watch how far your taps moved. Real FFT, real
   adaptive threshold, real peak picking. → `/projects/cue#see-it-working`
2. **Slipstream → Abu Dhabi 2021, lap 52 of 58.** Scrubbable replay from official FastF1
   timing, with tyre strategy and the safety car. Everyone who cares about F1 will click this.
   → `/projects/slipstream#replay-a-race`
3. **Shobha's Delicacies → FIFO vs LIFO shelf simulator.** Same deliveries, same orders,
   one rule different, and you watch food get thrown away. → `/projects/shobhas-delicacies`

**Recommendation:** these get their own section near the top of the README, above the
project list. Framed as an invitation ("three things you can actually play with"), not a
list of links. This is the single highest-leverage change.

---

## 4. Flagship projects to feature

Keep it to **four**, each linking to the *case study on the site*, not to the GitHub repo.

| Project | One-line hook for the README | Status |
|---|---|---|
| **Cue** | Human reaction time is ~150 ms late. Tap approximately, and three independent mechanisms remove the rest. | launching |
| **Slipstream** | Every F1 race since 2018 as a full-field replay; every season since 1950, offline; nine native home-screen widgets. | launching |
| **Song Reference Network** | Songs name-drop other songs. Nobody has mapped it. Building the first open citation network of popular music. | in progress |
| **Shobha's Delicacies** | Replaced my mother's bill book and my notes app. Five staff, daily, in production. | shipped |

Held back deliberately (mention as a single line, or not at all):
- **Temporal Reference Resolution** — great work, but "second annotator on a friend's
  dissertation" needs a paragraph to land. One line under a "research" note, at most.
- **TB Prediction** — still worth one line: presented at CAN Info-Tech 2024, and the
  "it can say *I don't know*" detail is memorable.
- **Bhansa / Tomato Game** — retire from the README. They're on the site under Supporting.

---

## 5. What gives the profile its own character (not a copy of the site)

This is the part you asked for: the README needs something the site doesn't have.
Ranked by how strongly I'd recommend each.

### 5.1 "What went wrong" — a rotating field-notes block ⭐ strongest idea
Every case study on your site has a *What went wrong* section, and they're the best
writing on the whole site. The README can distil three of them into one-liners:

> - A green Cloudflare deploy served a build from five deploys earlier. `versions upload` ≠ `deploy`.
> - A circuit traced as a scribble. The fastest lap had almost no real GPS fixes — the data was there, and interpolated.
> - A loader reported "nothing new" for 26 rows that were right there on disk. A byte-order mark.

Why it works: it's instantly the most distinctive thing on any GitHub profile, it's
honest, and each line is a hook that makes people click the case study to get the ending.
The site's version is thorough; the README's version is punchy. Different character, same voice.

### 5.2 A "now" block that mirrors the site's CURRENTLY panel
Site already maintains this. Three lines, dated. Makes the profile look alive rather than
a monument. Can be hand-edited or synced from the site's content later.

### 5.3 The "why" line for each project
Every project of yours came from something you were personally curious about — Cue and SRN
from music, Shobha's from your mother's kitchen, TB Prediction from Nepal's rural clinics.
No other profile has that thread. **Recommendation:** one italic "why" line per flagship.
This is the thing that makes the list read as a person rather than a portfolio.

### 5.4 A `<details>` "about me" drawer
Your current personal section is genuinely good (music, cinema, guitar, watches, keyboards,
single-player games) but it's long and it's competing with the projects. Collapse it into a
`<details>` block. It stays discoverable, costs zero vertical space, and the collapsed
summary line can have a joke in it.

### 5.5 A terminal-style / "repository" opening
Since the site is a GitHub clone, the README can go one step further and open like a
`git log` or a file tree of *you*. Risky — it can read as gimmicky — but done once at the
top, small, it ties README and site together instantly.

---

## 6. Animation and visuals — what's actually possible

GitHub strips `<script>` and `<style>` from READMEs. So animation is limited to:
**GIF/APNG**, **externally-hosted animated SVG** (SMIL), and `<picture>` with
`prefers-color-scheme` for a proper dark/light swap.

Ranked:

1. **Three demo GIFs, captured from your own demos.** ⭐ Cue's onset track scrolling, the
   Abu Dhabi replay running, the FIFO shelf rotating. 6–10 s each, ~600px wide, put
   directly under each flagship. Nothing else you can add will convert visitors better than
   showing the demo actually moving. Cost: three screen recordings.
2. **A custom animated SVG header**, hand-built to match your token palette (the GitHub
   `#0d1117` / green accent) — e.g. an animated waveform-into-onset-markers strip, which
   is on-brand for Cue and for you. Self-hosted in `/images`, dark/light via `<picture>`.
3. **Typing SVG** (`readme-typing-svg`) for a rotating one-liner under your name. Cheap,
   very common — use only if the line is good.
4. **Stats cards, re-themed.** Keep the top-languages donut, but drop `tokyonight` for a
   theme matching your site (`github_dark` / custom `bg_color=0d1117`). Consider adding the
   streak card. Add `hide_border=true` so they sit flush.
5. **Snake contribution graph** — the eaten-contributions animation. Very popular, slightly
   overdone, but it does look good above a footer. Your call.
6. **Status badges** using your site's own vocabulary: `launching`, `shipped`,
   `in-progress`, `collaborator`, in your site's exact colours. Ties the two together
   better than any header image.

**Recommendation:** 1 + 2 + 4 + 6. Skip 3 and 5 unless you want them.

---

## 7. What to cut from the current README

- The **~40-icon tech wall** across three rows. Replace with one compact line of text or a
  small badge row. This is the single biggest visual liability.
- **Tech Choices** (OS / PC brand / browsers) — interesting to you, noise to a recruiter.
  If you love it, it goes inside the `<details>` drawer.
- **Currently Learning** (single icon, no context).
- **Duplicate icons** — AWS appears twice, several icons are unlabelled or mislabelled
  (three different icons all `alt="FFmpeg"`, two `alt="PostgreSQL"`, `alt="Letterboxd"` on
  the WatchCrunch logo).
- **"Recently graduated… taking a break"** — no longer true and it undersells you badly.
- **Both Spotify widgets** — pick one. The now-playing widget is dead space when offline.
- **Footer "2024"**.
- **Bhansa / Tomato Game / TB** as the headline three.

---

## 8. Proposed structure for iteration 2

```
┌ Header ──────────────────────────────────────────────┐
│ Animated SVG banner (dark/light) + name              │
│ One-line positioning statement                       │
│ Badge row: site · CV · LinkedIn · email              │
└──────────────────────────────────────────────────────┘

▸ Three things you can actually try          ← the demos, with GIFs
▸ Flagship work                              ← 4 projects, why-line each, → site
▸ What went wrong                            ← 3 field notes, the signature block
▸ Currently                                  ← dated now-block
▸ Stack                                      ← one compact line, no icon wall
▸ <details> Off the clock                    ← music, film, guitar, watches, games
▸ Stats                                      ← re-themed cards
└ Footer: single CTA back to the site
```

Target length: **roughly one and a half screens** before the `<details>` drawer.
The current README is about five.

---

## 9. Decisions I need from you before iteration 2

1. **Demo GIFs** — can you record the three demos (or shall I script exact capture
   instructions / try to capture them via the browser)? This is the biggest single win.
2. **Positioning line** — pick a lane: *"Software engineer. Independent researcher.
   I build things I was already curious about."* or something you'd rather write yourself.
3. **"What went wrong" block** — in or out? It's the boldest idea here and the one I'd
   fight for.
4. **Song Reference Network** — feature it as a flagship (it has no demo, but the *premise*
   is the most interesting sentence on your whole site), or hold it until there's more to show?
5. **Snake graph / typing SVG** — yes or no.
6. **Header banner** — custom animated SVG built by me, or keep it text-only and let the
   demo GIFs carry all the motion?

---

## 10. Also worth doing (outside the README)

- Your GitHub **profile bio** still reads *"Just a tech enthusiast software engineer."* —
  worth updating alongside the README, and the website link is already set correctly.
- **Pinned repositories** are currently doing nothing for you. Pin the repos behind the four
  flagships so the pins and the README agree.
