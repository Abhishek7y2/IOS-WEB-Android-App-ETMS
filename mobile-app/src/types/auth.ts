export interface AuthUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'user';
  designation?: string;
  profilePicture?: string;
  coverPicture?: string;
  mobileNumber?: string;
  countryCode?: string;
  department?: string;
  employeeId?: string;
  biography?: string;
  joiningDate?: string;
  reportingManager?: string;
  isBlocked?: boolean;
}

export interface LoginRequest {
  email?: string;
  password?: string;
  mobileNumber?: string;
  countryCode?: string;
  otp?: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: {
    accessToken: string;
    expiresIn: number;
  };
}

export interface RegisterRequest {
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  designation?: string;
  role?: string;
  gender?: string;
  qualification?: string;
  mobileNumber?: string;
  countryCode?: string;
  profilePicture?: string;
  termsAndConditions?: boolean;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
  token?: {
    accessToken: string;
    expiresIn?: number;
  };
}
