export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  mobileNumber?: string;
  countryCode?: string;
  email: string;
  role?: string;
  profilePicture?: string;
  coverPicture?: string;
  designation?: string;
  department?: string;
  qualification?: string;
  country?: string;
  permanentAddress?: string;
  currentAddress?: string;
  alternateNumber?: string;
  state?: string;
  district?: string;
  documents?: string[];
  termsAndConditions?: boolean;
  notificationPreferences?: {
    email: boolean;
    inApp: boolean;
  };
  // isVerified indicates if the employee's email/phone has been verified.
  isVerified?: boolean;
  biography?: string;
  createdAt?: string;
}

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  name?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  qualification?: string;
  mobileNumber?: string;
  countryCode?: string;
  email: string;
  password: string;
  profilePicture?: string;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
  token?: string;
}

export interface LoginRequest {
  email?: string;
  password?: string;
  mobileNumber?: string;
  countryCode?: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: TokenResponse;
}

export interface ForgotPasswordRequest {
  email?: string;
  mobileNumber?: string;
  countryCode?: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email?: string;
  mobileNumber?: string;
  countryCode?: string;
  otp: string;
  password?: string;
}

export interface ResetPasswordResponse {
  message: string;
}

