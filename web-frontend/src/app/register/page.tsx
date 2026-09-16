'use client';

import { useState, FormEvent, type ChangeEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { verifyOtp, resendVerificationOtp, requestRegistrationOtpApi, verifyRegistrationOtpApi, requestRegistrationEmailOtpApi, verifyRegistrationEmailOtpApi } from '../../api/auth';
import { countries } from '@/constants/countries';
import { Eye, EyeOff, Lock, Mail, User, Image as ImageIcon, ClipboardCheck, ArrowRight, Phone, Check, Plus, Briefcase, Network, CheckCircle, X, ChevronDown } from 'lucide-react';
import { checkRequirements, isPasswordValid, calculatePasswordStrength, getPasswordValidationError } from '../../utils/passwordValidator';
import { isValidEmail } from '../../utils/emailValidator';
import { validateMobileNumber } from '../../utils/phoneValidator';

const inputBase =
  'peer w-full rounded-xl border-2 shadow-sm text-sm text-zinc-950 dark:text-zinc-50 bg-white dark:bg-zinc-900 outline-none transition duration-150 focus:ring-2 placeholder-transparent focus:placeholder-zinc-600 dark:focus:placeholder-zinc-600';

const getFloatingLabelClass = (value: string, hasError: boolean, leftInset: string = 'left-9') =>
  `absolute px-1 transition-all duration-200 pointer-events-none bg-white dark:bg-zinc-900 ` +
  `${!value ? `top-3 ${leftInset} text-sm text-zinc-600` : '-top-2.5 left-3 text-xs font-semibold text-zinc-700 dark:text-zinc-500'} ` +
  `peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:font-semibold ` +
  `${hasError ? 'text-red-500 peer-focus:text-red-500' : 'peer-focus:text-teal-700 dark:text-teal-500'}`;
const inputNormal =
  'border-zinc-500 dark:border-zinc-600 focus:border-teal-700 focus:ring-teal-700/20 hover:border-zinc-700 dark:hover:border-zinc-500';
const inputError =
  'border-red-400 focus:border-red-400 focus:ring-red-400/20';


const validateNameField = (value: string, fieldName: string, allowSpace: boolean = true): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return `Please enter your ${fieldName.toLowerCase()}.`;
  if (trimmed.length < 2) return `${fieldName} must be at least 2 characters long`;
  if (trimmed.length > 50) return `${fieldName} must be at most 50 characters long`;
  if (!/^[A-Z]/.test(trimmed)) return `${fieldName} must start with a capital letter`;
  if (/[0-9]/.test(trimmed) || /[@#$%^&*()]/.test(trimmed)) return `${fieldName} should only contain letters`;
  if (!allowSpace && /\s/.test(trimmed)) return `${fieldName} cannot contain spaces`;

  const regex = allowSpace ? /^[A-Z][a-zA-Z]*(?:[\s'-][a-zA-Z]+)*$/ : /^[A-Z][a-zA-Z]*(?:['-][a-zA-Z]+)*$/;
  if (!regex.test(trimmed)) return `${fieldName} has invalid characters or consecutive ${allowSpace ? 'spaces/' : ''}symbols`;
  return null;
};

export default function RegisterPage() {
  const { register, loading, error, persistAuth } = useAuth() as any;
  const router = useRouter();

  // Registration states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [gender, setGender] = useState('');
  const [qualification, setQualification] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [isQualDropdownOpen, setIsQualDropdownOpen] = useState(false);
  const qualDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
        setCountrySearchQuery('');
      }
      if (qualDropdownRef.current && !qualDropdownRef.current.contains(event.target as Node)) {
        setIsQualDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prefill email from query parameters if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, []);

  // Phone OTP States
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showPhoneOtpInput, setShowPhoneOtpInput] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpTimer, setPhoneOtpTimer] = useState(0);
  const [phoneOtpSending, setPhoneOtpSending] = useState(false);
  const [phoneOtpVerifying, setPhoneOtpVerifying] = useState(false);
  const [isPhoneLocked, setIsPhoneLocked] = useState(false);
  const [phoneLockoutSeconds, setPhoneLockoutSeconds] = useState(0);

  useEffect(() => {
    if (phoneOtpTimer > 0) {
      const interval = setInterval(() => {
        setPhoneOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phoneOtpTimer]);

  useEffect(() => {
    if (phoneLockoutSeconds > 0) {
      const interval = setInterval(() => {
        setPhoneLockoutSeconds((prev) => {
          if (prev <= 1) {
            setIsPhoneLocked(false);
            setMobileError(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phoneLockoutSeconds]);

  const isLockErrorMessage = (msg: string) => {
    const lower = msg.toLowerCase();
    return lower.includes('locked') || lower.includes('wait') || lower.includes('too many') || lower.includes('limit') || lower.includes('attempts') || lower.includes('minute');
  };

  const parseLockoutSeconds = (msg: string): number => {
    const match = msg.match(/(\d+)\s*minute/i);
    if (match && match[1]) {
      const mins = parseInt(match[1], 10);
      return mins * 60;
    }
    return 600; // Default to 10 minutes if no duration parsed
  };

  const formatLockoutTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendPhoneOtp = async () => {
    if (isPhoneLocked || (mobileError && isLockErrorMessage(mobileError))) return;
    setMobileError(null);
    if (!mobileNumber || mobileNumber.length < 5) return;
    setPhoneOtpSending(true);
    try {
      await requestRegistrationOtpApi({ mobileNumber, countryCode });
      setShowPhoneOtpInput(true);
      setPhoneOtpTimer(60);
      setPhoneOtp('');
      setIsPhoneLocked(false);
      setPhoneLockoutSeconds(0);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to send OTP.';
      setMobileError(errMsg);
      if (isLockErrorMessage(errMsg)) {
        setIsPhoneLocked(true);
        const secs = parseLockoutSeconds(errMsg);
        setPhoneLockoutSeconds(secs);
      }
    } finally {
      setPhoneOtpSending(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (isPhoneLocked || (mobileError && isLockErrorMessage(mobileError))) {
      return;
    }
    setMobileError(null);
    if (!phoneOtp || phoneOtp.length !== 6) {
      setMobileError('Please enter the 6-digit OTP.');
      return;
    }
    setPhoneOtpVerifying(true);
    try {
      await verifyRegistrationOtpApi({ mobileNumber, countryCode, otp: phoneOtp });
      setIsPhoneVerified(true);
      setShowPhoneOtpInput(false);
      setIsPhoneLocked(false);
      setPhoneLockoutSeconds(0);
    } catch (err: any) {
      const errMsg = err.message || 'Invalid OTP.';
      setMobileError(errMsg);
      if (isLockErrorMessage(errMsg)) {
        setIsPhoneLocked(true);
        const secs = parseLockoutSeconds(errMsg);
        setPhoneLockoutSeconds(secs);
      }
    } finally {
      setPhoneOtpVerifying(false);
    }
  };

  // Email OTP States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpTimer, setEmailOtpTimer] = useState(0);
  const [emailOtpSending, setEmailOtpSending] = useState(false);
  const [emailOtpVerifying, setEmailOtpVerifying] = useState(false);
  const [isEmailLocked, setIsEmailLocked] = useState(false);
  const [emailLockoutSeconds, setEmailLockoutSeconds] = useState(0);

  useEffect(() => {
    if (emailOtpTimer > 0) {
      const interval = setInterval(() => {
        setEmailOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [emailOtpTimer]);

  useEffect(() => {
    if (emailLockoutSeconds > 0) {
      const interval = setInterval(() => {
        setEmailLockoutSeconds((prev) => {
          if (prev <= 1) {
            setIsEmailLocked(false);
            setEmailError(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [emailLockoutSeconds]);

  const handleSendEmailOtp = async () => {
    if (isEmailLocked || (emailError && isLockErrorMessage(emailError))) return;
    setEmailError(null);
    if (!email || !isValidEmail(email)) {
      setEmailError('Please enter a valid email.');
      return;
    }
    setEmailOtpSending(true);
    try {
      await requestRegistrationEmailOtpApi({ email });
      setShowEmailOtpInput(true);
      setEmailOtpTimer(60);
      setEmailOtp('');
      setIsEmailLocked(false);
      setEmailLockoutSeconds(0);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to send OTP.';
      setEmailError(errMsg);
      if (isLockErrorMessage(errMsg)) {
        setIsEmailLocked(true);
        const secs = parseLockoutSeconds(errMsg);
        setEmailLockoutSeconds(secs);
      }
    } finally {
      setEmailOtpSending(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (isEmailLocked || (emailError && isLockErrorMessage(emailError))) {
      return;
    }
    setEmailError(null);
    if (!emailOtp || emailOtp.length !== 6) {
      setEmailError('Please enter the 6-digit OTP.');
      return;
    }
    setEmailOtpVerifying(true);
    try {
      await verifyRegistrationEmailOtpApi({ email, otp: emailOtp });
      setIsEmailVerified(true);
      setShowEmailOtpInput(false);
      setIsEmailLocked(false);
      setEmailLockoutSeconds(0);
    } catch (err: any) {
      const errMsg = err.message || 'Invalid OTP.';
      setEmailError(errMsg);
      if (isLockErrorMessage(errMsg)) {
        setIsEmailLocked(true);
        const secs = parseLockoutSeconds(errMsg);
        setEmailLockoutSeconds(secs);
      }
    } finally {
      setEmailOtpVerifying(false);
    }
  };

  // OTP Verification digits (6 separate boxes)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  // UI States
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [genderError, setGenderError] = useState<string | null>(null);
  const [qualificationError, setQualificationError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const reqs = checkRequirements(password);
  const strength = calculatePasswordStrength(password);
  const isPassValid = isPasswordValid(password);

  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setFormError('Invalid image format. Only JPG, PNG, and WEBP are accepted.');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setFormError('Image size must be less than 20MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
        setFormError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFirstNameChange = (val: string) => {
    let filteredVal = val.replace(/[^a-zA-Z]/g, '');
    if (filteredVal.length > 0) {
      filteredVal = filteredVal.charAt(0).toUpperCase() + filteredVal.slice(1);
    }
    filteredVal = filteredVal.slice(0, 50);
    setFirstName(filteredVal);
    setFirstNameError(null);
  };

  const handleLastNameChange = (val: string) => {
    let filteredVal = val.replace(/[^a-zA-Z\s'-]/g, '');
    filteredVal = filteredVal.trimStart().replace(/\s{2,}/g, ' ').replace(/-{2,}/g, '-').replace(/'{2,}/g, "'");
    if (filteredVal.length > 0) {
      filteredVal = filteredVal.replace(/(?:^|\s|-)\S/g, (match) => match.toUpperCase());
    }
    filteredVal = filteredVal.slice(0, 50);
    setLastName(filteredVal);
    setLastNameError(null);
  };


  const handleMobileChange = (val: string) => {
    if (isPhoneVerified) return; // Lock if verified

    const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];

    // Automatically remove non-numeric chars and slice to max length
    const digitsOnly = val.replace(/\D/g, '').slice(0, selectedCountry.maxLength);

    if (!digitsOnly) {
      setMobileNumber('');
      setMobileError(null);
      return;
    }

    // Indian mobile numbers must start with 6, 7, 8, or 9
    if (countryCode === '+91' && !/^[6-9]/.test(digitsOnly)) {
      return; // block typing
    }

    setMobileNumber(digitsOnly);

    // Real-time robust validation using libphonenumber-js
    const errorMsg = validateMobileNumber(digitsOnly, selectedCountry.iso);
    setMobileError(errorMsg);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    setFirstNameError(null);
    setLastNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setMobileError(null);
    setMobileError(null);
    setGenderError(null);
    setQualificationError(null);

    let hasError = false;

    const fnError = validateNameField(firstName, 'First name', false);
    if (fnError) {
      setFirstNameError(fnError);
      hasError = true;
    }

    const lnError = validateNameField(lastName, 'Last name');
    if (lnError) {
      setLastNameError(lnError);
      hasError = true;
    }

    if (!gender) {
      setGenderError('Please select your gender.');
      hasError = true;
    }

    // Qualification is now optional, so no validation error here

    const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];

    const mobileValidationErr = validateMobileNumber(mobileNumber, selectedCountry.iso);
    if (mobileValidationErr) {
      setMobileError(mobileValidationErr);
      hasError = true;
    } else if (!isPhoneVerified) {
      setMobileError('Please verify your mobile number before continuing.');
      hasError = true;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Please enter your email.');
      hasError = true;
    } else if (!isValidEmail(trimmedEmail)) {
      setEmailError('Please enter a valid email address (e.g., user@example.com).');
      hasError = true;
    } else if (!isEmailVerified) {
      setEmailError('Please verify your email address before continuing.');
      hasError = true;
    }

    const passError = getPasswordValidationError(password);
    if (passError) {
      setPasswordError('Please enter the valid password.');
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password.');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords must match.');
      hasError = true;
    }

    if (hasError) return;

    try {
      const data = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        qualification,
        mobileNumber,
        countryCode,
        email: email.trim().toLowerCase(),
        password,
        profilePicture
      });
      
      setSuccessMessage(data.message || 'Registration successful! Redirecting to dashboard...');
      
      if (data.token) {
        persistAuth(data.user, data.token);
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      if (msg.toLowerCase().includes('email')) {
        setEmailError(msg);
      } else {
        setFormError(msg);
      }
    }
  };

  const handleResendOtp = async () => {
    setResendMessage(null);
    setResendLoading(true);
    try {
      const result = await resendVerificationOtp(email);
      setResendMessage(result.message || 'A new code has been sent.');
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setResendMessage(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) {
      const nextDigits = [...otpDigits];
      nextDigits[index] = '';
      setOtpDigits(nextDigits);
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = numericValue.slice(-1);
    setOtpDigits(nextDigits);

    if (index < 5 && numericValue) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleOtpDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  };

  const handleOtpSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOtpError(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setOtpError('Please enter the 6-digit code.');
      return;
    }

    setOtpLoading(true);
    try {
      await verifyOtp(email, fullOtp);
      setOtpSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="h-screen flex font-sans transition-colors duration-500 overflow-hidden relative">
      {/* ── LEFT COLUMN (45%) ── */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 xl:px-24 py-12 relative z-10 bg-white dark:bg-zinc-950 h-full shadow-2xl lg:shadow-none overflow-y-auto">
        <div className="w-full max-w-[440px] mx-auto">
          {/* Profile Picture Upload & Title */}
          <div className="flex flex-col items-center mb-10">
            <h1 className="text-3.5xl lg:text-[34px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-outfit text-center w-full leading-tight">
              Employee Task Manager
            </h1>
            <p className="mt-1.5 text-base text-zinc-500 dark:text-zinc-500 text-center mb-6 w-full">
              {successMessage ? 'Verify your email to continue' : 'Create your workspace account'}
            </p>
            <div className="relative mb-2" onMouseEnter={() => setIsHoveringAvatar(true)} onMouseLeave={() => setIsHoveringAvatar(false)}>
              <label htmlFor="profile-pic" className={`cursor-pointer group relative flex h-24 w-24 items-center justify-center rounded-full bg-[#9ca3af] dark:bg-zinc-700 transition-all duration-200 overflow-hidden ${formError?.includes('Image') ? 'ring-2 ring-red-400' : 'hover:bg-zinc-600 dark:hover:bg-zinc-600'}`}>
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-end pt-3">
                    <div className="w-9 h-9 bg-[#e5e7eb] dark:bg-zinc-900 rounded-full mb-1 shrink-0" />
                    <div className="w-[85%] h-10 bg-[#e5e7eb] dark:bg-zinc-900 rounded-t-full shrink-0 translate-y-1" />
                  </div>
                )}
                {profilePicture && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-semibold uppercase tracking-wider">
                    Change
                  </div>
                )}
                <input
                  id="profile-pic"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {!profilePicture && (
                <div className="absolute bottom-0 right-0 h-8 w-8 bg-[#9ca3af] dark:bg-zinc-700 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950 pointer-events-none shadow-sm">
                  <Plus className="h-5 w-5 text-white" strokeWidth={3} />
                </div>
              )}
              {profilePicture && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setProfilePicture('');
                  }}
                  className="absolute top-0 right-0 h-6.5 w-6.5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-950 transition-all duration-300 hover:scale-115 hover:ring-4 hover:ring-red-500/25 active:scale-90 cursor-pointer z-20"
                  title="Remove picture"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={3} />
                </button>
              )}
            </div>
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Upload Profile Picture</span>
            {isHoveringAvatar && (
              <p className="text-[10px] font-bold text-red-500 mt-2 text-center animate-in fade-in duration-200">
                Accepted formats: JPG, PNG. Max size: 20MB.
              </p>
            )}
          </div>

          {successMessage && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-3.5 py-3 mb-6 text-sm text-emerald-700 dark:text-emerald-400 font-medium text-center">
              {successMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    <input
                      id="firstName"
                      type="text"
                      maxLength={50}
                      value={firstName}
                      onChange={(e) => handleFirstNameChange(e.target.value)}
                      placeholder="John"
                      className={`${inputBase} pl-10 pr-3.5 py-3 ${firstNameError ? inputError : inputNormal}`}
                    />
                    <label htmlFor="firstName" className={getFloatingLabelClass(firstName, !!firstNameError)}>
                      First name <span className="text-red-500">*</span>
                    </label>
                    {firstName.length > 0 && (
                      <span className="absolute right-3.5 -top-2 px-1 text-[10px] font-semibold text-zinc-600 bg-white dark:bg-zinc-950 z-10">
                        {firstName.length}/50
                      </span>
                    )}
                  </div>
                  {firstNameError && <p className="text-sm text-red-500 font-semibold">{firstNameError}</p>}
                </div>
 
                <div className="space-y-1">
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    <input
                      id="lastName"
                      type="text"
                      maxLength={50}
                      value={lastName}
                      onChange={(e) => handleLastNameChange(e.target.value)}
                      placeholder="Doe"
                      className={`${inputBase} pl-10 pr-3.5 py-3 ${lastNameError ? inputError : inputNormal}`}
                    />
                    <label htmlFor="lastName" className={getFloatingLabelClass(lastName, !!lastNameError)}>
                      Last name <span className="text-red-500">*</span>
                    </label>
                    {lastName.length > 0 && (
                      <span className="absolute right-3.5 -top-2 px-1 text-[10px] font-semibold text-zinc-600 bg-white dark:bg-zinc-950 z-10">
                        {lastName.length}/50
                      </span>
                    )}
                  </div>
                  {lastNameError && <p className="text-sm text-red-500 font-semibold">{lastNameError}</p>}
                </div>
              </div>

              {/* Gender and Qualification Grid */}
              <div className="grid grid-cols-2 gap-4 pt-1 pb-2">
                {/* Gender Radio Buttons */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 px-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-4 px-1">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={gender === g}
                          onChange={(e) => { setGender(e.target.value); setGenderError(null); }}
                          className="peer sr-only"
                        />
                        <div className="w-[18px] h-[18px] rounded-full border-2 border-zinc-500 dark:border-zinc-600 peer-focus-visible:ring-2 peer-focus-visible:ring-teal-700/50 peer-checked:border-teal-700 peer-checked:[&>div]:scale-100 bg-white dark:bg-zinc-900 flex items-center justify-center transition-all">
                          <div className="w-[10px] h-[10px] rounded-full bg-teal-700 scale-0 transition-transform duration-200" />
                        </div>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                          {g}
                        </span>
                      </label>
                    ))}
                  </div>
                  {genderError && <p className="text-sm text-red-500 font-semibold px-1">{genderError}</p>}
                </div>

                {/* Qualification Select */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 px-1 opacity-0 pointer-events-none hidden sm:block">
                    Qualification
                  </label>
                  <div className="relative" ref={qualDropdownRef}>
                    <div
                      onClick={() => setIsQualDropdownOpen(!isQualDropdownOpen)}
                      className={`${inputBase} px-3 py-3 flex items-center justify-between cursor-pointer select-none ${qualificationError ? inputError : inputNormal}`}
                    >
                      <span className={qualification ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600'}>
                        {qualification || 'Select Qualification'}
                      </span>
                      <svg className={`h-4 w-4 text-zinc-600 transition-transform duration-200 ${isQualDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {isQualDropdownOpen && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                          Highest Qualification
                        </div>
                        <ul className="max-h-56 overflow-y-auto py-1">
                          {['10th', '12th', 'Bachelor\'s', 'Master\'s', 'PhD', 'Other'].map(q => (
                            <li
                              key={q}
                              onClick={() => {
                                setQualification(q);
                                setQualificationError(null);
                                setIsQualDropdownOpen(false);
                              }}
                              className={`px-3 py-2.5 cursor-pointer text-sm font-medium transition-colors flex items-center justify-between ${qualification === q ? 'bg-blue-50 dark:bg-blue-900/20 text-teal-800 dark:text-teal-400' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                            >
                              <span>{q}</span>
                              {qualification === q && <Check className="h-4 w-4" />}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {qualificationError && <p className="text-sm text-red-500 font-semibold px-1">{qualificationError}</p>}
                </div>
              </div>

              {/* Country Selector Dropdown & Mobile Number */}
              <div className="space-y-1">
                <div className="flex gap-2 mt-2">
                  <div
                    ref={countryDropdownRef}
                    className="relative flex items-center bg-white dark:bg-zinc-900 rounded-xl border-2 border-zinc-500 dark:border-zinc-600 shadow-sm hover:border-zinc-500 dark:hover:border-zinc-500 px-3 py-3 text-sm font-semibold focus-within:ring-2 focus-within:ring-teal-700/20 focus-within:border-teal-700 shrink-0 w-[105px] cursor-pointer"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  >
                    <div className="flex items-center gap-2 pointer-events-none w-full">
                      {(() => {
                        const selected = countries.find(c => c.code === countryCode);
                        return selected ? (
                          <img
                            src={`https://flagcdn.com/w20/${selected.iso}.png`}
                            srcSet={`https://flagcdn.com/w40/${selected.iso}.png 2x`}
                            width="20"
                            alt={selected.name}
                            className="rounded-[2px] shadow-sm shrink-0"
                          />
                        ) : null;
                      })()}
                      <span className="text-zinc-700 dark:text-zinc-300 truncate flex-1">{countryCode}</span>
                      <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
                    </div>

                    {isCountryDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-[280px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 flex flex-col overflow-hidden">
                        <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                          <input
                            type="text"
                            autoFocus
                            placeholder="Search country..."
                            value={countrySearchQuery}
                            onChange={(e) => setCountrySearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all placeholder:text-zinc-500 dark:placeholder:text-zinc-600"
                          />
                        </div>
                        <ul className="max-h-[250px] overflow-y-auto py-1 flex flex-col gap-0.5">
                          {countries.filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) || c.code.includes(countrySearchQuery)).map((c, idx) => (
                            <li
                              key={`${c.name}-${idx}`}
                              className="px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-3 transition-colors"
                              onClick={(e) => {
                                if (isPhoneVerified) return;
                                e.stopPropagation();
                                setCountryCode(c.code);
                                if (mobileNumber.length > c.maxLength) {
                                  setMobileNumber(mobileNumber.slice(0, c.maxLength));
                                }
                                setIsCountryDropdownOpen(false);
                                setCountrySearchQuery('');
                              }}
                            >
                              <img
                                src={`https://flagcdn.com/w20/${c.iso}.png`}
                                srcSet={`https://flagcdn.com/w40/${c.iso}.png 2x`}
                                width="20"
                                alt={c.name}
                                className="rounded-[2px] shadow-sm shrink-0"
                              />
                              <span className="flex-1 truncate text-zinc-700 dark:text-zinc-300 font-medium">{c.name}</span>
                              <span className="text-zinc-600 dark:text-zinc-400 font-semibold shrink-0">{c.code}</span>
                            </li>
                          ))}
                          {countries.filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) || c.code.includes(countrySearchQuery)).length === 0 && (
                            <li className="px-3 py-6 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">No countries found</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    <input
                      id="mobile"
                      type="text"
                      inputMode="numeric"
                      value={mobileNumber}
                      disabled={isPhoneVerified}
                      onChange={(e) => handleMobileChange(e.target.value)}
                      placeholder={`${countries.find(c => c.code === countryCode)?.maxLength || 10}-digit number`}
                      className={`${inputBase} pl-10 ${isPhoneVerified ? 'pr-24 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100 disabled:opacity-100' : 'pr-10'} py-3 ${mobileError ? inputError : inputNormal}`}
                    />
                    <label htmlFor="mobile" className={getFloatingLabelClass(mobileNumber, !!mobileError)}>
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    {isPhoneVerified && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                          <Check className="h-3 w-3" strokeWidth={3} />
                          <span className="text-[10px] font-bold tracking-wide uppercase">Verified</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone OTP Actions */}
                {!isPhoneVerified && !showPhoneOtpInput && mobileNumber && !mobileError && (
                  <div className="flex justify-end mt-1 animate-in fade-in zoom-in-95">
                    <button
                      type="button"
                      onClick={handleSendPhoneOtp}
                      disabled={phoneOtpSending}
                      className="text-xs font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 disabled:opacity-50"
                    >
                      {phoneOtpSending ? 'Sending...' : 'Verify Phone Number'}
                    </button>
                  </div>
                )}

                {showPhoneOtpInput && !isPhoneVerified && (
                  <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-2 text-xs font-semibold">
                      <span className="text-zinc-700 dark:text-zinc-300">Enter SMS Code</span>
                      {phoneOtpTimer > 0 ? (
                        <span className="text-teal-700 dark:text-teal-400">{phoneOtpTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendPhoneOtp}
                          disabled={phoneOtpSending || isPhoneLocked || (!!mobileError && isLockErrorMessage(mobileError))}
                          className="text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {phoneOtpSending ? 'Sending...' : 'Resend OTP'}
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={phoneOtp}
                        disabled={isPhoneLocked || (!!mobileError && isLockErrorMessage(mobileError))}
                        onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                        className={`${inputBase} px-3 py-2 text-center tracking-[0.2em] font-bold disabled:opacity-50`}
                        placeholder="••••••"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyPhoneOtp}
                        disabled={phoneOtp.length !== 6 || phoneOtpVerifying || isPhoneLocked || (!!mobileError && isLockErrorMessage(mobileError))}
                        className="px-4 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 disabled:opacity-50 transition-colors"
                      >
                        {phoneOtpVerifying ? '...' : 'Verify'}
                      </button>
                    </div>
                  </div>
                )}

                {mobileError && (
                  <p className="text-sm text-red-500 font-semibold mt-1 flex flex-wrap items-center gap-1">
                    {phoneLockoutSeconds > 0 ? (
                      <>
                        <span>Verification is locked due to multiple incorrect attempts. Please wait</span>
                        <span className="font-bold underline tracking-wider font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800 animate-pulse">
                          {formatLockoutTime(phoneLockoutSeconds)}
                        </span>
                        <span>before requesting a new code.</span>
                      </>
                    ) : (
                      mobileError
                    )}
                  </p>
                )}
              </div>

              {/* Email - Always visible, but disabled until Phone is verified */}
              <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                      <input
                        id="email"
                        type="text"
                        autoComplete="new-email"
                        maxLength={254}
                        value={email}
                        disabled={isEmailVerified || !isPhoneVerified || isEmailLocked}
                        onChange={(event) => {
                          const val = event.target.value;
                          setEmail(val);
                          setFormError(null);
                          
                          const trimmed = val.trim();
                          if (!trimmed) {
                            setEmailError('Please enter your email.');
                          } else if (!isValidEmail(trimmed)) {
                            setEmailError('Please enter the valid email address.');
                          } else {
                            setEmailError(null);
                            setIsEmailLocked(false);
                          }
                        }}
                        onBlur={(e) => {
                          if (!e.target.value.trim()) {
                            setEmailError('Please enter your email.');
                          }
                        }}
                        placeholder="name@company.com"
                        className={`${inputBase} pl-10 pr-3.5 py-3 ${emailError ? inputError : inputNormal} ${isEmailVerified ? 'opacity-70 bg-zinc-100 dark:bg-zinc-800' : ''}`}
                      />
                      {isEmailVerified && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                            <Check className="h-3 w-3" strokeWidth={3} />
                            <span className="text-[10px] font-bold tracking-wide uppercase">Verified</span>
                          </div>
                        </div>
                      )}
                      <label htmlFor="email" className={getFloatingLabelClass(email, !!emailError)}>
                        Email <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {emailError && (
                      <p className="text-sm text-red-500 font-semibold mt-1 flex flex-wrap items-center gap-1">
                        {emailLockoutSeconds > 0 ? (
                          <>
                            <span>Verification is locked due to multiple incorrect attempts. Please wait</span>
                            <span className="font-bold underline tracking-wider font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800 animate-pulse">
                              {formatLockoutTime(emailLockoutSeconds)}
                            </span>
                            <span>before requesting a new code.</span>
                          </>
                        ) : (
                          emailError
                        )}
                      </p>
                    )}
                  </div>

                  {/* Email OTP Actions */}
                  {!isEmailVerified && !showEmailOtpInput && email && !emailError && (
                    <div className="flex justify-end mt-1 animate-in fade-in zoom-in-95">
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={emailOtpSending || isEmailLocked}
                        className="text-xs font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 disabled:opacity-50"
                      >
                        {emailOtpSending ? 'Sending...' : 'Verify Email Address'}
                      </button>
                    </div>
                  )}

                  {showEmailOtpInput && !isEmailVerified && (
                    <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between mb-2 text-xs font-semibold">
                        <span className="text-zinc-700 dark:text-zinc-300">Enter Email Code</span>
                        {emailOtpTimer > 0 ? (
                          <span className="text-teal-700 dark:text-teal-400">{emailOtpTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendEmailOtp}
                            disabled={emailOtpSending || isEmailLocked || (!!emailError && isLockErrorMessage(emailError))}
                            className="text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 underline disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {emailOtpSending ? 'Sending...' : 'Resend OTP'}
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={emailOtp}
                          disabled={isEmailLocked || (!!emailError && isLockErrorMessage(emailError))}
                          onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                          className={`${inputBase} px-3 py-2 text-center tracking-[0.2em] font-bold disabled:opacity-50`}
                          placeholder="••••••"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyEmailOtp}
                          disabled={emailOtp.length !== 6 || emailOtpVerifying || isEmailLocked || (!!emailError && isLockErrorMessage(emailError))}
                          className="px-4 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 disabled:opacity-50 transition-colors"
                        >
                          {emailOtpVerifying ? '...' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              {/* Password and Submit - Always visible */}
              <div className="space-y-4">
                  {/* Password */}
                  <div className="space-y-1">
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        maxLength={128}
                        value={password}
                        disabled={!isPhoneVerified}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        onChange={(event) => {
                          const val = event.target.value;
                          setPassword(val);
                          setFormError(null);
                          if (!val) {
                            setPasswordError(null);
                          } else if (getPasswordValidationError(val)) {
                            setPasswordError('Please enter the valid password.');
                          } else {
                            setPasswordError(null);
                          }
                        }}
                        placeholder="••••••••"
                        className={`${inputBase} pl-10 pr-10 py-3 ${passwordError ? inputError : inputNormal}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-650 cursor-pointer focus:outline-none focus:text-teal-700 dark:text-teal-500"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                      </button>
                      <label htmlFor="password" className={getFloatingLabelClass(password, !!passwordError)}>
                        Password <span className="text-red-500">*</span>
                      </label>
                    </div>

                    {/* Interactive Password Format Guidance Card */}
                    {(isPasswordFocused || password.length > 0) && (
                      <div className="mt-2.5 p-3.5 bg-zinc-50 dark:bg-zinc-900/90 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-md animate-in fade-in slide-in-from-top-2 duration-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                            Password Format Guidance
                          </span>
                          {password && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${strength.colorClass} text-white`}>
                              {strength.level}
                            </span>
                          )}
                        </div>

                        {/* Format Criteria Checklist */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-medium">
                          <div className={`flex items-center gap-1.5 ${reqs.hasMinMaxLen ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${reqs.hasMinMaxLen ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                              {reqs.hasMinMaxLen ? '✓' : '•'}
                            </div>
                            <span>8 to 64 Characters</span>
                          </div>

                          <div className={`flex items-center gap-1.5 ${reqs.hasUppercase && reqs.hasLowercase ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${reqs.hasUppercase && reqs.hasLowercase ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                              {reqs.hasUppercase && reqs.hasLowercase ? '✓' : '•'}
                            </div>
                            <span>Letters (<code className="text-[11px] font-mono bg-zinc-200 dark:bg-zinc-800 px-1 rounded">A-Z</code>, <code className="text-[11px] font-mono bg-zinc-200 dark:bg-zinc-800 px-1 rounded">a-z</code>)</span>
                          </div>

                          <div className={`flex items-center gap-1.5 ${reqs.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${reqs.hasNumber ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                              {reqs.hasNumber ? '✓' : '•'}
                            </div>
                            <span>Number (<code className="text-[11px] font-mono bg-zinc-200 dark:bg-zinc-800 px-1 rounded">0-9</code>)</span>
                          </div>

                          <div className={`flex items-center gap-1.5 ${reqs.hasSpecialChar ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${reqs.hasSpecialChar ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                              {reqs.hasSpecialChar ? '✓' : '•'}
                            </div>
                            <span>Special (<code className="text-[11px] font-mono bg-zinc-200 dark:bg-zinc-800 px-1 rounded">@,#,$,%</code>)</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {passwordError && <p className="text-sm text-red-500 font-semibold">{passwordError}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        maxLength={128}
                        value={confirmPassword}
                        disabled={!isPhoneVerified}
                        onChange={(event) => { setConfirmPassword(event.target.value); setConfirmPasswordError(null); setFormError(null); }}
                        placeholder="••••••••"
                        className={`${inputBase} pl-10 pr-10 py-3 ${confirmPasswordError ? inputError : inputNormal}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-650 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <label htmlFor="confirmPassword" className={getFloatingLabelClass(confirmPassword, !!confirmPasswordError)}>
                        Confirm password <span className="text-red-500">*</span>
                      </label>
                    </div>
                    {confirmPasswordError && <p className="text-sm text-red-500 font-semibold">{confirmPasswordError}</p>}
                  </div>

                  {formError && (
                    <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400 font-semibold">
                      {formError}
                    </div>
                  )}
                  {error && !formError && (
                    <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400 font-semibold">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !firstName.trim() || !lastName.trim() || !gender || !mobileNumber.trim() || !isPhoneVerified || !email.trim() || !isEmailVerified || !password.trim() || !confirmPassword.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3f33] px-4 py-2.5 text-xs font-bold text-white transition-all duration-150 hover:bg-[#0c3128] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? 'Creating account…' : 'Create account'}
                  </button>
                </div>
            </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-zinc-550 dark:text-zinc-400">
            Already have an account?{' '}
            <a href="/login" className="font-semibold text-teal-800 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 hover:underline transition-colors">
              Sign in
            </a>
          </div>
        </div>
      </div>
      {/* ── RIGHT COLUMN (55%) ── */}
      <div className="hidden lg:flex lg:w-[55%] bg-[#061f17] relative flex-col justify-between px-16 xl:px-24 py-16 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/20 blur-[100px] animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-700/10 blur-[120px] animate-[pulse_8s_ease-in-out_infinite_alternate]" />
        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-teal-400/5 blur-[80px] animate-[pulse_10s_ease-in-out_infinite_alternate]" />

        {/* Top Floating Dots */}
        <div className="relative z-10 flex justify-end">
          <div className="flex space-x-2">
            {[1, 2, 3].map((dot) => (
              <div key={dot} className="w-2 h-2 rounded-full bg-teal-500/30" />
            ))}
          </div>
        </div>

        {/* Central Animated Solar System */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center w-full min-h-[400px] overflow-hidden my-4">
          <div className="relative flex items-center justify-center w-[400px] h-[400px] scale-75 md:scale-90 lg:scale-100">

            {/* Center Core */}
            <div className="absolute w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-full shadow-[0_0_60px_rgba(45,212,191,0.6)] z-20 flex items-center justify-center animate-[pulse_4s_ease-in-out_infinite]">
              <Network className="w-8 h-8 text-white" />
            </div>

            {/* Orbit 1 (Inner) */}
            <div className="absolute w-[180px] h-[180px] rounded-full border border-teal-500/30 animate-[spin_10s_linear_infinite]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#0a2b20] border border-teal-500/50 rounded-full flex items-center justify-center shadow-lg animate-[spin_10s_linear_infinite_reverse]">
                <User className="w-4 h-4 text-teal-400" />
              </div>
            </div>

            {/* Orbit 2 (Middle) */}
            <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-teal-500/20 animate-[spin_15s_linear_infinite_reverse]">
              <div className="absolute top-1/2 -right-5 -translate-y-1/2 w-10 h-10 bg-teal-900 border border-teal-400/50 rounded-full flex items-center justify-center shadow-lg animate-[spin_15s_linear_infinite]">
                <Briefcase className="w-4 h-4 text-teal-300" />
              </div>
              <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 bg-teal-800 border border-teal-500/50 rounded-full flex items-center justify-center shadow-lg animate-[spin_15s_linear_infinite]">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Orbit 3 (Outer) */}
            <div className="absolute w-[380px] h-[380px] rounded-full border border-teal-500/10 animate-[spin_25s_linear_infinite]">
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#0e372e] border border-teal-400/40 rounded-full flex items-center justify-center shadow-lg animate-[spin_25s_linear_infinite_reverse]">
                <CheckCircle className="w-4 h-4 text-teal-400" />
              </div>
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-emerald-900 border border-emerald-400/40 rounded-full flex items-center justify-center shadow-lg animate-[spin_25s_linear_infinite_reverse]">
                <User className="w-4 h-4 text-emerald-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Content / Testimonial Style */}
        <div className="relative z-10 flex flex-col items-start">
          <h2 className="text-3xl lg:text-4xl font-bold text-white font-outfit mb-4 leading-tight">
            Elevate your <br />
            <span className="text-teal-400">enterprise productivity.</span>
          </h2>
          <p className="text-teal-100/70 text-[15px] max-w-[400px] leading-relaxed">
            Experience our industry-grade platform designed for seamless team collaboration, task tracking, and powerful analytics at scale.
          </p>
        </div>
      </div>
    </div>
  );
}

