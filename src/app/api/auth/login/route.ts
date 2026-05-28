import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, generateAccessToken, generateRefreshToken, setAuthCookies } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    if (!user.isActive) {
      return NextResponse.json({ error: "This account has been deactivated." }, { status: 403 });
    }
    if (user.isFrozen) {
      return NextResponse.json({ error: "This account is frozen. Contact support." }, { status: 403 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown",
      },
    });

    const tokenPayload = { userId: user.id, email: user.email, role: user.role as "user" | "admin" };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "security",
        title: "New Login Detected",
        message: `Successful login from ${req.headers.get("x-forwarded-for") ?? "unknown IP"}.`,
        severity: "info",
      },
    });

    const response = NextResponse.json({
      data: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
