import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { shuffled, matches } from '../games.js';
import { art, animalNames } from '../art.js';

test('shuffling keeps every card and does not mutate its input', () => {
  const cards = ['cat', 'cat', 'dog', 'dog'];
  const result = shuffled(cards, () => .2);
  assert.deepEqual([...result].sort(), [...cards].sort());
  assert.deepEqual(cards, ['cat', 'cat', 'dog', 'dog']);
  assert.notEqual(result, cards);
});
test('sorting accepts the same semantic key and rejects other homes', () => {
  assert.equal(matches('rabbit', 'rabbit'), true);
  assert.equal(matches('rabbit', 'cow'), false);
  assert.equal(matches('circle', 'triangle'), false);
});
test('every animal is drawn with valid viewBox artwork', () => {
  for (const name of animalNames) { const svg = art(name); assert.match(svg, /viewBox="0 0 100 100"/); assert.ok(!svg.includes('undefined')); }
});
test('manifest has real tablet install icons', async () => {
  const manifest = JSON.parse(await readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some(icon => icon.sizes === '192x192'));
  assert.ok(manifest.icons.some(icon => icon.sizes === '512x512' && icon.purpose === 'maskable'));
  for (const icon of manifest.icons) await access(new URL(`../${icon.src}`, import.meta.url));
});
test('offline cache contains every module, stylesheet, and install icon', async () => {
  const sw = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  const files = [...sw.matchAll(/'\.\/([^']*)'/g)].map(match => match[1]).filter(Boolean);
  for (const required of ['index.html', 'app.js', 'games.js', 'art.js', 'audio.js', 'style.css', 'manifest.webmanifest']) assert.ok(files.includes(required));
  for (const file of files) await access(new URL(`../${file}`, import.meta.url));
});
