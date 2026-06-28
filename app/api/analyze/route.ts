import { assertRequestSize, MAX_MULTIPART_BYTES, validateImageFile } from "@/lib/image";
import { analyzeImage } from "@/lib/openai";
import {
  createErrorResponse,
  createRequestId,
  createSuccessEnvelope,
  jsonContentType,
  parseAnalyzePreferences,
} from "@/lib/schema-validation";
import { PublicApiError } from "@/lib/schema-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const startedAt = performance.now();
  const requestId = createRequestId();

  try {
    if (!jsonContentType(request).includes("multipart/form-data")) {
      throw new PublicApiError(
        "content_type_unsupported",
        "Send the image as multipart form data.",
        { status: 415 },
      );
    }

    assertRequestSize(request, MAX_MULTIPART_BYTES);

    const formData = await request.formData();
    const image = await validateImageFile(formData.get("image"));
    const preferences = parseAnalyzePreferences(formData.get("preferences"));
    const result = await analyzeImage({ image, preferences });

    return Response.json(
      createSuccessEnvelope(result, {
        requestId,
        latencyMs: Math.round(performance.now() - startedAt),
      }),
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
