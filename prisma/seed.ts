import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function genAccountNumber() {
  return `4200${Math.floor(Math.random() * 1e12).toString().padStart(12, "0")}`.slice(0, 16);
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log("🌱 Seeding NexaBank database...");

  await prisma.adminLog.deleteMany();
  await prisma.fraudAlert.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.account.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = await bcrypt.hash("Admin@1234", 12);
  const userHash = await bcrypt.hash("Demo@1234", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@nexabank.com",
      name: "Alex Admin",
      passwordHash: adminHash,
      role: "admin",
      mfaEnabled: true,
      lastLoginAt: new Date(),
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: "user@nexabank.com",
      name: "Jamie Smith",
      passwordHash: userHash,
      role: "user",
      lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  const extraUsers = await Promise.all(
    ["Sarah Johnson","Marcus Williams","Elena Rodriguez","David Kim","Priya Patel"].map((name, i) =>
      prisma.user.create({
        data: {
          email: `${name.split(" ")[0].toLowerCase()}@example.com`,
          name,
          passwordHash: userHash,
          role: "user",
          createdAt: randomDate(new Date("2024-01-01"), new Date()),
        },
      })
    )
  );

  const adminAccount = await prisma.account.create({
    data: { userId: admin.id, accountNumber: genAccountNumber(), type: "checking", balance: 50000, currency: "USD", status: "active" },
  });

  const checkingAccount = await prisma.account.create({
    data: { userId: demoUser.id, accountNumber: genAccountNumber(), type: "checking", balance: 12450.75, currency: "USD", status: "active" },
  });

  const savingsAccount = await prisma.account.create({
    data: { userId: demoUser.id, accountNumber: genAccountNumber(), type: "savings", balance: 8200.00, currency: "USD", status: "active" },
  });

  const extraAccounts = await Promise.all(
    extraUsers.map((u) =>
      prisma.account.create({
        data: {
          userId: u.id,
          accountNumber: genAccountNumber(),
          type: "checking",
          balance: Math.round(Math.random() * 20000 + 1000),
          currency: "USD",
          status: Math.random() > 0.1 ? "active" : "frozen",
        },
      })
    )
  );

  const categories = ["food","transport","shopping","entertainment","utilities","health","salary","other"];
  const descriptions = [
    "Grocery Store","Netflix","Uber Ride","Electric Bill","Amazon Purchase",
    "Coffee Shop","Restaurant","Pharmacy","Salary Deposit","Online Transfer",
    "Gas Station","Gym Membership","Streaming Service","Phone Bill","Clothing Store",
  ];

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  for (let i = 0; i < 80; i++) {
    const date = randomDate(sixMonthsAgo, now);
    const isSalary = i % 15 === 0;
    const isDeposit = isSalary || Math.random() > 0.65;
    const amount = isSalary ? 3500 + Math.random() * 1000 : Math.round(Math.random() * 500 + 10);

    await prisma.transaction.create({
      data: {
        fromAccountId: isDeposit ? extraAccounts[Math.floor(Math.random() * extraAccounts.length)].id : checkingAccount.id,
        toAccountId: isDeposit ? checkingAccount.id : extraAccounts[Math.floor(Math.random() * extraAccounts.length)].id,
        amount,
        type: isSalary ? "deposit" : isDeposit ? "transfer" : "transfer",
        category: isSalary ? "salary" : categories[Math.floor(Math.random() * categories.length)],
        status: Math.random() > 0.05 ? "completed" : "pending",
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        reference: `NXB${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        isFlagged: Math.random() > 0.95,
        createdAt: date,
      },
    });
  }

  for (let i = 0; i < 20; i++) {
    const date = randomDate(sixMonthsAgo, now);
    await prisma.transaction.create({
      data: {
        fromAccountId: checkingAccount.id,
        toAccountId: savingsAccount.id,
        amount: Math.round(Math.random() * 400 + 50),
        type: "transfer",
        category: "investment",
        status: "completed",
        description: "Transfer to Savings",
        reference: `NXB${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        createdAt: date,
      },
    });
  }

  await prisma.savingsGoal.createMany({
    data: [
      { userId: demoUser.id, name: "Emergency Fund", targetAmount: 15000, currentAmount: 8200, icon: "🛡️", color: "#10B981", deadline: new Date("2025-12-31") },
      { userId: demoUser.id, name: "Vacation to Japan", targetAmount: 5000, currentAmount: 1200, icon: "✈️", color: "#4361EE", deadline: new Date("2025-08-01") },
      { userId: demoUser.id, name: "New MacBook Pro", targetAmount: 3500, currentAmount: 875, icon: "💻", color: "#7C3AED" },
      { userId: demoUser.id, name: "Down Payment", targetAmount: 50000, currentAmount: 12000, icon: "🏠", color: "#F59E0B", deadline: new Date("2027-01-01") },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: demoUser.id, type: "security", title: "New Login Detected", message: "Successful login from 196.12.xx.xx.", severity: "info" },
      { userId: demoUser.id, type: "transaction", title: "Transfer Completed", message: "Your transfer of $250 was processed successfully.", severity: "success" },
      { userId: demoUser.id, type: "system", title: "Welcome to NexaBank!", message: "Hi Jamie! Your account is ready.", severity: "success", read: true },
      { userId: demoUser.id, type: "fraud", title: "Security Alert", message: "Unusual transfer pattern detected on your account.", severity: "warning" },
    ],
  });

  await prisma.fraudAlert.create({
    data: {
      userId: demoUser.id,
      riskScore: 72,
      reason: "Rapid succession: 5 transactions in the last hour; Large transfer amount exceeding $5,000",
      status: "open",
    },
  });

  console.log("✅ Seed complete!");
  console.log("   Admin: admin@nexabank.com / Admin@1234");
  console.log("   User:  user@nexabank.com / Demo@1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
