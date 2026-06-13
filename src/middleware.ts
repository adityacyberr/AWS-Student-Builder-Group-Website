import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const isConsoleSubdomain = hostname.startsWith("console.");

  // Bypass static file requests by checking if path contains a file extension
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  // Check if Supabase variables are set
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = hasSupabaseUrl && hasSupabaseKey;

  // Retrieve the session cookie
  const sessionCookie = request.cookies.get("sb-session");

  // 1. Redirection if user accesses legacy paths on the main domain (e.g., adityacyber.in/admin or adityacyber.in/login)
  if (!isConsoleSubdomain) {
    if (pathname.startsWith("/admin") || pathname === "/login") {
      const protocol = hostname.includes("localhost") ? "http" : "https";

      // If we are on localhost:3000, we redirect to console.localhost:3000
      const newHost = `console.${hostname}`;

      // Map /admin/events to /events, and /admin or /login to / or /login
      let targetPath = "/";
      if (pathname === "/login") {
        targetPath = "/login";
      } else if (pathname.startsWith("/admin/")) {
        targetPath = pathname.replace("/admin", "");
      }

      return NextResponse.redirect(
        new URL(`${protocol}://${newHost}${targetPath}${request.nextUrl.search}`)
      );
    }
    return NextResponse.next();
  }

  // 2. Subdomain Routing (e.g. console.localhost:3000 or console.adityacyber.in)
  // If the path already has "/console" internally, avoid infinite loop
  if (pathname.startsWith("/console")) {
    return NextResponse.next();
  }

  // Authentication validation for console subdomain
  if (pathname === "/login") {
    // If authenticated (or sandbox), redirect to home page of console
    if (!isSupabaseConfigured || sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Else rewrite to internal folder /console/login
    return NextResponse.rewrite(new URL(`/console/login${request.nextUrl.search}`, request.url));
  }

  // Any other page (dashboard routes like /, /events, etc.) require auth
  if (isSupabaseConfigured && !sessionCookie) {
    // Redirect to login page on the console domain
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Rewrite to internal route inside /console
  return NextResponse.rewrite(new URL(`/console${pathname}${request.nextUrl.search}`, request.url));
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

