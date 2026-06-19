import { NextRequest, NextResponse } from "next/server";
import { performOcr } from "@/lib/ocr";
import { generateStructuredContent } from "@/lib/ai";
import { buildAnalysisPrompt } from "@/lib/ai/prompts";
import { analysisSchema } from "@/lib/ai/schemas";
import { validateUpload, getClientIp } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";
import pdf from "pdf-parse";
import crypto from "crypto";
import type { DocumentAnalysis, RawAnalysisResponse } from "@/lib/types";

// In-memory cache for hackathon demo speed (persists during dev server run)
const analysisCache = new Map<string, DocumentAnalysis>();

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    // 1. Rate Limiting
    const ip = getClientIp(request);
    const limit = await rateLimit(ip);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "X-RateLimit-Reset": limit.resetSeconds.toString() } }
      );
    }

    // 2. Parse Form Data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    // const language = (formData.get("language") || "en") as SupportedLanguage;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // 3. File validation
    validateUpload(file);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const uploadDuration = Date.now() - startTime;

    // 4. Cache Check (SHA-256 Hash of file contents)
    const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
    if (analysisCache.has(fileHash)) {
      console.log(`[CACHE HIT] Returning cached analysis for file: ${file.name} (hash: ${fileHash})`);
      const cachedResult = { ...analysisCache.get(fileHash)! };
      // Update total time to show cache speed
      if (cachedResult.timings) {
        cachedResult.timings.totalMs = Date.now() - startTime;
      }
      return NextResponse.json(cachedResult);
    }

    // 5. Single-step PDF Page Count checking & Text Extraction (Analyze first 5 pages by default)
    const pdfStart = Date.now();
    let pdfText = "";
    let totalPages = 1;
    let pagesAnalyzed = 1;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    
    if (isPdf) {
      try {
        console.log("POST /api/analyze: Running single-step PDF parsing (limit 5 pages)...");
        // We parse with max: 5 to speed up parsing significantly
        const pdfMeta = await pdf(buffer, { max: 5 });
        totalPages = pdfMeta.numpages;
        pagesAnalyzed = Math.min(totalPages, 5);
        pdfText = pdfMeta.text || "";
      } catch (err) {
        console.warn("Failed to check page count of PDF or extract text, proceeding to OCR:", err);
      }
    }
    const pdfDuration = isPdf ? Date.now() - pdfStart : 0;

    // 6. Run OCR Pipeline (Passes pre-extracted text to bypass step 1 duplicate)
    console.log(`OCR Pipeline Triggered: name=${file.name}, size=${file.size} bytes`);
    const ocrStart = Date.now();
    const ocrResult = await performOcr(buffer, file.type, file.name, pdfText);
    const ocrEnd = Date.now();
    const ocrDuration = ocrEnd - ocrStart;

    // 7. Formulate AI prompt & Call OpenRouter
    const systemPrompt = `You are BhashaBuddy, a helpful document decoding assistant for India. Extract details in English. Keep fields short and concise. Avoid long explanations.`;
    const prompt = buildAnalysisPrompt(ocrResult.text);

    console.log("Calling OpenRouter for structured analysis...");
    const aiStart = Date.now();
    const rawAnalysis = await generateStructuredContent<RawAnalysisResponse>({
      prompt,
      systemInstruction: systemPrompt,
      responseSchema: analysisSchema,
    });
    const aiEnd = Date.now();
    const aiDuration = aiEnd - aiStart;

    // 8. Inject OCR pipeline metadata, disclaimers, and speed metrics
    const totalDuration = Date.now() - startTime;
    
    const finalAnalysis: DocumentAnalysis = {
      ...rawAnalysis,
      ocr: {
        text: ocrResult.text,
        preview: ocrResult.preview,
        confidence: ocrResult.confidence,
        method: ocrResult.method
      },
      disclaimers: [
        "The AI-generated analysis is for informational purposes only and does not constitute official legal, medical, or financial advice.",
        "Always cross-reference dates and checklist requirements with original government or college authorities."
      ],
      timings: {
        uploadMs: uploadDuration,
        pdfParseMs: pdfDuration,
        ocrMs: ocrDuration,
        aiMs: aiDuration,
        totalMs: totalDuration
      },
      pagesAnalyzed,
      totalPages
    };

    // Store in cache
    analysisCache.set(fileHash, finalAnalysis);

    if (process.env.NODE_ENV !== "production") {
      console.log(`[PERFORMANCE METRICS] Upload: ${uploadDuration}ms | PDF: ${pdfDuration}ms | OCR: ${ocrDuration}ms | AI: ${aiDuration}ms | Total: ${totalDuration}ms`);
    }

    console.log("Analysis completed successfully in " + totalDuration + "ms.");
    return NextResponse.json(finalAnalysis);
  } catch (error: unknown) {
    console.error("Analysis route error:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "An error occurred during document analysis." },
      { status: 500 }
    );
  }
}
