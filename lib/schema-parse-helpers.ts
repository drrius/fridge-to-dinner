import { PublicApiError, type ApiErrorCode } from "./schema-types";

export function parseIdentifier(value: unknown, code: ApiErrorCode) {
  return parseText(value, 2, 80, code, /^[a-zA-Z0-9_-]+$/);
}

export function parseName(value: unknown, code: ApiErrorCode) {
  return parseText(value, 2, 60, code);
}

export function parseText(
  value: unknown,
  minLength: number,
  maxLength: number,
  code: ApiErrorCode,
  pattern?: RegExp
) {
  if (typeof value !== "string") {
    throwShapeError(code);
  }

  const trimmed = value.trim();

  if (
    trimmed.length < minLength ||
    trimmed.length > maxLength ||
    (pattern && !pattern.test(trimmed))
  ) {
    throwShapeError(code);
  }

  return trimmed;
}

export function parseInteger(
  value: unknown,
  min: number,
  max: number,
  code: ApiErrorCode
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    throwShapeError(code);
  }

  return value;
}

export function parseEnum<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  code: ApiErrorCode
): T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throwShapeError(code);
  }

  return value;
}

export function parseStringList(
  value: unknown,
  code: ApiErrorCode,
  options: { minItems?: number; maxItems?: number; minLength?: number } = {}
) {
  const minItems = options.minItems ?? 0;
  const maxItems = options.maxItems ?? 20;
  const minLength = options.minLength ?? 2;

  if (!Array.isArray(value) || value.length < minItems || value.length > maxItems) {
    throw new PublicApiError(code, "The response shape was invalid.", {
      status: 502,
      retryable: true,
    });
  }

  return value.map((item) => parseText(item, minLength, 120, code));
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function throwShapeError(code: ApiErrorCode): never {
  throw new PublicApiError(code, "The response shape was invalid.", {
    status: code === "ingredients_invalid" ? 400 : 502,
    retryable: code !== "ingredients_invalid",
  });
}
