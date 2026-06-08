import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export function ok<T>(data: T, message = "OK", init?: ResponseInit) {
  return NextResponse.json({ success: true, data, message }, init);
}

export function fail(message = "Something went wrong.", status = 500, data: unknown = null) {
  return NextResponse.json({ success: false, data, message }, { status });
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  return session;
}

export async function assertAdmin() {
  const session = await requireAdmin();

  if (!session) {
    return fail("Admin authentication required.", 401);
  }

  return null;
}
