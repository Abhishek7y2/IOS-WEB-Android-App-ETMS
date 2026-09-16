import { Request, Response, NextFunction } from 'express';

/**
 * @description Recursively strips dangerous HTML tags and script patterns from strings.
 * @param value The value to sanitize (string, object, array).
 */
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    // Skip base64 data URLs to prevent file payload corruption
    if (value.startsWith('data:')) {
      return value;
    }
    // Strips HTML tags (<script>, <iframe>, etc.) and dangerous event handler attributes
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
      .replace(/on\w+\s*=\s*[^>\s]+/gi, '')
      .replace(/javascript:[^"'\s>]*/gi, '');
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      sanitizedObj[key] = sanitizeValue(value[key]);
    }
    return sanitizedObj;
  }
  return value;
}

/**
 * @description Express middleware to sanitize incoming payload bodies and query parameters against XSS attacks.
 */
export function xssSanitizer(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  next();
}
