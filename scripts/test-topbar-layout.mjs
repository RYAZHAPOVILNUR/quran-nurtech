import assert from 'node:assert/strict';
import test from 'node:test';

const baseUrl = process.env.QURAN_TEST_URL || 'http://127.0.0.1:4321';

test('mushaf header keeps reading controls without the global locale switch', async () => {
  const response = await fetch(`${baseUrl}/mushaf/80`);
  assert.equal(response.status, 200);

  const html = await response.text();
  const header = html.match(/<header class="topbar"[\s\S]*?<\/header>/)?.[0] || '';

  assert.match(header, /data-mushaf-preload-indicator/);
  assert.doesNotMatch(header, /data-locale-set/);
  assert.doesNotMatch(header, /class="menu-wrap lang-switch"/);
});
