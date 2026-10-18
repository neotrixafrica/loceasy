import { createHash, randomInt, timingSafeEqual } from 'crypto';

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function secret(): string {
  return process.env.JWT_SECRET || 'loceasy-otp';
}

export function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

export function hashOtp(userId: string, otp: string): string {
  return createHash('sha256').update(`${userId}:${otp}:${secret()}`).digest('hex');
}

export function otpMatches(userId: string, otp: string, storedHash: string | null): boolean {
  if (!storedHash || !/^\d{6}$/.test(otp)) return false;
  const computed = hashOtp(userId, otp);
  const a = Buffer.from(computed);
  const b = Buffer.from(storedHash);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function otpExpiry(): Date {
  return new Date(Date.now() + OTP_TTL_MS);
}

export function isOtpExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true;
  return expiresAt.getTime() < Date.now();
}

/** True if an OTP was sent less than 60s ago (expiry is TTL 10 min). */
export function isResendTooSoon(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  const sentAt = expiresAt.getTime() - OTP_TTL_MS;
  return Date.now() - sentAt < RESEND_COOLDOWN_MS;
}
