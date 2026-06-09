import { createClient } from "@supabase/supabase-js";
import { fail, ok } from "@/lib/api";
import { setAdminSessionCookie } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return fail("Email and password are required.", 400);
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return fail("Supabase authentication is not configured.", 500);
    }

    const supabase = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session?.access_token || !data.user?.email) {
      return fail("Invalid admin credentials.", 401);
    }

    setAdminSessionCookie(data.session.access_token);

    return ok({ user: { id: data.user.id, email: data.user.email } }, "Signed in.");
  } catch (error) {
    console.error("Admin login failed:", error);
    return fail("Unable to sign in right now.");
  }
}
