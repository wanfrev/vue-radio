import { writeFileSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';

const SOURCE = 'public/icon-source.svg';
const OUT = 'public/icons';

mkdirSync(OUT, { recursive: true });

for (const size of [192, 512]) {
  const out = `${OUT}/icon-${size}.png`;
  await sharp(SOURCE)
    .resize(size, size, { fit: 'contain', background: { r: 0x0b, g: 0x12, b: 0x20, alpha: 1 } })
    .png()
    .toFile(out);
  console.log(`✅ ${out} (${size}x${size})`);
}
