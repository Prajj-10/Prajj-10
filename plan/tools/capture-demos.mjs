import { chromium } from 'playwright';
import fs from 'node:fs';

const WORD_ENDS = [0.640, 1.131, 2.421, 2.709, 3.317, 5.131, 5.611, 5.856, 6.496];
const LAG = 0.150; // the human reaction lag the demo is about

const CONFIGS = {
  slipstream: {
    url: 'https://prajjwalveerbasnet.com/projects/slipstream',
    root: 'figure.slip', clipH: 812, park: 110, viewport: { width: 1400, height: 1150 },
    setup: async (p) => {
      await p.locator('button.slip__speed', { hasText: '8x' }).first().click();
      await p.waitForTimeout(300);
      await p.locator('button.slip__play').first().click();
    },
    frames: 52, interval: 150, timeline: [],
  },

  cue: {
    url: 'https://prajjwalveerbasnet.com/projects/cue',
    root: 'figure.cue', clipH: null, park: 110, viewport: { width: 1400, height: 1150 },
    setup: async (p) => {
      await p.locator('button.cue__play').first().click();
      await p.waitForFunction(
        () => document.querySelector('button.cue__play')?.innerText.trim() === 'Play',
        null, { timeout: 30000 });
      await p.waitForTimeout(400);
      await p.locator('button.cue__play').first().click();
      await p.waitForFunction(() => {
        const r = document.querySelectorAll('figure.cue input[type=range]')[1];
        return r && parseFloat(r.value) > 0.05;
      }, null, { timeout: 30000 });
    },
    frames: 92, interval: 110,
    timeline: [
      ...WORD_ENDS.map((t) => ({ at: (t + LAG) * 1000, fn: (p) => p.keyboard.press('Space') })),
      { at: 7400, fn: (p) => p.locator('figure.cue input[type=checkbox]').first().check() },
    ],
  },

  shobha: {
    url: 'https://prajjwalveerbasnet.com/projects/shobhas-delicacies',
    // captured at a narrower viewport: the site's own layout reflows tighter, which removes
    // the dead space to the right of the batch chips
    root: 'figure.rot', clipH: 660, park: 110, setup: null,
    viewport: { width: 1100, height: 1200 },
    frames: 50, interval: 150,
    timeline: [800, 2000, 3200, 4400, 5600, 6800, 8000].map((at) => ({
      at, fn: (p) => p.locator('button.rot__btn--go').first().click(),
    })),
    // the product is randomised per load; keep only a run where the rotation rule
    // is the sole thing separating the two shelves (FIFO wastes nothing).
    validate: (p) => p.evaluate(() => {
      const t = document.querySelector('figure.rot').innerText;
      const n = (t.match(/(\d+)\s+thrown away/g) || []).map((m) => parseInt(m, 10));
      return { ok: n.length === 2 && n[0] === 0 && n[1] >= 4, n };
    }),
  },
};

const name = process.argv[2];
const cfg = CONFIGS[name];
const outDir = `frames/${name}`;

async function runOnce(attempt) {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
  const ctx = await b.newContext({ viewport: cfg.viewport, deviceScaleFactor: 2 });

  // Local-only: the live site sends `media-src 'self'`, which blocks the blob: URL the Cue
  // player hands to its <audio> element. Patched here so the demo records as it will behave
  // once that header is fixed. See plan/site-bug-cue-csp.md.
  await ctx.route('**/*', async (route) => {
    const res = await route.fetch();
    const headers = { ...res.headers() };
    const k = Object.keys(headers).find((h) => h.toLowerCase() === 'content-security-policy');
    if (k && headers[k].includes("media-src 'self'")) {
      headers[k] = headers[k].replace("media-src 'self'", "media-src 'self' blob:");
    }
    await route.fulfill({ response: res, headers });
  });

  const p = await ctx.newPage();
  await p.goto(cfg.url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  await p.waitForTimeout(400);

  await p.locator(cfg.root).first().scrollIntoViewIfNeeded();
  await p.waitForTimeout(600);
  if (cfg.setup) await cfg.setup(p);
  await p.waitForTimeout(120);

  await p.evaluate(([sel, park]) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    window.scrollBy(0, r.top - park);
  }, [cfg.root, cfg.park]);
  await p.waitForTimeout(200);

  const parkedY = await p.evaluate(() => window.scrollY);
  const box = await p.evaluate((sel) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  }, cfg.root);
  const clip = {
    x: Math.round(box.x), y: Math.round(box.y),
    width: Math.round(box.width), height: cfg.clipH || Math.round(box.height),
  };

  const timeline = [...(cfg.timeline || [])].sort((a, b) => a.at - b.at);
  let ti = 0;
  const t0 = Date.now();
  for (let i = 0; i < cfg.frames; i++) {
    const target = t0 + i * cfg.interval;
    while (ti < timeline.length && Date.now() - t0 >= timeline[ti].at) {
      try { await timeline[ti].fn(p); } catch (e) { /* control may be disabled */ }
      ti++;
    }
    const wait = target - Date.now();
    if (wait > 0) await p.waitForTimeout(wait);
    await p.evaluate((y) => { if (window.scrollY !== y) window.scrollTo(0, y); }, parkedY);
    await p.screenshot({ path: `${outDir}/f${String(i).padStart(3, '0')}.png`, clip });
  }

  let verdict = { ok: true };
  if (cfg.validate) verdict = await cfg.validate(p);
  console.log(`attempt ${attempt}: clip=${JSON.stringify(clip)} ${JSON.stringify(verdict)}`);
  await b.close();
  return verdict.ok;
}

const MAX_TRIES = cfg.validate ? 8 : 1;
for (let a = 1; a <= MAX_TRIES; a++) {
  if (await runOnce(a)) { console.log('kept run', a); break; }
  if (a === MAX_TRIES) console.log('WARNING: no clean run found, keeping last');
}
