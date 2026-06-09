import { clearAdminSessionCookie } from "@/lib/admin-auth";
import { ok } from "@/lib/api";

export async function POST() {
  clearAdminSessionCookie();
  return ok(null, "Signed out.");
}
