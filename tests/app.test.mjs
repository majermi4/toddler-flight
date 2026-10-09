import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { shuffled, matches } from '../games.js';
import { art, animalNames } from '../art.js';
import { noteFrequency, pianoNotes, fireflyNotes } from '../audio.js';

test('piano covers every semitone from C4 through C6 at equal-tempered pitches', () => {
  assert.equal(pianoNotes.length, 25);
  assert.deepEqual(pianoNotes.map(note => note.midi), Array.from({ length: 25 }, (_, i) => 60 + i));
  assert.equal(pianoNotes[0].name, 'C4');
  assert.equal(pianoNotes.at(-1).name, 'C6');
  assert.equal(pianoNotes.filter(note => note.black).length, 10);
  assert.equal(noteFrequency(69), 440);
  for (let i = 1; i < pianoNotes.length; i++) assert.ok(Math.abs(pianoNotes[i].frequency / pianoNotes[i - 1].frequency - 2 ** (1 / 12)) < 1e-10);
  assert.equal(pianoNotes.at(-1).frequency / pianoNotes[0].frequency, 4);
});
test('fireflies only play C-major pentatonic notes and include all five pitches', () => {
  assert.deepEqual([...new Set(fireflyNotes.map(note => note.pitch))], ['C', 'D', 'E', 'G', 'A']);
  assert.equal(fireflyNotes.length, 11);
  for (const note of fireflyNotes) { assert.ok([0, 2, 4, 7, 9].includes(note.midi % 12)); assert.equal(note.frequency, noteFrequency(note.midi)); }
});

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
