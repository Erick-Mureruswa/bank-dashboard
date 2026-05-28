import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { clearAuthCookies, verifyRefreshToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    if (payload) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {});
    }
  }

  const response = NextResponse.json({ message: "Logged out successfully." });
  clearAuthCookies(response);
  return response;
}
