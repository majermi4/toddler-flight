// Dependency-free, antialiased PNG icons. Run with: node scripts/make-icons.mjs
import { deflateSync } from 'node:zlib';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const dir = fileURLToPath(new URL('../icons/', import.meta.url));
await mkdir(dir, { recursive: true });
const crcTable = Array.from({ length: 256 }, (_, n) => { for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1; return n >>> 0; });
function chunk(type, data) { const t = Buffer.from(type); let crc = 0xffffffff; for (const byte of Buffer.concat([t, data])) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8); const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const c = Buffer.alloc(4); c.writeUInt32BE((crc ^ 0xffffffff) >>> 0); return Buffer.concat([len, t, data, c]); }
const inside = (x, y, polygon) => { let result = false; for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) { const [xi, yi] = polygon[i], [xj, yj] = polygon[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result; } return result; };
function pixel(x, y) {
  let c = [221, 235, 225];
  if ((x - 170) ** 2 + (y - 238) ** 2 < 47 ** 2 || (x - 229) ** 2 + (y - 216) ** 2 < 65 ** 2 || (x - 298) ** 2 + (y - 240) ** 2 < 52 ** 2 || (x - 350) ** 2 + (y - 269) ** 2 < 32 ** 2 || x > 134 && x < 350 && y > 230 && y < 298) c = [255, 253, 247];
  if (inside(x, y, [[126,254],[365,178],[278,348],[243,279]])) c = [235,152,110];
  if (inside(x, y, [[243,279],[365,178],[278,348]])) c = [203,112,85];
  if (inside(x, y, [[126,254],[365,178],[209,263]])) c = [243,187,141];
  return c;
}
for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['maskable-512.png', 512], ['apple-touch-icon.png', 180]]) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const sum = [0, 0, 0];
    for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) { const c = pixel((x + .25 + sx * .5) * 512 / size, (y + .25 + sy * .5) * 512 / size); c.forEach((v, i) => sum[i] += v); }
    const offset = y * (size * 4 + 1) + 1 + x * 4; for (let i = 0; i < 3; i++) raw[offset + i] = Math.round(sum[i] / 4); raw[offset + 3] = 255;
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  await writeFile(new URL(name, `file://${dir}`), Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
console.log('Created tablet PWA icons.');
