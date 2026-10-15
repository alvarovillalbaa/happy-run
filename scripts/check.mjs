import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import assert from 'node:assert/strict';
import { publicFiles } from './public-files.mjs';
import { club, validateClub } from '../club.js';

const root = fileURLToPath(new URL('../', import.meta.url));
validateClub(club);
for (const file of publicFiles) {
  assert.ok((await stat(resolve(root, file))).size > 0, `${file} is missing or empty`);
  if (!file.endsWith('.html')) continue;
  const html = await readFile(resolve(root, file), 'utf8');
  assert.match(html, /<html lang="es">/, `${file} needs a Spanish language declaration`);
  assert.match(html, /name="viewport"/, `${file} needs viewport metadata`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${file} contains duplicate IDs`);
  for (const [, link] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(?:https:|data:)/.test(link) || link.startsWith('/')) continue;
    const [target, hash] = link.split('#');
    if (!target) {
      assert.ok(ids.includes(hash), `${file}: anchor ${link} has no target`);
      continue;
    }
    const destination = resolve(root, dirname(file), target.endsWith('/') ? `${target}index.html` : target);
    assert.ok((await stat(destination)).isFile(), `${file}: broken link ${link}`);
    if (hash) assert.ok((await readFile(destination, 'utf8')).includes(`id="${hash}"`), `${file}: missing destination anchor ${link}`);
  }
}
const css = await readFile(resolve(root, 'styles.css'), 'utf8');
assert.match(css, /prefers-reduced-motion/, 'Reduced-motion support is required');
assert.match(css, /focus-visible/, 'Visible keyboard focus is required');
console.log(`Checked ${publicFiles.length} public files, local links, assets, anchors and club configuration.`);
