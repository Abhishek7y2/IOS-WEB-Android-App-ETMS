'use client';

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { resendResetOtp } from '../../api/auth';
import { Mail, Lock, Eye, EyeOff, ClipboardCheck, User, Briefcase, Network, CheckCircle } from 'lucide-react';

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

function ResetPasswordForm() {
  const { resetPassword, loading, error } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
    const mobileParam = searchParams.get('mobileNumber');
    if (mobileParam) {
      setMobileNumber(mobileParam);
    }
    const codeParam = searchParams.get('countryCode');
    if (codeParam) {
      setCountryCode(codeParam);
    }
  }, [searchParams]);

  const handleResendOtp = async () => {
    if (!email.trim() && !mobileNumber.trim()) {
      setResendMessage('Please enter your email or phone first.');
      return;
    }
    setResendMessage(null);
    setResendLoading(true);
    try {
      const payload = email ? { email } : { mobileNumber, countryCode };
      const result = await resendResetOtp(payload);
      setResendMessage(result.message || 'A new reset code has been sent.');
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if ((!email.trim() && !mobileNumber.trim()) || !otp.trim() || !password.trim() || !confirmPassword.trim()) {
      setFormError('Please complete all fields.');
      return;
    }

    if (otp.length !== 6) {
      setFormError('Please enter a valid 6-digit verification code.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      let payload = email ? { email, otp, password } : { mobileNumber, countryCode, otp, password };
      const message = await resetPassword(payload);
      setSuccessMessage(message || 'Password reset successful! Redirecting to login…');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch {
      // Error is handled in context
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto">
      {/* Logo & Heading */}
      <div className="flex flex-col mb-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0e372e] text-white shadow-lg shadow-teal-900/20 mb-6 ring-2 ring-[#0e372e]/20">
          <ClipboardCheck className="h-6 w-6" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-outfit mb-3">
          Reset your password
        </h1>
        <p className="text-[15px] font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
          Enter the code we sent you and choose a new password.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        
        {/* Email/Mobile Field Display */}
        <div className="space-y-1">
          <div className="relative mt-2">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              id="identifier"
              type="text"
              readOnly
              value={email || (countryCode + ' ' + mobileNumber)}
              className={`${inputBase} pl-10 pr-4 py-3 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600`}
            />
            <label htmlFor="identifier" className={getFloatingLabelClass(email || mobileNumber, false)}>
              {email ? 'Email Address' : 'Mobile Number'}
            </label>
          </div>
        </div>

        {/* OTP Field (Custom styling for code) */}
        <div className="space-y-1 pt-2">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block text-center mb-2" htmlFor="otp">
            6-digit code sent to{' '}
            {email || mobileNumber ? <span className="text-teal-700 dark:text-teal-400 font-bold">{email || mobileNumber}</span> : 'you'}
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className={`w-full rounded-xl border-2 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 outline-none transition duration-150 shadow-sm px-4 py-3 text-2xl font-mono tracking-[0.4em] text-center ${inputNormal}`}
          />
        </div>

        {/* New Password Field */}
        <div className="space-y-1 pt-2">
          <div className="relative mt-2">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className={`${inputBase} pl-10 pr-10 py-3 ${inputNormal}`}
            />
            <label htmlFor="password" className={getFloatingLabelClass(password, false)}>
              New password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-650 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1">
          <div className="relative mt-2">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              maxLength={128}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="••••••••"
              className={`${inputBase} pl-10 pr-10 py-3 ${inputNormal}`}
            />
            <label htmlFor="confirmPassword" className={getFloatingLabelClass(confirmPassword, false)}>
              Confirm new password
            </label>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-650 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Messages */}
        {formError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400 font-semibold mt-2">
            {formError}
          </div>
        )}
        {error && !formError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400 font-semibold mt-2">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-400 font-semibold mt-2">
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3f33] hover:bg-[#0c3128] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/25 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-6"
        >
          {loading ? 'Resetting password…' : 'Reset password'}
        </button>

        <div className="flex items-center justify-center text-xs mt-4">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendCooldown > 0 || resendLoading}
            className="text-xs font-semibold text-teal-800 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 hover:underline transition-colors disabled:opacity-40 cursor-pointer"
          >
            {resendLoading ? 'Sending…' : resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend reset code'}
          </button>
        </div>

        {resendMessage && (
          <p className="text-center text-xs text-zinc-600 dark:text-zinc-400 mt-2 font-medium">{resendMessage}</p>
        )}
      </form>

      {/* Footer */}
      <div className="mt-10 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
        Remember your password?{' '}
        <a href="/login" className="font-bold text-teal-800 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 hover:underline transition-colors decoration-2 underline-offset-2">
          Sign in
        </a>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex font-sans transition-colors duration-500 overflow-hidden relative">
      
      {/* ── LEFT COLUMN (45%) ── */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 xl:px-24 py-12 relative z-10 bg-white dark:bg-zinc-950 min-h-screen shadow-2xl lg:shadow-none overflow-y-auto">
        <Suspense
          fallback={
            <div className="w-full max-w-sm relative z-10 flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-teal-800 dark:border-zinc-800 dark:border-t-teal-400" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
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
