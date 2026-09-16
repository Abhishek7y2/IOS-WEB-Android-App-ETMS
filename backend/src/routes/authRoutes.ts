// =========================================================================
// INTERVIEW GUIDE: authRoutes.ts - The Traffic Police
// `app.ts` ne saare '/api/auth' requests is file ko bhej diye. Ab ye file dekhegi
// ki us request me aage kya likha hai (jaise '/login' ya '/register') aur
// usko sahi Controller aur Middlewares (security check) ke paas bhejegi.
// =========================================================================

import { Router } from 'express';
// Ye saare function (Handlers) authController se aaye hain jahan actual brain/logic likha hai
import {
  register, login, logout, forgotPassword, resetPassword, profile,
  verifyOtp, resendVerificationOtp, resendResetOtp, getAllUsers,
  updateUser, deleteUser, getArchivedUsers, restoreUser, requestLoginOtp,
  loginWithOtp, verifyResetOtp, permanentDeleteUser, refreshToken,
  blockUser, unblockUser, requestPhoneChangeOtp, verifyPhoneChangeOtp,
  requestRegistrationOtp, verifyRegistrationOtp,
  requestRegistrationEmailOtp, verifyRegistrationEmailOtp,
  requestEmailChangeOtp, verifyEmailChangeOtp, getCsrfToken,
  purgeAccountData
} from '../controllers/authController';

// Ye Middlewares hain (Checkers). Controller me jaane se pehle data check hoga.
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } from '../validators/authValidator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// =========================================================================
// THE REQUEST PIPELINE (Very Important)
// Interviewer: "Login request kaise flow karti hai aapke code me?"
// Aapka Jawab: "Sabse pehle request router pe aati hai. Yahan main 3 functions pass kar raha hoon:"
// 1. `loginValidation`: Check karega ki email/password empty toh nahi? Format sahi hai?
// 2. `validateRequest`: Agar 1st step me error mili, toh yahi se Frontend ko error bhej dega (Controller tak nahi jayega).
// 3. `login`: Agar sab theek hai, tab ja kar hamara main logic (Controller) chalega!
// =========================================================================

// Naya user banane ka route (Registration)
router.post('/register', registerValidation, validateRequest, register);

// Normal email aur password se login (Yahi pipeline lagoo hoti hai)
router.post('/login', loginValidation, validateRequest, login);
// User ko logout karne ke liye
router.post('/logout', logout);
// CSRF Token issuance
router.get('/csrf-token', getCsrfToken);

// Refresh token endpoint to get new access token
router.post('/refresh', refreshToken);
// Account verify karne ke liye OTP submit karna
router.post('/verify-otp', verifyOtp);
// OTP wapas mangwane ke routes
router.post('/resend-verification-otp', resendVerificationOtp);
router.post('/resend-reset-otp', resendResetOtp);
// Password bhool jane par OTP mangwana
router.post('/forgot-password', forgotPasswordValidation, validateRequest, forgotPassword);
// Naya password set karna
router.post('/reset-password', resetPasswordValidation, validateRequest, resetPassword);
// Bina password ke login karne ke liye OTP mangwana aur verify karna
router.post('/request-login-otp', requestLoginOtp);
router.post('/login-with-otp', loginWithOtp);
router.post('/verify-reset-otp', verifyResetOtp);
// Registration inline mobile verification
router.post('/request-registration-otp', requestRegistrationOtp);
router.post('/verify-registration-otp', verifyRegistrationOtp);

// Registration inline email verification
router.post('/request-registration-email-otp', requestRegistrationEmailOtp);
router.post('/verify-registration-email-otp', verifyRegistrationEmailOtp);

// Profile fetch karna (Iske liye 'authenticate' middleware zaroori hai, matlab login hona lazmi hai)
router.get('/profile', authenticate, profile);

// Phone number change ke liye OTP generate aur verify karna
router.post('/request-phone-change-otp', authenticate, requestPhoneChangeOtp);
router.post('/verify-phone-change-otp', authenticate, verifyPhoneChangeOtp);

// Email change ke liye OTP generate aur verify karna
router.post('/request-email-change-otp', authenticate, requestEmailChangeOtp);
router.post('/verify-email-change-otp', authenticate, verifyEmailChangeOtp);
// Users ki details nikalna, update karna, ya delete karna
router.get('/users/archived', authenticate, getArchivedUsers);
router.get('/users', authenticate, getAllUsers);
router.put('/users/:id', authenticate, updateUser);
router.delete('/users/:id', authenticate, deleteUser);
router.put('/users/:id/restore', authenticate, restoreUser);
router.delete('/users/:id/permanent', authenticate, permanentDeleteUser);
router.post('/users/:id/block', authenticate, blockUser);
router.post('/users/:id/unblock', authenticate, unblockUser);
// DPDP Act 2023 Right to Erasure account purge
router.delete('/me/purge', authenticate, purgeAccountData);

export default router;
