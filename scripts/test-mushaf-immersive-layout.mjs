import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const css = await readFile(new URL('../src/styles/mushaf-immersive.css', import.meta.url), 'utf8');

test('desktop immersive reader has a full-width grid track for centring the page', () => {
  const rule = css.match(/body\.mushaf-immersive \.mushaf-reader\s*\{([\s\S]*?)\n\}/)?.[1] || '';

  assert.match(rule, /grid-template-columns:\s*minmax\(0,\s*1fr\)/);
});
