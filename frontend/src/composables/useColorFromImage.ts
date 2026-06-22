/**
 * Extract the dominant color from an image URL via a hidden canvas.
 * Returns null if CORS blocks the read or the image fails to load.
 */
export async function colorFromImage(imageUrl: string | null | undefined): Promise<string | null> {
  if (!imageUrl) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 16;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3] ?? 0;
          if (a < 128) continue;
          r += data[i] ?? 0;
          g += data[i + 1] ?? 0;
          b += data[i + 2] ?? 0;
          count++;
        }
        if (count === 0) { resolve(null); return; }
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        resolve(`rgb(${r}, ${g}, ${b})`);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}

/** Hash-based color for when canvas extraction is blocked by CORS. */
export function seedToColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 85%, 55%)`;
}

/**
 * Resolve the best possible bloom color:
 *  1. Try canvas extraction from the image
 *  2. Fall back to hash-based from seed
 */
export async function resolveBloomColor(
  imageUrl: string | null | undefined,
  seed: string,
): Promise<string> {
  const extracted = await colorFromImage(imageUrl);
  return extracted ?? seedToColor(seed);
}
