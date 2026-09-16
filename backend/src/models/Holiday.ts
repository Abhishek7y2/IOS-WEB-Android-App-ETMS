import mongoose, { Document, Schema } from 'mongoose';


export interface IHoliday extends Document {
  holidayName: string;
  holidayDate: Date;
  holidayType: string;
  description?: string;
  location?: string;
  department?: string;
  isOptional: boolean;
  isRecurring: boolean;
  recurrenceType?: string;
  createdBy?: mongoose.Types.ObjectId;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const HolidaySchema: Schema = new Schema(
  {
    holidayName: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    holidayDate: { type: Date, required: true },
    holidayType: {
      type: String,
      enum: ['National Holiday', 'Festival Holiday', 'Company Holiday', 'Regional Holiday', 'Optional Holiday', 'Restricted Holiday'],
      required: true
    },
    description: { type: String, maxlength: 500 },
    location: { type: String },
    department: { type: String },
    isOptional: { type: Boolean, default: false },
    isRecurring: { type: Boolean, default: false },
    recurrenceType: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Upcoming', 'Completed', 'Cancelled'], default: 'Upcoming' }
  },
  { timestamps: true }
);

// Prevent duplicate holidays (Same Name, Date, Location)
HolidaySchema.index({ holidayName: 1, holidayDate: 1, location: 1 }, { unique: true });

const Holiday = mongoose.models.Holiday || mongoose.model<IHoliday>('Holiday', HolidaySchema);



export default Holiday;
