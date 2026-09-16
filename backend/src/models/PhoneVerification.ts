import { Schema, model, Document } from 'mongoose';

export interface IPhoneVerification extends Document {
  mobileNumber: string;
  countryCode: string;
  otp: string;
  verified: boolean;
  expiresAt: Date;
}

const phoneVerificationSchema = new Schema<IPhoneVerification>(
  {
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    countryCode: {
      type: String,
      required: true,
      trim: true,
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
phoneVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PhoneVerification = model<IPhoneVerification>('PhoneVerification', phoneVerificationSchema);

export default PhoneVerification;
