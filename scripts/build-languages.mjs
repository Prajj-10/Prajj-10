#!/usr/bin/env node
/**
 * Builds the language-breakdown bar from the GitHub API.
 *
 * Why this exists rather than a stats card: the widely used ones read PUBLIC repos only, so
 * they weight 2021–24 coursework against the work that is actually current — and Cue,
 * Slipstream, Shobha's and the Song Reference Network are all private. This runs in your own
 * Actions with your own token, so private repositories are counted and the picture is true.
 *
 * Output:
 *   images/readme/languages.svg   one fixed dark card, matching the listening/watching pair
 *
 * Auth:
 *   GH_TOKEN   a classic PAT with `repo` scope. Without it the script still runs but sees
 *              public repositories only, and says so in the console.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const OUT = 'images/readme/languages.svg';
const OUT_M = 'images/readme/languages-m.svg';
const USER = process.env.GH_USER || 'Prajj-10';
const TOKEN = process.env.GH_TOKEN || '';
const TOP = 8;

/* Forks aren't your code, and archived repos aren't current. Add any repo you'd rather not
   count here — a coursework dump you don't want weighted, say. */
const SKIP = new Set(['it-cert-automation-practice']);

/* Linguist's own colours, so the bar reads the same as the language dot on any repo page. */
const COLOURS = {
  Dart: '#00B4AB', TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5',
  'C#': '#178600', Java: '#b07219', HTML: '#e34c26', CSS: '#663399', Astro: '#ff5a03',
  'Jupyter Notebook': '#DA5B0B', 'C++': '#f34b7d', C: '#555555', Kotlin: '#A97BFF',
  Swift: '#F05138', Shell: '#89e051', Ruby: '#701516', Go: '#00ADD8', Rust: '#dea584',
  PHP: '#4F5D95', Vue: '#41b883', SCSS: '#c6538c', Makefile: '#427819', Dockerfile: '#384d54',
  CMake: '#DA3434', Objective_C: '#438eff',
};
const FALLBACK = ['#8b949e', '#6e7681', '#484f58', '#57606a'];

const CARD = { bg: '#151b23', border: '#232b36', text: '#e9eef5', muted: '#9fadbd', dim: '#7d8b9c' };
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

async function gh(url) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'readme-language-builder' };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function repos() {
  const out = [];
  for (let page = 1; page <= 10; page++) {
    // /user/repos sees private repos; /users/:u/repos is the unauthenticated fallback
    const url = TOKEN
      ? `https://api.github.com/user/repos?per_page=100&affiliation=owner&page=${page}`
      : `https://api.github.com/users/${USER}/repos?per_page=100&page=${page}`;
    const batch = await gh(url);
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out.filter((r) => !r.fork && !r.archived && !SKIP.has(r.name));
}

// `mobile` swaps to a 380-wide card with a 2-column legend. GitHub honours
// `<source media="(max-width: …)">` inside <picture>, so phones get this instead of a
// 1024px card squeezed to ~37% with 5px legend text.
function render(rows, totals, mobile = false) {
  const W = mobile ? 380 : 1024;
  const PAD = mobile ? 14 : 20;
  const BAR_Y = mobile ? 66 : 74;
  const BAR_H = mobile ? 14 : 16;
  const BAR_W = W - PAD * 2;
  const perRow = mobile ? 2 : 4;
  const legendRows = Math.ceil(rows.length / perRow);
  const ROW_H = mobile ? 22 : 26;
  const H = BAR_Y + BAR_H + (mobile ? 20 : 24) + legendRows * ROW_H + 8;
  const p = [];

  p.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Language breakdown: ${esc(rows.map((r) => `${r.name} ${r.pct.toFixed(1)}%`).join(', '))}">`);
  p.push('<title>Languages by bytes of code</title>');
  p.push(`<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="${CARD.bg}"/>`);

  p.push(`<text x="${PAD}" y="34" font-family="${SANS}" font-size="${mobile ? 15 : 16}" font-weight="600" fill="${CARD.text}">Languages</text>`);
  p.push(`<text x="${W - PAD}" y="34" text-anchor="end" font-family="${SANS}" font-size="${mobile ? 11 : 12.5}" fill="${CARD.dim}">${totals.repos} repos${TOKEN ? '' : ' (public only)'}</text>`);
  p.push(`<text x="${PAD}" y="${mobile ? 50 : 54}" font-family="${SANS}" font-size="${mobile ? 11 : 12.5}" fill="${CARD.muted}">by bytes of code${TOKEN ? ', public and private' : ''}</text>`);

  // stacked bar, clipped so the rounded ends stay rounded
  p.push(`<clipPath id="bar"><rect x="${PAD}" y="${BAR_Y}" width="${BAR_W}" height="${BAR_H}" rx="${BAR_H / 2}"/></clipPath>`);
  p.push(`<g clip-path="url(#bar)">`);
  let x = PAD;
  rows.forEach((r) => {
    const w = (r.pct / 100) * BAR_W;
    p.push(`<rect x="${x.toFixed(2)}" y="${BAR_Y}" width="${Math.max(w, 0.5).toFixed(2)}" height="${BAR_H}" fill="${r.colour}"/>`);
    x += w;
  });
  p.push('</g>');

  // legend
  rows.forEach((r, i) => {
    const col = i % perRow, row = Math.floor(i / perRow);
    const lx = PAD + col * (BAR_W / perRow);
    const ly = BAR_Y + BAR_H + (mobile ? 34 : 40) + row * ROW_H;
    p.push(`<circle cx="${lx + 5}" cy="${ly - 4}" r="${mobile ? 5 : 6}" fill="${r.colour}"/>`);
    p.push(`<text x="${lx + (mobile ? 16 : 20)}" y="${ly}" font-family="${SANS}" font-size="${mobile ? 12.5 : 14}" fill="${CARD.text}">${esc(r.name)}</text>`);
    // right-aligned at a fixed offset so the percentages line up in a column, rather than
    // floating off the end of names of wildly different length ("C#" vs "Jupyter Notebook")
    p.push(`<text x="${lx + (mobile ? BAR_W / perRow - 6 : 200)}" y="${ly}" text-anchor="end" font-family="${SANS}" font-size="${mobile ? 11.5 : 13}" fill="${CARD.dim}">${r.pct.toFixed(1)}%</text>`);
  });

  p.push('</svg>');
  return p.join('\n');
}

async function main() {
  if (!TOKEN) console.warn('! GH_TOKEN not set — counting public repositories only.');
  const list = await repos();
  const bytes = new Map();

  for (const r of list) {
    let langs;
    try { langs = await gh(r.languages_url); } catch (e) { console.warn(`  ! ${r.name}: ${e.message}`); continue; }
    for (const [name, n] of Object.entries(langs)) bytes.set(name, (bytes.get(name) || 0) + n);
  }

  const total = [...bytes.values()].reduce((a, b) => a + b, 0);
  if (!total) throw new Error('no language bytes found — nothing to draw');

  const sorted = [...bytes.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, TOP);
  const restBytes = sorted.slice(TOP).reduce((a, [, n]) => a + n, 0);

  const rows = top.map(([name, n], i) => ({
    name, pct: (n / total) * 100,
    colour: COLOURS[name] || FALLBACK[i % FALLBACK.length],
  }));
  if (restBytes > 0) rows.push({ name: 'Other', pct: (restBytes / total) * 100, colour: '#484f58' });

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, render(rows, { repos: list.length }, false));
  await fs.writeFile(OUT_M, render(rows, { repos: list.length }, true));

  for (const f of [OUT, OUT_M]) {
    const { size } = await fs.stat(f);
    console.log(`  ${f}  ${(size / 1024).toFixed(1)} KB`);
  }
  console.log(`  from ${list.length} repositories`);
  for (const r of rows) console.log(`    ${r.name.padEnd(18)} ${r.pct.toFixed(1)}%`);
}

main().catch((e) => { console.error('failed:', e.message); process.exit(1); });
