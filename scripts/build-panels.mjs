#!/usr/bin/env node
/**
 * Builds the "recently watched" panel as a self-contained SVG.
 *
 * Letterboxd publishes a public RSS feed per member — no API key, no OAuth, nothing that can
 * expire. Diary entries carry the film title, year, rating, watch date and a poster URL, so
 * this needs no credentials and no third-party service sitting in the middle.
 *
 * Output:
 *   images/readme/watching.svg  — one fixed dark card, matched to the Spotify widget beside it
 *
 * (Music is handled by the spotify-recently-played widget directly in the README, so there is
 * nothing to generate for it here.)
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = 'images/readme';
const LETTERBOXD_USER = process.env.LETTERBOXD_USER || 'Prajj_';
const COUNT = 4;
const POSTER_SIZES = ['150-0-225', '250-0-375', '300-0-450'];  // 150 is plenty for a 27px thumb

// ---------------------------------------------------------------- theme tokens
const THEMES = {
  dark: {
    card: '#161b22', border: '#30363d', text: '#e6edf3',
    muted: '#8b949e', star: '#d29922', head: '#8b949e',
  },
  light: {
    card: '#f6f8fa', border: '#d0d7de', text: '#1f2328',
    muted: '#59636e', star: '#9a6700', head: '#59636e',
  },
};

const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** Rough visual truncation — SVG has no text wrapping, so titles get clipped by width. */
function clip(s, max) {
  s = String(s ?? '');
  return s.length <= max ? s : s.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

function stars(rating) {
  if (rating == null || rating === '') return '';
  const r = parseFloat(rating);
  if (Number.isNaN(r)) return '';
  return '★'.repeat(Math.floor(r)) + (r % 1 >= 0.5 ? '½' : '');
}

/** Takes one URL or a list of fallbacks; returns the first that fetches, as a data: URI. */
async function dataUri(urls) {
  for (const url of [].concat(urls || [])) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'readme-panel-builder' } });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const type = res.headers.get('content-type') || 'image/jpeg';
      return `data:${type};base64,${buf.toString('base64')}`;
    } catch { /* try the next candidate */ }
  }
  console.warn('  ! no artwork could be fetched for', [].concat(urls || [])[0]);
  return null;
}

// ---------------------------------------------------------------- letterboxd
async function getWatched() {
  const res = await fetch(`https://letterboxd.com/${LETTERBOXD_USER}/rss/`, {
    headers: { 'User-Agent': 'readme-panel-builder' },
  });
  if (!res.ok) throw new Error(`Letterboxd RSS ${res.status}`);
  const xml = await res.text();

  const pick = (block, tag) => {
    const m = block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`));
    return m ? m[1].trim() : null;
  };

  const items = [];
  for (const block of xml.split('<item>').slice(1)) {
    const filmTitle = pick(block, 'letterboxd:filmTitle');
    if (!filmTitle) continue;                       // skip list/review-only entries
    const posterRaw = (block.match(/<img src="([^"]+)"/) || [])[1] || null;
    // Letterboxd only serves a whitelist of pre-generated sizes — anything else 403s. 250x375
    // is 2x the card width and, oddly, lighter than 230x345. Fall back down the list, then to
    // whatever the feed gave us, so a change on their side loses quality rather than the image.
    const poster = posterRaw
      ? POSTER_SIZES.map((sz) => posterRaw.replace(/-0-\d+-0-\d+-crop\.jpg/, `-0-${sz}-crop.jpg`))
          .concat(posterRaw)
      : null;
    items.push({
      title: filmTitle,
      year: pick(block, 'letterboxd:filmYear'),
      rating: pick(block, 'letterboxd:memberRating'),
      watched: pick(block, 'letterboxd:watchedDate'),
      link: pick(block, 'link'),
      poster,
    });
    if (items.length >= COUNT) break;
  }
  return items;
}

// ---------------------------------------------------------------- rendering
// Deliberately mirrors the spotify-recently-played widget it sits beside: same 400x272 card,
// same fill, same divider positions, same type scale and baselines. That widget renders a
// FIXED dark card regardless of the reader's theme, so this one does too — a theme-adaptive
// panel would go light next to a dark one and the pair would stop looking like a pair.
const W = 400, H = 272;
const C = {
  card: '#151b23', border: '#232b36', text: '#e9eef5',
  muted: '#9fadbd', dim: '#7d8b9c', star: '#e0a232',
};
const ROW_CENTERS = [76, 132, 188, 244];
const DIVIDERS = [47.5, 103.5, 159.5, 215.5];
const ART_W = 27, ART_H = 40, TEXT_X = 60, RIGHT_X = 384;

function renderPanel({ items, user }) {
  const p = [];
  p.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Recently watched on Letterboxd: ${esc(items.map((f) => f.title).join(', '))}">`);
  p.push(`<title>Recently watched on Letterboxd</title>`);
  p.push(`<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="${C.card}"/>`);

  // Letterboxd lockup, built to the Spotify widget's measured geometry so the two cards read
  // as a set: icon occupying x 16..44.8, a 1.2 gap, then the wordmark, all centred on y=24.2.
  // The title still lands further right than Spotify's 103.77 — "Letterboxd" is three
  // characters longer than "Spotify" and no amount of spacing fixes that — but the gap
  // between lockup and title is Spotify's own 7.3, and the vertical centres line up at 24.
  p.push('<g>'
    + '<circle cx="24" cy="24.2" r="8" fill="#FF8000"/>'
    + '<circle cx="30.4" cy="24.2" r="8" fill="#00E054"/>'
    + '<circle cx="36.8" cy="24.2" r="8" fill="#40BCF4"/>'
    + `<text x="46" y="28.6" font-family="${SANS}" font-size="12.5" font-weight="700" letter-spacing="-0.1" fill="${C.text}">Letterboxd</text>`
    + '</g>');
  p.push(`<text x="116" y="30" font-family="${SANS}" font-size="16" font-weight="600" fill="${C.text}">Recently Watched</text>`);
  p.push(`<text x="${RIGHT_X}" y="30" text-anchor="end" font-family="${SANS}" font-size="12.5" font-weight="600" fill="${C.text}">${esc(user)}</text>`);
  for (const y of DIVIDERS) p.push(`<rect x="16" y="${y}" width="368" height="1" fill="${C.border}"/>`);

  items.forEach((f, i) => {
    const cy = ROW_CENTERS[i];
    const ay = cy - ART_H / 2;
    if (f.art) {
      p.push(`<clipPath id="p${i}"><rect x="16" y="${ay}" width="${ART_W}" height="${ART_H}" rx="3"/></clipPath>`);
      p.push(`<image x="16" y="${ay}" width="${ART_W}" height="${ART_H}" href="${f.art}" preserveAspectRatio="xMidYMid slice" clip-path="url(#p${i})"/>`);
    } else {
      p.push(`<rect x="16" y="${ay}" width="${ART_W}" height="${ART_H}" rx="3" fill="${C.border}"/>`);
    }
    p.push(`<text x="${TEXT_X}" y="${cy - 4.6}" font-family="${SANS}" font-size="14" font-weight="600" fill="${C.text}">${esc(clip(f.title, 30))}</text>`);
    p.push(`<text x="${TEXT_X}" y="${cy + 14.4}" font-family="${SANS}" font-size="13" fill="${stars(f.rating) ? C.star : C.muted}">${esc(stars(f.rating) || 'unrated')}</text>`);
    p.push(`<text x="${RIGHT_X}" y="${cy + 2.7}" text-anchor="end" font-family="${SANS}" font-size="11.5" fill="${C.dim}">${esc(f.year || '')}</text>`);
  });

  p.push('</svg>');
  return p.join('\n');
}

// ---------------------------------------------------------------- main
async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const films = await getWatched();
  for (const f of films) f.art = f.poster ? await dataUri(f.poster) : null;

  const file = path.join(OUT_DIR, 'watching.svg');
  await fs.writeFile(file, renderPanel({ items: films, user: LETTERBOXD_USER }));
  const { size } = await fs.stat(file);
  console.log(`  ${file}  ${(size / 1024).toFixed(0)} KB`);
  console.log(`watched: ${films.map((f) => `${f.title} (${stars(f.rating) || 'unrated'})`).join(', ')}`);
}

main().catch((e) => {
  console.error('failed:', e.message);
  process.exit(1);
});
