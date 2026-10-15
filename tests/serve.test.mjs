import test from 'node:test';
import assert from 'node:assert/strict';
import { createSiteServer } from '../scripts/serve.mjs';

test('public pages work under the project prefix and local-only files stay unavailable', async (t) => {
  const server = createSiteServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const path of ['/', '/happy-run/', '/happy-run/app.js', '/happy-run/assets/smile.svg', '/privacy.html']) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  }
  for (const path of ['/.git/config', '/package.json', '/scripts/serve.mjs', '/not-a-page', '/%2e%2e/package.json']) {
    const response = await fetch(origin + path);
    assert.equal(response.status, 404, path);
    assert.match(await response.text(), /Nos hemos salido/);
  }
  const head = await fetch(origin + '/happy-run/styles.css', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.equal((await fetch(origin + '/', { method: 'POST' })).status, 405);
});
