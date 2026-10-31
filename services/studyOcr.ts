import { createWorker, type Worker } from 'tesseract.js';

export type StudyOcrProgress = {
  status: string;
  progress: number;
};

let workerPromise: Promise<Worker> | null = null;

async function getWorker(onProgress?: (progress: StudyOcrProgress) => void): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = createWorker('eng', undefined, {
      logger: event => {
        if (event.status) onProgress?.({ status: event.status, progress: event.progress ?? 0 });
      },
    }).catch(error => {
      workerPromise = null;
      throw error;
    });
  }
  return workerPromise;
}

/**
 * Recognizes printed English text locally in the browser.
 * OCR output is untrusted input: students should review it before asking the AI.
 * The first run may need to download the OCR worker/language data; offline use
 * requires those assets to have been cached or bundled by the application.
 */
export async function recognizeStudyImage(
  image: Blob | File,
  onProgress?: (progress: StudyOcrProgress) => void,
): Promise<string> {
  if (typeof window === 'undefined') throw new Error('On-device OCR is only available in the browser.');
  if (!(image instanceof Blob) || image.size === 0) throw new Error('Choose a readable image first.');

  const worker = await getWorker(onProgress);
  const result = await worker.recognize(image);
  const text = result.data.text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  if (!text) throw new Error('No readable text was found. Try a sharper, brighter photo or crop closer to the question.');
  return text;
}

/** Release OCR memory when the app explicitly shuts down the OCR session. */
export async function terminateStudyOcr(): Promise<void> {
  const current = workerPromise;
  workerPromise = null;
  if (current) {
    try {
      const worker = await current;
      await worker.terminate();
    } catch {
      // A failed worker is already unusable; allow the next request to retry.
    }
  }
}
