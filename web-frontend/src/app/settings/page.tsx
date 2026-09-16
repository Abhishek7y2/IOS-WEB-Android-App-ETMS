'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../services/axios';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Key, Eye, EyeOff, Loader2, Trash2, ShieldAlert, AlertTriangle, Send, CheckCircle2, Clock, User as UserIcon, Edit2, Camera, X, Download, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Country, State, City } from 'country-state-city';
import { countries } from '@/constants/countries';
import Select from 'react-select';
import { sanitizePhoneNumber, validatePhoneNumber } from '../../utils/phoneValidation';
import ProfileCompletionCard from '../../components/profile/ProfileCompletionCard';
import ImageCropperModal from '../../components/profile/ImageCropperModal';
import { exportUserDataPDF } from '@/utils/exportPDF';

const reactSelectClassNames = {
  control: () => '!bg-transparent !border-2 !border-zinc-600 dark:!border-zinc-600 !rounded-xl !shadow-none !py-0.5',
  menu: () => '!bg-white dark:!bg-zinc-900 !border !border-2 !border-zinc-600 dark:!border-zinc-600 !rounded-xl !mt-1',
  option: (state: any) => `!cursor-pointer !text-zinc-900 dark:!text-zinc-100 hover:!bg-zinc-100 dark:hover:!bg-zinc-800 ${state.isSelected ? '!bg-blue-50 dark:!bg-blue-900/30' : '!bg-transparent'}`,
  singleValue: () => '!text-zinc-950 dark:!text-zinc-50',
  input: () => '!text-zinc-950 dark:!text-zinc-50',
  placeholder: () => '!text-zinc-600',
  menuList: () => '!p-1',
};

const inputBase =
  'peer w-full rounded-xl border-2 shadow-sm text-sm text-zinc-950 dark:text-zinc-50 bg-white dark:bg-zinc-900 outline-none transition duration-150 focus:ring-2 placeholder-transparent focus:placeholder-zinc-600 dark:focus:placeholder-zinc-600';

const inputNormal = 'border-zinc-600 dark:border-zinc-600 focus:border-blue-500 focus:ring-blue-500/20 hover:border-zinc-700 dark:hover:border-zinc-500';
const inputDisabled = 'border-zinc-600 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/50 cursor-not-allowed';

const floatingLabelNormal = "absolute left-3 px-1 transition-all duration-200 pointer-events-none bg-white dark:bg-zinc-900 " +
  "-top-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-500 " +
  "peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:text-zinc-600 " +
  "peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-blue-600 dark:peer-focus:text-blue-500";

const floatingLabelDisabled = "absolute left-3 px-1 transition-all duration-200 pointer-events-none bg-zinc-50 dark:bg-zinc-900/50 " +
  "-top-2.5 text-xs font-semibold text-zinc-500 dark:text-zinc-500 " +
  "peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:text-zinc-500 " +
  "peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-semibold";

export default function SettingsPage() {
  const { user, forgotPassword, resetPassword, deleteAccount, verifyResetOtp, updateUser, requestPhoneChangeOtp, verifyPhoneChangeOtp, requestEmailChangeOtp, verifyEmailChangeOtp } = useAuth();
  const router = useRouter();

  // Change password states
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'danger' | 'download'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [savedOtp, setSavedOtp] = useState('');
  const [passwordTimer, setPasswordTimer] = useState(0); // 120s countdown

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Cropper State
  const [cropperState, setCropperState] = useState<{
    isOpen: boolean;
    imageSrc: string | null;
    type: 'profile' | 'cover';
  }>({
    isOpen: false,
    imageSrc: null,
    type: 'profile',
  });

  // Delete account states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteOtpSent, setIsDeleteOtpSent] = useState(false);
  const [isRequestingDeleteOtp, setIsRequestingDeleteOtp] = useState(false);
  const [deleteOtpDigits, setDeleteOtpDigits] = useState(['', '', '', '', '', '']);
  const [confirmText, setConfirmText] = useState('');
  const [isVerifyingDeleteOtp, setIsVerifyingDeleteOtp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTimer, setDeleteTimer] = useState(0); // 120s countdown

  // Phone Change OTP states
  const [isPhoneOtpModalOpen, setIsPhoneOtpModalOpen] = useState(false);
  const [phoneOtpDigits, setPhoneOtpDigits] = useState(['', '', '', '', '', '']);
  const [isRequestingPhoneOtp, setIsRequestingPhoneOtp] = useState(false);
  const [isVerifyingPhoneOtp, setIsVerifyingPhoneOtp] = useState(false);
  const [phoneTimer, setPhoneTimer] = useState(0);

  // Email Change OTP states
  const [isEmailOtpModalOpen, setIsEmailOtpModalOpen] = useState(false);
  const [emailOtpDigits, setEmailOtpDigits] = useState(['', '', '', '', '', '']);
  const [isRequestingEmailOtp, setIsRequestingEmailOtp] = useState(false);
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  const [emailInputValue, setEmailInputValue] = useState('');
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [isPhoneEditable, setIsPhoneEditable] = useState(false);

  // Country, State & District handling
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedCountryName, setSelectedCountryName] = useState(user?.country || '');
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const [selectedStateName, setSelectedStateName] = useState(user?.state || '');
  const [selectedDistrictName, setSelectedDistrictName] = useState(user?.district || '');

  // Documents handling
  const [existingDocuments, setExistingDocuments] = useState<string[]>(user?.documents || []);
  const [newDocumentsBase64, setNewDocumentsBase64] = useState<string[]>([]);
  const [isConvertingFiles, setIsConvertingFiles] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [purgePassword, setPurgePassword] = useState('');
  const [isPurgingAccount, setIsPurgingAccount] = useState(false);

  // Controlled Phone states for typing restrictions
  const [mobilePhoneValue, setMobilePhoneValue] = useState('');
  const [alternatePhoneValue, setAlternatePhoneValue] = useState('');

  const [countryCode, setCountryCode] = useState('+91');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const countryDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
        setCountrySearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMobileChange = (val: string, code: string) => {
    let numericValue = val.replace(/\D/g, '');
    const maxLen = countries.find(c => c.code === code)?.maxLength || 15;
    if (numericValue.length > maxLen) {
      numericValue = numericValue.slice(0, maxLen);
    }
    setMobilePhoneValue(numericValue);
    if (typeof window !== 'undefined') {
      (window as any)._tempEditMobile = `${code}${numericValue}`;
    }
  };

  // Initialize selected country and state code
  useEffect(() => {
    let currentCountryCode = '';
    if (user?.country) {
      const countries = Country.getAllCountries();
      const foundCountry = countries.find(c => c.name === user.country);
      if (foundCountry) {
        currentCountryCode = foundCountry.isoCode;
        setSelectedCountryCode(foundCountry.isoCode);
        setSelectedCountryName(foundCountry.name);
      }
    }

    if (user?.state && currentCountryCode) {
      const states = State.getStatesOfCountry(currentCountryCode);
      const foundState = states.find(s => s.name === user.state);
      if (foundState) {
        setSelectedStateCode(foundState.isoCode);
        setSelectedStateName(foundState.name);
      }
    }

    if (user?.district) {
      setSelectedDistrictName(user.district);
    }

    const mobile = user?.mobileNumber;
    if (mobile) {
      const match = countries.find(c => mobile.startsWith(c.code));
      if (match) {
        setCountryCode(match.code);
        setMobilePhoneValue(mobile.slice(match.code.length));
      } else {
        setMobilePhoneValue(mobile);
      }
    }
    if (user?.alternateNumber) setAlternatePhoneValue(user.alternateNumber);
    if (user?.email) setEmailInputValue(user.email);
  }, [user]);

  // ─── Countdown Timers ──────────────────────────────────────────────────────

  useEffect(() => {
    if (passwordTimer <= 0) return;
    const interval = setInterval(() => {
      setPasswordTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [passwordTimer]);

  useEffect(() => {
    if (deleteTimer <= 0) return;
    const interval = setInterval(() => {
      setDeleteTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [deleteTimer]);

  useEffect(() => {
    if (phoneTimer <= 0) return;
    const interval = setInterval(() => {
      setPhoneTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phoneTimer]);

  useEffect(() => {
    if (emailTimer <= 0) return;
    const interval = setInterval(() => {
      setEmailTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [emailTimer]);

  // ─── Unsaved Changes Warning ─────────────────────────────────────────────

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditingProfile) {
        e.preventDefault();
        e.returnValue = ''; // Standard way to trigger the browser warning dialog
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditingProfile]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── Box OTP Change Handlers ───────────────────────────────────────────────

  const handleBoxChange = (
    index: number,
    value: string,
    digits: string[],
    setDigits: React.Dispatch<React.SetStateAction<string[]>>,
    fieldPrefix: string
  ) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      setDigits(nextDigits);
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = numericValue.slice(-1);
    setDigits(nextDigits);

    // Auto-focus next input
    if (index < 5) {
      const nextInput = document.getElementById(`${fieldPrefix}-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleBoxKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    digits: string[],
    fieldPrefix: string
  ) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`${fieldPrefix}-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  };

  // ─── Picture Upload Handlers ───────────────────────────────────────────────

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File is too large. Maximum size is 20MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperState({ isOpen: true, imageSrc: reader.result as string, type: 'profile' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File is too large. Maximum size is 20MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperState({ isOpen: true, imageSrc: reader.result as string, type: 'cover' });
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── Change Password Handlers ──────────────────────────────────────────────

  const handleRequestOtp = async () => {
    if (!user) return;
    setIsRequestingOtp(true);
    setPasswordError('');
    try {
      await forgotPassword({ email: user.email });
      setIsOtpSent(true);
      setOtpDigits(['', '', '', '', '', '']);
      setPasswordTimer(120); // 2-min countdown
      toast.success('Verification OTP code sent. Redirecting to reset page...');
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(user.email)}`);
      }, 1500);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send OTP code');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!user) return;
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setPasswordError('Please enter the 6-digit OTP code');
      return;
    }
    if (passwordTimer <= 0) {
      setPasswordError('Verification code has expired. Please request a new OTP.');
      return;
    }

    setIsVerifyingOtp(true);
    setPasswordError('');
    try {
      await verifyResetOtp(fullOtp);
      setSavedOtp(fullOtp);
      setIsOtpVerified(true);
      toast.success('OTP verified successfully! You can now update your password.');
    } catch (err: any) {
      toast.error(err?.message || 'Verification failed. Please check the OTP code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsResettingPassword(true);
    setPasswordError('');
    try {
      await resetPassword({
        email: user.email,
        otp: savedOtp,
        password: newPassword,
      });
      toast.success('Password changed successfully!');

      // Reset password change UI
      setNewPassword('');
      setConfirmPassword('');
      setOtpDigits(['', '', '', '', '', '']);
      setSavedOtp('');
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setShowPasswordSection(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to change password. Please request a new OTP.');
      setIsOtpVerified(false);
      setOtpDigits(['', '', '', '', '', '']);
    } finally {
      setIsResettingPassword(false);
    }
  };

  // ─── Delete Account Handlers ───────────────────────────────────────────────

  const handleRequestDeleteOtp = async () => {
    if (!user) return;
    setIsRequestingDeleteOtp(true);
    try {
      await forgotPassword({ email: user.email });
      setIsDeleteOtpSent(true);
      setDeleteOtpDigits(['', '', '', '', '', '']);
      setDeleteTimer(120); // 2-min countdown
      toast.success('Verification OTP code sent to your email.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send OTP code');
    } finally {
      setIsRequestingDeleteOtp(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (confirmText.toLowerCase() !== 'delete') {
      toast.error('Please type "delete" to confirm');
      return;
    }
    const fullOtp = deleteOtpDigits.join('');
    if (fullOtp.length < 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }
    if (deleteTimer <= 0) {
      toast.error('Verification code has expired. Please request a new OTP.');
      return;
    }

    setIsVerifyingDeleteOtp(true);
    try {
      // First verify OTP
      await verifyResetOtp(fullOtp);

      // Then delete account
      setIsDeleting(true);
      await deleteAccount();
      toast.success('Account deleted successfully.');
    } catch (err: any) {
      toast.error(err?.message || 'Verification or deletion failed. Please check the OTP code.');
    } finally {
      setIsVerifyingDeleteOtp(false);
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setIsDeleteOtpSent(false);
    setDeleteOtpDigits(['', '', '', '', '', '']);
    setConfirmText('');
    setDeleteTimer(0);
  };

  const handleVerifyPhoneChange = async () => {
    const fullOtp = phoneOtpDigits.join('');
    if (fullOtp.length < 6) return;
    if (phoneTimer <= 0) return;

    setIsVerifyingPhoneOtp(true);
    try {
      await verifyPhoneChangeOtp(fullOtp);
      toast.success('Mobile number updated successfully!');
      setIsPhoneOtpModalOpen(false);
      setIsEditingProfile(false);
      setPhoneOtpDigits(['', '', '', '', '', '']);
      delete (window as any)._tempEditMobile;
    } catch (err: any) {
      toast.error(err?.message || 'Verification failed. Incorrect OTP.');
    } finally {
      setIsVerifyingPhoneOtp(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    const fullOtp = emailOtpDigits.join('');
    if (fullOtp.length < 6) return;
    if (emailTimer <= 0) return;

    setIsVerifyingEmailOtp(true);
    try {
      await verifyEmailChangeOtp(fullOtp);
      toast.success('Email updated successfully!');
      setIsEmailOtpModalOpen(false);
      setIsEditingProfile(false);
      delete (window as any)._tempEditEmail;
    } catch (err: any) {
      toast.error(err?.message || 'Verification failed. Incorrect OTP.');
    } finally {
      setIsVerifyingEmailOtp(false);
    }
  };

  const handleRequestEmailChangeDirectly = async () => {
    const newEmail = (window as any)._tempEditEmail || user?.email || '';
    if (!newEmail || newEmail.trim() === '') {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (newEmail.trim() === user?.email) {
      toast.error('Please enter a different email address to change it.');
      return;
    }
    setIsRequestingEmailOtp(true);
    try {
      await requestEmailChangeOtp(newEmail);
      setIsEmailOtpModalOpen(true);
      setEmailOtpDigits(['', '', '', '', '', '']);
      setEmailTimer(120);
      toast.success('Verification code sent to your new email address.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send OTP for email change.');
    } finally {
      setIsRequestingEmailOtp(false);
    }
  };

  const handleRequestPhoneChangeDirectly = async () => {
    const rawVal = mobilePhoneValue;
    const pendingPhone = `${countryCode}${rawVal}`;
    if (!rawVal || rawVal.trim() === '') {
      toast.error('Please enter a valid mobile number.');
      return;
    }
    if (pendingPhone === user?.mobileNumber) {
      toast.error('Please enter a different mobile number to change it.');
      return;
    }
    const validation = validatePhoneNumber(pendingPhone);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }
    setIsRequestingPhoneOtp(true);
    try {
      await requestPhoneChangeOtp(pendingPhone, countryCode);
      setIsPhoneOtpModalOpen(true);
      setPhoneOtpDigits(['', '', '', '', '', '']);
      setPhoneTimer(120);
      toast.success('Verification code sent to your email.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send OTP for mobile number.');
    } finally {
      setIsRequestingPhoneOtp(false);
    }
  };

  return (
    <ProtectedRoute>

      <div className="flex-1 overflow-y-auto px-3 md:px-5 py-4 space-y-5 w-full">
        <div className="space-y-0.5 mb-4">
          <h1 className="text-xl font-bold text-zinc-950 dark:text-white md:text-2xl font-outfit">Account Settings</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">Manage your system credentials and security options.</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 w-full items-start">

          {/* 1. Left Column: Settings Navigation Box */}
          <div className="w-full lg:w-[220px] xl:w-[240px] shrink-0 space-y-4">
            <div className="w-full space-y-2 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/60">
              <div className="px-2 py-1 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Settings Navigation
              </div>

              {/* Profile Details Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'profile' ? 'bg-teal-50 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300 border-2 border-teal-600 dark:border-teal-400 font-bold shadow-xs' : 'text-zinc-600 border-2 border-transparent hover:bg-zinc-50 hover:border-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:border-zinc-800'}`}
              >
                <UserIcon className="h-4.5 w-4.5 text-teal-700 dark:text-teal-400" />
                Profile Details
              </button>

              {/* Security Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'security' ? 'bg-teal-50 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300 border-2 border-teal-600 dark:border-teal-400 font-bold shadow-xs' : 'text-zinc-600 border-2 border-transparent hover:bg-zinc-50 hover:border-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:border-zinc-800'}`}
              >
                <Key className="h-4.5 w-4.5 text-teal-700 dark:text-teal-400" />
                Security
              </button>

              {/* Download Account Data Tab */}
              <button
                type="button"
                onClick={() => setActiveTab('download')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'download' ? 'bg-teal-50 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300 border-2 border-teal-600 dark:border-teal-400 font-bold shadow-xs' : 'text-zinc-600 border-2 border-transparent hover:bg-zinc-50 hover:border-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:border-zinc-800'}`}
              >
                <Download className="h-4.5 w-4.5 text-teal-700 dark:text-teal-400" />
                Download Account Data
              </button>

              {/* Delete My Account Tab (ONLY for regular employees, NOT Admin or Super Admin) */}
              {user?.role !== 'admin' && user?.role !== 'superadmin' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('danger')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === 'danger' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border-2 border-red-600 dark:border-red-500 font-bold shadow-xs' : 'text-zinc-600 border-2 border-transparent hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-900/10 dark:hover:text-red-400'}`}
                >
                  <Trash2 className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />
                  Delete My Account
                </button>
              )}
            </div>
          </div>

          {/* 2. Middle Column: Complete Your Profile Progress Widget Card (Renders ONLY on Profile Details Tab!) */}
          {activeTab === 'profile' && (
            <div className="w-full lg:w-[280px] xl:w-[300px] shrink-0">
              <ProfileCompletionCard user={user} />
            </div>
          )}

          {/* 3. Main Column: Active Tab Content (Profile Details / Security / Danger) */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {activeTab === 'profile' && (
              <div className="w-full rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/60 space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <UserIcon className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
                    Profile Details
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(!isEditingProfile);
                      setIsEmailEditable(false);
                      setIsPhoneEditable(false);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all border-2 cursor-pointer ${isEditingProfile ? 'bg-red-50 text-red-600 border-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-600' : 'bg-teal-50 text-teal-800 border-teal-600 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-400 shadow-xs'}`}
                  >
                    {isEditingProfile ? 'Cancel' : (<><Edit2 className="h-3.5 w-3.5" /> Edit Profile</>)}
                  </button>
                </div>
                  {/* Profile Banner & Avatar Section */}
                  <div className={`relative w-full mb-16 md:mb-6 ${!isEditingProfile ? 'pointer-events-none' : ''}`}>
                    {/* Cover Picture */}
                    <div className="h-32 sm:h-48 w-full bg-zinc-200 dark:bg-zinc-800 rounded-t-xl overflow-hidden relative group">
                      <label htmlFor="settings-cover-upload" className="block w-full h-full cursor-pointer">
                        <img
                          src={user?.coverPicture || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200'}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                          <Camera className="h-8 w-8 text-white" />
                        </div>
                      </label>
                      {isEditingProfile && user?.coverPicture && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                              await updateUser({ coverPicture: '' });
                              toast.success('Cover picture removed');
                            } catch (err) {
                              toast.error('Failed to remove cover picture');
                            }
                          }}
                          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <input
                        id="settings-cover-upload"
                        type="file"
                        accept="image/*"
                        onClick={(e) => { (e.target as any).value = '' }}
                        onChange={handleCoverPicChange}
                        className="hidden"
                      />
                    </div>

                    {/* Profile Avatar */}
                    <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0">
                      <div className="relative group">
                        <label htmlFor="settings-photo-upload" className="cursor-pointer block relative">
                          {user?.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user?.name || 'Profile'}
                              className="h-28 w-28 rounded-full object-cover ring-4 ring-white dark:ring-zinc-950 shadow-md transition-transform group-hover:scale-105 bg-white dark:bg-zinc-950"
                            />
                          ) : (
                            <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-teal-700 via-emerald-600 to-teal-500 text-white text-3xl font-extrabold flex items-center justify-center ring-4 ring-white dark:ring-zinc-950 shadow-md transition-transform group-hover:scale-105 select-none font-outfit uppercase">
                              {(() => {
                                const name = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}` || 'User';
                                const parts = name.trim().split(/\s+/);
                                if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
                                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                              })()}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                            <Camera className="h-7 w-7 text-white" />
                          </div>
                        </label>
                        {isEditingProfile && user?.profilePicture && (
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              try {
                                await updateUser({ profilePicture: '' });
                                toast.success('Profile picture removed');
                              } catch (err) {
                                toast.error('Failed to remove profile picture');
                              }
                            }}
                            className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <input
                          id="settings-photo-upload"
                          type="file"
                          accept="image/*"
                          onClick={(e) => { (e.target as any).value = '' }}
                          onChange={handleProfilePicChange}
                          className="hidden"
                        />
                        <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-green-500 border-4 border-white dark:border-zinc-950" title="Online" />
                      </div>
                    </div>
                  </div>

                  {/* Name and Role */}
                  <div className="flex flex-col items-center md:items-start md:pl-[160px] pb-6 mt-16 md:mt-2">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white font-outfit">{user?.name}</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Employee'}
                    </p>
                  </div>

                  {!isEditingProfile ? (
                    /* Read-Only Profile View (Displayed by Default - No Input Boxes!) */
                    <div className="w-full space-y-5 pt-2 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
                          <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">First Name</span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5 block">{user?.firstName || '—'}</span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
                          <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Last Name</span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5 block">{user?.lastName || '—'}</span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
                          <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Country</span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5 block flex items-center gap-2">
                            {selectedCountryCode ? (
                              <img
                                src={`https://flagcdn.com/w20/${selectedCountryCode.toLowerCase()}.png`}
                                alt={user?.country || 'Country'}
                                className="w-5 shadow-xs rounded-[2px]"
                              />
                            ) : null}
                            <span>{user?.country || 'India'}</span>
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
                          <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Gender</span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5 block capitalize">{user?.gender || '—'}</span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
                          <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Mobile Number</span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5 block flex items-center justify-between">
                            {(() => {
                              if (!user?.mobileNumber) return '—';
                              const num = user.mobileNumber.trim();
                              if (num.startsWith('+91')) {
                                return `+91 ${num.slice(3)}`;
                              }
                              if (num.startsWith('+1')) {
                                return `+1 ${num.slice(2)}`;
                              }
                              if (num.startsWith('+')) {
                                const match = num.match(/^(\+\d{2})(\d+)$/);
                                return match ? `${match[1]} ${match[2]}` : num;
                              }
                              if (/^\d{10}$/.test(num)) return `+91 ${num}`;
                              return num;
                            })()}
                            {user?.mobileNumber && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">Verified</span>
                            )}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
                          <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Email Address</span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5 block flex items-center justify-between">
                            {user?.email || '—'}
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">Verified</span>
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
                          <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Qualification</span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5 block capitalize">{user?.qualification || 'Bachelor'}</span>
                        </div>
                        <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
                          <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Role</span>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5 block capitalize">{user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Employee'}</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
                        <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Address</span>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5 block">{user?.permanentAddress || '—'}</span>
                      </div>
                      <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
                        <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Biography</span>
                        <span className="text-sm font-normal text-zinc-700 dark:text-zinc-300 mt-0.5 block leading-relaxed">{user?.biography || 'No biography added yet.'}</span>
                      </div>
                    </div>
                  ) : (
                    /* Interactive Form Input Boxes (Displayed ONLY when Edit Profile is clicked!) */
                    <div className="w-full space-y-4 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative mt-2">
                        <input
                          id="settings-first-name"
                          type="text"
                          placeholder=" "
                          maxLength={50}
                          defaultValue={user?.firstName}
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^A-Za-z]/g, '');
                            if (val.length > 0) {
                              val = val.charAt(0).toUpperCase() + val.slice(1);
                            }
                            e.target.value = val;
                            if (typeof window !== 'undefined') {
                              (window as any)._tempEditFirstName = val;
                            }
                          }}
                          className={`${inputBase} ${inputNormal} px-3.5 py-3`}
                        />
                        <label htmlFor="settings-first-name" className={floatingLabelNormal}>First Name <span className="text-red-500">*</span></label>
                      </div>
                      <div className="relative mt-2">
                        <input
                          id="settings-last-name"
                          type="text"
                          placeholder=" "
                          maxLength={50}
                          defaultValue={user?.lastName}
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^A-Za-z ]/g, '');
                            val = val.replace(/^\s+/, ''); // Remove leading spaces
                            val = val.replace(/\s{2,}/g, ' '); // Allow max one space consecutively

                            if (val.length > 0) {
                              val = val.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                            }
                            e.target.value = val;
                            if (typeof window !== 'undefined') {
                              (window as any)._tempEditLastName = val;
                            }
                          }}
                          className={`${inputBase} ${inputNormal} px-3.5 py-3`}
                        />
                        <label htmlFor="settings-last-name" className={floatingLabelNormal}>Last Name <span className="text-red-500">*</span></label>
                      </div>
                      <div className="relative mt-2">
                        <Select
                          instanceId="country-select"
                          options={Country.getAllCountries().map(c => ({
                            value: c.name,
                            label: (
                              <div className="flex items-center gap-2">
                                <img src={`https://flagcdn.com/w20/${c.isoCode.toLowerCase()}.png`} alt={c.name} className="w-5" />
                                <span>{c.name}</span>
                              </div>
                            ),
                            country: c
                          }))}
                          value={
                            selectedCountryCode ? {
                              value: selectedCountryName,
                              label: (
                                <div className="flex items-center gap-2">
                                  <img src={`https://flagcdn.com/w20/${selectedCountryCode.toLowerCase()}.png`} alt={selectedCountryName} className="w-5" />
                                  <span>{selectedCountryName}</span>
                                </div>
                              )
                            } : null
                          }
                          onChange={(selectedOption: any) => {
                            if (!selectedOption) return;
                            const newCode = selectedOption.country.isoCode;
                            const newName = selectedOption.country.name;
                            setSelectedCountryCode(newCode);
                            setSelectedCountryName(newName);

                            // Reset state and district when country changes
                            setSelectedStateCode('');
                            setSelectedStateName('');
                            setSelectedDistrictName('');

                            if (typeof window !== 'undefined') {
                              (window as any)._tempEditCountry = newName;
                              (window as any)._tempEditState = '';
                              (window as any)._tempEditDistrict = '';
                            }
                          }}
                          placeholder="Select Country"
                          classNames={reactSelectClassNames}
                          className="text-sm peer"
                          onInputChange={(inputValue, { action }) => {
                            if (action === 'input-change') {
                              let val = inputValue.replace(/[^a-zA-Z]/g, '');
                              if (val.length > 0) {
                                val = val.charAt(0).toUpperCase() + val.slice(1);
                              }
                              return val;
                            }
                            return inputValue;
                          }}
                        />
                        <label htmlFor="settings-country" className="absolute left-3 px-1 pointer-events-none bg-white dark:bg-zinc-900 -top-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-500 z-10 transition-all peer-focus:text-blue-600 dark:peer-focus:text-blue-500">Country <span className="text-red-500">*</span></label>
                      </div>
                      <div className="relative mt-2">
                        <select
                          id="settings-gender"
                          defaultValue={user?.gender || ''}
                          onChange={(e) => {
                            if (typeof window !== 'undefined') {
                              (window as any)._tempEditGender = e.target.value;
                            }
                          }}
                          className={`${inputBase} ${inputNormal} px-3.5 py-3 appearance-none`}
                        >
                          <option value="" disabled hidden>Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <label htmlFor="settings-gender" className="absolute left-3 px-1 transition-all duration-200 pointer-events-none bg-white dark:bg-zinc-900 -top-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-500 peer-focus:text-blue-600 dark:peer-focus:text-blue-500">Gender <span className="text-red-500">*</span></label>
                      </div>
                      <div className="flex flex-col gap-1.5 w-full mt-2">
                        <div className="flex gap-2">
                          <div
                            ref={countryDropdownRef}
                            className={`relative flex items-center bg-white dark:bg-zinc-900 rounded-xl border-2 border-zinc-500 dark:border-zinc-600 shadow-sm hover:border-zinc-700 dark:hover:border-zinc-500 px-3 py-3 text-sm font-semibold focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 shrink-0 w-[105px] transition-colors ${!isPhoneEditable ? 'opacity-65 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900/50' : 'cursor-pointer'}`}
                            onClick={() => isPhoneEditable && setIsCountryDropdownOpen(!isCountryDropdownOpen)}
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
                              <span className="text-zinc-700 dark:text-zinc-300 truncate">{countryCode}</span>
                            </div>

                            {isPhoneEditable && isCountryDropdownOpen && (
                              <div className="absolute top-full left-0 mt-2 w-[280px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                                  <input
                                    type="text"
                                    autoFocus
                                    placeholder="Search country..."
                                    value={countrySearchQuery}
                                    onChange={(e) => {
                                      let val = e.target.value.replace(/[^a-zA-Z]/g, '');
                                      if (val.length > 0) {
                                        val = val.charAt(0).toUpperCase() + val.slice(1);
                                      }
                                      setCountrySearchQuery(val);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-500 dark:placeholder:text-zinc-600"
                                  />
                                </div>
                                <ul className="max-h-[250px] overflow-y-auto py-1 flex flex-col gap-0.5">
                                  {countries.filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) || c.code.includes(countrySearchQuery)).map((c, idx) => (
                                    <li
                                      key={`${c.name}-${idx}`}
                                      className="px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-3 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCountryCode(c.code);
                                        if (mobilePhoneValue.length > c.maxLength) {
                                          handleMobileChange(mobilePhoneValue.slice(0, c.maxLength), c.code);
                                        } else {
                                          handleMobileChange(mobilePhoneValue, c.code);
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
                            <input
                              id="settings-mobile"
                              type="text"
                              inputMode="numeric"
                              value={mobilePhoneValue}
                              readOnly={!isPhoneEditable}
                              onChange={(e) => handleMobileChange(e.target.value, countryCode)}
                              placeholder=" "
                              className={`${inputBase} ${!isPhoneEditable ? inputDisabled : inputNormal} pl-3.5 pr-24 py-3`}
                            />
                            <label htmlFor="settings-mobile" className={!isPhoneEditable ? floatingLabelDisabled : floatingLabelNormal}>
                              Mobile Number <span className="text-red-500">*</span>
                            </label>
                            {user?.isVerified && !isPhoneEditable && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-600 dark:text-emerald-400 select-none">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Verified
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (!isPhoneEditable) {
                                setIsPhoneEditable(true);
                              } else {
                                handleRequestPhoneChangeDirectly();
                              }
                            }}
                            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                          >
                            {isPhoneEditable ? 'Send OTP' : 'Change Mobile'}
                          </button>
                        </div>
                      </div>
                      <div className="relative mt-2 flex flex-col gap-1.5">
                        <div className="relative">
                          <input
                            id="settings-email"
                            type="email"
                            placeholder=" "
                            value={emailInputValue}
                            readOnly={!isEmailEditable}
                            onChange={(e) => {
                              setEmailInputValue(e.target.value);
                              if (typeof window !== 'undefined') {
                                (window as any)._tempEditEmail = e.target.value;
                              }
                            }}
                            className={`${inputBase} ${!isEmailEditable ? inputDisabled : inputNormal} pl-3.5 pr-24 py-3`}
                          />
                          <label htmlFor="settings-email" className={!isEmailEditable ? floatingLabelDisabled : floatingLabelNormal}>Email Address <span className="text-red-500">*</span></label>
                          {user?.isVerified && !isEmailEditable && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-600 dark:text-emerald-400 select-none">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Verified
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (!isEmailEditable) {
                                setIsEmailEditable(true);
                              } else {
                                handleRequestEmailChangeDirectly();
                              }
                            }}
                            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
                          >
                            {isEmailEditable ? 'Send OTP' : 'Change Email'}
                          </button>
                        </div>
                      </div>
                      <div className="relative mt-2">
                        <input
                          id="settings-qualification"
                          type="text"
                          placeholder=" "
                          defaultValue={user?.qualification}
                          onChange={(e) => {
                            if (typeof window !== 'undefined') {
                              (window as any)._tempEditQualification = e.target.value;
                            }
                          }}
                          className={`${inputBase} ${inputNormal} px-3.5 py-3`}
                        />
                        <label htmlFor="settings-qualification" className={floatingLabelNormal}>Qualification <span className="text-red-500">*</span></label>
                      </div>
                      <div className="relative mt-2">
                        <input
                          id="settings-role"
                          type="text"
                          placeholder=" "
                          defaultValue={user?.role}
                          readOnly
                          className={`${inputBase} ${inputDisabled} px-3.5 py-3 capitalize`}
                        />
                        <label htmlFor="settings-role" className={floatingLabelDisabled}>Role <span className="text-red-500">*</span></label>
                      </div>
                      <div className="relative mt-2 sm:col-span-2">
                        <input
                          id="settings-address"
                          type="text"
                          placeholder=" "
                          defaultValue={user?.permanentAddress}
                          onChange={(e) => {
                            if (typeof window !== 'undefined') {
                              (window as any)._tempEditPermanentAddress = e.target.value;
                            }
                          }}
                          className={`${inputBase} ${inputNormal} px-3.5 py-3`}
                        />
                        <label htmlFor="settings-address" className={floatingLabelNormal}>Address <span className="text-red-500">*</span></label>
                      </div>


                      <div className="relative mt-4 sm:col-span-2">
                        <textarea
                          id="settings-biography"
                          placeholder=" "
                          defaultValue={user?.biography || ''}
                          rows={4}
                          onChange={(e) => {
                            if (typeof window !== 'undefined') {
                              (window as any)._tempEditBiography = e.target.value;
                            }
                          }}
                          className={`${inputBase} ${inputNormal} px-3.5 py-3 resize-none`}
                        />
                        <label htmlFor="settings-biography" className={floatingLabelNormal}>Biography</label>
                      </div>
                    </div>
                    {isEditingProfile && (
                      <button
                        type="button"
                        onClick={async (e) => {
                          const btn = e.currentTarget;
                          const prevText = btn.innerHTML;
                          btn.innerHTML = 'Saving...';
                          btn.disabled = true;
                          try {
                            const updates: any = {};
                            if ((window as any)._tempEditFirstName !== undefined) updates.firstName = (window as any)._tempEditFirstName;
                            if ((window as any)._tempEditLastName !== undefined) updates.lastName = (window as any)._tempEditLastName;

                            // Also derive 'name' if either firstName or lastName is updated
                            if ((window as any)._tempEditFirstName !== undefined || (window as any)._tempEditLastName !== undefined) {
                              const fName = (window as any)._tempEditFirstName !== undefined ? (window as any)._tempEditFirstName : (user?.firstName || '');
                              const lName = (window as any)._tempEditLastName !== undefined ? (window as any)._tempEditLastName : (user?.lastName || '');
                              updates.name = `${fName} ${lName}`.trim();
                            }

                            if ((window as any)._tempEditCountry !== undefined) updates.country = (window as any)._tempEditCountry;
                            let requiresPhoneVerification = false;
                            let pendingPhone = '';
                            let requiresEmailVerification = false;
                            let pendingEmail = '';

                            if ((window as any)._tempEditEmail !== undefined && (window as any)._tempEditEmail !== user?.email) {
                               requiresEmailVerification = true;
                               pendingEmail = (window as any)._tempEditEmail;
                            }

                            if ((window as any)._tempEditMobile !== undefined && (window as any)._tempEditMobile !== user?.mobileNumber) {
                              const sanitized = sanitizePhoneNumber((window as any)._tempEditMobile);
                              if (sanitized) {
                                const validation = validatePhoneNumber(sanitized);
                                if (!validation.isValid) {
                                  toast.error(`Mobile Number: ${validation.error}`);
                                  btn.innerHTML = prevText;
                                  btn.disabled = false;
                                  return;
                                }
                                requiresPhoneVerification = true;
                                pendingPhone = sanitized;
                              }
                            }
                            if ((window as any)._tempEditGender) updates.gender = (window as any)._tempEditGender;
                            if ((window as any)._tempEditQualification) updates.qualification = (window as any)._tempEditQualification;
                            if ((window as any)._tempEditPermanentAddress !== undefined) updates.permanentAddress = (window as any)._tempEditPermanentAddress;
                            if ((window as any)._tempEditCurrentAddress !== undefined) updates.currentAddress = (window as any)._tempEditCurrentAddress;

                            if ((window as any)._tempEditAlternateNumber !== undefined) {
                              const sanitizedAlt = sanitizePhoneNumber((window as any)._tempEditAlternateNumber);
                              if (sanitizedAlt) {
                                const validationAlt = validatePhoneNumber(sanitizedAlt);
                                if (!validationAlt.isValid) {
                                  toast.error(`Alternate Number: ${validationAlt.error}`);
                                  btn.innerHTML = prevText;
                                  btn.disabled = false;
                                  return;
                                }
                              }
                              updates.alternateNumber = sanitizedAlt;
                            }

                            if ((window as any)._tempEditCountry !== undefined) {
                              updates.country = (window as any)._tempEditCountry;
                            } else if (!user?.country) {
                              updates.country = selectedCountryName || 'India';
                            }
                            if ((window as any)._tempEditState !== undefined) updates.state = (window as any)._tempEditState;
                            if ((window as any)._tempEditDistrict !== undefined) updates.district = (window as any)._tempEditDistrict;
                            if ((window as any)._tempEditBiography !== undefined) updates.biography = (window as any)._tempEditBiography;

                            if (Object.keys(updates).length > 0) {
                              await updateUser(updates);
                              toast.success('Profile updated successfully!');
                            }
                            
                            if (requiresPhoneVerification) {
                               setIsRequestingPhoneOtp(true);
                               try {
                                 await requestPhoneChangeOtp(pendingPhone, countryCode);
                                 setIsPhoneOtpModalOpen(true);
                                 setPhoneOtpDigits(['', '', '', '', '', '']);
                                 setPhoneTimer(120);
                                 toast.success('Verification code sent to your email.');
                               } catch (err: any) {
                                 toast.error(err?.message || 'Failed to send OTP for mobile number.');
                               } finally {
                                 setIsRequestingPhoneOtp(false);
                               }
                            } else if (requiresEmailVerification) {
                               setIsRequestingEmailOtp(true);
                               try {
                                 await requestEmailChangeOtp(pendingEmail);
                                 setIsEmailOtpModalOpen(true);
                                 setEmailOtpDigits(['', '', '', '', '', '']);
                                 setEmailTimer(120);
                                 toast.success('Verification code sent to your new email address.');
                               } catch (err: any) {
                                 toast.error(err?.message || 'Failed to send OTP for email change.');
                               } finally {
                                 setIsRequestingEmailOtp(false);
                               }
                            } else {
                               setIsEditingProfile(false);
                            }
                          } catch (err: any) {
                            toast.error(err?.message || 'Failed to update profile');
                          } finally {
                            btn.innerHTML = prevText;
                            btn.disabled = false;
                          }
                        }}
                        className="flex items-center gap-1.5 py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                      >
                        Save Changes
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── SECURITY TAB: Password Change & Credential Management ── */}
            {activeTab === 'security' && (
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/60 space-y-5">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                  <Key className="h-4.5 w-4.5 text-blue-500" />
                  Security (Change Credentials)
                </h2>

                {passwordError && (
                  <div className="p-3.5 text-xs text-red-650 bg-red-50 dark:bg-red-950/10 border border-red-150 dark:border-red-900/55 rounded-xl max-w-xl animate-in slide-in-from-top-1.5 duration-200">
                    {passwordError}
                  </div>
                )}

                <div className="max-w-xl space-y-4">
                  {!showPasswordSection ? (
                    <div className="space-y-3">
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Update your account login password periodically to keep your workspace secure.</p>
                      <button
                        type="button"
                        onClick={() => setShowPasswordSection(true)}
                        className="flex items-center gap-1.5 py-2 px-5 rounded-xl border-2 border-zinc-600 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                      >
                        🔑 Request Password Change
                      </button>
                    </div>
                  ) : !isOtpVerified ? (
                    <div className="space-y-4 p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200/65 dark:border-zinc-800/65 animate-in fade-in duration-200">
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        For security, we must verify your identity. Let us send a 6-digit verification code to your registered email: <span className="font-bold text-zinc-900 dark:text-white">{user?.email}</span>.
                      </p>

                      {!isOtpSent ? (
                        <button
                          type="button"
                          onClick={handleRequestOtp}
                          disabled={isRequestingOtp}
                          className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                        >
                          {isRequestingOtp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          Send Verification OTP
                        </button>
                      ) : (
                        <div className="space-y-4 animate-in fade-in duration-150">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Verification OTP Code</label>
                              {passwordTimer > 0 ? (
                                <span className="text-xs text-blue-650 dark:text-blue-450 font-bold flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 animate-pulse" /> Expires in: {formatTimer(passwordTimer)}
                                </span>
                              ) : (
                                <span className="text-xs text-red-550 dark:text-red-450 font-bold">Code Expired!</span>
                              )}
                            </div>

                            <div className="flex gap-2.5 justify-center py-2">
                              {otpDigits.map((digit, idx) => (
                                <input
                                  key={idx}
                                  id={`pass-otp-${idx}`}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={digit}
                                  disabled={passwordTimer <= 0}
                                  onChange={(e) => handleBoxChange(idx, e.target.value, otpDigits, setOtpDigits, 'pass-otp')}
                                  onKeyDown={(e) => handleBoxKeyDown(idx, e, otpDigits, 'pass-otp')}
                                  className="w-12 h-12 text-center text-xl font-bold bg-white dark:bg-zinc-900 border-2 border-zinc-600 dark:border-zinc-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-50 text-zinc-950 dark:text-zinc-50"
                                />
                              ))}
                            </div>
                            {passwordTimer <= 0 && (
                              <p className="text-[10px] text-red-550 dark:text-red-450 font-medium">OTP has expired. Please click "Back" and request a new verification code.</p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsOtpSent(false);
                                setOtpDigits(['', '', '', '', '', '']);
                                setPasswordTimer(0);
                              }}
                              className="flex-1 py-2 px-4 rounded-xl border-2 border-zinc-600 dark:border-zinc-600 text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:bg-zinc-150 dark:hover:bg-zinc-900 transition cursor-pointer"
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              onClick={handleVerifyOtp}
                              disabled={isVerifyingOtp || otpDigits.some(d => !d) || passwordTimer <= 0}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                            >
                              {isVerifyingOtp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                              Verify OTP Code
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 p-4 rounded-xl bg-blue-50/20 dark:bg-blue-950/10 border border-blue-100/20 dark:border-blue-900/20 animate-in zoom-in-95 duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="settings-password" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">New Password</label>
                          <div className="relative">
                            <input
                              id="settings-password"
                              type={showPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border-2 border-zinc-600 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              placeholder="At least 8 characters"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-650 cursor-pointer"
                            >
                              {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="settings-confirm-password" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Confirm Password</label>
                          <input
                            id="settings-confirm-password"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-zinc-600 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 outline-none transition focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="Repeat password"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          onClick={() => setIsOtpVerified(false)}
                          className="py-2 px-4 rounded-xl border-2 border-zinc-600 dark:border-zinc-600 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdatePassword}
                          disabled={isResettingPassword || !newPassword || !confirmPassword}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                        >
                          {isResettingPassword && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          Save New Password
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── DOWNLOAD ACCOUNT DATA TAB ── */}
            {activeTab === 'download' && (
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/60 space-y-4">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                  <Download className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
                  Download Account Data (DPDP Act 2023)
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                  Under the Digital Personal Data Protection Act (2023), you have the right to data portability. Click below to download a complete, machine-readable digital export copy of all your personal records, system profile info, activity logs, and account details.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        toast.info('Generating official PDF Personal Data Export...');
                        exportUserDataPDF(user);
                        toast.success('PDF Personal Data Export downloaded successfully!');
                      } catch (err) {
                        toast.error('Failed to generate PDF export document.');
                      }
                    }}
                    className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-teal-700 hover:bg-teal-800 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Download My Personal Data PDF (DPDP)
                  </button>
                </div>
              </div>
            )}

            {/* ── DELETE MY ACCOUNT TAB (ONLY FOR REGULAR EMPLOYEES, HIDDEN FOR ADMIN & SUPER ADMIN) ── */}
            {activeTab === 'danger' && user?.role !== 'admin' && user?.role !== 'superadmin' && (
              <div className="rounded-2xl border border-red-200/60 bg-red-50/20 p-6 shadow-sm dark:border-red-950/20 space-y-5">
                <h2 className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2 border-b border-red-100/40 dark:border-red-950/30 pb-3">
                  <ShieldAlert className="h-4.5 w-4.5" />
                  Delete My Account (Right to Erasure)
                </h2>

                <div className="space-y-4 max-w-2xl">
                  <p className="text-xs text-red-650/90 dark:text-red-400/90 leading-relaxed">
                    Deleting your account is permanent and irreversible. Under the Digital Personal Data Protection Act (2023), requesting erasure will permanently purge all your personal records, credentials, logs, and profile data from the server database.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPurgePassword('');
                        setIsPurgeModalOpen(true);
                      }}
                      className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      Purge My Account & PII (Right to Erasure)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="flex items-center gap-2 py-2.5 px-4 rounded-xl border border-red-300 dark:border-red-800 bg-white hover:bg-red-50 text-xs font-bold text-red-600 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-950/40 transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete My Profile Permanently
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      {/* Terms and Conditions Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border-2 border-zinc-600 dark:border-zinc-600 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Terms & Conditions (Registration & Profile Update)</h3>
              <button onClick={() => setIsTermsModalOpen(false)} className="text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300">
                <Trash2 className="w-5 h-5 hidden" />
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
              <p>By registering an account or updating your profile in the Employee Management System (&quot;EMS&quot;), you agree to the following terms:</p>

              <div><strong className="text-zinc-900 dark:text-white">Accurate Information</strong><br />You agree to provide accurate, complete, and up-to-date personal and professional information during registration and profile updates. Providing false or misleading information may result in account suspension or termination.</div>

              <div><strong className="text-zinc-900 dark:text-white">Account Responsibility</strong><br />You are responsible for maintaining the confidentiality of your login credentials. You must not share your username, password, or verification codes with anyone. Any activity performed using your account is your responsibility.</div>

              <div><strong className="text-zinc-900 dark:text-white">Profile Updates</strong><br />You may update your personal information whenever necessary. Certain fields, such as Employee ID, Company Email, Role, Department, or other official records, may only be modified by authorized administrators.</div>

              <div><strong className="text-zinc-900 dark:text-white">Data Privacy</strong><br />Your personal information will be collected, stored, and processed only for employment-related purposes, including account management, communication, attendance, payroll, and other HR operations. Your information will be handled securely and in accordance with the organization&apos;s Privacy Policy.</div>

              <div><strong className="text-zinc-900 dark:text-white">Acceptable Use</strong><br />You agree to use the system only for legitimate business purposes. You must not upload harmful, offensive, misleading, or illegal content, attempt unauthorized access, interfere with system security, or misuse the platform in any way.</div>

              <div><strong className="text-zinc-900 dark:text-white">Security Monitoring</strong><br />For security, compliance, and audit purposes, the system may record login history, profile updates, password changes, and other account activities. These records may be reviewed by authorized personnel when necessary.</div>

              <div><strong className="text-zinc-900 dark:text-white">Account Suspension</strong><br />The organization reserves the right to suspend, restrict, or terminate your account if you violate these Terms & Conditions, provide false information, misuse the system, or engage in unauthorized activities.</div>

              <div><strong className="text-zinc-900 dark:text-white">System Availability</strong><br />While every effort is made to ensure uninterrupted access, the system may occasionally be unavailable due to maintenance, updates, or technical issues. The organization is not responsible for temporary service interruptions.</div>

              <div><strong className="text-zinc-900 dark:text-white">Changes to Terms</strong><br />These Terms & Conditions may be updated from time to time. Continued use of the Employee Management System after any changes indicates your acceptance of the revised terms.</div>
            </div>
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {isPhoneOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border-2 border-zinc-600 dark:border-zinc-600 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3 text-blue-600">
              <div className="bg-blue-100 dark:bg-blue-950/50 p-2 rounded-xl shrink-0">
                <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Verify Mobile Number Change</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-normal">
                  We've sent a 6-digit OTP code to your registered email: <span className="font-bold text-zinc-900 dark:text-white">{user?.email}</span>. Please enter it below to confirm your new mobile number.
                </p>
              </div>
            </div>

            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-blue-700 dark:text-blue-400">Verification OTP Code</label>
                  {phoneTimer > 0 ? (
                    <span className="text-xs text-blue-650 dark:text-blue-450 font-bold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 animate-pulse" /> Expires in: {formatTimer(phoneTimer)}
                    </span>
                  ) : (
                    <span className="text-xs text-red-550 dark:text-red-450 font-bold">Code Expired!</span>
                  )}
                </div>

                <div className="flex gap-2.5 justify-center py-2">
                  {phoneOtpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`phone-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      disabled={phoneTimer <= 0}
                      onChange={(e) => handleBoxChange(idx, e.target.value, phoneOtpDigits, setPhoneOtpDigits, 'phone-otp')}
                      onKeyDown={(e) => handleBoxKeyDown(idx, e, phoneOtpDigits, 'phone-otp')}
                      className="w-12 h-12 text-center text-xl font-bold bg-white dark:bg-zinc-900 border-2 border-zinc-600 dark:border-zinc-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-50 text-zinc-950 dark:text-zinc-50"
                    />
                  ))}
                </div>
              </div>

              {phoneTimer <= 0 && (
                <p className="text-[10px] text-red-550 dark:text-red-450 font-medium">OTP has expired. Please cancel and request a new code.</p>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                     setIsPhoneOtpModalOpen(false);
                     setPhoneTimer(0);
                     setPhoneOtpDigits(['', '', '', '', '', '']);
                     delete (window as any)._tempEditMobile;
                  }}
                  className="flex-1 py-2 px-4 rounded-xl border-2 border-zinc-600 dark:border-zinc-600 text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyPhoneChange}
                  disabled={isVerifyingPhoneOtp || phoneOtpDigits.some(d => !d) || phoneTimer <= 0}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {isVerifyingPhoneOtp ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  Verify Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEmailOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border-2 border-zinc-600 dark:border-zinc-600 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3 text-blue-600">
              <div className="bg-blue-100 dark:bg-blue-950/50 p-2 rounded-xl shrink-0">
                <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Verify Email Address Change</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-normal">
                  We've sent a 6-digit OTP code to your new email address. Please enter it below to confirm your new email address.
                </p>
              </div>
            </div>

            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-blue-700 dark:text-blue-400">Verification OTP Code</label>
                  {emailTimer > 0 ? (
                    <span className="text-xs text-blue-650 dark:text-blue-450 font-bold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 animate-pulse" /> Expires in: {formatTimer(emailTimer)}
                    </span>
                  ) : (
                    <span className="text-xs text-red-550 dark:text-red-450 font-bold">Code Expired!</span>
                  )}
                </div>

                <div className="flex gap-2.5 justify-center py-2">
                  {emailOtpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`email-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      disabled={emailTimer <= 0}
                      onChange={(e) => handleBoxChange(idx, e.target.value, emailOtpDigits, setEmailOtpDigits, 'email-otp')}
                      onKeyDown={(e) => handleBoxKeyDown(idx, e, emailOtpDigits, 'email-otp')}
                      className="w-12 h-12 text-center text-xl font-bold bg-white dark:bg-zinc-900 border-2 border-zinc-600 dark:border-zinc-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-50 text-zinc-950 dark:text-zinc-50"
                    />
                  ))}
                </div>
              </div>

              {emailTimer <= 0 && (
                <p className="text-[10px] text-red-550 dark:text-red-450 font-medium">OTP has expired. Please cancel and request a new code.</p>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                     setIsEmailOtpModalOpen(false);
                     setEmailTimer(0);
                     setEmailOtpDigits(['', '', '', '', '', '']);
                  }}
                  className="flex-1 py-2 px-4 rounded-xl border-2 border-zinc-600 dark:border-zinc-600 text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyEmailChange}
                  disabled={isVerifyingEmailOtp || emailOtpDigits.some(d => !d) || emailTimer <= 0}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {isVerifyingEmailOtp ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  Verify Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEmailOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border-2 border-zinc-600 dark:border-zinc-600 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3 text-blue-600">
              <div className="bg-blue-100 dark:bg-blue-950/50 p-2 rounded-xl shrink-0">
                <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Verify Email Address Change</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-normal">
                  We've sent a 6-digit OTP code to your registered mobile number: <span className="font-bold text-zinc-900 dark:text-white">{user?.mobileNumber}</span>. Please enter it below to confirm your new email address.
                </p>
              </div>
            </div>

            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-blue-700 dark:text-blue-400">Verification OTP Code</label>
                  {emailTimer > 0 ? (
                    <span className="text-xs text-blue-650 dark:text-blue-450 font-bold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 animate-pulse" /> Expires in: {formatTimer(emailTimer)}
                    </span>
                  ) : (
                    <span className="text-xs text-red-550 dark:text-red-450 font-bold">Code Expired!</span>
                  )}
                </div>

                <div className="flex gap-2.5 justify-center py-2">
                  {emailOtpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`email-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      disabled={emailTimer <= 0}
                      onChange={(e) => handleBoxChange(idx, e.target.value, emailOtpDigits, setEmailOtpDigits, 'email-otp')}
                      onKeyDown={(e) => handleBoxKeyDown(idx, e, emailOtpDigits, 'email-otp')}
                      className="w-12 h-12 text-center text-xl font-bold bg-white dark:bg-zinc-900 border-2 border-zinc-600 dark:border-zinc-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-50 text-zinc-950 dark:text-zinc-50"
                    />
                  ))}
                </div>
              </div>

              {emailTimer <= 0 && (
                <p className="text-[10px] text-red-550 dark:text-red-450 font-medium">OTP has expired. Please cancel and request a new code.</p>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                     setIsEmailOtpModalOpen(false);
                     setEmailTimer(0);
                     setEmailOtpDigits(['', '', '', '', '', '']);
                     delete (window as any)._tempEditEmail;
                  }}
                  className="flex-1 py-2 px-4 rounded-xl border-2 border-zinc-600 dark:border-zinc-600 text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerifyEmailChange}
                  disabled={isVerifyingEmailOtp || emailOtpDigits.some(d => !d) || emailTimer <= 0}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {isVerifyingEmailOtp ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}
                  Verify Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ImageCropperModal
        isOpen={cropperState.isOpen}
        imageSrc={cropperState.imageSrc}
        onClose={() => setCropperState(prev => ({ ...prev, isOpen: false }))}
        cropShape={cropperState.type === 'profile' ? 'round' : 'rect'}
        aspectRatio={cropperState.type === 'profile' ? 1 : 16 / 9}
        onSave={async (croppedBase64) => {
          if (cropperState.type === 'profile') {
            await updateUser({ profilePicture: croppedBase64 });
            toast.success('Profile picture updated!');
          } else {
            await updateUser({ coverPicture: croppedBase64 });
            toast.success('Cover picture updated!');
          }
        }}
      />

      {/* ── CUSTOM ENTERPRISE DPDP RIGHT TO ERASURE PURGE MODAL ── */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border-2 border-red-500/40 dark:border-red-600/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-red-50/50 dark:bg-red-950/20">
              <h3 className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                DPDP Act 2023: Right to Erasure Account Purge
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsPurgeModalOpen(false);
                  setPurgePassword('');
                }}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-2xl font-bold leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 space-y-1.5">
                <p className="font-bold text-red-800 dark:text-red-300 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                  WARNING: This action is permanent and irreversible!
                </p>
                <p className="text-red-700/90 dark:text-red-400/90 leading-relaxed text-[11px]">
                  Under the Digital Personal Data Protection Act (2023), purging your account will permanently erase your personal identity, login credentials, task history, and PII from our database.
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <label htmlFor="purge-password-input" className="block font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                  Enter your password to authorize permanent account purge:
                </label>
                <input
                  id="purge-password-input"
                  type="password"
                  value={purgePassword}
                  onChange={(e) => setPurgePassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-900 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsPurgeModalOpen(false);
                  setPurgePassword('');
                }}
                className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!purgePassword || isPurgingAccount}
                onClick={async () => {
                  if (!purgePassword) return;
                  setIsPurgingAccount(true);
                  try {
                    toast.info('Purging account data...');
                    const response = await axiosInstance.delete('/auth/me/purge', { data: { password: purgePassword } });
                    if (response.data?.success) {
                      toast.success('Your account data has been permanently purged.');
                      window.localStorage.removeItem('auth_user');
                      window.location.href = '/login';
                    }
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || 'Failed to purge account data. Incorrect password.');
                  } finally {
                    setIsPurgingAccount(false);
                  }
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-xs font-bold text-white shadow-sm transition cursor-pointer"
              >
                {isPurgingAccount ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Purging...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" /> Confirm Permanent Purge
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}
