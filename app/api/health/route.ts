import { connectToDatabase } from "@/lib/mongodb";
import { fail, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    return ok({ service: "Artisan Root API" }, "API is healthy.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "API health check failed.", 500);
  }
}
