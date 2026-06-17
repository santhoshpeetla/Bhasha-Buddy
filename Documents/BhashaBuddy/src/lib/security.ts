import { z } from "zod";

export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_PDF_PAGES = 20;

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp"
]);

const allowedExtensions = new Set(["pdf", "png", "jpg", "jpeg", "webp"]);

export const requestLanguageSchema = z.enum(["en", "te", "hi"]);

export function validateUpload(file: File) {
  if (!file) {
    throw new Error("Please upload a document.");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error("File is too large. Please upload a document up to 20 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !allowedExtensions.has(extension)) {
    throw new Error("Unsupported file type. Please upload PDF, PNG, JPG, JPEG, or WEBP.");
  }

  if (file.type && !allowedMimeTypes.has(file.type)) {
    throw new Error("Unsupported file format. Please upload PDF, PNG, JPG, JPEG, or WEBP.");
  }
}

export function safeError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}
