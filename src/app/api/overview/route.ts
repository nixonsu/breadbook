import { getOverview } from "@/src/features/overview/overview-service";

const PERIOD_OFFSETS: Record<string, number> = {
  "1m": 30,
  "3m": 90,
  "1y": 365,
};

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "all";
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  let from: Date | undefined;
  let to: Date | undefined;

  if (fromParam && toParam) {
    from = new Date(fromParam);
    to = new Date(toParam);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return new Response(
        JSON.stringify({ error: "Invalid date format for 'from' or 'to'" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  } else if (period !== "all") {
    const days = PERIOD_OFFSETS[period];
    if (!days) {
      return new Response(
        JSON.stringify({ error: "Invalid period. Use 1m, 3m, 1y, or all" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    to = new Date();
    from = new Date();
    from.setDate(from.getDate() - days);
  }

  try {
    const overview = await getOverview(1, from, to);
    return new Response(JSON.stringify(overview), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch overview";
    console.error("Failed to fetch overview:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
