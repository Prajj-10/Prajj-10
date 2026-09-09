# Site bug: the Cue demo cannot play, for anyone

Found while recording the README GIFs. This is on the live site right now.

## What happens

Go to <https://prajjwalveerbasnet.com/projects/cue#see-it-working> and press **Load**, then
**Play**. The decode works — you get the readout:

```
Decoded 960,000 samples at 48.0kHz
Bucketed to 650 bins, 31ms each
Found 27 onsets above the adaptive threshold
```

The waveform and the onset track render. The 3-2-1 countdown runs. Then the transport button
flips straight back from **Cancel** to **Play**, position stays at `0.00s`, and nothing ever
moves. No error is shown in the interface.

The console says why:

```
Loading media from 'blob:https://prajjwalveerbasnet.com/9394f90c-…' violates the following
Content Security Policy directive: "media-src 'self'". The action has been blocked.
```

## Cause

Your response headers carry:

```
content-security-policy: default-src 'self'; …; media-src 'self'; …
```

`media-src 'self'` does **not** cover `blob:` — blob URLs need to be listed explicitly. The
Cue player decodes the excerpt and hands the resulting object URL to an `<audio>` element, and
CSP blocks the load. The AudioContext is already `closed` by then (it did its decode job), so
the take has no clock, ends immediately, and the UI falls back to `Play`.

Reproduced in a clean Chromium, headless and headed, on 9 Sep 2026.

## Fix

One token, in whatever sets your headers (the Cloudflare Worker, or `public/_headers`):

```diff
- media-src 'self';
+ media-src 'self' blob:;
```

If the tapper ever loads a user's own file via `URL.createObjectURL`, that same change is
required for it to work at all — so this is not just a demo fix.

## Worth checking at the same time

Two other CSP violations fire on the same page load. Neither breaks the demo, but both are
noise in the console:

1. `https://static.cloudflareinsights.com/beacon.min.js/…` is blocked by `script-src`.
   Cloudflare Web Analytics is being injected but cannot run — so either you are not getting
   the analytics you think you are, or the auto-injection should be turned off in the
   Cloudflare dashboard.
2. An inline script is blocked for not matching any of the `sha256-…` hashes in `script-src`.
   Probably a hash that went stale after a build. Worth finding, since a legitimately blocked
   inline script means something on the page is not running.

## Why this matters for the README

The GIF I recorded is the demo working. To record it I patched the response header locally
(`media-src 'self' blob:`) via a Playwright route interceptor — the capture script says so in
a comment.

**So the README will link to a demo that does not currently work.** Ship the one-token CSP
fix before you publish the README, or the best asset on your profile sends people to a dead
button.
