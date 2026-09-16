import { Request, Response } from 'express';
import User from '../models/User';
import { signToken, verifyToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendVerificationOtp, sendResetPasswordOtp, sendAdminAccountCreationEmail, sendAccountDeactivationEmail, sendAccountReactivationEmail, sendAccountPermanentDeletionEmail, sendAccountBlockedEmail, sendAccountUnblockedEmail, sendPhoneChangeOtp } from '../utils/mailer';
import { sendSmsOtp } from '../utils/twilio';
import { uploadToCloudinary, uploadDocumentToCloudinary } from '../utils/cloudinary';
import { AuthRequest } from '../middleware/authMiddleware';
import { encrypt, decrypt } from '../utils/crypto';
import { sanitizePhoneNumber, validatePhoneNumber, findUserByMobileNumber } from '../utils/phoneValidation';
import PhoneVerification from '../models/PhoneVerification';
import EmailVerification from '../models/EmailVerification';
import { checkAndIncrementSendLimit, checkVerificationLock, handleVerifyResult } from '../services/otpLimiter';
import Attendance from '../models/Attendance';
import Leave from '../models/Leave';
import Notification from '../models/Notification';
/**
 * @description Registers a new user in the system.
 * @logic
 * - Extracts personal details and credentials from the payload.
 * - Performs a MongoDB lookup to ensure the email or mobile number isn't already taken (Conflict Prevention).
 * - Hashes the password (handled automatically via the Mongoose pre-save hook in `User.ts`).
 * - Uploads the profile picture to Cloudinary if provided.
 * - Generates a 6-digit OTP for email verification and sends it via Nodemailer.
 */
export async function register(req: Request, res: Response) {
  const { name, email, password, profilePicture, firstName, lastName, gender, qualification, mobileNumber, countryCode } = req.body as {
    name: string;
    email: string;
    password: string;
    profilePicture?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    qualification?: string;
    mobileNumber?: string;
    countryCode?: string;
  };

  try {
    // 1. Check if email is already registered
    const existingEmailUser = await User.findOne({ email: email.toLowerCase() });
    if (existingEmailUser) {
      if (existingEmailUser.isVerified) {
        return res.status(409).json({
          success: false,
          message: 'Email is already registered.',
          errors: [],
        });
      } else {
        // User exists but is NOT verified. Delete the unverified record so they can register again.
        await User.findByIdAndDelete(existingEmailUser._id);
      }
    }

    // 2. Check if mobile number is already registered by another verified user account
    if (mobileNumber) {
      const existingPhoneUser = await findUserByMobileNumber(mobileNumber, countryCode);
      if (existingPhoneUser) {
        return res.status(409).json({
          success: false,
          message: 'This mobile number is already registered by another account.',
          errors: [],
        });
      }
    }

    // Verify that the mobile number was verified inline (admins bypass this)
    let isCreatedByAdmin = false;
    let token = req.cookies?.token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        const userId = decoded.id as string;
        if (userId) {
          const reqUser = await User.findById(userId);
          if (reqUser && (reqUser.role === 'admin' || reqUser.role === 'superadmin' || reqUser.designation === 'Admin' || reqUser.designation === 'Project Manager')) {
            isCreatedByAdmin = true;
          }
        }
      } catch (err) {
        // ignore decoding errors, treat as standard user signup
      }
    }

    let verificationRecord = null;
    let emailVerificationRecord = null;
    if (!isCreatedByAdmin) {
      verificationRecord = await PhoneVerification.findOne({ mobileNumber, countryCode, verified: true });
      if (!verificationRecord) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number not verified. Please verify your mobile number first.',
          errors: [],
        });
      }

      emailVerificationRecord = await EmailVerification.findOne({ email: email.toLowerCase(), verified: true });
      if (!emailVerificationRecord) {
        return res.status(400).json({
          success: false,
          message: 'Email address not verified. Please verify your email first.',
          errors: [],
        });
      }
    }

    // Upload image to Cloudinary (falls back to placeholder if Cloudinary not config'd)
    const computedName = `${firstName || ''} ${lastName || ''}`.trim() || name;
    const profilePicUrl = await uploadToCloudinary(profilePicture || '', computedName);

    // Generate 6-Digit OTP Code
    const verificationOtpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOtpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes (lower from 10 min to 2 min)

    const role = email.toLowerCase().startsWith('superadmin') ? 'superadmin' : (email.toLowerCase().startsWith('admin') ? 'admin' : 'member');
    const designation = role === 'superadmin' ? 'CEO' : (role === 'admin' ? 'Admin' : 'Employee');

    // Rule: There can only be ONE Super Admin (CEO) in the entire system.
    if (role === 'superadmin') {
      const existingCEO = await User.findOne({ role: 'superadmin' });
      if (existingCEO && existingCEO.email !== email.toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: 'A Super Admin (CEO) already exists. There can only be one CEO in the system.',
          errors: []
        });
      }
    }

    const user = await User.create({
      name: computedName,
      firstName,
      lastName,
      gender,
      qualification,
      mobileNumber,
      countryCode,
      email: email.toLowerCase(),
      password,
      profilePicture: profilePicUrl,
      isVerified: !isCreatedByAdmin, // Self-registered users are verified via OTP inline, Admin-created must verify on first login
      role,
      designation,
      consentTimestamp: new Date(),
      termsVersion: '1.0.0',
      privacyPolicyVersion: '1.0.0',
    });

    if (isCreatedByAdmin) {
      // Trigger Admin Account Creation Email
      sendAdminAccountCreationEmail(user, password).catch((emailErr) => {
        console.error('authController.ts: Failed to send admin account creation email:', emailErr);
      });
    }

    if (verificationRecord) {
      await PhoneVerification.findByIdAndDelete(verificationRecord._id);
    }
    if (emailVerificationRecord) {
      await EmailVerification.findByIdAndDelete(emailVerificationRecord._id);
    }

    let authToken = null;
    let refreshTokenStr = null;

    if (!isCreatedByAdmin) {
      // Token Generation (JWT) to log the user in immediately
      authToken = signToken({ id: user._id, email: user.email });
      refreshTokenStr = signRefreshToken({ id: user._id, email: user.email });

      user.lastLogin = new Date();
      user.refreshTokens = [refreshTokenStr];
      await user.save({ validateBeforeSave: false });

      // HttpOnly Cookie Set Karna
      res.cookie('token', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', refreshTokenStr, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }

    return res.status(201).json({
      success: true,
      message: isCreatedByAdmin
        ? 'Employee registered successfully!'
        : 'Registration successful! Redirecting to dashboard...',
      data: {
        token: authToken,
        user: {
          id: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          mobileNumber: user.mobileNumber,
          countryCode: user.countryCode,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          coverPicture: user.coverPicture,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    console.error('authController.ts: Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.',
      errors: [],
    });
  }
}

// =========================================================================
// INTERVIEW GUIDE: login() Controller (The Brain)
// Yeh function actual logic run karta hai. 
// Pipeline: Request -> authRoutes.ts -> Validation Middleware -> Yahan (Controller)
// =========================================================================
export async function login(req: Request, res: Response) {
  // 1. Data Extractor: Frontend se aaye data ko nikalna
  const { email, password, mobileNumber, countryCode } = req.body as { email?: string; password: string; mobileNumber?: string; countryCode?: string };

  try {
    let user;
    // 2. Database Lookup: Email ya Mobile kisi ek cheez se user dhoondhna
    // Interview Note: Yahan `select('+password')` isliye likha hai kyunki Model me humne 
    // `select: false` kiya tha (Security). Toh verify karne ke liye explicitly bulana padta hai.
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    } else if (mobileNumber) {
      user = (await User.findOne({ mobileNumber, countryCode }).select('+password')) || (await User.findOne({ mobileNumber }).select('+password'));
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with these credentials.',
        errors: [],
      });
    }

    if (user.isArchived) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated by an administrator.',
        errors: [],
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked by an administrator.',
        errors: [],
      });
    }

    // Check email verification status
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your account is not verified yet. Please verify your account to continue.',
        requiresVerification: true,
        email: user.email,
        errors: [],
      });
    }

    // 3. Password Verification
    // Database me password encrypted (hash) hai aur user ne plain text bheja hai.
    // Hum 'comparePassword' method (jo User.ts me banaya tha) use karke match karte hain.
    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password.',
        errors: [],
      });
    }

    // 4. Token Generation (JWT)
    const token = signToken({ id: user._id, email: user.email });
    const refreshToken = signRefreshToken({ id: user._id, email: user.email });

    // 5. Update Record
    user.lastLogin = new Date();

    // Save refresh token to user
    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    user.refreshTokens.push(refreshToken);
    // Keep max 5 active sessions
    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift();
    }

    await user.save({ validateBeforeSave: false });

    // 6. HttpOnly Cookie Set Karna
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          mobileNumber: user.mobileNumber,
          countryCode: user.countryCode,
          email: user.email,
          role: user.role,
          designation: user.designation,
          profilePicture: user.profilePicture,
          coverPicture: user.coverPicture,
          qualification: user.qualification,
          country: user.country,
          permanentAddress: user.permanentAddress,
          currentAddress: user.currentAddress,
          alternateNumber: user.alternateNumber,
          state: user.state,
          district: user.district,
          documents: user.documents,
          termsAndConditions: user.termsAndConditions,
          // Sending verification status so the frontend shows the Verified badge.
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error('authController.ts: Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.',
      errors: [],
    });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  const { email, otp } = req.body as { email: string; otp: string };

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email and OTP code are required.',
    });
  }

  try {
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select('+verificationOtp +verificationOtpExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'Account is already verified.',
      });
    }

    // Decrypt the stored OTP and compare with what the user submitted
    let storedOtp: string;
    try {
      storedOtp = decrypt(user.verificationOtp!);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Verification code is invalid or corrupted. Please register again.',
      });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code.',
      });
    }

    if (user.verificationOtpExpires && user.verificationOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please register again or request a new OTP.',
      });
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error) {
    console.error('authController.ts: OTP Verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during verification. Please try again.',
    });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  const { email, mobileNumber, countryCode } = req.body as { email?: string; mobileNumber?: string; countryCode?: string };

  try {
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (mobileNumber) {
      const cleanMobile = mobileNumber.replace(/\D/g, ''); // Extract only digits
      const cleanPrefix = countryCode ? countryCode.replace(/[^\d+]/g, '') : '+91';
      const combined = `${cleanPrefix}${cleanMobile}`;
      
      user = await User.findOne({
        $or: [
          { mobileNumber: mobileNumber },
          { mobileNumber: combined },
          { mobileNumber: `+${cleanMobile}` },
          { mobileNumber: cleanMobile },
          // Ultimate fallback: Match last 10 digits
          { mobileNumber: new RegExp(cleanMobile.slice(-10) + '$') }
        ]
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with these credentials.',
        errors: [],
      });
    }

    if (user.isArchived) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated by an administrator.',
        errors: [],
      });
    }

    // Apply request rate limit
    const limitKey = email ? email.toLowerCase().trim() : (mobileNumber || '');
    const limitCheck = await checkAndIncrementSendLimit(limitKey);
    if (!limitCheck.allowed) {
      return res.status(429).json({ success: false, message: limitCheck.message });
    }

    // Generate 6-digit OTP code for password reset
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = encrypt(otpPlain); // stored encrypted
    user.resetPasswordOtpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
    await user.save();

    // Log OTP to terminal for development/testing
    console.log(`\n🔑 [FORGOT PASSWORD] Reset OTP for ${user.email}: ${otpPlain} (expires in 2 min)\n`);

    if (email) {
      // Send only to email
      sendResetPasswordOtp(user.email, user.name, otpPlain).catch((emailErr) => {
        console.error('authController.ts: Failed to send reset password OTP email:', emailErr);
      });
    } else if (mobileNumber && user.mobileNumber) {
      // Send only to mobile
      sendSmsOtp(user.countryCode || '', user.mobileNumber, otpPlain, 'Password Reset').catch((smsErr) => {
        console.error('authController.ts: Failed to send reset SMS:', smsErr);
      });
    }

    return res.status(200).json({
      success: true,
      message: mobileNumber ? 'Password reset OTP has been sent to your mobile number.' : 'Password reset OTP has been sent to your email.',
      data: {},
    });
  } catch (error) {
    console.error('authController.ts: forgotPassword error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.',
      errors: [],
    });
  }
}

export async function resetPassword(req: Request, res: Response) {
  const { email, mobileNumber, countryCode, otp, password } = req.body as {
    email?: string;
    mobileNumber?: string;
    countryCode?: string;
    otp: string;
    password?: string;
  };

  if ((!email && !mobileNumber) || !otp || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email/Phone, OTP code, and new password are required.',
      errors: [],
    });
  }

  try {
    let user;
    if (email) {
      user = await User.findOne({
        email: email.toLowerCase(),
      }).select('+resetPasswordOtp +resetPasswordOtpExpires');
    } else if (mobileNumber) {
      user = (await User.findOne({ mobileNumber, countryCode }).select('+resetPasswordOtp +resetPasswordOtpExpires')) || (await User.findOne({ mobileNumber }).select('+resetPasswordOtp +resetPasswordOtpExpires'));
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found.',
        errors: [],
      });
    }

    if (user.isArchived) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated.',
        errors: [],
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Account is blocked.',
        errors: [],
      });
    }

    if (!user.resetPasswordOtp) {
      return res.status(400).json({
        success: false,
        message: 'No reset code found. Please request a new one.',
        errors: [],
      });
    }

    // Decrypt the stored OTP and compare with what the user submitted
    let storedResetOtp: string;
    try {
      storedResetOtp = decrypt(user.resetPasswordOtp);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Reset code is invalid or corrupted. Please request a new one.',
        errors: [],
      });
    }

    if (storedResetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code.',
        errors: [],
      });
    }

    if (user.resetPasswordOtpExpires && user.resetPasswordOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new OTP.',
        errors: [],
      });
    }

    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.',
      data: {},
    });
  } catch (error) {
    console.error('authController.ts: resetPassword error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during password reset. Please try again.',
      errors: [],
    });
  }
}

export async function resendVerificationOtp(req: Request, res: Response) {
  const { email, mobileNumber } = req.body as { email?: string; mobileNumber?: string };

  if (!email && !mobileNumber) {
    return res.status(400).json({
      success: false,
      message: 'Email or Mobile Number is required.',
    });
  }

  try {
    const query = email ? { email: email.toLowerCase() } : { mobileNumber };
    const user = await User.findOne(query).select('+verificationOtp +verificationOtpExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified. You can log in.',
      });
    }

    // Rate limit: prevent resend if last OTP was generated less than 60 seconds ago
    if (user.verificationOtpExpires && user.verificationOtpExpires.getTime() > Date.now() + 1 * 60 * 1000) {
      const secondsLeft = Math.ceil((user.verificationOtpExpires.getTime() - (Date.now() + 1 * 60 * 1000)) / 1000);
      if (secondsLeft > 0) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${secondsLeft} seconds before requesting a new code.`,
        });
      }
    }

    // Generate new 6-digit OTP
    const verificationOtpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOtpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    user.verificationOtp = encrypt(verificationOtpPlain);
    user.verificationOtpExpires = verificationOtpExpires;
    await user.save();

    // Log OTP to terminal for development/testing
    console.log(`\n🔑 [RESEND VERIFY] Verification OTP for ${user.email}: ${verificationOtpPlain} (expires in 2 min)\n`);

    if (email) {
      // Send the new OTP via email (fire-and-forget)
      sendVerificationOtp(user.email, user.name, verificationOtpPlain).catch((emailErr) => {
        console.error('authController.ts: Failed to resend verification OTP email:', emailErr);
      });
    } else if (mobileNumber && user.mobileNumber) {
      // Send SMS (fire-and-forget)
      sendSmsOtp(user.countryCode || '', user.mobileNumber, verificationOtpPlain, 'Verification').catch((smsErr) => {
        console.error('authController.ts: Failed to resend verification SMS:', smsErr);
      });
    }

    return res.status(200).json({
      success: true,
      message: mobileNumber ? 'A new verification code has been sent to your mobile number.' : 'A new verification code has been sent to your email.',
    });
  } catch (error) {
    console.error('authController.ts: resendVerificationOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.',
    });
  }
}

export async function resendResetOtp(req: Request, res: Response) {
  const { email, mobileNumber, countryCode } = req.body as { email?: string; mobileNumber?: string; countryCode?: string };

  if (!email && !mobileNumber) {
    return res.status(400).json({
      success: false,
      message: 'Email or Mobile Number is required.',
    });
  }

  try {
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+resetPasswordOtp +resetPasswordOtpExpires');
    } else if (mobileNumber) {
      user = (await User.findOne({ mobileNumber, countryCode }).select('+resetPasswordOtp +resetPasswordOtpExpires')) || (await User.findOne({ mobileNumber }).select('+resetPasswordOtp +resetPasswordOtpExpires'));
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with these credentials.',
      });
    }

    // Rate limit: prevent resend if last OTP was generated less than 60 seconds ago
    if (user.resetPasswordOtpExpires && user.resetPasswordOtpExpires.getTime() > Date.now() + 1 * 60 * 1000) {
      const secondsLeft = Math.ceil((user.resetPasswordOtpExpires.getTime() - (Date.now() + 1 * 60 * 1000)) / 1000);
      if (secondsLeft > 0) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${secondsLeft} seconds before requesting a new code.`,
        });
      }
    }

    // Generate new 6-digit OTP
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = encrypt(otpPlain);
    user.resetPasswordOtpExpires = new Date(Date.now() + 2 * 60 * 1000);
    await user.save();

    // Log OTP to terminal for development/testing
    console.log(`\n🔑 [RESEND RESET] Reset OTP for ${user.email}: ${otpPlain} (expires in 2 min)\n`);

    if (email) {
      // Send only to email
      sendResetPasswordOtp(user.email, user.name, otpPlain).catch((emailErr) => {
        console.error('authController.ts: Failed to resend reset OTP email:', emailErr);
      });
    } else if (mobileNumber && user.mobileNumber) {
      // Send only to mobile
      sendSmsOtp(user.countryCode || '', user.mobileNumber, otpPlain, 'Password Reset').catch((smsErr) => {
        console.error('authController.ts: Failed to resend reset SMS:', smsErr);
      });
    }

    return res.status(200).json({
      success: true,
      message: mobileNumber ? 'A new password reset code has been sent to your mobile number.' : 'A new password reset code has been sent to your email.',
    });
  } catch (error) {
    console.error('authController.ts: resendResetOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.',
    });
  }
}

export async function requestLoginOtp(req: Request, res: Response) {
  const { email, mobileNumber, countryCode } = req.body as { email?: string; mobileNumber?: string; countryCode?: string };

  if (!email && !mobileNumber) {
    return res.status(400).json({ success: false, message: 'Email or Mobile Number is required.' });
  }

  try {
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (mobileNumber) {
      user = (await User.findOne({ mobileNumber, countryCode })) || (await User.findOne({ mobileNumber }));
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with these credentials.' });
    }

    if (user.isArchived) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated by an administrator.' });
    }
    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: 'Your account is not verified yet. Please verify your account first.' });
    }

    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    user.loginOtp = encrypt(otpPlain);
    user.loginOtpExpires = otpExpires;
    await user.save();

    console.log(`\n🔑 [LOGIN OTP] OTP for ${user.email || user.mobileNumber}: ${otpPlain} (expires in 2 min)\n`);

    if (email) {
      sendVerificationOtp(user.email, user.name, otpPlain).catch((err) => {
        console.error('authController.ts: Failed to send login OTP email:', err);
      });
    } else if (mobileNumber && user.mobileNumber) {
      // Send SMS (fire-and-forget)
      sendSmsOtp(user.countryCode || '', user.mobileNumber, otpPlain, 'Login').catch((smsErr) => {
        console.error('authController.ts: Failed to send login SMS:', smsErr);
      });
    }

    return res.status(200).json({
      success: true,
      message: mobileNumber ? 'A login code has been sent to your mobile number.' : 'A login code has been sent to your email.',
    });
  } catch (error) {
    console.error('authController.ts: requestLoginOtp error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
}

export async function loginWithOtp(req: Request, res: Response) {
  const { email, mobileNumber, countryCode, otp } = req.body as { email?: string; mobileNumber?: string; countryCode?: string; otp: string };

  if ((!email && !mobileNumber) || !otp) {
    return res.status(400).json({ success: false, message: 'Credentials and OTP code are required.' });
  }

  try {
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+loginOtp +loginOtpExpires');
    } else if (mobileNumber) {
      user = (await User.findOne({ mobileNumber, countryCode }).select('+loginOtp +loginOtpExpires')) || (await User.findOne({ mobileNumber }).select('+loginOtp +loginOtpExpires'));
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with these credentials.' });
    }
    if (!user.loginOtp) {
      return res.status(400).json({ success: false, message: 'No login code found. Please request a new one.' });
    }

    let storedOtp: string;
    try {
      storedOtp = decrypt(user.loginOtp);
    } catch {
      return res.status(400).json({ success: false, message: 'Login code is invalid or corrupted. Please request a new one.' });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid login code.' });
    }
    if (user.loginOtpExpires && user.loginOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'Login code has expired. Please request a new one.' });
    }

    // Clear OTP after successful verification
    user.loginOtp = undefined;
    user.loginOtpExpires = undefined;
    await user.save();

    const token = signToken({ id: user._id, email: user.email });
    const refreshToken = signRefreshToken({ id: user._id, email: user.email });

    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift();
    }
    await user.save({ validateBeforeSave: false });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          mobileNumber: user.mobileNumber,
          countryCode: user.countryCode,
          email: user.email,
          role: user.role,
          profilePicture: user.profilePicture,
          coverPicture: user.coverPicture,
          qualification: user.qualification,
          country: user.country,
          permanentAddress: user.permanentAddress,
          currentAddress: user.currentAddress,
          alternateNumber: user.alternateNumber,
          state: user.state,
          district: user.district,
          documents: user.documents,
          termsAndConditions: user.termsAndConditions,
          // Sending verification status so the frontend shows the Verified badge.
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error('authController.ts: loginWithOtp error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
  }
}

export async function profile(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
      errors: [],
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        mobileNumber: user.mobileNumber,
        countryCode: user.countryCode,
        email: user.email,
        role: user.role,
        designation: user.designation || 'Employee',
        profilePicture: user.profilePicture,
        coverPicture: user.coverPicture,
        qualification: user.qualification,
        country: user.country,
        permanentAddress: user.permanentAddress,
        currentAddress: user.currentAddress,
        alternateNumber: user.alternateNumber,
        state: user.state,
        district: user.district,
        documents: user.documents,
        termsAndConditions: user.termsAndConditions,
        // Sending verification status so the frontend shows the Verified badge.
        isVerified: user.isVerified,
      },
    },
  });
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await User.find({ isArchived: { $ne: true } }, 'name email role designation profilePicture isVerified firstName lastName mobileNumber isBlocked');
    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: { users },
    });
  } catch (error) {
    console.error('authController.ts: Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
    });
  }
}

export async function logout(req: Request, res: Response) {
  // If user is authenticated, remove this specific refresh token from DB
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken) as { id: string };
      await User.findByIdAndUpdate(decoded.id, {
        $pull: { refreshTokens: refreshToken }
      });
    } catch (err) {
      // Token is invalid or expired, ignore DB update
    }
  }

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
}

export async function updateUser(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  const { role, designation, name, profilePicture, coverPicture, firstName, lastName, gender, mobileNumber, countryCode, qualification, country, permanentAddress, currentAddress, alternateNumber, state, district, documents, termsAndConditions, biography } = req.body as {
    role?: string;
    designation?: string;
    name?: string;
    profilePicture?: string;
    coverPicture?: string;
    firstName?: string;
    lastName?: string;
    gender?: string;
    mobileNumber?: string;
    countryCode?: string;
    qualification?: string;
    country?: string;
    permanentAddress?: string;
    currentAddress?: string;
    alternateNumber?: string;
    state?: string;
    district?: string;
    documents?: string[];
    termsAndConditions?: boolean;
    biography?: string;
  };
  const { id } = req.params;

  try {
    const isAdmin = authReq.user?.role === 'admin' || authReq.user?.designation === 'Admin' || authReq.user?.designation === 'Project Manager';
    const isSuperAdmin = authReq.user?.role === 'superadmin' || authReq.user?.designation === 'CEO';
    const isSelf = authReq.user?._id.toString() === id;

    if (!isAdmin && !isSuperAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to update this profile.',
        errors: [],
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        errors: [],
      });
    }

    // Role updates are reserved for SUPER ADMINS only
    if (role !== undefined) {
      if (!isSuperAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. Only Super Administrators can update user roles.',
          errors: [],
        });
      }
      // Frontend may still send 'employee' or 'user' for role, map it to 'member'
      const sanitizedRole = (role === 'employee' || role === 'user') ? 'member' : role;
      user.role = sanitizedRole as 'member' | 'admin' | 'superadmin';
    }

    if (designation !== undefined) {
      if (!isAdmin && !isSuperAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. Only administrators can update user designations.',
          errors: [],
        });
      }
      user.designation = designation;
    }

    if (firstName !== undefined) {
      user.firstName = firstName;
    }

    if (biography !== undefined) {
      user.biography = biography;
    }

    if (lastName !== undefined) {
      if (lastName.startsWith(' ')) {
        return res.status(400).json({
          success: false,
          message: 'Last name cannot start with a space.',
          errors: [],
        });
      }
      if (/\d/.test(lastName)) {
        return res.status(400).json({
          success: false,
          message: 'Last name cannot contain numbers.',
          errors: [],
        });
      }
      const nameRegex = /^[a-zA-Z][a-zA-Z.'\- ]*$/;
      if (!nameRegex.test(lastName)) {
        return res.status(400).json({
          success: false,
          message: 'Last name must start with a letter and contain only letters, spaces, dots, quotes, and hyphens.',
          errors: [],
        });
      }
      user.lastName = lastName;
    }

    if (gender !== undefined) {
      user.gender = gender;
    }

    if (mobileNumber !== undefined) {
      const sanitized = sanitizePhoneNumber(mobileNumber);
      if (sanitized) {
        const validation = validatePhoneNumber(sanitized);
        if (!validation.isValid) {
          return res.status(400).json({ success: false, message: `Mobile Number: ${validation.error}`, errors: [] });
        }
        const existingPhoneUser = await findUserByMobileNumber(sanitized, countryCode || user.countryCode, user._id.toString());
        if (existingPhoneUser) {
          return res.status(409).json({
            success: false,
            message: 'This mobile number is already in use by another account.',
            errors: [],
          });
        }
      }
      user.mobileNumber = sanitized;
    }

    if (countryCode !== undefined) {
      user.countryCode = countryCode;
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (qualification !== undefined) {
      user.qualification = qualification;
    }

    if (country !== undefined) {
      user.country = country;
    }

    if (permanentAddress !== undefined) {
      user.permanentAddress = permanentAddress;
    }

    if (currentAddress !== undefined) {
      user.currentAddress = currentAddress;
    }

    if (alternateNumber !== undefined) {
      const sanitizedAlt = sanitizePhoneNumber(alternateNumber);
      if (sanitizedAlt) {
        const validationAlt = validatePhoneNumber(sanitizedAlt);
        if (!validationAlt.isValid) {
          return res.status(400).json({ success: false, message: `Alternate Number: ${validationAlt.error}`, errors: [] });
        }
      }
      user.alternateNumber = sanitizedAlt;
    }

    if (state !== undefined) {
      user.state = state;
    }

    if (district !== undefined) {
      user.district = district;
    }

    if (documents !== undefined) {
      const resolvedDocuments = await Promise.all(documents.map(async (doc) => {
        if (doc.startsWith('data:')) {
          return await uploadDocumentToCloudinary(doc);
        }
        return doc;
      }));
      user.documents = resolvedDocuments.filter(Boolean);
    }

    if (termsAndConditions !== undefined) {
      user.termsAndConditions = termsAndConditions;
    }

    if (profilePicture !== undefined) {
      if (profilePicture.startsWith('data:image')) {
        const computedName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name;
        user.profilePicture = await uploadToCloudinary(profilePicture, computedName);
      } else {
        user.profilePicture = profilePicture;
      }
    }

    if (coverPicture !== undefined) {
      if (coverPicture.startsWith('data:image')) {
        const computedName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name;
        user.coverPicture = await uploadToCloudinary(coverPicture, `${computedName}_cover`);
      } else {
        user.coverPicture = coverPicture;
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          mobileNumber: user.mobileNumber,
          countryCode: user.countryCode,
          email: user.email,
          role: user.role,
          designation: user.designation || 'Employee',
          profilePicture: user.profilePicture,
          coverPicture: user.coverPicture,
          qualification: user.qualification,
          country: user.country,
          permanentAddress: user.permanentAddress,
          currentAddress: user.currentAddress,
          alternateNumber: user.alternateNumber,
          state: user.state,
          district: user.district,
          documents: user.documents,
          termsAndConditions: user.termsAndConditions,
          biography: user.biography,
          // Sending verification status so the frontend shows the Verified badge.
          isVerified: user.isVerified,
        }
      },
    });
  } catch (error) {
    console.error('authController.ts: updateUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating user.',
      errors: [],
    });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  try {
    const isSuperAdmin = authReq.user?.role === 'superadmin';
    const isAdmin = authReq.user?.role === 'admin' || isSuperAdmin;
    const isSelf = authReq.user?._id.toString() === id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only Administrators can perform this action.',
        errors: [],
      });
    }

    if (isSuperAdmin && isSelf) {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own admin account.',
        errors: [],
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        errors: [],
      });
    }

    const targetIsAdmin = targetUser.role === 'admin' || targetUser.role === 'superadmin';
    if (authReq.user?.role === 'admin' && targetIsAdmin && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Sub-admins cannot remove other administrators.',
        errors: [],
      });
    }

    targetUser.isArchived = true;
    await targetUser.save({ validateBeforeSave: false });
    const user = targetUser;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        errors: [],
      });
    }

    sendAccountDeactivationEmail(user.email, user.name).catch((err) => {
      console.error('Failed to send deactivation email to', user.email, err);
    });

    return res.status(200).json({
      success: true,
      message: 'User removed successfully.',
      data: {},
    });
  } catch (error) {
    console.error('authController.ts: deleteUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while removing the user.',
      errors: [],
    });
  }
}

export async function blockUser(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  try {
    const isSuperAdmin = authReq.user?.role === 'superadmin';
    const isAdmin = authReq.user?.role === 'admin' || isSuperAdmin;
    const isSelf = authReq.user?._id.toString() === id;

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only Administrators can block users.',
        errors: [],
      });
    }

    if (isSelf) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block your own account.',
        errors: [],
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.', errors: [] });
    }

    const targetIsAdmin = targetUser.role === 'admin' || targetUser.role === 'superadmin';
    if (authReq.user?.role === 'admin' && targetIsAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Sub-admins cannot block administrators.',
        errors: [],
      });
    }

    targetUser.isBlocked = true;
    await targetUser.save({ validateBeforeSave: false });

    sendAccountBlockedEmail(targetUser.email, targetUser.name).catch((err) => {
      console.error('Failed to send blocked email to', targetUser.email, err);
    });

    return res.status(200).json({
      success: true,
      message: 'User blocked successfully.',
      data: {},
    });
  } catch (error) {
    console.error('authController.ts: blockUser error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while blocking the user.', errors: [] });
  }
}

export async function unblockUser(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  try {
    const isSuperAdmin = authReq.user?.role === 'superadmin';
    const isAdmin = authReq.user?.role === 'admin' || isSuperAdmin;

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only Administrators can unblock users.',
        errors: [],
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.', errors: [] });
    }

    const targetIsAdmin = targetUser.role === 'admin' || targetUser.role === 'superadmin';
    if (authReq.user?.role === 'admin' && targetIsAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Sub-admins cannot unblock administrators.',
        errors: [],
      });
    }

    targetUser.isBlocked = false;
    await targetUser.save({ validateBeforeSave: false });

    sendAccountUnblockedEmail(targetUser.email, targetUser.name).catch((err) => {
      console.error('Failed to send unblocked email to', targetUser.email, err);
    });

    return res.status(200).json({
      success: true,
      message: 'User unblocked successfully.',
      data: {},
    });
  } catch (error) {
    console.error('authController.ts: unblockUser error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while unblocking the user.', errors: [] });
  }
}

export async function getArchivedUsers(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== 'admin' && authReq.user?.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    const users = await User.find({ isArchived: true }, 'name email role designation profilePicture isVerified firstName lastName mobileNumber');
    return res.status(200).json({
      success: true,
      message: 'Archived users retrieved successfully.',
      data: { users },
    });
  } catch (error) {
    console.error('authController.ts: getArchivedUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching archived users.',
      errors: [],
    });
  }
}

export async function restoreUser(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== 'admin' && authReq.user?.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { id } = req.params;

  try {
    const user = await User.findByIdAndUpdate(id, { isArchived: false }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in archive.' });
    }

    sendAccountReactivationEmail(user.email, user.name).catch((err) => {
      console.error('Failed to send reactivation email to', user.email, err);
    });

    return res.status(200).json({
      success: true,
      message: 'User restored successfully.',
      data: {},
    });
  } catch (error) {
    console.error('authController.ts: restoreUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while restoring the user.',
      errors: [],
    });
  }
}

export async function verifyResetOtp(req: Request, res: Response) {
  const { email, otp } = req.body as { email: string; otp: string };
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Email and OTP code are required.',
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check verification lockout
    const lockCheck = await checkVerificationLock(normalizedEmail);
    if (!lockCheck.allowed) {
      return res.status(429).json({ success: false, message: lockCheck.message });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+resetPasswordOtp +resetPasswordOtpExpires');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (!user.resetPasswordOtp) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new one.',
      });
    }

    let storedOtp = decrypt(user.resetPasswordOtp);
    if (storedOtp !== otp) {
      const verifyResult = await handleVerifyResult(normalizedEmail, false);
      return res.status(400).json({
        success: false,
        message: verifyResult.message || 'Invalid verification code.',
      });
    }

    if (user.resetPasswordOtpExpires && user.resetPasswordOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    // Reset rate limit on success
    await handleVerifyResult(normalizedEmail, true);

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
    });
  } catch (error) {
    console.error('authController.ts: verifyResetOtp error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during verification.',
    });
  }
}

export async function permanentDeleteUser(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  if (authReq.user?.role !== 'admin' && authReq.user?.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Forbidden. Only Super Administrators can permanently delete users.' });
  }

  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    sendAccountPermanentDeletionEmail(user.email, user.name).catch((err) => {
      console.error('Failed to send permanent deletion email to', user.email, err);
    });

    return res.status(200).json({
      success: true,
      message: 'User permanently deleted.',
      data: {},
    });
  } catch (error) {
    console.error('authController.ts: permanentDeleteUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the user.',
    });
  }
}

export async function refreshToken(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token not found. Please log in again.'
    });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken) as { id: string };

    // Check if user exists and token is in their active sessions
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user || !user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }

    // Generate new access token
    const newAccessToken = signToken({ id: user._id, email: user.email });

    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: { token: newAccessToken }
    });

  } catch (error) {
    console.error('authController.ts: Refresh token error:', error);
    // If token verification fails (e.g., expired), we clear the cookies
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    return res.status(401).json({
      success: false,
      message: 'Refresh token expired or invalid.'
    });
  }
}

export async function requestPhoneChangeOtp(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  const userId = authReq.user?._id;

  const { mobileNumber, countryCode } = req.body as { mobileNumber: string; countryCode: string };

  if (!mobileNumber) {
    return res.status(400).json({ success: false, message: 'New mobile number is required.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if another user already has this number
    const existing = await findUserByMobileNumber(mobileNumber, countryCode, userId ? userId.toString() : undefined);
    if (existing) {
      return res.status(409).json({ success: false, message: 'This mobile number is already in use by another account.' });
    }

    // Apply request rate limit
    const limitCheck = await checkAndIncrementSendLimit(mobileNumber);
    if (!limitCheck.allowed) {
      return res.status(429).json({ success: false, message: limitCheck.message });
    }

    // Generate 6-digit OTP
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    user.phoneChangeOtp = encrypt(otpPlain);
    user.phoneChangeOtpExpires = otpExpires;
    user.pendingMobileNumber = mobileNumber;
    user.pendingCountryCode = countryCode || '+91';

    await user.save();

    console.log(`\n🔑 [PHONE CHANGE OTP] OTP for ${user.email}: ${otpPlain} (expires in 2 min)\n`);

    // Send OTP to email because SMS might fail without credits in local testing
    sendPhoneChangeOtp(user.email, user.name, otpPlain).catch((err) => {
      console.error('authController.ts: Failed to send email for phone change:', err);
    });

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email address.',
    });
  } catch (error) {
    console.error('authController.ts: requestPhoneChangeOtp error:', error);
    return res.status(500).json({ success: false, message: 'Failed to request OTP.' });
  }
}

export async function verifyPhoneChangeOtp(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  const userId = authReq.user?._id;

  const { otp } = req.body as { otp: string };

  if (!otp) {
    return res.status(400).json({ success: false, message: 'OTP is required.' });
  }

  try {
    const user = await User.findById(userId).select('+phoneChangeOtp +phoneChangeOtpExpires +pendingMobileNumber');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.phoneChangeOtp) {
      return res.status(400).json({ success: false, message: 'No pending phone number change found.' });
    }

    const pendingKey = user.pendingMobileNumber || '';

    // Check verification lockout
    const lockCheck = await checkVerificationLock(pendingKey);
    if (!lockCheck.allowed) {
      return res.status(429).json({ success: false, message: lockCheck.message });
    }

    let storedOtp: string;
    try {
      storedOtp = decrypt(user.phoneChangeOtp);
    } catch {
      return res.status(400).json({ success: false, message: 'OTP is invalid or corrupted.' });
    }

    if (storedOtp !== otp) {
      const verifyResult = await handleVerifyResult(pendingKey, false);
      return res.status(400).json({ success: false, message: verifyResult.message || 'Invalid OTP code.' });
    }

    if (user.phoneChangeOtpExpires && user.phoneChangeOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Reset rate limit on success
    await handleVerifyResult(pendingKey, true);

    // Double check before applying changes that mobile number wasn't claimed by another user in the interim
    const existingClaim = await findUserByMobileNumber(user.pendingMobileNumber!, user.pendingCountryCode, user._id.toString());
    if (existingClaim) {
      return res.status(409).json({ success: false, message: 'This mobile number is already in use by another account.' });
    }

    // Apply the changes
    user.mobileNumber = user.pendingMobileNumber!;
    user.countryCode = user.pendingCountryCode || '+91';

    // Clear pending
    user.pendingMobileNumber = undefined;
    user.pendingCountryCode = undefined;
    user.phoneChangeOtp = undefined;
    user.phoneChangeOtpExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Phone number updated successfully.',
      data: {
        mobileNumber: user.mobileNumber,
        countryCode: user.countryCode,
      }
    });
  } catch (error) {
    console.error('authController.ts: verifyPhoneChangeOtp error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
  }
}

export async function requestRegistrationOtp(req: Request, res: Response) {
  const { mobileNumber, countryCode } = req.body as { mobileNumber: string; countryCode: string };

  if (!mobileNumber || !countryCode) {
    return res.status(400).json({ success: false, message: 'Mobile number and country code are required.' });
  }

  try {
    // Check if the mobile number is already taken by a registered user
    const existingUser = await findUserByMobileNumber(mobileNumber, countryCode);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'This mobile number is already registered by another account.' });
    }

    // Apply request rate limit
    const limitCheck = await checkAndIncrementSendLimit(mobileNumber);
    if (!limitCheck.allowed) {
      return res.status(429).json({ success: false, message: limitCheck.message });
    }

    // Generate 6-digit OTP
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Upsert the PhoneVerification record
    await PhoneVerification.findOneAndUpdate(
      { mobileNumber, countryCode },
      {
        otp: encrypt(otpPlain),
        expiresAt,
        verified: false,
      },
      { upsert: true, new: true }
    );

    console.log(`\n🔑 [REGISTRATION OTP] OTP for ${mobileNumber}: ${otpPlain} (expires in 2 min)\n`);

    // Send SMS (fire-and-forget)
    sendSmsOtp(countryCode, mobileNumber, otpPlain, 'Registration').catch((smsErr) => {
      console.error('authController.ts: Failed to send registration SMS:', smsErr);
    });

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your mobile number.',
    });
  } catch (error) {
    console.error('authController.ts: requestRegistrationOtp error:', error);
    return res.status(500).json({ success: false, message: 'Failed to request OTP.' });
  }
}

export async function verifyRegistrationOtp(req: Request, res: Response) {
  const { mobileNumber, countryCode, otp } = req.body as { mobileNumber: string; countryCode: string; otp: string };

  if (!mobileNumber || !countryCode || !otp) {
    return res.status(400).json({ success: false, message: 'Mobile number, country code, and OTP are required.' });
  }

  try {
    // Check verification lockout
    const lockCheck = await checkVerificationLock(mobileNumber);
    if (!lockCheck.allowed) {
      return res.status(429).json({ success: false, message: lockCheck.message });
    }

    const record = await PhoneVerification.findOne({ mobileNumber, countryCode }).select('+otp');
    if (!record) {
      return res.status(404).json({ success: false, message: 'No pending verification found for this number.' });
    }

    let storedOtp: string;
    try {
      storedOtp = decrypt(record.otp);
    } catch {
      return res.status(400).json({ success: false, message: 'OTP is invalid or corrupted.' });
    }

    if (storedOtp !== otp) {
      const verifyResult = await handleVerifyResult(mobileNumber, false);
      return res.status(400).json({ success: false, message: verifyResult.message || 'Invalid OTP code.' });
    }

    if (record.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Reset rate limit on success
    await handleVerifyResult(mobileNumber, true);

    // Mark as verified
    record.verified = true;
    record.otp = 'VERIFIED'; // Clear OTP with placeholder to pass validation
    // Give them 15 minutes to complete registration
    record.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await record.save();

    return res.status(200).json({
      success: true,
      message: 'Mobile number verified successfully.',
    });
  } catch (error) {
    console.error('authController.ts: verifyRegistrationOtp error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
  }
}

export async function requestRegistrationEmailOtp(req: Request, res: Response) {
  const { email } = req.body as { email: string };

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check if the email is already taken by a registered user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({ success: false, message: 'This email is already registered.' });
    }

    // Apply request rate limit
    const limitCheck = await checkAndIncrementSendLimit(normalizedEmail);
    if (!limitCheck.allowed) {
      return res.status(429).json({ success: false, message: limitCheck.message });
    }

    // Generate 6-digit OTP
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Upsert the EmailVerification record
    await EmailVerification.findOneAndUpdate(
      { email: normalizedEmail },
      {
        otp: encrypt(otpPlain),
        expiresAt,
        verified: false,
      },
      { upsert: true, new: true }
    );

    console.log(`\n🔑 [REGISTRATION EMAIL OTP] OTP for ${normalizedEmail}: ${otpPlain} (expires in 2 min)\n`);

    // Send Email (fire-and-forget)
    sendVerificationOtp(normalizedEmail, 'User', otpPlain).catch((emailErr) => {
      console.error('authController.ts: Failed to send registration email OTP:', emailErr);
    });

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email address.',
    });
  } catch (error) {
    console.error('authController.ts: requestRegistrationEmailOtp error:', error);
    return res.status(500).json({ success: false, message: 'Failed to request OTP.' });
  }
}

export async function verifyRegistrationEmailOtp(req: Request, res: Response) {
  const { email, otp } = req.body as { email: string; otp: string };

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check verification lockout
    const lockCheck = await checkVerificationLock(normalizedEmail);
    if (!lockCheck.allowed) {
      return res.status(429).json({ success: false, message: lockCheck.message });
    }

    const record = await EmailVerification.findOne({ email: normalizedEmail }).select('+otp');
    if (!record) {
      return res.status(404).json({ success: false, message: 'No pending verification found for this email.' });
    }

    let storedOtp: string;
    try {
      storedOtp = decrypt(record.otp);
    } catch {
      return res.status(400).json({ success: false, message: 'OTP is invalid or corrupted.' });
    }

    if (storedOtp !== otp) {
      const verifyResult = await handleVerifyResult(normalizedEmail, false);
      return res.status(400).json({ success: false, message: verifyResult.message || 'Invalid OTP code.' });
    }

    if (record.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Reset rate limit on success
    await handleVerifyResult(normalizedEmail, true);

    // Mark as verified
    record.verified = true;
    record.otp = 'VERIFIED'; // Clear OTP with placeholder to pass validation
    // Give them 15 minutes to complete registration
    record.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await record.save();

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
    });
  } catch (error) {
    console.error('authController.ts: verifyRegistrationEmailOtp error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
  }
}


export async function requestEmailChangeOtp(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  const userId = authReq.user?._id;

  const { email } = req.body as { email: string };

  if (!email) {
    return res.status(400).json({ success: false, message: 'New email address is required.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if another user already has this email
    const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This email is already in use by another account.' });
    }

    // Apply request rate limit
    const limitCheck = await checkAndIncrementSendLimit(email.toLowerCase().trim());
    if (!limitCheck.allowed) {
      return res.status(429).json({ success: false, message: limitCheck.message });
    }

    // Generate 6-digit OTP
    const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    user.emailChangeOtp = encrypt(otpPlain);
    user.emailChangeOtpExpires = otpExpires;
    user.pendingEmail = email.toLowerCase();

    await user.save();

    console.log(`\n🔑 [EMAIL CHANGE OTP] OTP for ${user.mobileNumber}: ${otpPlain} (expires in 2 min)\n`);

    // Send OTP to user's existing mobile number via SMS
    // Note: user.mobileNumber already contains the country code in the database (e.g. +917309715478)
    sendSmsOtp('', user.mobileNumber || '', otpPlain, 'Email Change Verification').catch((smsErr) => {
      console.error('authController.ts: Failed to send SMS for email change:', smsErr);
    });

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your mobile number.',
    });
  } catch (error) {
    console.error('authController.ts: requestEmailChangeOtp error:', error);
    return res.status(500).json({ success: false, message: 'Failed to request OTP.' });
  }
}

export async function verifyEmailChangeOtp(req: Request, res: Response) {
  const authReq = req as AuthRequest;
  const userId = authReq.user?._id;
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ success: false, message: 'OTP is required.' });
  }

  try {
    const user = await User.findById(userId).select('+emailChangeOtp +emailChangeOtpExpires +pendingEmail');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.emailChangeOtp || !user.emailChangeOtpExpires || user.emailChangeOtpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP is expired or invalid.' });
    }

    const pendingKey = user.pendingEmail || '';

    // Check verification lockout
    const lockCheck = await checkVerificationLock(pendingKey);
    if (!lockCheck.allowed) {
      return res.status(429).json({ success: false, message: lockCheck.message });
    }

    const decryptedOtp = decrypt(user.emailChangeOtp);
    if (decryptedOtp !== otp) {
      const verifyResult = await handleVerifyResult(pendingKey, false);
      return res.status(400).json({ success: false, message: verifyResult.message || 'Invalid OTP.' });
    }

    // Reset rate limit on success
    await handleVerifyResult(pendingKey, true);

    // Update email
    if (user.pendingEmail) {
      user.email = user.pendingEmail;
    }

    user.emailChangeOtp = undefined;
    user.emailChangeOtpExpires = undefined;
    user.pendingEmail = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Email updated successfully!',
    });
  } catch (error) {
    console.error('authController.ts: verifyEmailChangeOtp error:', error);
    return res.status(500).json({ success: false, message: 'An error occurred during verification.' });
  }
}

export async function getCsrfToken(req: Request, res: Response) {
  const { setCsrfCookie } = require('../middleware/csrfMiddleware');
  const token = setCsrfCookie(res);
  return res.status(200).json({ success: true, csrfToken: token });
}

/**
 * @description DPDP Act 2023 Compliance: Permanent PII Purge (Right to Erasure).
 */
export async function purgeAccountData(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?._id;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect password provided for erasure confirmation.' });
      }
    }

    // Perform hard deletion of User PII
    await User.findByIdAndDelete(userId);

    // Delete associated non-essential historical records
    await Promise.all([
      Attendance.deleteMany({ employeeId: userId }),
      Leave.deleteMany({ employeeId: userId }),
      Notification.deleteMany({ recipientId: userId }),
    ]);

    // Clear session cookies
    res.clearCookie('token');
    res.clearCookie('_csrf_token');

    return res.status(200).json({
      success: true,
      message: 'Account and personal data permanently purged in compliance with DPDP Act 2023.',
    });
  } catch (error) {
    console.error('authController.ts: purgeAccountData error:', error);
    return res.status(500).json({ success: false, message: 'Failed to purge account data.' });
  }
}
