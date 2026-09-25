import React, { useState } from 'react';
import { Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { isAdmin as checkIsAdmin, isSuperAdmin as checkIsSuperAdmin, getDisplayRole } from '@/utils/permissions';
import { Trash2, Ban, CheckCircle2, Edit, Eye, X, ChevronDown } from 'lucide-react';

interface EmployeeCardProps {
  employee: Employee;
}

const DESIGNATIONS = [
  'CEO',
  'Admin',
  'Employee',
  'Software Developer',
  'Senior Developer',
  'Product Designer',
  'QA Analyst',
  'Project Manager',
  'HR Specialist',
  'Intern'
];

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  const { user } = useAuth();
  const { updateEmployeeDesignation, updateEmployeeRole, removeEmployee, blockEmployee, unblockEmployee } = useTasks();

  const isSuperAdmin = checkIsSuperAdmin(user);
  const isAdmin = checkIsAdmin(user);
  const canEditDesignation = isAdmin && (employee.role !== 'superadmin' || employee.id === user?.id);
  const canEditRole = isSuperAdmin && employee.id !== user?.id && employee.role !== 'superadmin';

  const targetIsAdminOrSuper = employee.role === 'admin' || employee.role === 'superadmin';
  const canRemoveUser = employee.id !== user?.id && (isSuperAdmin || (isAdmin && !targetIsAdminOrSuper));
  const canBlockUser = canRemoveUser;

  const handleDesignationChange = (designation: string) => {
    updateEmployeeDesignation(employee.id, designation);
    setDraftDesignation(designation);
    setIsDesignationDropdownOpen(false);
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [draftDesignation, setDraftDesignation] = useState(employee.designation || '');
  const [draftRole, setDraftRole] = useState(employee.role === 'user' || employee.role === 'employee' ? 'member' : employee.role);
  
  const [isDesignationDropdownOpen, setIsDesignationDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [confirmState, setConfirmState] = React.useState<{
    isOpen: boolean;
    action: 'remove' | 'block' | 'unblock' | null;
    message: string;
  }>({ isOpen: false, action: null, message: '' });

  const handleConfirmAction = () => {
    if (confirmState.action === 'remove') {
      removeEmployee(employee.id);
    } else if (confirmState.action === 'block') {
      blockEmployee(employee.id);
    } else if (confirmState.action === 'unblock') {
      unblockEmployee(employee.id);
    }
    setConfirmState({ isOpen: false, action: null, message: '' });
  };

  const handleRemoveUser = () => {
    setConfirmState({
      isOpen: true,
      action: 'remove',
      message: `Are you sure you want to remove ${employee.name}?`
    });
  };

  const handleBlockUser = () => {
    setConfirmState({
      isOpen: true,
      action: 'block',
      message: `Are you sure you want to block ${employee.name}? They will lose access.`
    });
  };

  const handleUnblockUser = () => {
    setConfirmState({
      isOpen: true,
      action: 'unblock',
      message: `Are you sure you want to unblock ${employee.name}? They will regain access.`
    });
  };

  return (
    <>
      <tr className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10 transition-colors duration-300">
        <td className="pl-6 pr-2 py-4 max-w-xs">
          <div className="flex items-center space-x-3 min-w-0">
            {employee.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={employee.avatarUrl}
                alt={employee.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-200/60 dark:ring-zinc-800/60 hover:scale-105 transition-all duration-300"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-500/10 hover:scale-105 transition-all duration-300 shrink-0">
                {employee.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h4 className="font-extrabold text-zinc-950 dark:text-zinc-50 text-sm truncate">{employee.name}</h4>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed truncate">{employee.email}</p>
            </div>
          </div>
        </td>

        <td className="px-6 py-4 text-center">
          <span className="inline-flex items-center justify-center rounded-full border w-44 py-1 text-xs font-bold text-purple-700 border-purple-200 bg-purple-50 dark:text-purple-400 dark:border-purple-900/30 dark:bg-purple-900/10 capitalize truncate">
            {employee.designation || (employee.role === 'superadmin' ? 'CEO' : (employee.role === 'admin' ? 'Admin' : 'Employee'))}
          </span>
        </td>

        <td className="px-6 py-4 text-center">
          <span className="inline-flex items-center justify-center">
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${employee.role === 'superadmin' ? 'bg-orange-100 text-orange-700' : employee.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {getDisplayRole(employee)}
            </span>
          </span>
        </td>

        <td className="px-6 py-4 text-center whitespace-nowrap">
          <div className="inline-flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="rounded-xl p-2 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:scale-105 transition-all dark:text-emerald-450 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-300 cursor-pointer"
              title={`View ${employee.name}`}
            >
              <Eye className="h-4.5 w-4.5" />
            </button>

            {isAdmin && (
              <>
                {(canEditDesignation || canEditRole) ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDraftDesignation(employee.designation || '');
                      setDraftRole(employee.role === 'user' || employee.role === 'employee' ? 'member' : employee.role);
                      setIsEditModalOpen(true);
                    }}
                    className={`rounded-xl p-2 transition-all cursor-pointer ${isEditModalOpen ? 'text-blue-500 bg-blue-50 hover:bg-blue-100 hover:scale-105 dark:text-blue-400 dark:bg-blue-950/20 dark:hover:bg-blue-950/40' : 'text-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:scale-105 dark:text-blue-400 dark:hover:bg-blue-950/20 dark:hover:text-blue-300'}`}
                    title="Edit"
                  >
                    <Edit className="h-4.5 w-4.5" />
                  </button>
                ) : (
                  <button type="button" className="rounded-xl p-2 invisible pointer-events-none" aria-hidden="true">
                    <Edit className="h-4.5 w-4.5" />
                  </button>
                )}

                {canBlockUser ? (
                  employee.isBlocked ? (
                    <button
                      type="button"
                      onClick={handleUnblockUser}
                      className="rounded-xl p-2 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 hover:scale-105 transition-all dark:text-emerald-400 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-300 cursor-pointer"
                      title={`Unblock ${employee.name}`}
                    >
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleBlockUser}
                      className="rounded-xl p-2 text-red-500 hover:bg-red-50 hover:text-red-600 hover:scale-105 transition-all dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300 cursor-pointer"
                      title={`Block ${employee.name}`}
                    >
                      <Ban className="h-4.5 w-4.5" />
                    </button>
                  )
                ) : (
                  <button type="button" className="rounded-xl p-2 invisible pointer-events-none" aria-hidden="true">
                    <Ban className="h-4.5 w-4.5" />
                  </button>
                )}

                {canRemoveUser ? (
                  <button
                    type="button"
                    onClick={handleRemoveUser}
                    className="rounded-xl p-2 text-red-500 hover:bg-red-50 hover:text-red-600 hover:scale-105 transition-all dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-300 cursor-pointer"
                    title={`Remove ${employee.name}`}
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                ) : (
                  <button type="button" className="rounded-xl p-2 invisible pointer-events-none" aria-hidden="true">
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Custom Confirmation Modal */}
          {confirmState.isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-sm rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl dark:border-zinc-800/80 dark:bg-zinc-950 relative z-10 text-left whitespace-normal">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-2">Confirm Action</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">{confirmState.message}</p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmState({ isOpen: false, action: null, message: '' })}
                    className="rounded-lg px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAction}
                    className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Profile Details Modal */}
          {isProfileOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl dark:border-zinc-800/80 dark:bg-zinc-950 relative z-10 text-left whitespace-normal">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Employee Profile</h3>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-center mb-2">
                    {employee.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={employee.avatarUrl} alt={employee.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-zinc-100 dark:ring-zinc-800" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-md">
                        {employee.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Employee ID</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 col-span-2 truncate" title={employee.id}>{employee.id}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Name</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 col-span-2">{employee.name}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Email</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 col-span-2 truncate" title={employee.email}>{employee.email}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Contact Number</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 col-span-2">
                      {employee.mobileNumber || 'Not Available'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pb-1">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Employee Type</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 col-span-2 capitalize">
                      {employee.designation || (employee.role === 'superadmin' ? 'CEO' : (employee.role === 'admin' ? 'Admin' : 'Employee'))}
                      <span className="text-xs text-zinc-500 ml-1">({employee.role === 'user' || employee.role === 'member' ? 'Employee' : employee.role})</span>
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Profile Modal */}
          {isEditModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl dark:border-zinc-800/80 dark:bg-zinc-950 relative z-10 text-left whitespace-normal">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Edit Employee Profile</h3>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-center mb-2">
                    {employee.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={employee.avatarUrl} alt={employee.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-zinc-100 dark:ring-zinc-800" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-md">
                        {employee.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Employee ID</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 col-span-2 truncate" title={employee.id}>{employee.id}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Name</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 col-span-2">{employee.name}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Email</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 col-span-2 truncate" title={employee.email}>{employee.email}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Contact Number</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 col-span-2">
                      {employee.mobileNumber || 'Not Available'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3 items-center">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Designation</span>
                    <div className="col-span-2">
                      {canEditDesignation ? (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setIsDesignationDropdownOpen(!isDesignationDropdownOpen);
                              setIsRoleDropdownOpen(false);
                            }}
                            className="w-full text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer flex items-center justify-between"
                          >
                            <span>{draftDesignation}</span>
                            <ChevronDown size={14} className={`transition-transform ${isDesignationDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {isDesignationDropdownOpen && (
                            <div className="absolute z-[110] top-full left-0 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-h-32 overflow-y-auto custom-scrollbar overflow-hidden">
                              {DESIGNATIONS.filter(des => des !== 'CEO' || employee.role === 'superadmin').map((des) => (
                                <button
                                  key={des}
                                  type="button"
                                  onClick={() => {
                                    setDraftDesignation(des);
                                    setIsDesignationDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-colors font-medium"
                                >
                                  {des}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{employee.designation || 'Employee'}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pb-1 items-center">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Role Type</span>
                    <div className="col-span-2">
                      {canEditRole ? (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setIsRoleDropdownOpen(!isRoleDropdownOpen);
                              setIsDesignationDropdownOpen(false);
                            }}
                            className="w-full text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer flex items-center justify-between"
                          >
                            <span className="capitalize">{draftRole === 'member' ? 'Employee' : draftRole}</span>
                            <ChevronDown size={14} className={`transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          
                          {isRoleDropdownOpen && (
                            <div className="absolute z-[110] top-full left-0 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-h-40 overflow-y-auto custom-scrollbar overflow-hidden">
                              <button
                                type="button"
                                onClick={() => { setDraftRole('member'); setIsRoleDropdownOpen(false); }}
                                className="w-full text-left px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-colors font-medium"
                              >
                                Employee
                              </button>
                              <button
                                type="button"
                                onClick={() => { setDraftRole('admin'); setIsRoleDropdownOpen(false); }}
                                className="w-full text-left px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-colors font-medium"
                              >
                                Admin
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 capitalize">
                          {employee.role === 'user' || employee.role === 'member' ? 'Employee' : employee.role}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="rounded-lg bg-blue-50 px-5 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors cursor-pointer shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (draftDesignation !== employee.designation) {
                        updateEmployeeDesignation(employee.id, draftDesignation);
                      }
                      if (draftRole !== employee.role) {
                        updateEmployeeRole(employee.id, draftRole);
                      }
                      setIsEditModalOpen(false);
                    }}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors cursor-pointer shadow-sm"
                  >
                    Save Information
                  </button>
                </div>
              </div>
            </div>
          )}
        </td>
      </tr>
    </>
  );
};
