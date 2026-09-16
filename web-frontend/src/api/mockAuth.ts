'use client';

import {
  AuthUser,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  TokenResponse,
} from '../types/auth';

const STORAGE_KEYS = {
  users: 'mock_auth_users',
};

interface StoredUser extends AuthUser {
  password: string;
}

function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.users);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    window.localStorage.removeItem(STORAGE_KEYS.users);
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function createToken(): TokenResponse {
  return {
    accessToken: `mock-${Date.now()}`,
    expiresIn: 3600,
  };
}

function createError(message: string, status: number): Error {
  const error = new Error(message);
  Object.assign(error, { status });
  return error;
}

export async function registerUser(payload: RegisterRequest): Promise<RegisterResponse> {
  const users = getStoredUsers();
  const existingUser = users.find((user) => user.email.toLowerCase() === payload.email.toLowerCase());

  if (existingUser) {
    throw createError('A user with this email already exists.', 400);
  }

  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    name: payload.name || `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'User',
    firstName: payload.firstName,
    lastName: payload.lastName,
    gender: payload.gender,
    mobileNumber: payload.mobileNumber,
    countryCode: payload.countryCode,
    email: payload.email.toLowerCase(),
    role: 'member',
    password: payload.password,
    profilePicture: payload.profilePicture || '',
  };

  saveStoredUsers([...users, newUser]);

  return {
    message: 'Registration successful. Please log in with your new account.',
    user: {
      id: newUser.id,
      name: newUser.name,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      gender: newUser.gender,
      mobileNumber: newUser.mobileNumber,
      countryCode: newUser.countryCode,
      email: newUser.email,
      role: newUser.role,
      profilePicture: newUser.profilePicture,
    },
  };
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const users = getStoredUsers();
  let existingUser;
  if (payload.email) {
    existingUser = users.find(
      (user) => user.email.toLowerCase() === payload.email?.toLowerCase()
    );
  } else if (payload.mobileNumber) {
    existingUser = users.find(
      (user) => user.mobileNumber === payload.mobileNumber && user.countryCode === payload.countryCode
    );
  }

  if (!existingUser || existingUser.password !== payload.password) {
    throw createError('Invalid credentials or password.', 401);
  }

  return {
    user: {
      id: existingUser.id,
      name: existingUser.name,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      gender: existingUser.gender,
      mobileNumber: existingUser.mobileNumber,
      countryCode: existingUser.countryCode,
      email: existingUser.email,
      role: existingUser.role,
      profilePicture: existingUser.profilePicture,
    },
    token: createToken(),
  };
}

export async function forgotPassword(
  payload: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  const users = getStoredUsers();
  const existingUser = users.find(
    (user) => user.email.toLowerCase() === payload.email?.toLowerCase()
  );

  if (!existingUser) {
    throw createError('No account was found for this email address.', 404);
  }

  return {
    message: 'Password reset instructions have been sent to your email address.',
  };
}
