import { Schema, model, Document } from 'mongoose';

export interface IEmailVerification extends Document {
  email: string;
  otp: string;
  verified: boolean;
  expiresAt: Date;
}

const emailVerificationSchema = new Schema<IEmailVerification>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
      select: false, // Don't return by default
    },
    verified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete documents when `expiresAt` is reached
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerification = model<IEmailVerification>('EmailVerification', emailVerificationSchema);

export default EmailVerification;
