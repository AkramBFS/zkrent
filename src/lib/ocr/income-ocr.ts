/**
 * Client-side OCR orchestration using Tesseract.js.
 *
 * Provides a reusable Web Worker singleton, preprocesses images via
 * canvas, runs OCR, and pipes output through the income parser.
 *
 * PRIVACY: The uploaded image and OCR text never leave the browser.
 * No fetch/POST/FormData calls are made.  Only the derived numeric
 * value is returned to the caller (and ultimately to the prover).
 */

import { createWorker, type Worker as TesseractWorker } from 'tesseract.js';
import { preprocessImage } from './image-preprocess';
import { extractIncome, type OcrResult } from './income-parser';

// ---------------------------------------------------------------------------
// Reusable Tesseract worker singleton
// ---------------------------------------------------------------------------

let workerPromise: Promise<TesseractWorker> | null = null;

async function getWorker(): Promise<TesseractWorker> {
  if (!workerPromise) {
    workerPromise = createWorker('eng');
  }
  return workerPromise;
}

/**
 * Terminate the shared Tesseract worker.
 * Call this when the OCR component unmounts or the flow completes.
 */
export async function terminateOcrWorker(): Promise<void> {
  if (workerPromise) {
    try {
      const worker = await workerPromise;
      await worker.terminate();
    } catch {
      // Worker may already be terminated
    }
    workerPromise = null;
  }
}

// ---------------------------------------------------------------------------
// Supported MIME types
// ---------------------------------------------------------------------------

const ACCEPTED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

export const ACCEPTED_EXTENSIONS = '.png,.jpg,.jpeg,.webp';

export function isAcceptedFile(file: File): boolean {
  return ACCEPTED_TYPES.has(file.type);
}

// ---------------------------------------------------------------------------
// Progress callback
// ---------------------------------------------------------------------------

export type OcrProgressCallback = (progress: number, status: string) => void;

// ---------------------------------------------------------------------------
// Main recognition pipeline
// ---------------------------------------------------------------------------

/**
 * Runs the full client-side OCR pipeline on a bank-statement image:
 *
 * 1. Preprocess (upscale → grayscale → contrast → binarize)
 * 2. Tesseract OCR via Web Worker
 * 3. Semantic income parsing
 * 4. Memory cleanup
 *
 * @returns An OcrResult with the raw text and extracted income (or null).
 */
export async function recognizeDocument(
  file: File,
  onProgress?: OcrProgressCallback,
): Promise<OcrResult> {
  onProgress?.(5, 'Preparing image…');

  // 1. Preprocess
  const preprocessed = await preprocessImage(file);

  onProgress?.(20, 'Loading OCR engine…');

  // 2. Get (or create) the Tesseract worker
  const worker = await getWorker();

  onProgress?.(35, 'Reading document locally…');

  // 3. Run OCR on the preprocessed blob
  const result = await worker.recognize(preprocessed.blob);

  onProgress?.(80, 'Extracting income data…');

  // 4. Parse income from OCR text
  const ocrText = result.data.text;
  const income = extractIncome(ocrText);

  // 5. Cleanup preprocessed image from memory
  preprocessed.cleanup();

  onProgress?.(100, income ? 'Income detected' : 'Processing complete');

  return {
    text: ocrText,
    income,
  };
}
