/**
 * Handles fridge or pantry photo analysis and returns detected ingredients plus recipe ideas.
 */
export async function POST() {
  return Response.json(
    { error: "Analyze endpoint is not implemented yet." },
    { status: 501 },
  );
}
