import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if Supabase variables are set in production
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = hasSupabaseUrl && hasSupabaseKey;

  // Retrieve the session cookie
  const sessionCookie = request.cookies.get("sb-session");

  // Protect Admin route
  if (pathname.startsWith("/admin")) {
    // If Supabase is configured and no session exists, redirect to login page
    if (isSupabaseConfigured && !sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle Login route redirect
  if (pathname === "/login") {
    // If Supabase is configured and user is already logged in, redirect to admin
    if (isSupabaseConfigured && sessionCookie) {
      const adminUrl = new URL("/admin", request.url);
      return NextResponse.redirect(adminUrl);
    }
    
    // If Supabase is not configured (Sandbox Mode), we bypass login and direct to /admin
    if (!isSupabaseConfigured) {
      const adminUrl = new URL("/admin", request.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
