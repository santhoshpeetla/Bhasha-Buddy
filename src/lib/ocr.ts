import "server-only";
import pdf from "pdf-parse";
import { createWorker } from "tesseract.js";
import { generateTextWithVision } from "./ai";

export interface OcrResult {
  text: string;
  preview: string;
  confidence: number;
  method: "pdf-text" | "openrouter-vision" | "tesseract" | "demo";
}

export async function performOcr(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
  preExtractedText?: string
): Promise<OcrResult> {
  const isPdf = mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");

  // A. Use pre-extracted text first if available (avoids duplicate PDF parsing!)
  if (preExtractedText && preExtractedText.trim().replace(/\s+/g, " ").length > 150) {
    console.log("OCR Pipeline [Speed-up]: Using pre-extracted digital PDF text.");
    return {
      text: preExtractedText,
      preview: preExtractedText.substring(0, 1000),
      confidence: 0.98,
      method: "pdf-text"
    };
  }

  // B. Text extraction from digital text PDFs (if it is a PDF and no pre-extracted text was provided)
  if (isPdf && !preExtractedText) {
    try {
      console.log("OCR Pipeline: Parsing digital PDF text...");
      const data = await pdf(fileBuffer);
      const text = data.text || "";
      const cleanText = text.trim().replace(/\s+/g, " ");
      if (cleanText.length > 150) {
        console.log("OCR Pipeline: Digital PDF text extraction succeeded.");
        return {
          text: data.text,
          preview: data.text.substring(0, 1000),
          confidence: 0.98,
          method: "pdf-text"
        };
      }
    } catch (err) {
      console.warn("OCR Pipeline: Digital PDF text extraction failed, falling back to Vision:", err);
    }
  }

  // C. OpenRouter Vision Multimodal OCR
  try {
    console.log("OCR Pipeline: Attempting OpenRouter Vision OCR...");
    let uploadMime = mimeType;
    if (isPdf) {
      uploadMime = "application/pdf";
    } else if (!uploadMime) {
      uploadMime = "image/png";
    }

    const text = await generateTextWithVision({
      prompt: "Transcribe all text from this document. Retain headings, numbers, and layout where possible. Do not include markdown wraps or preambles. Output text exactly.",
      imageBuffer: fileBuffer,
      imageMimeType: uploadMime,
    });

    console.log("OCR Pipeline: OpenRouter Vision OCR succeeded.");
    return {
      text,
      preview: text.substring(0, 1000),
      confidence: 0.9,
      method: "openrouter-vision"
    };
  } catch (err) {
    console.warn("OCR Pipeline: OpenRouter Vision OCR failed, moving to final fallback:", err);
  }

  // D. Tesseract Fallback (Images only - Tesseract is image-focused)
  if (!isPdf) {
    try {
      console.log("OCR Pipeline: Attempting Tesseract fallback OCR...");
      const worker = await createWorker("eng");
      const { data: { text } } = await worker.recognize(fileBuffer);
      await worker.terminate();

      const cleanText = text?.trim() || "";
      if (cleanText) {
        console.log("OCR Pipeline: Tesseract fallback OCR succeeded.");
        return {
          text: cleanText,
          preview: cleanText.substring(0, 1000),
          confidence: 0.7,
          method: "tesseract"
        };
      }
    } catch (err) {
      console.error("OCR Pipeline: Tesseract fallback OCR failed:", err);
    }
  }

  throw new Error("OCR Pipeline failed: Unable to extract text from the document.");
}
