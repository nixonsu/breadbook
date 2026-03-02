import { syncClients } from "@/src/features/clients/client-service";

export async function POST(): Promise<Response> {
  try {
    const result = await syncClients(1);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sync clients";
    console.error("Failed to sync clients:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
