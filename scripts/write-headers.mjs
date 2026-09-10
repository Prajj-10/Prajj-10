/*
  Writes dist/_headers — the security headers Cloudflare serves with every
  static asset.

    node scripts/write-headers.mjs        (runs automatically after astro build)

  ---- Why this is generated rather than checked in ----

  The Content-Security-Policy names a SHA-256 hash for every inline <script>
  in the built site, so `script-src` can allow exactly those twelve scripts
  and nothing else — no 'unsafe-inline', which is the whole point. Astro
  inlines its smaller bundled scripts, and their content changes whenever the
  source does, so a hand-written policy would go stale on the next build and
  the symptom would be the site silently losing its mode switcher.

  Generating from the output that actually shipped means the policy cannot
  describe a build that no longer exists.

  ---- Why style-src still carries 'unsafe-inline' ----

  Not an oversight, and not laziness. The site has 301 inline `style=`
  attributes — the language bars' widths, the monogram's --mark-size, every
  figure's aspect ratio — and an attribute cannot carry a hash. The precise
  form would be `style-src 'self' <hashes>` plus `style-src-attr
  'unsafe-inline'`, but style-src-attr is not carried everywhere, and where it
  is missing the browser falls back to style-src, which — because naming any
  hash makes a browser ignore 'unsafe-inline' in that same directive — would
  block all 301 attributes and render the site wrong.

  So style-src takes 'unsafe-inline' knowingly. It is a real weakening and
  worth naming: it buys back the ability to inject a <style> block. That is a
  much smaller prize than script execution, which is what the hashes protect
  and where no exception is made.
*/

import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

/** Every .html under dist, at any depth. */
async function pages(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await pages(path)));
    else if (entry.name.endsWith('.html')) found.push(path);
  }
  return found;
}

/*
  The hash is over the script's exact bytes, which is what the browser hashes
  too — including the leading newline and indentation. Anything that
  normalises whitespace here produces a policy that looks right and blocks
  every script it names.

  The negative lookahead skips <script src=...>: an external script is covered
  by 'self' and hashing it would be meaningless anyway, since the hash applies
  to the element's inline content and it has none.
*/
const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;

const sha256 = (body) => `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`;

const files = await pages(DIST);
const hashes = new Set();

for (const file of files) {
  const html = await readFile(file, 'utf8');
  for (const [, body] of html.matchAll(INLINE_SCRIPT)) hashes.add(sha256(body));
}

if (hashes.size === 0) {
  /* Loud, not silent. Zero hashes means the regex stopped matching what Astro
     emits, and the policy that would be written from it is one that blocks
     every inline script on the site — a completely broken deploy that looks
     like a successful build. */
  console.error('write-headers: found no inline scripts in dist/.');
  console.error('Astro’s output shape has changed and the CSP would block everything. Not writing _headers.');
  process.exit(1);
}

const csp = [
  "default-src 'self'",
  /* The hashes, and nothing else. No 'unsafe-inline', no 'unsafe-eval':
     React ships its production build and Astro's router does not evaluate
     strings, so neither is needed. */
  `script-src 'self' ${[...hashes].sort().join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  /* data: for the two inline SVGs the stylesheets carry. */
  "img-src 'self' data:",
  /* Every face is a system font; nothing is fetched. */
  "font-src 'self'",
  /* /api/send-email, /api/note and /search-index.json — all same-origin. */
  "connect-src 'self'",
  /* blob: is required, not decorative. CueOnsetDemo decodes the excerpt in the
     page and hands the resulting object URL to an <audio> element
     (src/components/demos/CueOnsetDemo.tsx). Without blob: here the browser
     blocks that load, the take ends the instant the countdown finishes, and the
     demo silently never plays — no error surfaces in the interface. */
  "media-src 'self' blob:",
  /* The site embeds nothing and is embedded nowhere. */
  "object-src 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  /* Stops an injected <base> from re-pointing every relative URL on the page. */
  "base-uri 'self'",
  /* The contact form and the note composer post to this origin only. */
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ');

const headers = `# Generated by scripts/write-headers.mjs on every build — do not edit.
# The script-src hashes below are computed from the inline scripts in this
# exact build. Editing them by hand will break the next deploy, not this one.

/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: accelerometer=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
`;

await writeFile(join(DIST, '_headers'), headers, 'utf8');

console.log(`_headers written — ${hashes.size} inline script hashes across ${files.length} pages.`);
