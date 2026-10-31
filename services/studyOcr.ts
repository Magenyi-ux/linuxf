export type StudyOcrProgress = { status: string; progress: number };

type TesseractWorker = {
  recognize: (image: Blob | File) => Promise<{ data: { text: string } }>;
  terminate: () => Promise<void>;
};
type TesseractModule = {
  createWorker: (language: string, oem?: number, options?: Record<string, unknown>) => Promise<TesseractWorker>;
};

const TESSERACT_MODULE_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/+esm';
const TESSERACT_WORKER_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js';
const TESSERACT_CORE_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0';
const TESSERACT_LANGUAGE_URL = 'https://tessdata.projectnaptha.com/4.0.0';

let workerPromise: Promise<TesseractWorker> | null = null;

async function getWorker(onProgress?: (progress: StudyOcrProgress) => void): Promise<TesseractWorker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      // Load the OCR engine in the browser without bundling its worker into the app.
      const tesseract = await import(/* @vite-ignore */ TESSERACT_MODULE_URL) as unknown as TesseractModule;
      return tesseract.createWorker('eng', 1, {
        workerPath: TESSERACT_WORKER_URL,
        corePath: TESSERACT_CORE_URL,
        langPath: TESSERACT_LANGUAGE_URL,
        logger: (event: { status?: string; progress?: number }) => {
          if (event.status) onProgress?.({ status: event.status, progress: event.progress ?? 0 });
        },
      });
    })().catch(error => {
      workerPromise = null;
      throw error;
    });
  }
  return workerPromise;
}

/** Recognize printed English text locally in the browser. OCR output must be reviewed. */
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

export async function terminateStudyOcr(): Promise<void> {
  const current = workerPromise;
  workerPromise = null;
  if (current) {
    try { await (await current).terminate(); } catch { /* Allow a later attempt to create a fresh worker. */ }
  }
}
