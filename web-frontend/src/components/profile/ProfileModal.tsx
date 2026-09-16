'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, Mail, Camera, FileCheck, Phone, Briefcase, Loader2, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import ImageCropperModal from './ImageCropperModal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const countries = [
  { name: 'India', code: '+91', flag: 'IN' },
  { name: 'United States', code: '+1', flag: 'US' },
  { name: 'United Kingdom', code: '+44', flag: 'UK' },
  { name: 'Canada', code: '+1', flag: 'CA' },
  { name: 'Australia', code: '+61', flag: 'AU' },
  { name: 'Germany', code: '+49', flag: 'DE' },
  { name: 'France', code: '+33', flag: 'FR' },
  { name: 'Singapore', code: '+65', flag: 'SG' },
  { name: 'Japan', code: '+81', flag: 'JP' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser, requestPhoneChangeOtp, verifyPhoneChangeOtp } = useAuth();

  // Profile info state
  const [profilePicture, setProfilePicture] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [designation, setDesignation] = useState('');

  const [editingField, setEditingField] = useState<'phone' | 'type' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setProfilePicture(user.profilePicture || '');
      setCountryCode(user.countryCode || '+91');
      setMobileNumber(user.mobileNumber || '');
      setDesignation(user.designation || '');
      setEditingField(null);
      setIsVerifyingOtp(false);
      setOtp('');
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleMobileChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(digitsOnly);
  };

  const handleSaveField = async (field: 'phone' | 'type') => {
    if (field === 'phone') {
      if (mobileNumber && mobileNumber.length !== 10) {
        toast.error('Mobile number must be 10 digits.');
        return;
      }

      setIsSaving(true);
      try {
        const msg = await requestPhoneChangeOtp(mobileNumber, countryCode);
        toast.success(msg || 'OTP sent successfully!');
        setIsVerifyingOtp(true);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to request OTP');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    setIsSaving(true);
    try {
      await updateUser({
        designation,
      });
      toast.success('Profile updated successfully');
      setEditingField(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits.');
      return;
    }
    setIsSaving(true);
    try {
      await verifyPhoneChangeOtp(otp);
      toast.success('Phone number verified and updated successfully!');
      setIsVerifyingOtp(false);
      setOtp('');
      setEditingField(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to verify OTP');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File is too large. Maximum size is 5MB.');
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File is too large. Maximum size is 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperState({ isOpen: true, imageSrc: reader.result as string, type: 'cover' });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-zinc-950/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        <div
          className={`w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl flex flex-col transition-all duration-300 ease-in-out pointer-events-auto ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Section */}
          <div className="relative border-b border-zinc-200 dark:border-zinc-800 rounded-t-2xl shrink-0">
            {/* Cover Picture */}
            <div className="h-32 w-full bg-zinc-200 dark:bg-zinc-800 rounded-t-2xl overflow-hidden relative group">
              <img
                src={user?.coverPicture || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200'}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <label htmlFor="modal-cover-upload" className="absolute top-4 right-14 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-10">
                <Camera className="h-4 w-4" />
              </label>
              {user?.coverPicture && (
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
                  className="absolute top-4 right-24 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-10 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <input
                id="modal-cover-upload"
                type="file"
                accept="image/*"
                onClick={(e) => { (e.target as any).value = '' }}
                onChange={handleCoverPicChange}
                className="hidden"
              />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors backdrop-blur-sm z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center pb-6">
              {/* Profile Avatar */}
              <div className="relative -mt-14 mb-3">
                <div className="relative group cursor-pointer">
                  <label htmlFor="quick-photo-upload" className="cursor-pointer block relative">
                    <img
                      src={profilePicture || user.profilePicture || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'}
                      alt={user.name}
                      className="h-28 w-28 rounded-full object-cover ring-4 ring-white dark:ring-zinc-950 shadow-md transition-transform group-hover:scale-105 bg-white dark:bg-zinc-950"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                      <Camera className="h-7 w-7 text-white" />
                    </div>
                  </label>
                  {(profilePicture || user?.profilePicture) && (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          await updateUser({ profilePicture: '' });
                          if (setProfilePicture) setProfilePicture('');
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
                    id="quick-photo-upload"
                    type="file"
                    accept="image/*"
                    onClick={(e) => { (e.target as any).value = '' }}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-green-500 border-4 border-white dark:border-zinc-950" title="Online" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white font-outfit">{user.name}</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Employee'}</p>
            </div>
          </div>

          {/* Content Section - The Simplified Card */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-zinc-50/30 dark:bg-zinc-900/20">

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 shadow-sm">

              {/* Name Field (Read Only) */}
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors rounded-t-xl">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0 mt-1">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Name changes must be requested through HR.</p>
                </div>
              </div>

              {/* Email Field (Read Only) */}
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0 mt-1">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Email Address</p>
                    {user.isVerified && (
                      <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-600 dark:text-emerald-400 select-none mb-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Verified
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user.email}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Email is tied to your account and cannot be edited.</p>
                </div>
              </div>

              {/* Phone Field (Editable) */}
              <div
                className={`p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start gap-4 transition-colors group ${editingField !== 'phone' ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer' : ''}`}
                onClick={() => { if (editingField !== 'phone') setEditingField('phone'); }}
              >
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0 mt-1">
                  <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1" onClick={(e) => { if (editingField === 'phone') e.stopPropagation(); }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Phone Number</p>
                      {user.isVerified && (
                        <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-600 dark:text-emerald-400 select-none mb-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Verified
                        </div>
                      )}
                    </div>
                    {editingField !== 'phone' && (
                      <button onClick={(e) => { e.stopPropagation(); setEditingField('phone'); }} className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {editingField === 'phone' ? (
                    <div className="mt-2 space-y-3 animate-in fade-in duration-200">
                      {!isVerifyingOtp ? (
                        <>
                          <div className="flex gap-2">
                            <select
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              {countries.map((c) => (
                                <option key={c.name} value={c.code}>{c.flag} {c.code}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={mobileNumber}
                              onChange={(e) => handleMobileChange(e.target.value)}
                              placeholder="10 digit number"
                              className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setCountryCode(user.countryCode || '+91');
                                setMobileNumber(user.mobileNumber || '');
                                setEditingField(null);
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveField('phone')}
                              disabled={isSaving}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileCheck className="h-3.5 w-3.5" />}
                              Get OTP
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="Enter 6-digit OTP"
                              className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-1.5 text-sm tracking-widest text-center font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] text-zinc-500">Check terminal or email for OTP</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setIsVerifyingOtp(false);
                                  setOtp('');
                                }}
                                className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleVerifyPhoneOtp}
                                disabled={isSaving || otp.length !== 6}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                              >
                                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileCheck className="h-3.5 w-3.5" />}
                                Verify & Save
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {user.mobileNumber ? `${user.countryCode} ${user.mobileNumber}` : <span className="text-zinc-400 italic">Click to add phone number</span>}
                    </p>
                  )}
                </div>
              </div>

              {/* Employee Type (Editable for Admins only) */}
              <div
                className={`p-4 flex items-start gap-4 transition-colors rounded-b-xl group ${editingField !== 'type' && (user.role === 'admin' || user.role === 'superadmin') ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer' : ''}`}
                onClick={() => {
                  if (editingField !== 'type' && (user.role === 'admin' || user.role === 'superadmin')) {
                    setEditingField('type');
                  }
                }}
              >
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0 mt-1">
                  <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1" onClick={(e) => { if (editingField === 'type') e.stopPropagation(); }}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Employee Type</p>
                    {editingField !== 'type' && (user.role === 'admin' || user.role === 'superadmin') && (
                      <button onClick={(e) => { e.stopPropagation(); setEditingField('type'); }} className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {editingField === 'type' ? (
                    <div className="mt-2 space-y-3 animate-in fade-in duration-200">
                      <select
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="CEO">CEO</option>
                        <option value="Employee">Employee</option>
                        <option value="Developer">Developer</option>
                        <option value="Designer">Designer</option>
                        <option value="QA Engineer">QA Engineer</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Specialist">Specialist</option>
                        <option value="HR Specialist">HR Specialist</option>
                        <option value="Analyst">Analyst</option>
                      </select>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setDesignation(user.designation || '');
                            setEditingField(null);
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveField('type')}
                          disabled={isSaving}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                          {isSaving && editingField === 'type' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileCheck className="h-3.5 w-3.5" />}
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {user.designation || <span className="text-zinc-400 italic">No employee type set</span>}
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <ImageCropperModal
        isOpen={cropperState.isOpen}
        imageSrc={cropperState.imageSrc}
        onClose={() => setCropperState(prev => ({ ...prev, isOpen: false }))}
        cropShape={cropperState.type === 'profile' ? 'round' : 'rect'}
        aspectRatio={cropperState.type === 'profile' ? 1 : 16 / 9}
        onSave={async (croppedBase64) => {
          if (cropperState.type === 'profile') {
            await updateUser({ profilePicture: croppedBase64 });
            setProfilePicture(croppedBase64);
            toast.success('Profile picture updated!');
          } else {
            await updateUser({ coverPicture: croppedBase64 });
            toast.success('Cover picture updated!');
          }
        }}
      />
    </>
  );
};
