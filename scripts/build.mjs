import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicFiles } from './public-files.mjs';

const root = new URL('../', import.meta.url);
await rm(new URL('dist/', root), { recursive: true, force: true });
for (const file of publicFiles) {
  const target = new URL(`dist/${file}`, root);
  await mkdir(dirname(fileURLToPath(target)), { recursive: true });
  await cp(new URL(file, root), target);
}
console.log(`Prepared ${publicFiles.length} public files in dist/.`);
