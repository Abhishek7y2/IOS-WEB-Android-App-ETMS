import { Schema, model, Document } from 'mongoose';

export interface IOtpRateLimit extends Document {
  key: string;               // Normalized email or mobile number
  sendCount: number;
  sendLockExpires?: Date;
  failCount: number;
  failLockExpires?: Date;
  isSecondaryPhase: boolean;  // Tracks if the first 10-minute lock was triggered
  createdAt: Date;
  updatedAt: Date;
}

const otpRateLimitSchema = new Schema<IOtpRateLimit>(
  {
    key: { type: String, required: true, unique: true, index: true },
    sendCount: { type: Number, default: 0 },
    sendLockExpires: { type: Date },
    failCount: { type: Number, default: 0 },
    failLockExpires: { type: Date },
    isSecondaryPhase: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// TTL index to automatically clear rate limit records after 1 hour of inactivity
otpRateLimitSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 3600 });

const OtpRateLimit = model<IOtpRateLimit>('OtpRateLimit', otpRateLimitSchema);

export default OtpRateLimit;
