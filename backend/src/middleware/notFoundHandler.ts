import { Request, Response } from 'express';

/**
 * Ye middleware un sabhi API routes (URLs) ko catch karta hai jo humare backend me define nahi kiye gaye.
 * Agar frontend se kisi aisi API par request aati hai (e.g. /api/something-wrong), jo exist nahi karti, 
 * toh ye directly 404 status return kar deta hai.
 */
export function notFoundHandler(req: Request, res: Response) {
  // Frontend ko 404 (Not Found) status ke sath JSON format me message bhejna
  res.status(404).json({
    success: false,
    message: 'Resource not found', // Standard message batane ke liye ki aisi koi API nahi hai
    errors: [],
  });
}
