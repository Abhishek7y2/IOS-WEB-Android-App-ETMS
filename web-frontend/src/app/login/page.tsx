'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { requestLoginOtp, loginWithOtp } from '../../api/auth';
import { Eye, EyeOff, Mail, Lock, ClipboardCheck, Phone, Clock, ArrowLeft, User, Briefcase, Network, CheckCircle } from 'lucide-react';
import { validateMobileNumber } from '../../utils/phoneValidator';
import { countries } from '../../constants/countries';

const inputBase =
  'peer w-full rounded-xl border-2 shadow-sm text-sm text-zinc-950 dark:text-zinc-50 bg-white dark:bg-zinc-900 outline-none transition duration-150 focus:ring-2 placeholder-transparent focus:placeholder-zinc-600 dark:focus:placeholder-zinc-600';

const getFloatingLabelClass = (value: string, hasError: boolean, leftInset: string = 'left-9') =>
  `absolute px-1 transition-all duration-200 pointer-events-none bg-white dark:bg-zinc-900 ` +
  `${!value ? `top-3 ${leftInset} text-sm text-zinc-600` : '-top-2.5 left-3 text-xs font-semibold text-zinc-700 dark:text-zinc-500'} ` +
  `peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:font-semibold ` +
  `${hasError ? 'text-red-500 peer-focus:text-red-500' : 'peer-focus:text-teal-700 dark:peer-focus:text-teal-500'}`;

const inputNormal =
  'border-zinc-500 dark:border-zinc-700 focus:border-teal-700 focus:ring-teal-700/20 hover:border-zinc-700 dark:hover:border-zinc-600';
const inputError =
  'border-red-400 focus:border-red-400 focus:ring-red-400/20';

type LoginMode = 'initial' | 'email' | 'phone';
type SubTab = 'password' | 'otp';

export default function LoginPage() {
  const { login, loading, error, persistAuth } = useAuth() as any;
  const router = useRouter();

  // Navigation mode: 'initial' -> choose email/phone. 'email' -> email options. 'phone' -> phone options.
  const [mode, setMode] = useState<LoginMode>('initial');
  const [subTab, setSubTab] = useState<SubTab>('password');

  // Common inputs
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email specific states
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Phone specific states
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileError, setMobileError] = useState<string | null>(null);

  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  // OTP specific states (Used for both email OTP and phone OTP)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpCodeError, setOtpCodeError] = useState<string | null>(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState(0); // 120s countdown
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const emailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+(?<!\.)@[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,4}$/;

  // ── OTP Timer & Click Outside ───────────────────────────────────────────────
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

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

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset errors when mode/tab changes
  const resetErrors = () => {
    setFormError(null);
    setEmailError(null);
    setPasswordError(null);
    setMobileError(null);
    setOtpCodeError(null);
    setOtpSuccessMsg(null);
    setIsOtpSent(false);
    setOtpDigits(['', '', '', '', '', '']);
  };

  // ── PASSWORD LOGIN (Email or Phone) ────────────────────────────────────────
  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setEmailError(null);
    setPasswordError(null);
    setMobileError(null);

    let hasError = false;

    if (mode === 'email') {
      if (!email.trim()) { setEmailError('Please enter an email address.'); hasError = true; }
      else if (!emailRegex.test(email)) { setEmailError('Please enter a valid email address.'); hasError = true; }
    } else {
      if (!mobileNumber.trim()) { setMobileError('Please enter a mobile number.'); hasError = true; }
      else {
        const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];
        const validationError = validateMobileNumber(mobileNumber, selectedCountry.iso);
        if (validationError) { setMobileError(validationError); hasError = true; }
      }
    }

    if (!password.trim()) { setPasswordError('Please enter your password.'); hasError = true; }
    else if (password.length < 6) { setPasswordError('Password must be at least 6 characters.'); hasError = true; }

    if (hasError) return;

    try {
      if (mode === 'email') {
        await login({ email, password });
      } else {
        await login({ mobileNumber, countryCode, password });
      }
    } catch (err: any) {
      const requiresVerification = err.response?.data?.requiresVerification;
      const returnedEmail = err.response?.data?.email || email;

      if (requiresVerification) {
        setUnverifiedEmail(returnedEmail);
        setShowRegisterPrompt(true);
        return;
      }

      const msg = err.response?.data?.message || err.message || 'Invalid login credentials.';
      if (msg.toLowerCase().includes('email')) setEmailError(msg);
      else if (msg.toLowerCase().includes('password')) setPasswordError(msg);
      else if (msg.toLowerCase().includes('mobile') || msg.toLowerCase().includes('phone')) setMobileError(msg);
      else { setFormError(msg); }
    }
  };

  // ── OTP Change & Autotab ──────────────────────────────────────────────────
  const handleMobileChange = (val: string) => {
    const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];
    const digitsOnly = val.replace(/\D/g, '').slice(0, selectedCountry.maxLength);

    if (!digitsOnly) {
      setMobileNumber('');
      setMobileError(null);
      return;
    }

    if (countryCode === '+91' && !/^[6-9]/.test(digitsOnly)) {
      return;
    }

    setMobileNumber(digitsOnly);
    setMobileError(null);
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

    if (index < 5) {
      const nextInput = document.getElementById(`login-otp-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleOtpDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`login-otp-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
      }
    }
  };

  // ── REQUEST OTP (Email or Phone) ──────────────────────────────────────────
  const handleRequestOtp = async (e?: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    setEmailError(null);
    setMobileError(null);

    let payload: { email?: string; mobileNumber?: string; countryCode?: string } = {};

    if (mode === 'email') {
      if (!email.trim()) { setEmailError('Please enter an email address.'); return; }
      if (!emailRegex.test(email)) { setEmailError('Please enter a valid email address.'); return; }
      payload.email = email;
    } else {
      if (!mobileNumber.trim()) { setMobileError('Please enter a mobile number.'); return; }
      const selectedCountry = countries.find(c => c.code === countryCode) || countries[0];
      const validationError = validateMobileNumber(mobileNumber, selectedCountry.iso);
      if (validationError) { setMobileError(validationError); return; }
      payload.mobileNumber = mobileNumber;
      payload.countryCode = countryCode;
    }

    setOtpSending(true);
    try {
      const result = await requestLoginOtp(payload);
      setOtpSuccessMsg(result.message);
      setIsOtpSent(true);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(120); // 2 minutes
    } catch (err: any) {
      const msg = err.message || 'Failed to send OTP code. Please verify credentials.';
      if (mode === 'email') setEmailError(msg);
      else setMobileError(msg);
    } finally {
      setOtpSending(false);
    }
  };

  // ── VERIFY OTP (Email or Phone) ───────────────────────────────────────────
  const handleOtpVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOtpCodeError(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setOtpCodeError('Please enter the 6-digit code.');
      return;
    }
    if (otpTimer <= 0) {
      setOtpCodeError('Verification code has expired. Please request a new OTP.');
      return;
    }

    setOtpVerifying(true);
    try {
      let response;
      if (mode === 'email') {
        response = await loginWithOtp({ email, otp: fullOtp });
      } else {
        response = await loginWithOtp({ mobileNumber, countryCode, otp: fullOtp });
      }
      persistAuth(response.user, response.token.accessToken);
      router.push('/');
    } catch (err: any) {
      setOtpCodeError(err.message || 'Invalid code. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans transition-colors duration-500 overflow-hidden relative">

      {/* ── LEFT COLUMN (45%) ── */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 xl:px-24 py-12 relative z-10 bg-white dark:bg-zinc-950 min-h-screen shadow-2xl lg:shadow-none">
        <div className="w-full max-w-[440px] mx-auto">

          {/* Logo & Heading */}
          <div className="flex flex-col mb-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0e372e] text-white shadow-lg shadow-teal-900/20 mb-6 ring-2 ring-[#0e372e]/20">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-outfit mb-3">
              Welcome Back!
            </h1>
            <p className="text-[15px] font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Sign in to access your dashboard and continue optimizing your work process.
            </p>
          </div>

          {/* ── 1. INITIAL METHOD CHOICE SCREEN ── */}
          {mode === 'initial' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                type="button"
                onClick={() => { setMode('email'); setSubTab('password'); resetErrors(); }}
                className="group flex w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 px-5 py-2.5 text-[15px] font-semibold text-zinc-700 dark:text-zinc-200 transition-all duration-300 shadow-sm cursor-pointer"
              >
                <Mail className="h-4 w-4 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
                Continue with Email
              </button>

              <button
                type="button"
                onClick={() => { setMode('phone'); setSubTab('password'); resetErrors(); }}
                className="group flex w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 px-5 py-2.5 text-[15px] font-semibold text-zinc-700 dark:text-zinc-200 transition-all duration-300 shadow-sm cursor-pointer"
              >
                <Phone className="h-4 w-4 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
                Continue with Phone
              </button>
            </div>
          )}

          {/* ── 2. SUB-OPTIONS SCREEN (Email or Phone) ── */}
          {mode !== 'initial' && (
            <div className="space-y-6 animate-in fade-in duration-200">

              <button
                type="button"
                onClick={() => { setMode('initial'); resetErrors(); }}
                className="group flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors duration-300 cursor-pointer -mt-2"
              >
                <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> Back to options
              </button>

              {/* Sub-tab selection: Password vs OTP */}
              <div style={{ display: 'flex', borderRadius: '0.75rem', backgroundColor: '#f4f4f5', padding: '0.375rem', boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)' }}>
                <button
                  type="button"
                  onClick={() => { setSubTab('password'); resetErrors(); }}
                  style={{
                    flex: '1', borderRadius: '0.5rem', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.3s', cursor: 'pointer',
                    ...(subTab === 'password'
                      ? { backgroundColor: '#ffffff', color: '#18181b', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', border: '1px solid #e4e4e7' }
                      : { backgroundColor: 'transparent', color: '#71717a', border: '1px solid transparent' })
                  }}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => { setSubTab('otp'); resetErrors(); }}
                  style={{
                    flex: '1', borderRadius: '0.5rem', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.3s', cursor: 'pointer',
                    ...(subTab === 'otp'
                      ? { backgroundColor: '#ffffff', color: '#18181b', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', border: '1px solid #e4e4e7' }
                      : { backgroundColor: 'transparent', color: '#71717a', border: '1px solid transparent' })
                  }}
                >
                  OTP Code
                </button>
              </div>

              {formError && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400 font-semibold animate-in slide-in-from-top-1">
                  {formError}
                </div>
              )}

              {/* ── SUB-TAB: PASSWORD LOGIN ── */}
              {subTab === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4" autoComplete="off">
                  {mode === 'email' ? (
                    <div className="space-y-1">
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                        <input
                          id="email-input"
                          type="text"
                          autoComplete="off"
                          maxLength={254}
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setEmailError(null); setFormError(null); }}
                          placeholder="name@company.com"
                          className={`${inputBase} pl-10 pr-4 py-3 ${emailError ? inputError : inputNormal}`}
                        />
                        <label htmlFor="email-input" className={getFloatingLabelClass(email, !!emailError)}>
                          Email Address
                        </label>
                      </div>
                      {emailError && <p className="text-sm text-red-500 font-semibold">{emailError}</p>}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex gap-2 mt-2">
                        <div
                          ref={countryDropdownRef}
                          className="relative flex items-center bg-white dark:bg-zinc-900 rounded-xl border-2 border-zinc-500 dark:border-zinc-700 shadow-sm hover:border-zinc-500 dark:hover:border-zinc-600 px-3 py-3 text-sm font-semibold focus-within:ring-2 focus-within:ring-teal-700/20 focus-within:border-teal-700 shrink-0 w-[105px] cursor-pointer"
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
                            <span className="text-zinc-700 dark:text-zinc-300 truncate">{countryCode}</span>
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
                            id="mobile-input"
                            type="text"
                            inputMode="numeric"
                            value={mobileNumber}
                            onChange={(e) => handleMobileChange(e.target.value)}
                            placeholder="10-digit number"
                            className={`${inputBase} pl-10 pr-3.5 py-3 ${mobileError ? inputError : inputNormal}`}
                          />
                          <label htmlFor="mobile-input" className={getFloatingLabelClass(mobileNumber, !!mobileError)}>
                            Mobile Number
                          </label>
                        </div>
                      </div>
                      {mobileError && <p className="text-sm text-red-500 font-semibold">{mobileError}</p>}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center justify-end">
                      <a href="/forgot-password" className="text-xs font-semibold text-teal-800 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 hover:underline transition">
                        Forgot Password?
                      </a>
                    </div>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                      <input
                        id="password-input"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        maxLength={128}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setPasswordError(null); setFormError(null); }}
                        placeholder="Enter your password"
                        className={`${inputBase} pl-10 pr-10 py-3 ${passwordError ? inputError : inputNormal}`}
                      />
                      <label htmlFor="password-input" className={getFloatingLabelClass(password, !!passwordError)}>
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-650 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordError && <p className="text-sm text-red-500 font-semibold">{passwordError}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3f33] hover:bg-[#0c3128] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/25 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-6"
                  >
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </button>
                </form>
              )}

              {/* ── SUB-TAB: OTP LOGIN ── */}
              {subTab === 'otp' && (
                <>
                  {!isOtpSent ? (
                    // Step 1: Input details
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                      {mode === 'email' ? (
                        <div className="space-y-1">
                          <div className="relative mt-2">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                            <input
                              id="email-otp-input"
                              type="text"
                              maxLength={254}
                              value={email}
                              onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                              placeholder="name@company.com"
                              className={`${inputBase} pl-10 pr-4 py-3 ${emailError ? inputError : inputNormal}`}
                            />
                            <label htmlFor="email-otp-input" className={getFloatingLabelClass(email, !!emailError)}>
                              Email Address
                            </label>
                          </div>
                          {emailError && <p className="text-sm text-red-500 font-semibold">{emailError}</p>}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex gap-2 mt-2">
                            <div
                              ref={countryDropdownRef}
                              className="relative flex items-center bg-white dark:bg-zinc-900 rounded-xl border-2 border-zinc-500 dark:border-zinc-700 shadow-sm hover:border-zinc-500 dark:hover:border-zinc-600 px-3 py-3 text-sm font-semibold focus-within:ring-2 focus-within:ring-teal-700/20 focus-within:border-teal-700 shrink-0 w-[105px] cursor-pointer"
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
                                <span className="text-zinc-700 dark:text-zinc-300 truncate">{countryCode}</span>
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
                                id="mobile-otp-input"
                                type="text"
                                inputMode="numeric"
                                value={mobileNumber}
                                onChange={(e) => handleMobileChange(e.target.value)}
                                placeholder="10-digit number"
                                className={`${inputBase} pl-10 pr-3.5 py-3 ${mobileError ? inputError : inputNormal}`}
                              />
                              <label htmlFor="mobile-otp-input" className={getFloatingLabelClass(mobileNumber, !!mobileError)}>
                                Mobile Number
                              </label>
                            </div>
                          </div>
                          {mobileError && <p className="text-sm text-red-500 font-semibold">{mobileError}</p>}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={otpSending}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3f33] hover:bg-[#0c3128] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/25 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-6"
                      >
                        {otpSending ? 'Sending Code...' : 'Send Verification Code'}
                      </button>
                    </form>
                  ) : (
                    // Step 2: Verify code & expiry countdown
                    <form onSubmit={handleOtpVerify} className="space-y-5">
                      {otpSuccessMsg && (
                        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-3.5 py-2.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                          {otpSuccessMsg}
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Enter the 6-digit code
                          </label>
                          {otpTimer > 0 ? (
                            <span className="text-xs text-teal-700 dark:text-teal-400 font-bold flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 animate-pulse" /> {formatTimer(otpTimer)}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-red-500 font-bold">Expired</span>
                              <button
                                type="button"
                                onClick={(e) => handleRequestOtp(e)}
                                disabled={otpSending}
                                className="text-xs font-bold text-teal-700 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                {otpSending ? 'Sending...' : 'Resend OTP'}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Digit Box Input Layout */}
                        <div className="flex justify-center gap-2.5">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              id={`login-otp-${idx}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              disabled={otpTimer <= 0}
                              onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpDigitKeyDown(idx, e)}
                              className="w-12 h-12 text-center text-xl font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700 disabled:opacity-50 text-zinc-950 dark:text-zinc-50"
                            />
                          ))}
                        </div>

                        {otpCodeError && <p className="text-sm text-red-500 font-semibold text-center">{otpCodeError}</p>}
                        {otpTimer <= 0 && (
                          <p className="text-sm text-red-500 font-semibold text-center">OTP expired. Please go back and request a new code.</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={otpDigits.some((d) => !d) || otpVerifying || otpTimer <= 0}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3f33] hover:bg-[#0c3128] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/25 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-6"
                      >
                        {otpVerifying ? 'Verifying Code...' : 'Verify & Sign In'}
                      </button>

                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => { setIsOtpSent(false); setOtpDigits(['', '', '', '', '', '']); setOtpCodeError(null); setOtpSuccessMsg(null); }}
                          className="text-xs font-bold text-teal-800 dark:text-teal-400 hover:underline cursor-pointer"
                        >
                          ← Change input details
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Don&apos;t have an Account?{' '}
            <a href="/register" className="font-bold text-teal-800 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 hover:underline transition-colors decoration-2 underline-offset-2">
              Sign Up
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

      {/* Account Created by Admin / Verification Prompt Modal */}
      {showRegisterPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 font-sans animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800/60 pb-3.5 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white font-outfit">Account Verification Required</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Action needed to active your account</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Your account was created by the administrator, but it requires you to complete registration and verify your details before logging in.
              </p>
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-150 dark:border-zinc-800/40 p-3.5 text-xs text-zinc-650 dark:text-zinc-400 font-medium">
                Registered email: <span className="font-bold text-zinc-900 dark:text-zinc-100">{unverifiedEmail}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
              <button
                type="button"
                onClick={() => setShowRegisterPrompt(false)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRegisterPrompt(false);
                  router.push(`/register?email=${encodeURIComponent(unverifiedEmail)}`);
                }}
                className="rounded-xl bg-[#0f3f33] hover:bg-[#0c3128] px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-teal-950/10 cursor-pointer"
              >
                Complete Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
