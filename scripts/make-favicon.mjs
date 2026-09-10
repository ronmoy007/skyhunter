// Build a real multi-size favicon.ico from the logo (src/app/icon.png) so
// Google's favicon crawler — which requests /favicon.ico at the site root —
// gets the SkyHunter mark instead of a 404 (which shows the default globe).
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const SRC = "E:/Projects/Job losted/src/app/icon.png";
const OUT = "E:/Projects/Job losted/src/app/favicon.ico";
const sizes = [16, 32, 48]; // 48 is Google's preferred favicon size

const entries = [];
for (const s of sizes) {
  const buf = await sharp(SRC).resize(s, s, { fit: "cover" }).png().toBuffer();
  entries.push({ size: s, buf });
}

const count = entries.length;
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: 1 = icon
header.writeUInt16LE(count, 4);

const dir = [];
let offset = 6 + count * 16;
for (const { size, buf } of entries) {
  const e = Buffer.alloc(16);
  e.writeUInt8(size >= 256 ? 0 : size, 0); // width
  e.writeUInt8(size >= 256 ? 0 : size, 1); // height
  e.writeUInt8(0, 2); // palette
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // color planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(buf.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += buf.length;
  dir.push(e);
}

const ico = Buffer.concat([header, ...dir, ...entries.map((x) => x.buf)]);
writeFileSync(OUT, ico);
console.log(`Wrote ${OUT} (${ico.length} bytes, sizes ${sizes.join("/")}).`);
