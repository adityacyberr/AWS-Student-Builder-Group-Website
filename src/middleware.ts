import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass static file requests
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  // Check if Supabase variables are set
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = hasSupabaseUrl && hasSupabaseKey;

  // Retrieve the session cookie
  const sessionCookie = request.cookies.get("sb-session");

  // Redirect authenticated users trying to access login pages
  if (pathname === "/admin/login") {
    if (!isSupabaseConfigured || sessionCookie) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }
  if (pathname === "/member/login") {
    if (!isSupabaseConfigured || sessionCookie) {
      return NextResponse.redirect(new URL("/member", request.url));
    }
    return NextResponse.next();
  }

  // Protect all /admin/* routes
  if (pathname.startsWith("/admin")) {
    if (isSupabaseConfigured && !sessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Protect all /member/* routes (except /member/login)
  if (pathname.startsWith("/member")) {
    if (isSupabaseConfigured && !sessionCookie) {
      return NextResponse.redirect(new URL("/member/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     */
    "/((?!api|_next/static|_next/image).*)",
  ],
};
