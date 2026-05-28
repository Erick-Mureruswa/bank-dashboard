import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, generateAccessToken, generateRefreshToken, setAuthCookies, generateAccountNumber } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: "user" },
    });

    const accountNumber = generateAccountNumber();
    await prisma.account.create({
      data: {
        userId: user.id,
        accountNumber,
        type: "checking",
        balance: 1000,
        currency: "USD",
        status: "active",
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "system",
        title: "Welcome to NexaBank!",
        message: `Hi ${name}! Your account has been created. We've added $1,000 to get you started.`,
        severity: "success",
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

    const response = NextResponse.json({
      data: { id: user.id, email: user.email, name: user.name, role: user.role },
    }, { status: 201 });

    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
