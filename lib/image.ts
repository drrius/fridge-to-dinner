import { PublicApiError } from "@/lib/schemas";

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const MAX_MULTIPART_BYTES = MAX_IMAGE_BYTES + 256 * 1024;
export const MAX_JSON_BYTES = 64 * 1024;

export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
] as const;

export type SupportedImageType = (typeof SUPPORTED_IMAGE_TYPES)[number];

export type ValidatedImage = {
  file: File;
  mimeType: SupportedImageType;
  byteSize: number;
};

export function assertRequestSize(request: Request, maxBytes: number) {
  const contentLength = request.headers.get("content-length");

  if (contentLength === null) {
    return;
  }

  const bytes = Number(contentLength);

  if (!Number.isFinite(bytes) || bytes < 0) {
    throw new PublicApiError(
      "request_too_large",
      "The request size could not be verified.",
      { status: 413 },
    );
  }

  if (bytes > maxBytes) {
    throw new PublicApiError("request_too_large", "That request is too large.", {
      status: 413,
    });
  }
}

export async function validateImageFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File)) {
    throw new PublicApiError("image_missing", "Send an image file.", {
      status: 400,
    });
  }

  const mimeType = normalizeMimeType(value.type);

  if (!mimeType) {
    throw new PublicApiError(
      "image_type_unsupported",
      "Use a JPEG or PNG image. Convert HEIC or HEIF before upload.",
      { status: 415 },
    );
  }

  if (value.size === 0) {
    throw new PublicApiError("image_invalid", "That image appears to be empty.", {
      status: 400,
    });
  }

  if (value.size > MAX_IMAGE_BYTES) {
    throw new PublicApiError(
      "image_too_large",
      "That photo is too large. Try a smaller image.",
      { status: 413 },
    );
  }

  const header = new Uint8Array(await value.slice(0, 32).arrayBuffer());

  if (!hasExpectedSignature(header, mimeType)) {
    throw new PublicApiError(
      "image_invalid",
      "That file does not look like a supported image.",
      { status: 400 },
    );
  }

  return {
    file: value,
    mimeType,
    byteSize: value.size,
  } satisfies ValidatedImage;
}

export async function imageToDataUrl(image: ValidatedImage) {
  const bytes = Buffer.from(await image.file.arrayBuffer());
  return `data:${image.mimeType};base64,${bytes.toString("base64")}`;
}

function normalizeMimeType(value: string): SupportedImageType | null {
  const lower = value.toLowerCase();

  if (SUPPORTED_IMAGE_TYPES.includes(lower as SupportedImageType)) {
    return lower as SupportedImageType;
  }

  return null;
}

function hasExpectedSignature(bytes: Uint8Array, mimeType: SupportedImageType) {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  return false;
}
