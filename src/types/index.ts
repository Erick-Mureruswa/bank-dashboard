export type UserRole = "user" | "admin";
export type AccountType = "checking" | "savings" | "business";
export type AccountStatus = "active" | "frozen" | "closed";
export type TransactionType = "transfer" | "deposit" | "withdrawal" | "payment" | "refund";
export type TransactionStatus = "pending" | "completed" | "failed" | "cancelled";
export type TransactionCategory =
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "utilities"
  | "health"
  | "travel"
  | "education"
  | "salary"
  | "investment"
  | "other";
export type NotificationType = "security" | "transaction" | "system" | "fraud";
export type NotificationSeverity = "info" | "warning" | "error" | "success";
export type SavingsGoalStatus = "active" | "completed" | "paused";
export type FraudAlertStatus = "open" | "investigating" | "resolved" | "dismissed";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  mfaEnabled: boolean;
  isActive: boolean;
  isFrozen: boolean;
  lastLoginAt?: string | Date;
  createdAt: string | Date;
}

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  type: AccountType;
  balance: number;
  currency: string;
  status: AccountStatus;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Transaction {
  id: string;
  fromAccountId?: string;
  toAccountId?: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  status: TransactionStatus;
  description?: string;
  reference: string;
  isFlagged: boolean;
  createdAt: string | Date;
  fromAccount?: Account;
  toAccount?: Account;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | Date;
  status: SavingsGoalStatus;
  icon: string;
  color: string;
  createdAt: string | Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  severity: NotificationSeverity;
  createdAt: string | Date;
}

export interface FraudAlert {
  id: string;
  userId: string;
  transactionId?: string;
  riskScore: number;
  reason: string;
  status: FraudAlertStatus;
  createdAt: string | Date;
  transaction?: Transaction;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string | Date;
}

export interface DashboardStats {
  totalBalance: number;
  totalSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  financialHealthScore: number;
}

export interface SpendingByCategory {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountNumber: string;
  amount: number;
  description?: string;
}

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  frozenUsers: number;
  newUsersThisMonth: number;
}

export interface AdminTransactionStats {
  totalVolume: number;
  totalTransactions: number;
  flaggedTransactions: number;
  dailyVolume: { date: string; amount: number }[];
}
