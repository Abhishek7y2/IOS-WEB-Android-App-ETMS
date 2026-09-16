'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, AlertTriangle, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function DeleteAccountTab() {
  const { user, forgotPassword, deleteAccount, verifyResetOtp } = useAuth();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteOtpSent, setIsDeleteOtpSent] = useState(false);
  const [isRequestingDeleteOtp, setIsRequestingDeleteOtp] = useState(false);
  const [deleteOtpDigits, setDeleteOtpDigits] = useState(['', '', '', '', '', '']);
  const [confirmText, setConfirmText] = useState('');
  const [isVerifyingDeleteOtp, setIsVerifyingDeleteOtp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTimer, setDeleteTimer] = useState(0);

  useEffect(() => {
    if (deleteTimer <= 0) return;
    const interval = setInterval(() => {
      setDeleteTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [deleteTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBoxChange = (index: number, value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) {
      const nextDigits = [...deleteOtpDigits];
      nextDigits[index] = '';
      setDeleteOtpDigits(nextDigits);
      return;
    }
    const nextDigits = [...deleteOtpDigits];
    nextDigits[index] = numericValue.slice(-1);
    setDeleteOtpDigits(nextDigits);
    if (index < 5) {
      const nextInput = document.getElementById(`del-otp-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleBoxKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !deleteOtpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`del-otp-${index - 1}`);
      if (prevInput) (prevInput as HTMLInputElement).focus();
    }
  };

  const handleRequestDeleteOtp = async () => {
    if (!user) return;
    setIsRequestingDeleteOtp(true);
    try {
      await forgotPassword({ email: user.email });
      setIsDeleteOtpSent(true);
      setDeleteOtpDigits(['', '', '', '', '', '']);
      setDeleteTimer(120);
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
      await verifyResetOtp(fullOtp);
      setIsDeleting(true);
      await deleteAccount();
      toast.success('Account deleted successfully.');
    } catch (err: any) {
      toast.error(err?.message || 'Verification or deletion failed.');
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

  if (user?.role === 'admin' || user?.role === 'superadmin') {
    return null; // Admins cannot delete accounts from here
  }

  return (
    <>
      <div className="rounded-2xl border border-red-200/60 bg-red-50/20 p-6 shadow-sm dark:border-red-950/5 space-y-5">
        <h2 className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2 border-b border-red-100/40 dark:border-red-950/20 pb-3">
          <ShieldAlert className="h-4.5 w-4.5" />
          Profile Deletion
        </h2>
        <div className="space-y-4">
          <div className="max-w-xl text-xs text-red-650/80 dark:text-red-400/80 leading-relaxed">
            Deleting your account is permanent. This will erase all your personal data, logs, task assignations, and profile records from the database. You will not be able to log back in.
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-1.5 py-2 px-5 rounded-xl border border-red-200/80 bg-white hover:bg-red-50 text-xs font-bold text-red-600 dark:bg-zinc-950/60 dark:border-red-950/40 dark:text-red-400 dark:hover:bg-red-950/20 transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete My Profile permanently
          </button>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border-2 border-zinc-600 dark:border-zinc-600 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3 text-red-600">
              <div className="bg-red-100 dark:bg-red-950/50 p-2 rounded-xl shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Delete Profile permanently?</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-normal">
                  This action is irreversible. For security, we require OTP verification to delete your account.
                </p>
              </div>
            </div>

            {!isDeleteOtpSent ? (
              <div className="space-y-4 animate-in fade-in">
                <p className="text-xs text-zinc-650 dark:text-zinc-450 leading-normal">
                  We will send a 6-digit OTP verification code to your profile email <span className="font-bold text-zinc-900 dark:text-zinc-200">{user?.email}</span>.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    className="flex-1 py-2 px-4 rounded-xl border-2 border-zinc-600 dark:border-zinc-600 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestDeleteOtp}
                    disabled={isRequestingDeleteOtp}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                  >
                    {isRequestingDeleteOtp && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Send Deletion OTP
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-red-700 dark:text-red-400">Verification OTP Code</label>
                    {deleteTimer > 0 ? (
                      <span className="text-xs text-red-650 dark:text-red-450 font-bold flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 animate-pulse" /> Expires in: {formatTimer(deleteTimer)}
                      </span>
                    ) : (
                      <span className="text-xs text-red-550 dark:text-red-450 font-bold">Code Expired!</span>
                    )}
                  </div>

                  <div className="flex gap-2.5 justify-center py-2">
                    {deleteOtpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`del-otp-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        disabled={deleteTimer <= 0}
                        onChange={(e) => handleBoxChange(idx, e.target.value)}
                        onKeyDown={(e) => handleBoxKeyDown(idx, e)}
                        className="w-12 h-12 text-center text-xl font-bold bg-white dark:bg-zinc-900 border-2 border-zinc-600 dark:border-zinc-600 rounded-xl outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 disabled:opacity-50 text-zinc-950 dark:text-zinc-50"
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="delete-confirm-text" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    To proceed, type <span className="font-bold text-zinc-900 dark:text-white font-mono">delete</span> below:
                  </label>
                  <input
                    id="delete-confirm-text"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-zinc-600 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm text-zinc-950 dark:text-zinc-50 font-mono outline-none transition focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    placeholder="delete"
                  />
                </div>

                {deleteTimer <= 0 && (
                  <p className="text-[10px] text-red-550 dark:text-red-450 font-medium">OTP has expired. Please cancel and request a new code.</p>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    className="flex-1 py-2 px-4 rounded-xl border-2 border-zinc-600 dark:border-zinc-600 text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={isVerifyingDeleteOtp || isDeleting || confirmText.toLowerCase() !== 'delete' || deleteOtpDigits.some(d => !d) || deleteTimer <= 0}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                  >
                    {(isVerifyingDeleteOtp || isDeleting) ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Delete Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
