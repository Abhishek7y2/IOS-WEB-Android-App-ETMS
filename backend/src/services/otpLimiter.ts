import OtpRateLimit from '../models/OtpRateLimit';

/**
 * Normalizes keys to ensure consistent tracking for emails and phone numbers.
 */
function normalizeKey(key: string): string {
  const trimmed = key.trim().toLowerCase();
  // If it looks like a phone number (e.g. starts with + or contains only digits), strip spaces and formatting
  if (trimmed.startsWith('+') || /^\d+$/.test(trimmed.replace(/[\s\-()]/g, ''))) {
    return trimmed.replace(/[\s\-()]/g, '');
  }
  return trimmed;
}

/**
 * Checks if the user is allowed to send another OTP.
 * If allowed, increments their request counter.
 */
export async function checkAndIncrementSendLimit(rawKey: string): Promise<{ allowed: boolean; message?: string }> {
  const key = normalizeKey(rawKey);
  const now = new Date();

  let limitDoc = await OtpRateLimit.findOne({ key });
  if (!limitDoc) {
    limitDoc = new OtpRateLimit({ key });
  }

  // 1. Check send lock expiration
  if (limitDoc.sendLockExpires && limitDoc.sendLockExpires > now) {
    const waitTimeMin = Math.ceil((limitDoc.sendLockExpires.getTime() - now.getTime()) / 60000);
    return {
      allowed: false,
      message: `Too many OTP requests. Please wait at least ${waitTimeMin} minute${waitTimeMin > 1 ? 's' : ''} before requesting a new code.`
    };
  }

  // Also check verification fail lock expiration (locking sending new codes during fail lockout)
  if (limitDoc.failLockExpires && limitDoc.failLockExpires > now) {
    const waitTimeMin = Math.ceil((limitDoc.failLockExpires.getTime() - now.getTime()) / 60000);
    return {
      allowed: false,
      message: `Verification is locked due to multiple incorrect attempts. Please wait ${waitTimeMin} minute${waitTimeMin > 1 ? 's' : ''} before requesting a new code.`
    };
  }

  // If locks expired, clear the expired values
  if (limitDoc.sendLockExpires) {
    limitDoc.sendLockExpires = undefined;
    limitDoc.sendCount = 0;
  }
  if (limitDoc.failLockExpires && limitDoc.failLockExpires <= now) {
    limitDoc.failLockExpires = undefined;
    limitDoc.failCount = 0;
  }

  // 2. Increment sendCount
  limitDoc.sendCount += 1;

  // 3. Process send limits and apply lockouts if limits hit
  if (!limitDoc.isSecondaryPhase) {
    if (limitDoc.sendCount >= 7) {
      limitDoc.sendLockExpires = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes lockout
      limitDoc.isSecondaryPhase = true;
      limitDoc.sendCount = 0;
    }
  } else {
    if (limitDoc.sendCount >= 4) {
      limitDoc.sendLockExpires = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes lockout
      limitDoc.sendCount = 0;
    }
  }

  await limitDoc.save();
  return { allowed: true };
}

/**
 * Checks if verification is locked out due to previous verification failures.
 */
export async function checkVerificationLock(rawKey: string): Promise<{ allowed: boolean; message?: string }> {
  const key = normalizeKey(rawKey);
  const now = new Date();

  const limitDoc = await OtpRateLimit.findOne({ key });
  if (!limitDoc) return { allowed: true };

  if (limitDoc.failLockExpires && limitDoc.failLockExpires > now) {
    const waitTimeMin = Math.ceil((limitDoc.failLockExpires.getTime() - now.getTime()) / 60000);
    return {
      allowed: false,
      message: `Too many verification failures. Please wait at least ${waitTimeMin} minute${waitTimeMin > 1 ? 's' : ''} before attempting again.`
    };
  }

  return { allowed: true };
}

/**
 * Handles the result of an OTP verification attempt.
 * Increments fail counters or resets the rate limits depending on success.
 */
export async function handleVerifyResult(
  rawKey: string,
  isSuccess: boolean
): Promise<{ allowed: boolean; message?: string }> {
  const key = normalizeKey(rawKey);
  const now = new Date();

  let limitDoc = await OtpRateLimit.findOne({ key });
  if (!limitDoc) {
    limitDoc = new OtpRateLimit({ key });
  }

  // Clear expired fail lockouts
  if (limitDoc.failLockExpires && limitDoc.failLockExpires <= now) {
    limitDoc.failLockExpires = undefined;
    limitDoc.failCount = 0;
  }

  if (isSuccess) {
    // Reset rate limiter on successful verification
    await OtpRateLimit.deleteOne({ key });
    return { allowed: true };
  }

  // Increment failCount on failure
  limitDoc.failCount += 1;

  if (!limitDoc.isSecondaryPhase) {
    if (limitDoc.failCount >= 7) {
      limitDoc.failLockExpires = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes lockout
      limitDoc.isSecondaryPhase = true;
      limitDoc.failCount = 0;
      await limitDoc.save();
      return {
        allowed: false,
        message: 'Incorrect OTP entered 7 times. Verification is locked. Please wait 10 minutes before requesting a new code.'
      };
    }
  } else {
    if (limitDoc.failCount >= 4) {
      limitDoc.failLockExpires = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes lockout
      limitDoc.failCount = 0;
      await limitDoc.save();
      return {
        allowed: false,
        message: 'Incorrect OTP entered 4 times. Verification is locked. Please wait 15 minutes before requesting a new code.'
      };
    }
  }

  await limitDoc.save();
  const maxAttempts = limitDoc.isSecondaryPhase ? 4 : 7;
  return { 
    allowed: true, 
    message: `Invalid OTP code. Attempt ${limitDoc.failCount} of ${maxAttempts} failed.`
  };
}
