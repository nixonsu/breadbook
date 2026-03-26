import { getCurrentBalances } from "@/src/features/balances/balance-service";

export async function GET(): Promise<Response> {
  try {
    const summary = await getCurrentBalances(1);
    return new Response(JSON.stringify(summary), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch balance summary";
    console.error("Failed to fetch balance summary:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
