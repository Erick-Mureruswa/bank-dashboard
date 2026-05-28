import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { JwtPayload, UserRole } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

export function setAuthCookies(
  response: Response,
  accessToken: string,
  refreshToken: string
): void {
  const isProduction = process.env.NODE_ENV === "production";
  response.headers.append(
    "Set-Cookie",
    `access_token=${accessToken}; HttpOnly; Path=/; Max-Age=900; SameSite=Strict${isProduction ? "; Secure" : ""}`
  );
  response.headers.append(
    "Set-Cookie",
    `refresh_token=${refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict${isProduction ? "; Secure" : ""}`
  );
}

export function clearAuthCookies(response: Response): void {
  response.headers.append(
    "Set-Cookie",
    "access_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict"
  );
  response.headers.append(
    "Set-Cookie",
    "refresh_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict"
  );
}

export function generateAccountNumber(): string {
  const prefix = "4200";
  const random = Math.floor(Math.random() * 1_000_000_000_000)
    .toString()
    .padStart(12, "0");
  return `${prefix}${random}`.substring(0, 16);
}

export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}
