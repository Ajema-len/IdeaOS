import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes (including all NextAuth routes)
  const publicRoutes = ["/login", "/register", "/api/auth"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Skip middleware for public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const session = await auth();

  // Protected routes (excluding public routes)
  const protectedRoutes = ["/api/", "/"];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

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
