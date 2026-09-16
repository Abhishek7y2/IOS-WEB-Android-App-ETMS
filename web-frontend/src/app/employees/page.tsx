'use client';

import React, { useState, FormEvent } from 'react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { EmployeeCard } from '../../components/employee/EmployeeCard';
import { Search, Plus, X, User, Mail, Lock, CheckCircle, Eye, EyeOff, Loader2, ClipboardCheck } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { isValidEmail } from '../../utils/emailValidator';
import { getPasswordValidationError } from '../../utils/passwordValidator';

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

export default function EmployeesPage() {
  const { employees, addEmployee } = useTasks();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    designation: 'Employee',
    role: 'member',
    avatarUrl: ''
  });

  const isAdmin = (user?.role === 'admin' || user?.role === 'superadmin') || user?.role === 'Admin' || user?.role === 'Project Manager';

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: pass }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size must be less than 2MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
        setErrors(prev => ({ ...prev, image: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = () => {
    // Generate initial password
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: pass,
      designation: 'Employee',
      role: 'member',
      avatarUrl: ''
    });
    setErrors({});
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const validate = () => {
    let hasError = false;
    const errs: Record<string, string> = {};

    const fnError = validateNameField(formData.firstName, 'First name', false);
    if (fnError) {
      errs.firstName = fnError;
      hasError = true;
    }

    const lnError = validateNameField(formData.lastName, 'Last name');
    if (lnError) {
      errs.lastName = lnError;
      hasError = true;
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      errs.email = 'Please enter your email address.';
      hasError = true;
    } else if (!isValidEmail(trimmedEmail)) {
      errs.email = 'Please enter a valid email address (e.g., user@example.com).';
      hasError = true;
    }

    const passError = getPasswordValidationError(formData.password);
    if (passError) {
      errs.password = 'Please enter a valid password.';
      hasError = true;
    }

    setErrors(errs);
    return !hasError;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await addEmployee({
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        designation: formData.designation,
        role: formData.role,
        avatarUrl: formData.avatarUrl || undefined
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setErrors({ api: err.message || 'Failed to create user. Email may already exist.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="w-full space-y-6 pb-12 transition-colors duration-300 relative">
        {/* Decorative background glows */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Team Members</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-500">Manage designations, workspace roles, and employee records.</p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 px-5.5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-teal-700/20 hover:shadow-xl hover:shadow-teal-700/35 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-white" />
              <span>Add Member</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/60 bg-white/90 p-4.5 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950/45 backdrop-blur-sm transition-colors duration-300 md:flex-row md:items-center md:justify-between relative z-10">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-600 dark:text-zinc-500" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search team members..."
              className="w-full rounded-xl border border-zinc-500 bg-white py-2.5 pl-11 pr-4 text-xs text-zinc-950 outline-none transition duration-205 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
            />
          </div>
          <div className="text-xs font-bold text-zinc-600 dark:text-zinc-500">
            Showing {filteredEmployees.length} of {employees.length} members
          </div>
        </div>

        <div className="relative z-10 enterprise-card overflow-hidden rounded-2xl shadow-sm">
          {filteredEmployees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-base text-zinc-800 dark:text-zinc-200">
                <thead className="bg-zinc-50/50 text-[13px] font-bold uppercase tracking-[0.1em] text-zinc-950 border-b border-zinc-200/60 dark:bg-zinc-900/20 dark:text-zinc-50 dark:border-zinc-800/60">
                  <tr>
                    <th className="pl-6 pr-2 py-4 text-blue-700 dark:text-blue-400">Employee Profile</th>
                    <th className="px-6 py-4 text-center text-purple-700 dark:text-purple-400">Designation</th>
                    <th className="px-6 py-4 text-center text-amber-700 dark:text-amber-400">Role Type</th>
                    <th className="px-6 py-4 text-center text-slate-700 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                  {filteredEmployees.map((employee) => (
                    <EmployeeCard key={employee.id} employee={employee} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-dashed border-zinc-200 bg-white p-12 text-center transition-all duration-300 dark:border-dashed dark:border-zinc-800 dark:bg-zinc-950/40">
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">No team members found</p>
            </div>
          )}
        </div>

        {/* Modal Backdrop and Modal dialog */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Backdrop click dismiss */}
            <div className="absolute inset-0" onClick={() => !loading && setIsModalOpen(false)} />

            <div className="w-full max-w-sm rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl dark:border-zinc-800/80 dark:bg-zinc-950 relative z-10 max-h-[90vh] overflow-y-auto custom-scrollbar font-sans">
              <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800/60 pb-3.5 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm">
                    <ClipboardCheck className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 font-outfit">Create User</h3>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.api && (
                  <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                    {errors.api}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                      <input
                        id="firstName"
                        type="text"
                        maxLength={50}
                        value={formData.firstName}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^a-zA-Z]/g, '');
                          if (val.length > 0) val = val.charAt(0).toUpperCase() + val.slice(1);
                          setFormData({ ...formData, firstName: val });
                          setErrors({ ...errors, firstName: '' });
                        }}
                        placeholder="Jane"
                        className={`${inputBase} pl-10 pr-4 py-3 ${errors.firstName ? inputError : inputNormal}`}
                      />
                      <label htmlFor="firstName" className={getFloatingLabelClass(formData.firstName, !!errors.firstName, 'left-9')}>
                        First Name
                      </label>
                    </div>
                    {errors.firstName && <p className="text-xs text-red-500 font-medium">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-1">
                    <div className="relative mt-2">
                      <input
                        id="lastName"
                        type="text"
                        maxLength={50}
                        value={formData.lastName}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
                          val = val.trimStart().replace(/\s{2,}/g, ' ').replace(/-{2,}/g, '-').replace(/'{2,}/g, "'");
                          if (val.length > 0) val = val.replace(/(?:^|\s|-)\S/g, (m) => m.toUpperCase());
                          setFormData({ ...formData, lastName: val });
                          setErrors({ ...errors, lastName: '' });
                        }}
                        placeholder="Doe"
                        className={`${inputBase} px-4 py-3 ${errors.lastName ? inputError : inputNormal}`}
                      />
                      <label htmlFor="lastName" className={getFloatingLabelClass(formData.lastName, !!errors.lastName, 'left-3')}>
                        Last Name
                      </label>
                    </div>
                    {errors.lastName && <p className="text-xs text-red-500 font-medium">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    <input
                      id="email"
                      type="text"
                      maxLength={254}
                      value={formData.email}
                      onChange={(e) => { setFormData({ ...formData, email: e.target.value.toLowerCase().replace(/\s/g, '') }); setErrors({ ...errors, email: '' }); }}
                      placeholder="jane@company.com"
                      className={`${inputBase} pl-10 pr-4 py-3 ${errors.email ? inputError : inputNormal}`}
                    />
                    <label htmlFor="email" className={getFloatingLabelClass(formData.email, !!errors.email, 'left-9')}>
                      Email
                    </label>
                  </div>
                  {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                </div>

                <div className="space-y-1">
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      maxLength={128}
                      value={formData.password}
                      onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
                      placeholder="Enter credentials"
                      className={`${inputBase} pl-10 pr-28 py-3 ${errors.password ? inputError : inputNormal}`}
                    />
                    <label htmlFor="password" className={getFloatingLabelClass(formData.password, !!errors.password, 'left-9')}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-20 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer animate-in fade-in"
                    >
                      {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-450 dark:hover:bg-teal-900/60 px-2.5 py-1.5 rounded-lg cursor-pointer transition"
                    >
                      Generate
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password}</p>}
                </div>



                <div className="border-t border-zinc-150 dark:border-zinc-800/60 pt-4 mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setIsModalOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-600/30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-5 py-2.5 text-xs font-extrabold text-teal-800 dark:text-teal-300 shadow-sm hover:border-teal-600 hover:bg-teal-50/60 dark:hover:bg-teal-950/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 px-5.5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-teal-700/20 hover:shadow-xl hover:shadow-teal-700/35 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      <>
                        Create User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
