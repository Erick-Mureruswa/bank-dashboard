import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password"];
const ADMIN_PATHS = ["/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith("/api/auth"));
  if (isPublic) return NextResponse.next();

  const token = request.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (isAdminPath && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-email", payload.email);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
