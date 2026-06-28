import type {
  ApiErrorEnvelope,
  ApiSuccess,
  Ingredient,
  Preferences,
} from "@/lib/schema-types";

const MAX_UPLOAD_EDGE = 1280;
const JPEG_QUALITY = 0.82;

type ApiClientOptions = {
  signal?: AbortSignal;
};

export class ClientApiError extends Error {
  readonly retryable: boolean;

  constructor(message: string, retryable = true) {
    super(message);
    this.name = "ClientApiError";
    this.retryable = retryable;
  }
}

export async function analyzePhoto(
  image: File,
  preferences: Required<Preferences>,
  options: ApiClientOptions = {}
) {
  const upload = await prepareImageUpload(image);
  const formData = new FormData();

  formData.set("image", upload);
  formData.set("preferences", JSON.stringify(preferences));

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
    signal: options.signal,
  });

  return parseApiResponse(response);
}

export async function regenerateFromIngredients(
  ingredients: Ingredient[],
  preferences: Required<Preferences>,
  options: ApiClientOptions = {}
) {
  const response = await fetch("/api/recipes", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ ingredients, preferences }),
    signal: options.signal,
  });

  return parseApiResponse(response);
}

async function prepareImageUpload(image: File) {
  if (!image.type.startsWith("image/")) {
    throw new ClientApiError("Use an image from your camera roll.", false);
  }

  const bitmap = await createImageBitmap(image);
  const scale = Math.min(1, MAX_UPLOAD_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });

  if (!blob) {
    throw new ClientApiError("That photo could not be prepared.", true);
  }

  return new File([blob], "fridge-photo.jpg", { type: "image/jpeg" });
}

async function parseApiResponse(response: Response): Promise<ApiSuccess> {
  const body: unknown = await response.json().catch(() => null);

  if (response.ok && isApiSuccess(body)) {
    return body;
  }

  if (isApiError(body)) {
    throw new ClientApiError(body.error.message, body.error.retryable);
  }

  throw new ClientApiError("Something went sideways. Please try again.", true);
}

function isApiSuccess(value: unknown): value is ApiSuccess {
  return (
    typeof value === "object" &&
    value !== null &&
    "ingredients" in value &&
    "recipes" in value &&
    "meta" in value
  );
}

function isApiError(value: unknown): value is ApiErrorEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "object" &&
    value.error !== null &&
    "message" in value.error
  );
}
