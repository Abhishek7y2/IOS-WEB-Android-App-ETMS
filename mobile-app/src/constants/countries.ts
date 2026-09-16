export interface Country {
  name: string;
  code: string;
  iso: string;
  maxLength: number;
}

export const countries: Country[] = [
  { name: 'India', code: '+91', iso: 'in', maxLength: 10 },
  { name: 'United States', code: '+1', iso: 'us', maxLength: 10 },
  { name: 'United Kingdom', code: '+44', iso: 'gb', maxLength: 10 },
  { name: 'Canada', code: '+1', iso: 'ca', maxLength: 10 },
  { name: 'Australia', code: '+61', iso: 'au', maxLength: 9 },
  { name: 'Germany', code: '+49', iso: 'de', maxLength: 11 },
  { name: 'France', code: '+33', iso: 'fr', maxLength: 9 },
  { name: 'United Arab Emirates', code: '+971', iso: 'ae', maxLength: 9 },
  { name: 'Singapore', code: '+65', iso: 'sg', maxLength: 8 },
  { name: 'Japan', code: '+81', iso: 'jp', maxLength: 10 },
];
