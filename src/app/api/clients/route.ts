import { getClients } from "@/src/features/clients/client-service";

export async function GET(): Promise<Response> {
  const clients = await getClients(1);

  return new Response(JSON.stringify(clients), {
    headers: { "Content-Type": "application/json" },
  });
}
