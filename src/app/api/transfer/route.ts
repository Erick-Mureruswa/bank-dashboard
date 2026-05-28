import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, generateAccountNumber } from "@/lib/auth";
import { analyzeTransaction } from "@/lib/fraud-detection";
import { generateReference } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  fromAccountId: z.string(),
  toAccountNumber: z.string().min(10).max(20),
  amount: z.number().positive().max(100000),
  description: z.string().max(200).optional(),
  category: z.string().default("other"),
});

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { fromAccountId, toAccountNumber, amount, description, category } = parsed.data;

  const fromAccount = await prisma.account.findFirst({
    where: { id: fromAccountId, userId: auth.userId },
  });
  if (!fromAccount) return NextResponse.json({ error: "Source account not found." }, { status: 404 });
  if (fromAccount.status !== "active") return NextResponse.json({ error: "Source account is not active." }, { status: 400 });
  if (fromAccount.balance < amount) return NextResponse.json({ error: "Insufficient funds." }, { status: 400 });

  const toAccount = await prisma.account.findFirst({ where: { accountNumber: toAccountNumber } });
  if (!toAccount) return NextResponse.json({ error: "Recipient account not found." }, { status: 404 });
  if (toAccount.status !== "active") return NextResponse.json({ error: "Recipient account is not active." }, { status: 400 });
  if (toAccount.id === fromAccountId) return NextResponse.json({ error: "Cannot transfer to the same account." }, { status: 400 });

  const recentTxs = await prisma.transaction.findMany({
    where: { fromAccountId, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    orderBy: { createdAt: "desc" },
  });

  const fraud = analyzeTransaction({ amount, type: "transfer", description }, recentTxs as Parameters<typeof analyzeTransaction>[1], fromAccount.balance);

  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        fromAccountId,
        toAccountId: toAccount.id,
        amount,
        type: "transfer",
        category,
        status: "completed",
        description: description ?? `Transfer to ${toAccountNumber}`,
        reference: generateReference(),
        isFlagged: fraud.triggered,
      },
    }),
    prisma.account.update({ where: { id: fromAccountId }, data: { balance: { decrement: amount } } }),
    prisma.account.update({ where: { id: toAccount.id }, data: { balance: { increment: amount } } }),
  ]);

  if (fraud.triggered) {
    await prisma.fraudAlert.create({
      data: {
        userId: auth.userId,
        transactionId: transaction.id,
        riskScore: fraud.riskScore,
        reason: fraud.reason,
        status: "open",
      },
    });
    await prisma.notification.create({
      data: {
        userId: auth.userId,
        type: "fraud",
        title: "Security Alert: Unusual Transaction",
        message: `A transfer of $${amount.toFixed(2)} was flagged for review. Reason: ${fraud.reason}`,
        severity: "error",
      },
    });
  } else {
    await prisma.notification.create({
      data: {
        userId: auth.userId,
        type: "transaction",
        title: "Transfer Completed",
        message: `$${amount.toFixed(2)} sent successfully. Reference: ${transaction.reference}`,
        severity: "success",
      },
    });
  }

  return NextResponse.json({ data: transaction, flagged: fraud.triggered }, { status: 201 });
}
