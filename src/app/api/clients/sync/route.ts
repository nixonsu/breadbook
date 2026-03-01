import { syncClients } from "@/src/features/clients/client-service";

export async function POST(): Promise<Response> {
  try {
    const result = await syncClients(1);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to sync clients:", error);
    return new Response(JSON.stringify({ error: "Failed to sync clients" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
