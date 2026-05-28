import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const accounts = await prisma.account.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ data: accounts });
}
