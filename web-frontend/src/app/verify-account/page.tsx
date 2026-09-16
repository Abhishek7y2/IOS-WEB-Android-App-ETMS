'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { resendVerificationOtp, verifyOtp } from '../../api/auth';

function VerifyAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!email) {
      router.push('/login');
    } else {
      // Auto-send OTP on first load
      handleResendOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, router]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResendOtp = async () => {
    if (isResending || timer > 0) return;
    setIsResending(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await resendVerificationOtp(email);
      setSuccessMsg('Verification code sent to your email.');
      setTimer(60);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to send verification code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = numericValue.slice(-1);
    setOtpDigits(newDigits);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (index < 5 && numericValue) {
      const nextInput = document.getElementById(`verify-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`verify-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await verifyOtp(email, otp);
      setSuccessMsg('Account verified successfully! You can now log in.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Invalid verification code.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-500 p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800">
        <button 
          onClick={() => router.push('/login')} 
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </button>

        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center border-2 border-teal-100 dark:border-teal-900/50">
            <ShieldAlert className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-2">Verify Your Account</h2>
        <p className="text-sm text-center text-zinc-600 dark:text-zinc-400 mb-6">
          Your account was created by an admin. Please verify your email <strong>{email}</strong> to continue.
        </p>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 text-center">
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl text-sm font-semibold text-teal-600 dark:text-teal-400 text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                id={`verify-otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isVerifying || otpDigits.join('').length !== 6}
            className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex justify-center items-center gap-2 transition-colors"
          >
            {isVerifying ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium">
          <span className="text-zinc-600 dark:text-zinc-400">Didn't receive the code? </span>
          <button
            onClick={handleResendOtp}
            disabled={isResending || timer > 0}
            className="text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-50"
          >
            {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>}>
      <VerifyAccountContent />
    </Suspense>
  );
}
