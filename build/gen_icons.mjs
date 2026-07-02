// Generoi PWA-ikonit (PNG) ilman ulkoisia riippuvuuksia: piirto pikselipuskuriin
// + zlib-pakkaus PNG-chunkeiksi. 4x supersample → pehmeät reunat.
// Aja: node build/gen_icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/icons");
mkdirSync(OUT, { recursive: true });

// --- värit (styles.css:n paletin mukaan) ---
const BG = [0x14, 0x14, 0x3a]; // --bg tumma sininen
const FACE = [0x1e, 0x1e, 0x52]; // --bg-2 noppakuutio
const PIP = [0xc9, 0xa8, 0x4c]; // --gold silmät

const SS = 4; // supersample

// CRC32 PNG-chunkeille
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- piirto: renderöi suurella resoluutiolla, laatikkoalasämpläys ---
function roundRectInside(x, y, x0, y0, x1, y1, radius) {
  const r = radius;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r);
  const cy = Math.min(Math.max(y, y0 + r), y1 - r);
  if (x >= x0 + r && x <= x1 - r) return y >= y0 && y <= y1;
  if (y >= y0 + r && y <= y1 - r) return x >= x0 && x <= x1;
  const dx = x - cx, dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}
function circle(px, py, cx, cy, rad) {
  const dx = px - cx, dy = py - cy;
  return dx * dx + dy * dy <= rad * rad;
}

function renderIcon(size, maskable) {
  const R = size * SS;
  const out = Buffer.alloc(size * size * 4);
  const bgRadius = maskable ? 0 : 0.18 * R;

  // noppakuutio: hieman pienempi kuin tausta, pyöristetyt kulmat
  const pad = maskable ? 0.24 * R : 0.16 * R;
  const fx0 = pad, fy0 = pad, fx1 = R - pad, fy1 = R - pad;
  const faceRadius = 0.11 * R;

  // silmät (kuusi = noppa 6): 2 saraketta x 3 riviä
  const pipR = 0.055 * R;
  const colX = [fx0 + (fx1 - fx0) * 0.28, fx0 + (fx1 - fx0) * 0.72];
  const rowY = [fy0 + (fy1 - fy0) * 0.22, fy0 + (fy1 - fy0) * 0.5, fy0 + (fy1 - fy0) * 0.78];
  const pips = [];
  for (const cy of rowY) for (const cx of colX) pips.push([cx, cy]);

  for (let oy = 0; oy < size; oy++) {
    for (let ox = 0; ox < size; ox++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = ox * SS + sx + 0.5;
          const y = oy * SS + sy + 0.5;
          let col = null;
          if (maskable || roundRectInside(x, y, 0, 0, R, R, bgRadius)) col = BG;
          if (roundRectInside(x, y, fx0, fy0, fx1, fy1, faceRadius)) col = FACE;
          for (const [cx, cy] of pips) {
            if (circle(x, y, cx, cy, pipR)) col = PIP;
          }
          if (col) {
            r += col[0]; g += col[1]; b += col[2]; a += 255;
          }
        }
      }
      const n = SS * SS;
      const i = (oy * size + ox) * 4;
      if (a > 0) {
        const cov = a / (255 * n);
        const cnt = a / 255;
        out[i] = Math.round(r / cnt);
        out[i + 1] = Math.round(g / cnt);
        out[i + 2] = Math.round(b / cnt);
        out[i + 3] = Math.round(cov * 255);
      } else {
        out[i] = out[i + 1] = out[i + 2] = out[i + 3] = 0;
      }
    }
  }
  return encodePNG(size, size, out);
}

for (const size of [192, 512]) {
  const png = renderIcon(size, false);
  writeFileSync(resolve(OUT, `icon-${size}.png`), png);
  console.log(`icon-${size}.png  (${png.length} B)`);
}
// maskable = tausta täyttää koko alan (turva-alue Androidin pyöristykselle)
writeFileSync(resolve(OUT, "icon-512-maskable.png"), renderIcon(512, true));
console.log("icon-512-maskable.png");
