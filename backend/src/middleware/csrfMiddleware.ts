import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = '_csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * @description Generates a new Anti-CSRF token and sets it as an HTTP Cookie.
 */
export function setCsrfCookie(res: Response): string {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by client JS to attach to x-csrf-token header
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  return token;
}

/**
 * @description Express middleware that verifies incoming Anti-CSRF header against cookie for state-changing requests.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Safe HTTP methods do not require CSRF token validation
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Bypass CSRF check for public auth endpoints like login and registration
  const unauthenticatedBypass = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/verify-otp',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/request-login-otp',
    '/api/auth/login-with-otp',
    '/api/auth/verify-reset-otp',
    '/api/auth/request-registration-otp',
    '/api/auth/verify-registration-otp',
    '/api/auth/request-registration-email-otp',
    '/api/auth/verify-registration-email-otp',
  ];

  if (unauthenticatedBypass.some((path) => req.originalUrl.includes(path))) {
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF Token validation failed. Invalid anti-forgery token.',
      errors: [],
    });
  }

  next();
}
