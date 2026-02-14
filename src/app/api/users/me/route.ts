import { getUser } from "@/src/features/users/user-service";

export async function GET(request: Request): Promise<Response> {
  // const authHeader = request.headers.get("authorization");

  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   return Response.json({ error: "Unauthorized" }, { status: 401 });
  // }

  const user = await getUser("meep@hotmail.com");

  return new Response(JSON.stringify(user), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
