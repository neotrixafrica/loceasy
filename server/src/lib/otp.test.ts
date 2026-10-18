import { describe, it, expect } from 'vitest';
import { generateOtp, hashOtp, otpMatches, isOtpExpired, isResendTooSoon } from './otp';

describe('otp', () => {
  it('generates a 6-digit code', () => {
    expect(generateOtp()).toMatch(/^\d{6}$/);
  });

  it('matches hashed otp for the same user', () => {
    const hash = hashOtp('user-1', '123456');
    expect(otpMatches('user-1', '123456', hash)).toBe(true);
    expect(otpMatches('user-2', '123456', hash)).toBe(false);
    expect(otpMatches('user-1', '000000', hash)).toBe(false);
  });

  it('treats missing hash as invalid', () => {
    expect(otpMatches('user-1', '123456', null)).toBe(false);
  });

  it('detects expiry', () => {
    expect(isOtpExpired(new Date(Date.now() - 1000))).toBe(true);
    expect(isOtpExpired(new Date(Date.now() + 60_000))).toBe(false);
  });

  it('enforces resend cooldown against 10-minute expiry', () => {
    const justSent = new Date(Date.now() + 10 * 60 * 1000);
    expect(isResendTooSoon(justSent)).toBe(true);
    const old = new Date(Date.now() + 8 * 60 * 1000);
    expect(isResendTooSoon(old)).toBe(false);
  });
});
