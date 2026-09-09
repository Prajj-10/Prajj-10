import math, os

W, H = 1200, 208
PAD = 44
BAND_Y, BAND_H = 128, 56          # waveform band
BAND_X0, BAND_X1 = PAD, W - PAD
NBARS = 132
SWEEP = 7.0                        # seconds for one playhead pass

THEMES = {
    "dark":  dict(bg="#0d1117", card="#0d1117", border="#30363d", text="#e6edf3",
                  muted="#8b949e", dim="#6e7681", accent="#58a6ff", wave="#30363d",
                  waveLit="#58a6ff", tick="#3fb950", chip="#161b22", chipBorder="#30363d"),
    "light": dict(bg="#ffffff", card="#ffffff", border="#d0d7de", text="#1f2328",
                  muted="#59636e", dim="#818b98", accent="#0969da", wave="#ccd4dc",
                  waveLit="#0969da", tick="#1a7f37", chip="#f6f8fa", chipBorder="#d0d7de"),
}

def envelope(i, n):
    """Deterministic, song-like amplitude envelope in [0.12, 1.0]."""
    t = i / n
    # a few detuned sines + a pseudo-random jitter, all deterministic
    base = (0.55 + 0.45 * math.sin(2 * math.pi * (t * 3.1 + 0.15))) * 0.55
    swell = 0.45 * (0.5 + 0.5 * math.sin(2 * math.pi * (t * 0.9 - 0.25)))
    jit = ((math.sin(i * 12.9898) * 43758.5453) % 1.0)
    grain = 0.30 * jit
    v = base + swell + grain
    # quiet intro, loud middle, tapered outro
    shape = math.sin(math.pi * min(max(t, 0.0), 1.0)) ** 0.45
    return max(0.12, min(1.0, v * shape))

def onset_positions(n=17):
    """Peaks of the envelope, used as onset ticks."""
    vals = [(i, envelope(i, NBARS)) for i in range(NBARS)]
    peaks = []
    for i in range(2, NBARS - 2):
        v = vals[i][1]
        if v > vals[i-1][1] and v > vals[i+1][1] and v > 0.55:
            peaks.append(i)
    # thin them out so ticks don't crowd
    out, last = [], -99
    for i in peaks:
        if i - last >= 5:
            out.append(i); last = i
    return out[:n]

def build(theme_name):
    c = THEMES[theme_name]
    bw = (BAND_X1 - BAND_X0) / NBARS
    parts = []

    parts.append(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
        f'viewBox="0 0 {W} {H}" role="img" '
        f'aria-label="Prajjwal Veer Basnet — I love building on ideas that I find interesting.">'
    )

    # ---- styles: declarative CSS animation, which renders inside an <img> on GitHub ----
    parts.append(f'''<style>
    .bar {{ animation: breathe 3.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }}
    .tick {{ animation: pass {SWEEP}s linear infinite; }}
    .head {{ animation: sweep {SWEEP}s linear infinite; }}
    .glow {{ animation: sweep {SWEEP}s linear infinite; }}
    .cur  {{ animation: blink 1.1s steps(1) infinite; }}
    @keyframes breathe {{ 0%,100% {{ transform: scaleY(0.82); }} 50% {{ transform: scaleY(1.06); }} }}
    @keyframes sweep   {{ from {{ transform: translateX(0px); }} to {{ transform: translateX({BAND_X1-BAND_X0:.0f}px); }} }}
    @keyframes pass    {{ 0%,100% {{ opacity: .28; }} 48% {{ opacity: .28; }} 50% {{ opacity: 1; }} 62% {{ opacity: .28; }} }}
    @keyframes blink   {{ 0%,49% {{ opacity: 1; }} 50%,100% {{ opacity: 0; }} }}
    @media (prefers-reduced-motion: reduce) {{
      .bar, .tick, .head, .glow, .cur {{ animation: none; }}
    }}
    </style>''')

    # ---- card ----
    parts.append(f'<rect x="0" y="0" width="{W}" height="{H}" rx="12" fill="{c["bg"]}"/>')
    parts.append(f'<rect x="0.5" y="0.5" width="{W-1}" height="{H-1}" rx="12" fill="none" stroke="{c["border"]}"/>')

    SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
    MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"

    # ---- name + line ----
    parts.append(
        f'<text x="{PAD}" y="54" font-family="{SANS}" font-size="34" font-weight="600" '
        f'fill="{c["text"]}">Prajjwal Veer Basnet</text>'
    )
    parts.append(
        f'<text x="{PAD}" y="84" font-family="{SANS}" font-size="16" fill="{c["muted"]}">'
        f'I love building on ideas that I find interesting.</text>'
    )

    # ---- mono meta line with a blinking cursor ----
    meta = "Kathmandu, Nepal"
    parts.append(
        f'<text x="{PAD}" y="107" font-family="{MONO}" font-size="12.5" fill="{c["dim"]}">'
        f'{meta} &#183; <tspan fill="{c["accent"]}">prajjwalveerbasnet.com</tspan>'
        f'<tspan class="cur" fill="{c["accent"]}"> &#9608;</tspan></text>'
    )

    # ---- waveform ----
    parts.append('<g>')
    for i in range(NBARS):
        a = envelope(i, NBARS)
        h = max(2.0, a * BAND_H)
        x = BAND_X0 + i * bw
        y = BAND_Y + (BAND_H - h) / 2
        delay = (i % 11) * 0.17
        parts.append(
            f'<rect class="bar" x="{x:.1f}" y="{y:.1f}" width="{bw*0.62:.2f}" height="{h:.1f}" '
            f'rx="{min(1.4, bw*0.31):.2f}" fill="{c["wave"]}" style="animation-delay:{delay:.2f}s"/>'
        )
    parts.append('</g>')

    # ---- onset ticks under the band, flashing as the playhead reaches them ----
    for i in onset_positions():
        x = BAND_X0 + i * bw + bw * 0.31
        frac = (x - BAND_X0) / (BAND_X1 - BAND_X0)
        delay = -SWEEP * ((0.5 - frac) % 1.0)
        parts.append(
            f'<rect class="tick" x="{x:.1f}" y="{BAND_Y+BAND_H+7}" width="1.6" height="7" rx="0.8" '
            f'fill="{c["tick"]}" style="animation-delay:{delay:.2f}s"/>'
        )

    # ---- playhead ----
    parts.append(
        f'<g class="glow"><rect x="{BAND_X0-14}" y="{BAND_Y-8}" width="14" height="{BAND_H+16}" '
        f'fill="url(#g-{theme_name})" opacity="0.55"/></g>'
    )
    parts.append(
        f'<g class="head"><rect x="{BAND_X0-0.75}" y="{BAND_Y-9}" width="1.5" height="{BAND_H+18}" '
        f'fill="{c["waveLit"]}"/>'
        f'<circle cx="{BAND_X0}" cy="{BAND_Y-11}" r="2.6" fill="{c["waveLit"]}"/></g>'
    )

    parts.append(
        f'<defs><linearGradient id="g-{theme_name}" x1="0" x2="1" y1="0" y2="0">'
        f'<stop offset="0" stop-color="{c["waveLit"]}" stop-opacity="0"/>'
        f'<stop offset="1" stop-color="{c["waveLit"]}" stop-opacity="0.45"/>'
        f'</linearGradient></defs>'
    )

    # ---- baseline rule ----
    parts.append(f'<rect x="{PAD}" y="{H-1.5}" width="{W-2*PAD}" height="0" fill="none"/>')

    parts.append('</svg>')
    return "\n".join(parts)

out = "/home/prajj/Claude/Prajj-10-master/images/readme"
os.makedirs(out, exist_ok=True)
for t in THEMES:
    p = os.path.join(out, f"header-{t}.svg")
    open(p, "w").write(build(t))
    print(p, os.path.getsize(p), "bytes")
