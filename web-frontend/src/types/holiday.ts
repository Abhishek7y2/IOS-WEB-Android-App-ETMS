export type HolidayType = 
  | 'National Holiday'
  | 'Festival Holiday'
  | 'Company Holiday'
  | 'Regional Holiday'
  | 'Optional Holiday'
  | 'Restricted Holiday';

export type HolidayStatus = 'Upcoming' | 'Completed' | 'Cancelled';

export interface Holiday {
  _id: string;
  holidayName: string;
  holidayDate: string; // ISO string
  holidayType: HolidayType;
  description?: string;
  location?: string;
  department?: string;
  isOptional: boolean;
  isRecurring: boolean;
  recurrenceType?: string;
  createdBy?: string;
  status: HolidayStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HolidayStats {
  totalHolidays: number;
  optionalHolidays: number;
  upcomingHolidays: number;
  passedHolidays: number;
}
