/**
 * Client-side image preprocessing for OCR.
 *
 * Loads a File/Blob into an offscreen canvas, upscales if needed,
 * converts to grayscale, increases contrast, and optionally binarizes
 * to improve Tesseract.js recognition accuracy.
 *
 * The original File is never mutated — all work is done on in-memory
 * canvas pixel data.  Call cleanup() when done to free resources.
 */

export interface PreprocessedImage {
  canvas: HTMLCanvasElement;
  blob: Blob;
  width: number;
  height: number;
  cleanup: () => void;
}

const MIN_WIDTH = 1600;
const MIN_HEIGHT = 1200;

/**
 * Load a File/Blob into an HTMLImageElement.
 * Returns the image and an object-URL that must be revoked later.
 */
function loadImage(src: Blob | File): Promise<{ img: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(src);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for OCR preprocessing'));
    };
    img.src = url;
  });
}

/**
 * Convert canvas pixels to grayscale using luminance weighting.
 * 0.299·R + 0.587·G + 0.114·B
 */
function toGrayscale(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] = d[i + 1] = d[i + 2] = lum;
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Increase contrast and apply simple thresholding.
 * This helps OCR on documents with faint text or coloured backgrounds.
 */
function enhanceContrast(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;

  // Compute mean luminance
  let sum = 0;
  for (let i = 0; i < d.length; i += 4) sum += d[i];
  const mean = sum / (d.length / 4);

  // Stretch contrast around the mean
  const factor = 1.8;
  for (let i = 0; i < d.length; i += 4) {
    let v = factor * (d[i] - mean) + mean;
    v = v < 0 ? 0 : v > 255 ? 255 : v;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Optional adaptive binarisation pass — hard black/white.
 */
function binarize(ctx: CanvasRenderingContext2D, w: number, h: number, threshold = 140): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = d[i] >= threshold ? 255 : 0;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Main preprocessing pipeline.
 *
 * 1. Load image
 * 2. Upscale if small
 * 3. Grayscale
 * 4. Contrast enhancement
 * 5. Binarization
 * 6. Export as Blob for Tesseract
 */
export async function preprocessImage(file: Blob | File): Promise<PreprocessedImage> {
  const { img, url } = await loadImage(file);

  // Determine target dimensions (upscale small images)
  let targetW = img.naturalWidth;
  let targetH = img.naturalHeight;

  if (targetW < MIN_WIDTH || targetH < MIN_HEIGHT) {
    const scale = Math.max(MIN_WIDTH / targetW, MIN_HEIGHT / targetH, 1);
    targetW = Math.round(targetW * scale);
    targetH = Math.round(targetH * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  // Draw scaled image
  ctx.drawImage(img, 0, 0, targetW, targetH);

  // Preprocessing pipeline
  toGrayscale(ctx, targetW, targetH);
  enhanceContrast(ctx, targetW, targetH);
  binarize(ctx, targetW, targetH);

  // Export as PNG blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
      'image/png',
    );
  });

  // Revoke the source object URL — the image is now in the canvas
  URL.revokeObjectURL(url);

  return {
    canvas,
    blob,
    width: targetW,
    height: targetH,
    cleanup: () => {
      // Zero out canvas memory
      canvas.width = 0;
      canvas.height = 0;
    },
  };
}
