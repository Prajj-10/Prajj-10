# README Stats — full options review

> **Tested live on 9 Sep 2026.** I checked every endpoint below against your username rather
> than trusting the docs, and three of the popular ones are dead. Results table first.
>
> | Widget | Hits GitHub's API? | Measured | Verdict |
> |---|---|---|---|
> | `img.shields.io` badges | no | 3/3 OK, 38 ms | ✅ using it |
> | `readme-typing-svg.demolab.com` | no | 3/3 OK, 561 ms | ✅ using it |
> | `spotify-recently-played-readme` | no | 3/3 OK, 477 ms | ✅ kept, in the drawer |
> | `streak-stats.demolab.com` | **yes** | 200 once, then **503 ×3** | ❌ too flaky to ship |
> | `github-readme-stats.vercel.app` | **yes** | **503** | ❌ dead — see note below |
> | `github-readme-activity-graph` | **yes** | **402** | ❌ dead (my pick last iteration) |
> | `github-contributor-stats` | **yes** | **402** | ❌ dead |
> | `github-profile-summary-cards` | **yes** | 200 | ⚠️ works today, same risk; data thin |
> | `ghchart.rshah.org` | **yes** | 200 | ❌ light-grey empty cells clash on dark |
>
> ### The pattern, which is the actually useful finding
> Every service that **queries GitHub's API on demand** is rate-limited, out of quota, or
> both. Every service that just **renders something** is fast and reliable. The streak card
> proved it live: it returned 200 when I first tested it, then 503 on three consecutive
> retries thirty minutes later.
>
> **So: no GitHub-API-backed third-party card belongs in your README.** Anything of that kind
> has to be generated inside your own Actions and committed to your own repo. That is what
> `snake.yml` and `metrics.yml` do.
>
> ### ⚠️ Your current README has a broken image on it right now
> The top-languages donut at the bottom of your live profile is served by
> `github-readme-stats.vercel.app`, and that host currently returns **503**. So that card is a
> broken image on your profile as it stands today. It was already the wrong card for you (see
> §1); now it is also a dead one. Removing it is not a style call any more.

---

## The problem that changes every answer: your flagships are private

Cue, Slipstream, Song Reference Network and Shobha's Delicacies are private. Your **public**
repos are `cardiac-sonography-anatomy-quiz`, `Taxi-Booking-System`, `Elevator_Project_C_Sharp`,
`Hotel-Management-System`, `Bhansa`, `Tuberculosis-Prediction-App`, `Futsal-App`,
`Tomato-Game`, `JavaWebProject`, `JavaCollegeProjects`, `ASCompSci`, `Sorting-Algorithms`,
`Flutter`, plus a fork.

That is almost entirely 2021–2024 coursework.

**So the top-languages donut currently on your README is actively lying about you.** It reads
your public repos only, which means it's weighting Java coursework and C# exercises against
the TypeScript, Dart, Astro and Python you actually write now. The card looks like data and
is therefore more persuasive than prose — which is exactly why a wrong one is worse than none.

Every option below is graded on whether it can see private work.

---

## The options

### 1. `github-readme-stats` — stats card + top languages
`anuraghazra/github-readme-stats`

- **Stats card:** total stars, commits, PRs, issues, contributed-to. **Sees private: no**
  (commit count can include private if you use your own instance).
- **Top languages:** language breakdown by repo bytes. **Sees private: no**, on the public
  instance.
- **Fix:** deploy your own instance to Vercel (10 minutes, free) with a PAT carrying `repo`
  scope, then `&count_private=true` and the card reads everything. This is the single most
  common fix and it's well documented.
- **Verdict on the stats card:** ❌ skip regardless. Its headline number is stars. You have
  2\. A card whose biggest number is "2" is worse than no card.
- **Verdict on top-languages:** ⚠️ only with your own instance. On the public instance it
  misrepresents you.

### 2. `github-readme-streak-stats` — current streak / longest streak / total contributions
`DenverCoder1/github-readme-streak-stats`

- **Sees private:** yes, *if* you enable Settings → Profile → **"Include private
  contributions on my profile."** It reads the contribution graph, not repo contents.
- Shows total contributions, current streak, longest streak.
- **Verdict:** ✅ good candidate. Consistency is a real thing you have — you've been
  committing steadily across 2025–26 — and unlike stars, it's a number that flatters you.
  Caveat: a streak card is brutal on the day you take a week off. It resets to 0 and stays
  visible. Some people find that motivating; some find it stressful. Your call.

### 3. `github-readme-activity-graph` — contribution line chart
`Ashutosh00710/github-readme-activity-graph`

- A filled line chart of daily contributions over the last ~31 days or a custom range.
- **Sees private:** yes, with the same "include private contributions" setting.
- **Verdict:** ❌ **dead.** This was my pick in iteration 1, and it returns **HTTP 402** — the
  public Vercel instance has hit its usage limit. Do not put it on the README.
- **If you want it back:** fork `Ashutosh00710/github-readme-activity-graph` and deploy it to
  your own Vercel account. Free, ~10 minutes, and then it is yours and cannot 402 on you.
  This is the best upgrade path if you want a graph rather than a streak card.

### 4. `github-profile-trophy` — achievement trophies
`ryo-ma/github-profile-trophy`

- Ranks you into trophy tiers for commits, stars, followers, issues, PRs, repos.
- **Sees private:** no.
- **Verdict:** ❌ skip. Tiers are largely driven by stars and followers. Yours would render
  as a row of C and B ranks, which reads worse than showing nothing.

### 5. `snk` — the snake eating your contribution graph
`Platane/snk`, run as a GitHub Action

- Generates an animated SVG (and a dark variant) on a schedule, commits it to a branch, and
  you reference it from the README.
- **Sees private:** it renders whatever your public contribution graph shows, so again the
  "include private contributions" setting governs it.
- Runs on a cron (typically every 12–24h) via Actions. Needs a workflow file in the repo.
- **Verdict:** ✅ you said yes, and it's a good fit — it's the one widely-loved animation
  that isn't a stat pretending to be an achievement. I'll wire up the workflow.

### 6. `readme-typing-svg` — animated typing line
`DenverCoder1/readme-typing-svg`

- An SVG that types out one or more lines on a loop. Fully themeable (font, size, colour,
  speed, cursor).
- **Verdict:** ✅ you said yes. Worth spending effort on the *lines*, since that's all it is.
  Your positioning line is the obvious first one, and I'd rotate two or three.

### 7. `lowlighter/metrics` — the powerful one ⭐
`lowlighter/metrics`, run as a GitHub Action

This is the serious option and it deserves its own paragraph. It runs in *your* Actions with
*your* PAT, so **it sees private repos natively** — no Vercel deploy needed. It has ~40
plugins. The ones relevant to you:

- **`languages` with `indepth`** — a real language breakdown that can include private repos
  and can be weighted by *recent* commits rather than lifetime repo size. This is the correct
  fix for the coursework-skew problem.
- **`isocalendar`** — an isometric 3D contribution calendar. Genuinely striking, and almost
  nobody has it. Half-year or full-year.
- **`activity`** — a recent-activity feed.
- **`habits`** — which hours and days you actually commit in. Quirky and personal.
- **`achievements`**, **`stars`**, **`followup`** — skip these, same star problem.
- **Cost:** one workflow file, one PAT, runs on a cron. More setup than a URL.
- **Verdict:** ✅ **strongest option if you're willing to add a workflow.** `languages
  --indepth` + `isocalendar` would give you two panels no other profile has, both accurate.

### 8. WakaTime — coding time by language ⭐ the honest one
`wakatime.com` + `github-readme-stats`'s wakatime card, or metrics' wakatime plugin

- Tracks time spent in your editor, per language, per project. **Completely sidesteps the
  private-repo problem**, because it measures your keyboard, not your repos.
- Requires installing a WakaTime plugin in your editor and letting it accumulate data — so
  it shows nothing useful for the first couple of weeks.
- **Verdict:** ⚠️ the most *accurate* representation of what you actually work on, but it
  needs lead time. Worth starting now even if it doesn't ship in this iteration — in a month
  it becomes the best card on the page.

### 9. `github-profile-summary-cards`
`vn7n24fzkq/github-profile-summary-cards`

- A set of cards: languages by repo, languages by commit, productive time of day, profile
  details. Runs as an Action, so it can carry a PAT.
- **"Languages by commit"** is notable — it weights by what you've been committing rather
  than repo size, which is closer to the truth for you.
- **Verdict:** ⚠️ decent, but `metrics` does the same job better in one image.

### 10. Custom SVG generated from your own site ⭐ the unique one

Nobody else can do this one, because it's your data. A scheduled Action reads your site's
content (the `CURRENTLY` panel and `LATEST CHANGES` feed already exist as markdown in the
portfolio repo), renders a small SVG panel styled exactly like your site's, and commits it.
The README then always shows what you're working on right now, in your own design language,
with no third-party service involved.

- **Verdict:** ✅ the most *characterful* option on this list, and it's the one that actually
  ties the README to the site rather than decorating it. More work than anything else here.
  I'd suggest it as iteration 3 rather than now.

### 11. Shields.io badges
- Static or dynamic badges — flat, for-the-badge, or custom-coloured.
- Useful not as *stats* but as your site's **status vocabulary**: `launching`, `shipped`,
  `in-progress`, `collaborator`, in your site's exact colours, next to each project.
- **Verdict:** ✅ doing this regardless. It's not a stat, it's the visual handshake between
  the README and the site.

### 12. Spotify (you already have two)
- The now-playing widget renders as dead space when you're not listening; the
  recently-played strip always shows something.
- **Verdict:** keep **one**. I'd keep recently-played, inside the `<details>` drawer.

---

## What I'd actually do

**Shipped in iteration 2 (zero setup, all verified 200 OK):**
1. **Typing SVG** under the header — rotating lines about what you're building now.
2. ~~**Streak card**~~ — I built and themed it (it reads **951 contributions, current streak
   20, longest 20**), then pulled it back out when it started returning 503 on every retry.
   Its data was the most flattering thing available; its host cannot be relied on. Ship the
   Actions-generated `metrics.yml` panel instead.
3. **Status badges** on each project in your site's `launching` / `shipped` / `in-progress` /
   `collaborator` colours.
4. **Removed** the top-languages donut (wrong data *and* a dead host), replaced by a
   hand-written stack line.

**One thing for you to click right now:**
> GitHub → Settings → Profile → **Include private contributions on my profile** ✅
>
> Without this, the activity graph and the snake both render your last two years as nearly
> empty, because your real work is private. This single checkbox is worth more than any card
> on this list.

**Added, needs one click from you:**
5. **Snake** — `.github/workflows/snake.yml` is written and included. It generates
   `snake.svg` and `snake-dark.svg` twice a day and pushes them to an `output` branch. The
   two snake URLs in the README return **404 until the workflow runs once** — go to the
   repo's **Actions** tab and hit *Run workflow* on "Generate contribution snake", and they
   go live. Until then those two images show as broken.
6. **`lowlighter/metrics`** with `languages --indepth` and `isocalendar`. This is what
   finally makes your language breakdown truthful, and the isometric calendar is the most
   distinctive visual available.

**Start now, ship later:**
7. **WakaTime.** Install the plugin today; in a month it's the most honest stat you can show.

**Skip:**
- github-readme-stats' main stats card (headline number is stars)
- profile trophies (star and follower driven)
- the public-instance top-languages donut (misrepresents you)
