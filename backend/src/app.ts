// =========================================================================
// INTERVIEW GUIDE: app.ts - The Heart of the Backend
// Yeh file hamari Node.js backend ka "Main Entry Point" ya "Darwaza" hai.
// Yahan par hum server ki configuration, security, aur saare routes set karte hain.
// =========================================================================

// 1. Core Libraries Import karna
import express from 'express';         // Express ek web framework hai Node.js ke liye. (Routing aur server banane me madad karta hai)
import cors from 'cors';               // CORS (Cross-Origin Resource Sharing) - Browser ko security restrictions bypass karke frontend se API call karne deta hai.
import helmet from 'helmet';           // Helmet HTTP headers set karke basic security attacks (jaise XSS, Clickjacking) se bachata hai.
import dotenv from 'dotenv';           // `.env` file se secret variables (jaise DB_URL, JWT_SECRET) ko load karne ke liye.
import cookieParser from 'cookie-parser'; // Browser se aane wali HTTP cookies (jaise hamara JWT token) ko parse karne ke liye.

// Express me built-in body parsers
import { json, urlencoded } from 'express';

// 2. Routes (APIs) Imports
// Yahan humne saare alag-alag modules ke routes (URLs) ko import kiya hai.
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import chatRoutes from './routes/chatRoutes';
import communicationRoutes from './routes/communicationRoutes';
import notificationRoutes from './routes/notificationRoutes';
import holidayRoutes from './routes/holidayRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import leaveRoutes from './routes/leaveRoutes';
import profileRoutes from './routes/profileRoutes';
import ragRoutes from './routes/ragRoutes';
import noteRoutes from './routes/noteRoutes';

// 3. Error Handling Middleware Imports
import { notFoundHandler } from './middleware/notFoundHandler'; // Agar user galat URL type kare, toh ye chalega.
import { errorHandler } from './middleware/errorHandler';       // Agar server me kahin bhi crash ho, toh ye error handle karega taaki server band na ho.
import { xssSanitizer } from './middleware/xssSanitizer';

// 4. Environment Variables Initialize karna
dotenv.config(); // Ye line `.env` file ko padhti hai aur process.env me variables dal deti hai.

// 5. Express App Initialize karna
const app = express();

// =========================================================================
// 6. GLOBAL MIDDLEWARES (Security & Data Parsing)
// Middlewares wo functions hain jo har request (Frontend se aayi API call) aur response ke beech me chalte hain.
// =========================================================================

// Helmet: Adds 11 security headers.
// Interview me bataiyega: "Maine Helmet use kiya hai taaki application XSS attacks aur MIME-type sniffing se safe rahe."
app.use(helmet());

// CORS: Frontend ko Backend se jodta hai.
// origin: Allowed URLs ko allow karega. credentials: true isliye rakha hai taaki Cookies frontend tak jaa sakein.
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback allow for local dev convenience
    }
  },
  credentials: true
}));

// Body Parsers: Frontend se jo data JSON ya URL form me aata hai, usko samajhne (parse) ke liye.
app.use(json({ limit: '50mb' })); // Agar req.body me JSON data hai, toh usko object banata hai. Limit badhayi taaki image upload crash na ho.
app.use(urlencoded({ limit: '50mb', extended: true })); // Form submissions (URL encoded) ko padhne ke liye.

// XSS Sanitizer: Incoming request body, query, aur params me se HTML aur script tags strip karne ke liye.
app.use(xssSanitizer);

// Cookie Parser: Jo naya security feature humne lagaya hai, jisse req.cookies me token milta hai.
app.use(cookieParser());

// Root & Health Check endpoints taaki root URL ya /api hit karne par 404 Resource Not Found error na aaye
app.get(['/', '/api', '/api/health', '/health'], (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Mini Employee Task Manager API Server is running successfully.',
    status: 'online',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

// =========================================================================
// 7. API ROUTES MOUNTING (URLs)
// Yahan hum Express ko batate hain ki kaunsa URL kis file ke paas jayega.
// Example: Jab koi frontend se 'http://localhost:5000/api/auth/login' hit karega, 
// toh wo '/api/auth' dekhega aur `authRoutes` file ke andar chala jayega.
// =========================================================================
app.use('/api/auth', authRoutes);                   // Authentication (Login, Register, OTP)
app.use('/api/tasks', taskRoutes);                  // Tasks assign karna aur dekhna
app.use('/api/communication', communicationRoutes); // Admin Announcements aur Chat logic
app.use('/api/chat', chatRoutes);                   // Chat messages ke routes
app.use('/api/notifications', notificationRoutes);  // In-app notifications bhejna
app.use('/api/holidays', holidayRoutes);            // Company Holidays Calendar
app.use('/api/attendance', attendanceRoutes);       // Employee Attendance records
app.use('/api/leaves', leaveRoutes);                // Leave Management (Apply, Approve, Reject)
app.use('/api/profile', profileRoutes);             // User Profile updates
app.use('/api/rag', ragRoutes);                     // RAG Document Upload & QnA
app.use('/api/notes', noteRoutes);                  // Notepad routes

// =========================================================================
// 8. ERROR HANDLING (Global Safety Nets)
// Ye middlewares hamesha Routes ke baad aate hain.
// =========================================================================

// Agar upar wale routes me se koi bhi URL match nahi karta hai (e.g. /api/randomXYZ), 
// toh Express is notFoundHandler ke paas request bhej dega (Returns 404 Not Found).
app.use(notFoundHandler);

// Agar kisi bhi Route ya Controller me code phat jata hai (Database down ho, syntax error ho),
// toh 'errorHandler' us error ko pakad leta hai, aur properly 500 Server Error return karta hai.
// Is se hamara pura Node.js app crash nahi hota.
app.use(errorHandler);

// 9. Export karna taaki server.ts is app ko PORT (e.g. 5000) par start kar sake.
export default app;
