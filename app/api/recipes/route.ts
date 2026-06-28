import { assertRequestSize, MAX_JSON_BYTES } from "@/lib/image";
import { generateRecipes } from "@/lib/openai";
import {
  createErrorResponse,
  createRequestId,
  createSuccessEnvelope,
  jsonContentType,
  parseRecipeRequest,
} from "@/lib/schema-validation";
import { PublicApiError } from "@/lib/schema-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const startedAt = performance.now();
  const requestId = createRequestId();

  try {
    if (!jsonContentType(request).includes("application/json")) {
      throw new PublicApiError(
        "content_type_unsupported",
        "Send ingredient updates as JSON.",
        { status: 415 },
      );
    }

    assertRequestSize(request, MAX_JSON_BYTES);

    const input = await parseRecipeRequest(request);
    const result = await generateRecipes(input);

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
