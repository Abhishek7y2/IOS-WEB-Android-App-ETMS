import { Request, Response, NextFunction } from 'express';

/**
 * Ye middleware pure backend application ka Global Error Handler hai.
 * Agar kisi controller ya route mein koi error (crash/exception) aata hai jo catch nahi ho pata, 
 * toh wo aakhir me yahan aata hai taaki server crash na ho aur frontend ko ek proper error response mile.
 */
export function errorHandler(err: Error & { status?: number }, req: Request, res: Response, next: NextFunction) {
  // 1. Agar error object me koi specific status code (jaise 400 ya 401) bheja gaya hai toh wo use karein, 
  // warna default 500 (Internal Server Error) set karein
  const status = err.status ?? 500;

  // 2. Frontend ko properly formatted JSON error response bhejna
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error', // Actual error message (agar hai) ya default generic message
    errors: [], // Empty array kyunki ye generic server error hai, field-specific validation error nahi
  });
}
