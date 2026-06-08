import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const adminApiPatterns = [
  { pattern: /^\/api\/products(?:\/.*)?$/, methods: ["POST", "PUT", "DELETE"] },
  { pattern: /^\/api\/gallery(?:\/.*)?$/, methods: ["POST", "PUT", "DELETE"] },
  { pattern: /^\/api\/orders$/, methods: ["GET"] },
  { pattern: /^\/api\/orders\/[^/]+\/status$/, methods: ["PUT"] },
  { pattern: /^\/api\/upload$/, methods: ["POST"] },
  { pattern: /^\/api\/settings$/, methods: ["PUT"] }
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = adminApiPatterns.some(
    (entry) => entry.pattern.test(pathname) && entry.methods.includes(request.method)
  );

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  if (token) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json(
      { success: false, data: null, message: "Admin authentication required." },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"]
};
