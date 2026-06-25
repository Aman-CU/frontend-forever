import { auth } from "@/lib/auth/server";
import { ratelimit } from "@/lib/upstash";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = await ratelimit.limit(session.user.id);
  if (!success) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  return new Response(null, { status: 501 });
}
