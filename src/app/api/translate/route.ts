import { NextRequest, NextResponse } from "next/server";
import { generateStructuredContent } from "@/lib/ai";
import { buildTranslationPrompt } from "@/lib/ai/prompts";
import { translationResponseSchema } from "@/lib/ai/schemas";
import { getClientIp } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";
import type { SupportedLanguage } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = getClientIp(request);
    const limit = await rateLimit(ip);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 2. Parse Body
    const body = await request.json();
    const { summary, grandmaMode, actions, targetLanguage } = body as {
      summary: string;
      grandmaMode: string;
      actions: string[];
      targetLanguage: SupportedLanguage;
    };

    if (!summary || !grandmaMode || !actions || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing required fields in request body." },
        { status: 400 }
      );
    }

    console.log(`Translate API: Translating to ${targetLanguage}...`);

    // 3. Formulate Prompt & Call OpenRouter
    const systemPrompt = `You are BhashaBuddy Translator. Translate the given summary, grandmaMode text, and actions array into the target language accurately and naturally.`;
    const prompt = buildTranslationPrompt(summary, grandmaMode, actions, targetLanguage);

    const translatedResult = await generateStructuredContent<{
      summary: string;
      grandmaMode: string;
      actions: string[];
    }>({
      prompt,
      systemInstruction: systemPrompt,
      responseSchema: translationResponseSchema,
    });

    return NextResponse.json(translatedResult);
  } catch (error: unknown) {
    console.error("Translate route error:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to translate content." },
      { status: 500 }
    );
  }
}
