import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Ye middleware check karta hai ki express-validator ne request me koi error pakdi hai ya nahi.
 * Jaise galat email, chhote passwords, ya khali fields.
 */
export function validateRequest(req: Request, res: Response, next: NextFunction) {
  // 1. Request object me se saari validation errors nikalna
  const errors = validationResult(req);
  
  // 2. Agar koi error nahi hai (array khali hai), toh request ko aage (controller tak) bhej dena
  if (errors.isEmpty()) {
    return next();
  }

  // 3. Agar errors hain, toh unko ek proper format me map karke frontend ko wapas bhej dena (400 Bad Request)
  const mappedErrors = errors.array().map((error) => ({
    field: (error as any).param || (error as any).path || '',
    message: error.msg,
  }));
  
  const combinedMessage = "Validation failed: " + mappedErrors.map((e) => e.message).join(", ");

  return res.status(400).json({
    success: false,
    message: combinedMessage,
    errors: mappedErrors,
  });
}
