import "server-only";
import { type z } from "zod";

const apiKey = process.env.OPENROUTER_API_KEY || "";
const primaryModel = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3";
const fallbackModel = process.env.OPENROUTER_FALLBACK_MODEL || "meta-llama/llama-3.3-70b-instruct";
const visionModel = process.env.OPENROUTER_VISION_MODEL || "openai/gpt-4o-mini";

function getApiKey() {
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set. Please add it to your environment variables.");
  }
  return apiKey;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    const isRateLimit = err?.status === 429 || err?.message?.includes("rate limit") || err?.message?.includes("429");
    const isServerErr = (err?.status && err.status >= 500) || err?.message?.includes("500");
    const isNetworkErr = err?.message?.includes("Network error") || err?.message?.includes("fetch failed") || !err?.status;

    if ((isRateLimit || isServerErr || isNetworkErr) && retries > 0) {
      console.warn(`OpenRouter API call failed. Retrying in ${delay}ms. Retries left: ${retries}. Error:`, err?.message || err);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

async function makeOpenRouterRequest(
  model: string,
  messages: Array<{ role: string; content: unknown }>,
  responseFormat?: { type: "json_object" }
) {
  const key = getApiKey();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "BhashaBuddy",
      },
      body: JSON.stringify({
        model,
        messages,
        response_format: responseFormat,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const status = response.status;
      let errorText = "";
      try {
        errorText = await response.text();
      } catch (_e) {
        // ignore error parsing errors
      }

      if (status === 429) {
        throw { status, message: "OpenRouter API rate limit exceeded. Please try again later." };
      }
      if (status === 401 || errorText.includes("INVALID_API_KEY") || errorText.includes("API key expired")) {
        throw { status, message: "Invalid or expired OpenRouter API key. Please verify your configuration." };
      }
      throw { status, message: `OpenRouter API error: ${response.statusText} (${status}). Details: ${errorText}` };
    }

    const data = await response.json();
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error("Empty response received from OpenRouter API.");
    }
    return data.choices[0].message.content as string;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const error = err as { name?: string; message?: string };
    if (error.name === "AbortError") {
      throw new Error("Request to OpenRouter API timed out after 30 seconds.");
    }
    if (error.message && (error.message.includes("fetch failed") || error.message.includes("network") || error.message.includes("ENOTFOUND"))) {
      throw new Error("Network error occurred while connecting to OpenRouter. Please check your internet connection.");
    }
    throw err;
  }
}

export async function generateStructuredContent<T>({
  prompt,
  systemInstruction,
  responseSchema,
}: {
  prompt: string;
  systemInstruction?: string;
  responseSchema?: z.ZodSchema<T>;
}): Promise<T> {
  const messages: Array<{ role: string; content: unknown }> = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const fn = async (model: string) => {
    const content = await makeOpenRouterRequest(model, messages, { type: "json_object" });
    
    // Clean JSON wrappers if models wrap in markdown
    let cleanText = content.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    const parsedJson = JSON.parse(cleanText);
    if (responseSchema) {
      return responseSchema.parse(parsedJson);
    }
    return parsedJson as T;
  };

  // Try Primary first with retry logic
  try {
    console.log(`OpenRouter: Querying primary model: ${primaryModel}`);
    return await retryWithBackoff(() => fn(primaryModel));
  } catch (primaryError: unknown) {
    const pErr = primaryError as Error;
    console.warn(`OpenRouter: Primary model (${primaryModel}) failed. Attempting fallback model (${fallbackModel}). Error:`, pErr.message || pErr);
    // Try Fallback model with retry logic
    try {
      return await retryWithBackoff(() => fn(fallbackModel));
    } catch (fallbackError: unknown) {
      const fErr = fallbackError as Error;
      console.error(`OpenRouter: Fallback model (${fallbackModel}) also failed.`, fErr.message || fErr);
      throw fallbackError;
    }
  }
}

export async function generateTextWithVision({
  prompt,
  imageBuffer,
  imageMimeType,
}: {
  prompt: string;
  imageBuffer: Buffer;
  imageMimeType: string;
}): Promise<string> {
  const base64Image = imageBuffer.toString("base64");
  const imageUrl = `data:${imageMimeType};base64,${base64Image}`;

  const messages: Array<{ role: string; content: unknown }> = [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: imageUrl } },
      ],
    },
  ];

  const fn = async () => {
    return await makeOpenRouterRequest(visionModel, messages);
  };

  console.log(`OpenRouter: Querying vision model: ${visionModel} for Multimodal OCR`);
  return await retryWithBackoff(fn);
}
