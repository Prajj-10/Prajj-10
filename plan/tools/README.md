# Regenerating the assets

Both scripts are parameterised — re-run them when a demo changes or you want to retune the
header.

## Demo GIFs

```bash
npm i playwright gifsicle && npx playwright install chromium
node capture-demos.mjs slipstream   # also: cue, shobha
```

Frames land in `frames/<name>/`. Then:

```bash
ffmpeg -y -framerate 10 -i frames/cue/f%03d.png \
  -vf "scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
  -loop 0 cue.raw.gif
node_modules/gifsicle/vendor/gifsicle -O3 --lossy=40 cue.raw.gif -o cue.gif
```

Per-demo settings (frame count, interval, and the scripted clicks/keystrokes) are in the
`CONFIGS` object at the top of `capture-demos.mjs`.

Note the `ctx.route` block: it rewrites `media-src 'self'` to `media-src 'self' blob:` so the
Cue demo can actually play. Once that header is fixed on the live site, the interceptor
becomes a no-op and can be deleted.

## Header

```bash
python3 make-header.py
```

Colours, bar count, sweep duration and the amplitude envelope are all constants at the top.
Writes both `header-dark.svg` and `header-light.svg`.
