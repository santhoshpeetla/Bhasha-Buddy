import { NextRequest, NextResponse } from "next/server";
import { demoDocuments } from "@/lib/demo-documents";
import { generateStructuredContent } from "@/lib/ai";
import { buildAnalysisPrompt } from "@/lib/ai/prompts";
import { analysisSchema } from "@/lib/ai/schemas";
import { getClientIp } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";
import type { SupportedLanguage, DocumentAnalysis, RawAnalysisResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
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

    // 2. Query Params Validation
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get("kind") || "scholarship";
    const language = (searchParams.get("language") || "en") as SupportedLanguage;

    const doc = demoDocuments[kind];
    if (!doc) {
      return NextResponse.json(
        { error: `Invalid document kind. Supported: scholarship, circular, government, bank` },
        { status: 400 }
      );
    }

    console.log(`Demo API: Running live optimized analysis for kind=${kind}, lang=${language}...`);

    // 3. Formulate Prompt & Call OpenRouter
    const systemPrompt = `You are BhashaBuddy, a helpful document decoding assistant for India. Extract details in English and pre-translate them into English, Telugu, and Hindi in a single JSON response. Keep fields short.`;
    const prompt = buildAnalysisPrompt(doc.rawText);

    const aiStart = Date.now();
    const rawAnalysis = await generateStructuredContent<RawAnalysisResponse>({
      prompt,
      systemInstruction: systemPrompt,
      responseSchema: analysisSchema,
    });
    const aiEnd = Date.now();
    const aiDuration = aiEnd - aiStart;

    // 4. Augment with OCR method metadata, disclaimers, and timings to form a full DocumentAnalysis
    const totalDuration = Date.now() - startTime;

    const fullAnalysis: DocumentAnalysis = {
      ...rawAnalysis,
      ocr: {
        text: doc.rawText,
        preview: doc.rawText.substring(0, 1000),
        confidence: 1.0,
        method: "demo"
      },
      disclaimers: [
        "The AI-generated analysis is for informational purposes only and does not constitute official legal, medical, or financial advice.",
        "Always cross-reference dates and checklist requirements with original government or college authorities."
      ],
      timings: {
        ocrMs: 0, // No OCR for demo mode text!
        aiMs: aiDuration,
        totalMs: totalDuration
      }
    };

    if (process.env.NODE_ENV !== "production") {
      console.log(`[PERFORMANCE METRICS - DEMO] AI: ${aiDuration}ms | Total: ${totalDuration}ms`);
    }

    return NextResponse.json(fullAnalysis);
  } catch (error: unknown) {
    console.error("Demo Mode error:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to analyze demo document" },
      { status: 500 }
    );
  }
}
