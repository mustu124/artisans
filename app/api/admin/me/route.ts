import { getAdminUser } from "@/lib/admin-auth";
import { fail, ok } from "@/lib/api";

export async function GET() {
  const user = await getAdminUser();

  if (!user?.email) {
    return fail("Not signed in.", 401);
  }

  return ok({ user: { id: user.id, email: user.email } });
}
