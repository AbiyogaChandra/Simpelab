import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_session")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";
  
  // Define protected routes
  const protectedRoutes = [
    "/dashboard",
    "/data-inventaris", 
    "/data-peminjaman", 
    "/log-perubahan",
    "/create-produk",
    "/create-detail-produk",
    "/api/aktivitas",
    "/api/detail-produk",
    "/api/lokasi"
  ];
  
  // Specific API method protection (if needed, but for now path-based)
  // Note: /api/pengajuan GET should be protected, but POST is public.
  // Middleware cannot easily parse method without extensive logic.
  // Strategy: Protect strictly admin-only paths here. 
  // For mixed paths like /api/pengajuan, we handles check in the route.ts.

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    // If API request, return 401 instead of redirect
    if (request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/data-inventaris/:path*", 
    "/data-peminjaman/:path*", 
    "/log-perubahan/:path*", 
    "/create-produk/:path*", 
    "/create-detail-produk/:path*",
    "/login",
    "/api/aktivitas/:path*",
    "/api/detail-produk/:path*",
    "/api/lokasi/:path*"
  ],
};
