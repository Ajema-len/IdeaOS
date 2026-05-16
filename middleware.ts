import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  // Public routes
  const publicRoutes = ["/login", "/register", "/api/auth/register"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Protected routes
  const protectedRoutes = ["/api/", "/"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route)) && !isPublicRoute;

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If accessing auth routes with session, redirect to home
  if (isPublicRoute && session?.user && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
