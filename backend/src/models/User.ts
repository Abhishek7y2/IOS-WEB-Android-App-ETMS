// =========================================================================
// INTERVIEW GUIDE: User.ts (Database Schema / Model)
// Yeh file hamari MongoDB database ka "Blueprint" (Naksha) hai. 
// Mongoose library ka use karke hum batate hain ki User ka data kaisa dikhega.
// =========================================================================

import bcrypt from 'bcrypt'; // Password ko secure (hash) karne ke liye.
import { Schema, model, Document } from 'mongoose';


// 1. TypeScript Interface (IUser):
// Yeh TypeScript ko batata hai ki ek User object me kya-kya fields honge. 
// Interviewer: "Aapne Interface aur Schema dono kyun banaye?"
// Aapka Jawab: "Interface TypeScript ke liye hai taaki coding karte waqt auto-complete aur type-checking mil sake, jabki Schema Mongoose ke liye hai taaki wo actual database me data format enforce kar sake."
export interface IUser extends Document {
  name: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  qualification?: string;
  mobileNumber?: string;
  countryCode?: string;
  email: string;
  password: string;
  role: 'member' | 'admin' | 'superadmin';
  profilePicture?: string;
  coverPicture?: string;
  isVerified: boolean;
  verificationOtp?: string;
  verificationOtpExpires?: Date;
  resetPasswordOtp?: string;
  resetPasswordOtpExpires?: Date;
  loginOtp?: string;
  loginOtpExpires?: Date;
  phoneChangeOtp?: string;
  phoneChangeOtpExpires?: Date;
  pendingMobileNumber?: string;
  pendingCountryCode?: string;
  emailChangeOtp?: string;
  emailChangeOtpExpires?: Date;
  pendingEmail?: string;
  consentTimestamp?: Date;
  termsVersion?: string;
  privacyPolicyVersion?: string;
  designation?: string;
  department?: string;
  permanentAddress?: string;
  currentAddress?: string;
  country?: string;
  alternateNumber?: string;
  state?: string;
  district?: string;
  biography?: string;
  documents?: string[];
  termsAndConditions?: boolean;
  lastLogin?: Date;
  notificationPreferences?: {
    email: boolean;
    inApp: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  isBlocked: boolean;
  refreshTokens?: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * @description The User Model defines the core authentication and identity schema for all members and admins.
 * @logic
 * - Enforces strong password constraints (min 8 chars) and automatically hashes passwords before saving via the `pre('save')` hook.
 * - Stores sensitive data (like `password`, `loginOtp`, `verificationOtp`) with `select: false` to ensure they are NEVER accidentally returned in an API payload.
 * - Uses specific indexes (`email`, `mobileNumber`) to ensure extremely fast O(1) or O(log n) lookups during Login.
 */
const userSchema = new Schema<IUser>(
  {
    // User ka mukammal naam (First Name + Last Name)
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      trim: true,
      default: '',
    },
    qualification: {
      type: String,
      trim: true,
      default: '',
    },
    biography: {
      type: String,
      trim: true,
      default: '',
    },
    // Employee ka unique mobile number
    mobileNumber: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    countryCode: {
      type: String,
      trim: true,
      default: '',
    },
    // Email ID jo login ke kaam aayegi, ye hamesha unique hogi aur lowercase me save hogi
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    // User ka password, select: false ka matlab hai ki API response me ye field automatically nahi jayegi
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    // User ka role, by default har naya user 'member' (employee) banega
    role: {
      type: String,
      enum: ['member', 'admin', 'superadmin'],
      default: 'member',
    },
    designation: {
      type: String,
      default: 'Employee',
    },
    department: {
      type: String,
      default: 'Unassigned',
    },
    permanentAddress: {
      type: String,
      trim: true,
      default: '',
    },
    currentAddress: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: '',
    },
    alternateNumber: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    district: {
      type: String,
      trim: true,
      default: '',
    },
    documents: [{
      type: String,
      trim: true,
    }],
    termsAndConditions: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    coverPicture: {
      type: String,
      default: '',
    },
    // OTP verification status, account create hone par by default false hota hai
    isVerified: {
      type: Boolean,
      default: false,
    },
    consentTimestamp: {
      type: Date,
      default: Date.now,
    },
    termsVersion: {
      type: String,
      default: '1.0.0',
    },
    privacyPolicyVersion: {
      type: String,
      default: '1.0.0',
    },
    verificationOtp: {
      type: String,
      select: false,
    },
    verificationOtpExpires: {
      type: Date,
      select: false,
    },
    resetPasswordOtp: {
      type: String,
      select: false,
    },
    resetPasswordOtpExpires: {
      type: Date,
      select: false,
    },
    loginOtp: {
      type: String,
      select: false,
    },
    loginOtpExpires: {
      type: Date,
      select: false,
    },
    phoneChangeOtp: {
      type: String,
      select: false,
    },
    phoneChangeOtpExpires: {
      type: Date,
      select: false,
    },
    pendingMobileNumber: {
      type: String,
      trim: true,
    },
    pendingCountryCode: {
      type: String,
      trim: true,
    },
    emailChangeOtp: {
      type: String,
      select: false,
    },
    emailChangeOtpExpires: {
      type: Date,
      select: false,
    },
    pendingEmail: {
      type: String,
      trim: true,
    },
    lastLogin: {
      type: Date,
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    refreshTokens: [{
      type: String,
      select: false,
    }],
  },
  {
    timestamps: true,
  }
);

// =========================================================================
// 3. MONGOOSE MIDDLEWARE (Pre-save Hook) - Interview Favorite!
// =========================================================================
/**
 * @description Ye hook data database me save hone se theek pehle chalta hai
 * Interviewer: "Password encryption kaise manage kiya hai?"
 * Aapka Jawab: "Maine Mongoose ka 'pre-save' hook use kiya hai. Jab bhi user naya banta hai ya password badalta hai, 
 * toh DB me save hone se theek ek second pehle ye hook chalta hai aur password ko bcrypt se hash (encrypt) kar deta hai. 
 * Is se control hamesha model ke paas rehta hai, bhale hi kisi bhi controller se user save kiya jaye."
 */
userSchema.pre<IUser>('save', async function save(next) {
  // 1. Agar user ne firstName aur lastName update kiya hai, toh dono ko jod kar 'name' bana dena
  if (this.firstName || this.lastName) {
    this.name = `${this.firstName || ''} ${this.lastName || ''}`.trim() || 'User';
  }

  // 2. Agar password field me koi change nahi hua hai, toh seedha agle step par chale jao (bcrypt avoid karna)
  if (!this.isModified('password')) {
    return next();
  }

  // 3. Agar naya password diya gaya hai, toh usko encrypt (hash) karke save karna
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error as Error);
  }
});

// =========================================================================
// 4. INSTANCE METHODS
// =========================================================================
// Ye function hum login ke time use karte hain jahan user apna password dalta hai aur hum DB ke encrypted password se match karte hain.
userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// =========================================================================
// 5. DATABASE INDEXING (Performance Optimization)
// =========================================================================
// Interviewer: "Jab millions of users ho jayenge, toh login fast kaise rahega?"
// Aapka Jawab: "Maine 'email' aur 'mobileNumber' par index laga rakha hai. 
// Isse MongoDB ko poori table scan nahi karni padti. O(log N) time me turant user mil jata hai."
userSchema.index({ email: 1 });
userSchema.index({ mobileNumber: 1 });
userSchema.index({ role: 1 });
userSchema.index({ email: 1, isVerified: 1 });

const User = model<IUser>('User', userSchema);

export default User;
