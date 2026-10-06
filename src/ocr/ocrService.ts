export interface OcrResult {
  text: string
  confidence: number
  needsConfirmation: boolean
}

export async function recognizeImage(file: File | Blob): Promise<OcrResult> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng')
  try {
    const { data } = await worker.recognize(file)
    const text = (data.text || '').trim()
    const confidence = data.confidence ?? 0
    const needsConfirmation = confidence < 80 || text.length === 0
    return { text, confidence, needsConfirmation }
  } finally {
    await worker.terminate()
  }
}
