# Iteration 3 — answers and fixes

Synced from your `~/projects/Prajj-10/README.md`, so your wording is the base. I have not
touched anything in `projects/` — that folder stays read-only, and all pushing stays yours.

---

## 1. The snake — you're missing the folder

Neither of these is a VS Code problem. Nothing about the snake can work locally.

**The actual cause:** `.github/` never got copied across. Your `projects/Prajj-10` has
`README.md`, `images/`, and `plan/` — and no `.github/`. Hidden folders get skipped easily by
a file-manager copy or a drag-and-drop, and `ls` won't show it either.

I confirmed the downstream effect against GitHub:

```
raw.githubusercontent.com/.../output/snake.svg   -> 404
api.github.com/.../branches/output               -> 404
```

The `output` branch does not exist, because the workflow that creates it has never existed in
the repo.

**Why it can never render locally, even once you fix that.** The snake is not a local file.
The chain is:

1. You push `.github/workflows/snake.yml` to GitHub.
2. GitHub Actions runs `Platane/snk`, which reads your public contribution graph.
3. It writes `snake.svg` and `snake-dark.svg` to a branch called `output`.
4. The README loads them from `raw.githubusercontent.com`.

Steps 2–4 all happen on GitHub's servers. A local VS Code preview has no Actions runner, so
there is nothing to fetch until after a push. **Expect it to look broken locally forever.
That's correct behaviour.** It only ever appears on the rendered profile.

This zip has `.github/` in it again. `snake.yml` triggers on push to `master`, so the images
appear a minute or two after you push. You can also run it by hand: repo → **Actions** →
"Generate contribution snake" → **Run workflow**.

> If Actions is disabled on the repo, enable it under Settings → Actions → General →
> "Allow all actions". Profile repos sometimes have it off.

---

## 2. Spotify — your authorization has lapsed

This one *is* live and reachable. It returns HTTP 200 in 140 ms. But look at what the SVG
actually contains:

```
aria-label="Spotify: Spotify authorization needed.
            Reconnect at spotify-recently-played.jeffreyca.workers.dev"
```

The widget is working perfectly and telling you your token expired. That service holds an
OAuth grant against your Spotify account, and those lapse — typically when you haven't used
the widget in a while, or after a Spotify password change.

**Fix, about thirty seconds:** go to <https://spotify-recently-played.jeffreyca.workers.dev>,
sign in with Spotify, approve, and it hands you back a user id. If that id differs from the
one currently in the README, swap it in — the README uses `31zgwocp2gdczfwelfgj4lwoecby`,
carried over from your old README, and it's worth confirming it's still the right one. Your
profile link uses a different id (`31mhbwq3lthnnawplg2mgdjz5jzi`), which is normal — one is
the widget's id and one is your public profile — but if the reconnect gives you something
new, that's the one the widget needs.

Nothing for me to change in the files; this is an account action only you can do.

**Quick summary of the two:**

| | Renders locally? | What's needed |
|---|---|---|
| Snake | **No, never** | Copy `.github/`, push. Then it lives on GitHub only. |
| Spotify | Yes, once fixed | Re-authorize at the link above. |

---

## 3. The right-hand gap — fixed, and it was two problems

You were seeing two separate things stacked on top of each other.

**Outer gap.** The images were pinned at `width="720"` and left-aligned. GitHub's README
column is about 830px, and VS Code's preview pane can be 1200px+, so a fixed 720px image left
a permanent empty gutter down the right — much worse in VS Code, which is where you were
looking. All three are now `width="100%"`, so they fill whatever column they're in.

**Inner gap — the one that was actually ugly.** The Shobha demo had genuine dead space *inside
the frame*: the batch chips only reached about halfway across, with a wide empty stretch
before the `DELIVERIES` label. Cropping it off was not an option, because the `0 thrown away`
and `5 thrown away` counters — the entire payoff — live at that right edge.

So I recaptured it at a **narrower browser viewport** instead. Your site's own responsive
layout reflows the figure from 820px down to 669px, and the chips then fill nearly the whole
width. Same demo, same content, no cropping, no dead space. The counters stay put.

I checked whether the same trick helped the other two. It didn't:

| Demo | Wide (1400px) | Narrow (1100px) | Kept |
|---|---|---|---|
| Cue | 820 × 622, chips fill the row | 669 × 558 | **wide** |
| Slipstream | 820 × 812 | 669 × **1018** — map goes tall and portrait | **wide** |
| Shobha's | 820 × 803, half empty | 669 × 660, dense | **narrow** |

**Resolution.** All three are now 880px wide natively instead of 720. They're captured at 2×
device pixel ratio and downscaled, so at GitHub's ~830px column they render at or below native
size and stay sharp. In a very wide VS Code preview they'll upscale slightly and look a touch
soft — that's the preview pane being wider than GitHub ever is, not a problem with the files.

Sizes: `cue.gif` 1.5 MB, `slipstream.gif` 272 KB, `shobha.gif` 240 KB.

---

## 4. Small fixes I made to your text

Spelling and broken markup only — I left your wording and voice alone everywhere else. Revert
any of these you disagree with.

**Markup (these render visibly wrong):**
- Unclosed `<p>` on the cinema line — it was swallowing the games line into the same paragraph.
- Unclosed `<p>` on the watches line, same effect.

**Spelling and punctuation:**
- `smnall` → `small`
- `projgress` → `progress`
- `expect(Please fund me)` → `expect (please fund me)`
- `college and university .` → removed the space before the full stop
- `##  My Last three projects` → single space, sentence case

**Grammar, kept as close to your phrasing as I could:**
- "raced since 1950s their history" → "raced since the 1950s their full history"
- "one database, which I use daily and five of our staff" → "…which I and five of our staff use daily"
- "those name-drops namedrop other songs" → "those songs name-drop others in turn" (the original said the same thing twice)
- Shobha pull-quote had no closing full stop; tidied to match the others.

**One I did not touch, because I'd be guessing:** the film *Elephants in the fig*. If you mean
the 2024 Iranian film, it's *The Seed of the Sacred Fig*. Tell me and I'll set it.

Also worth knowing: your email badge now points at `contact@prajjwalveerbasnet.com`. I've left
it exactly as you set it — just flagging that it changed from the old Gmail address, in case
that was accidental.

---

## Install

Copy `README.md`, `images/readme/`, and **`.github/`** into `~/projects/Prajj-10`, then push.
The `.github/` folder is the one that went missing last time — worth checking with
`ls -a` after you copy.
