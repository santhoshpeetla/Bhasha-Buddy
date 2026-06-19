import { NextRequest, NextResponse } from "next/server";
import { generateStructuredContent } from "@/lib/ai";
import { buildChatPrompt } from "@/lib/ai/prompts";
import { chatSchema } from "@/lib/ai/schemas";
import { getClientIp } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
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

    // 2. Parse Body
    const body = await request.json();
    const { 
      question, 
      history, 
      documentText, 
      documentType, 
      documentSummary 
    } = body as { 
      question: string; 
      history?: Array<{ role: "user" | "assistant"; content: string }>;
      documentText?: string; 
      documentType?: string;
      documentSummary?: string;
    };

    if (!question) {
      return NextResponse.json(
        { error: "Missing required field: 'question'." },
        { status: 400 }
      );
    }

    console.log(`Chat API: Answering user question: "${question.substring(0, 50)}..."`);

    // 3. Serialize History
    const historyText = history && history.length > 0
      ? history.map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`).join("\n")
      : "No previous messages in this conversation.";

    // 4. Formulate Prompt & Call OpenRouter
    const systemPrompt = `You are BhashaBuddy Hybrid Chat Assistant. Classify intent into 'document' or 'general'. Answer general questions using standard knowledge and document questions using document text.`;
    const prompt = buildChatPrompt(
      documentText || "", 
      question, 
      historyText, 
      documentType, 
      documentSummary
    );

    const chatResponse = await generateStructuredContent<{
      source: "document" | "general";
      answer: string;
      citations: Array<{ id: string; quote: string }>;
    }>({
      prompt,
      systemInstruction: systemPrompt,
      responseSchema: chatSchema,
    });

    // 5. Post-process: enforce safety fallback phrase if it claims to answer from document but text was absent
    const normalizedAnswer = chatResponse.answer.toLowerCase();
    const notPresentPhrase = "this information is not present in the uploaded document";
    
    if (chatResponse.source === "document") {
      if (!documentText || documentText.trim().length === 0 || normalizedAnswer.includes(notPresentPhrase)) {
        chatResponse.source = "document";
        chatResponse.answer = "This information is not present in the uploaded document.";
        chatResponse.citations = [];
      }
    }

    return NextResponse.json(chatResponse);
  } catch (error: unknown) {
    console.error("Chat route error:", error);
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to answer chat question." },
      { status: 500 }
    );
  }
}
