import { reconciliationSchema } from "@/src/app/api/reconciliations/schema";
import {
  createReconciliation,
  getReconciliations,
} from "@/src/features/reconciliations/reconciliation-service";
import { parseRequestBody } from "@/src/utils/validation";

export async function GET(request: Request): Promise<Response> {
  try {
    const reconciliations = await getReconciliations(1);
    return new Response(JSON.stringify(reconciliations), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get reconciliations";
    console.error("Failed to get reconciliations:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const parsed = await parseRequestBody(request, reconciliationSchema);
    if (!parsed.success) return parsed.response;
    const {
      startPeriod,
      endPeriod,
      expectedCash,
      expectedCard,
      actualCash,
      actualCard,
    } = parsed.data;

    await createReconciliation(
      1,
      new Date(startPeriod),
      new Date(endPeriod),
      expectedCash,
      expectedCard,
      actualCash,
      actualCard,
    );
    return new Response(
      JSON.stringify({ message: "Nice! You've closed your balance!" }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create reconciliation";
    console.error("Failed to create reconciliation:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
