'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Mail, ClipboardCheck, Phone, ArrowLeft, User, Briefcase, Network, CheckCircle } from 'lucide-react';
import { countries } from '../../constants/countries';

const emailRegex = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+(?<!\.)@[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,4}$/;

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

type ResetMode = 'initial' | 'email' | 'phone';

export default function ForgotPasswordPage() {
  const { forgotPassword, loading, error } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<ResetMode>('initial');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetErrors = () => {
    setFormError(null);
    setEmailError(null);
    setMobileError(null);
    setSuccessMessage(null);
  };

  const handleMobileChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(digitsOnly);
    setMobileError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetErrors();
    let hasError = false;

    if (mode === 'email') {
      if (!email.trim()) {
        setEmailError('Email is required.');
        hasError = true;
      } else if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address.');
        hasError = true;
      }
    } else {
      if (!mobileNumber.trim()) {
        setMobileError('Mobile number is required.');
        hasError = true;
      } else if (mobileNumber.length !== 10) {
        setMobileError('Mobile number must be exactly 10 digits.');
        hasError = true;
      } else if (mobileNumber.startsWith('0')) {
        setMobileError('Mobile number should never start with 0.');
        hasError = true;
      }
    }

    if (hasError) return;

    try {
      let payload = mode === 'email' ? { email } : { mobileNumber, countryCode };
      const message = await forgotPassword(payload);
      setSuccessMessage(message || 'Password reset OTP has been sent. Redirecting…');
      setTimeout(() => {
        if (mode === 'email') {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        } else {
          router.push(`/reset-password?mobileNumber=${encodeURIComponent(mobileNumber)}&countryCode=${encodeURIComponent(countryCode)}`);
        }
      }, 2000);
    } catch {
      // Error state handled in context.
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
              Reset your password
            </h1>
            <p className="text-[15px] font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
              Enter your email or phone and we&apos;ll send a 6-digit code to reset your password.
            </p>
          </div>

          {/* ── 1. INITIAL METHOD CHOICE SCREEN ── */}
          {mode === 'initial' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                type="button"
                onClick={() => { setMode('email'); resetErrors(); }}
                className="group flex w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 px-5 py-2.5 text-[15px] font-semibold text-zinc-700 dark:text-zinc-200 transition-all duration-300 shadow-sm cursor-pointer"
              >
                <Mail className="h-4 w-4 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
                Reset with Email
              </button>

              <button
                type="button"
                onClick={() => { setMode('phone'); resetErrors(); }}
                className="group flex w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 px-5 py-2.5 text-[15px] font-semibold text-zinc-700 dark:text-zinc-200 transition-all duration-300 shadow-sm cursor-pointer"
              >
                <Phone className="h-4 w-4 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
                Reset with Phone
              </button>
            </div>
          )}

          {/* ── 2. INPUT SCREEN ── */}
          {mode !== 'initial' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={() => { setMode('initial'); resetErrors(); }}
                className="group flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors duration-300 cursor-pointer -mt-2"
              >
                <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> Back to options
              </button>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {mode === 'email' ? (
                  <div className="space-y-1">
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                      <input
                        id="email"
                        type="text"
                        maxLength={254}
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setEmailError(null);
                          setFormError(null);
                        }}
                        placeholder="name@company.com"
                        className={`${inputBase} pl-10 pr-4 py-3 ${emailError ? inputError : inputNormal}`}
                      />
                      <label htmlFor="email" className={getFloatingLabelClass(email, !!emailError)}>
                        Email Address
                      </label>
                    </div>
                    {emailError && <p className="text-sm text-red-500 font-semibold">{emailError}</p>}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex gap-2 mt-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="rounded-xl border-2 border-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-3 text-sm text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 outline-none shrink-0 cursor-pointer font-semibold"
                      >
                        {countries.map((c) => (
                          <option key={c.name} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                      </select>
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
                {successMessage && (
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 px-3.5 py-2.5 text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
                    {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3f33] hover:bg-[#0c3128] px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/25 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-6"
                >
                  {loading ? 'Sending code…' : 'Send reset code'}
                </button>
              </form>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Remember your password?{' '}
            <a href="/login" className="font-bold text-teal-800 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 hover:underline transition-colors decoration-2 underline-offset-2">
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
