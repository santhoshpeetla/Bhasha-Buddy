import { describe, it, expect } from "vitest";
import { validateUpload, MAX_FILE_BYTES } from "../security";

describe("validateUpload", () => {
  it("should pass for a valid PDF", () => {
    const file = {
      name: "test.pdf",
      size: 1024 * 1024,
      type: "application/pdf"
    } as unknown as File;
    expect(() => validateUpload(file)).not.toThrow();
  });

  it("should pass for a valid WebP image", () => {
    const file = {
      name: "image.webp",
      size: 2 * 1024 * 1024,
      type: "image/webp"
    } as unknown as File;
    expect(() => validateUpload(file)).not.toThrow();
  });

  it("should fail for a file that is too large", () => {
    const file = {
      name: "large.pdf",
      size: MAX_FILE_BYTES + 100,
      type: "application/pdf"
    } as unknown as File;
    expect(() => validateUpload(file)).toThrow("File is too large");
  });

  it("should fail for an unsupported extension", () => {
    const file = {
      name: "unsafe.exe",
      size: 100,
      type: "application/octet-stream"
    } as unknown as File;
    expect(() => validateUpload(file)).toThrow("Unsupported file type");
  });

  it("should fail for an unsupported MIME type", () => {
    const file = {
      name: "mismatch.pdf",
      size: 100,
      type: "application/zip"
    } as unknown as File;
    expect(() => validateUpload(file)).toThrow("Unsupported file format");
  });
});
