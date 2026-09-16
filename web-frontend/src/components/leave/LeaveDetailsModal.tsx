import React from 'react';
import { LeaveRequest } from '../../types/leave';
import { X, Calendar, User, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  leave: LeaveRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LeaveDetailsModal: React.FC<Props> = ({ leave, isOpen, onClose }) => {
  if (!isOpen || !leave) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800">
        
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Leave Request Details</h3>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{leave.employeeName}</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">{leave.designation} • {leave.department}</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
              leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
              leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
              leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-zinc-100 text-zinc-700'
            }`}>
              {leave.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <FileText size={16} className="text-zinc-500" />
                <span className="text-zinc-600 dark:text-zinc-400 w-24">Leave Type:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{leave.leaveType}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-zinc-500" />
                <span className="text-zinc-600 dark:text-zinc-400 w-24">Duration:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-zinc-500" />
                <span className="text-zinc-600 dark:text-zinc-400 w-24">Total Days:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {leave.totalDays} Day{leave.totalDays !== 1 && 's'} {leave.halfDay && `(${leave.halfDaySession})`}
                </span>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-zinc-500" />
                <span className="text-zinc-600 dark:text-zinc-400 w-24">Applied On:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{new Date(leave.createdAt).toLocaleDateString()}</span>
              </div>
              {leave.approverName && (
                <div className="flex items-center gap-3 text-sm">
                  <User size={16} className="text-zinc-500" />
                  <span className="text-zinc-600 dark:text-zinc-400 w-24">Approver:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{leave.approverName}</span>
                </div>
              )}
              {leave.approvedDate && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={16} className="text-zinc-500" />
                  <span className="text-zinc-600 dark:text-zinc-400 w-24">Action Date:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{new Date(leave.approvedDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Reason</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
              {leave.reason}
            </p>
          </div>

          {leave.rejectionReason && (
            <div>
              <h3 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-2">
                <XCircle size={16} /> Rejection Reason
              </h3>
              <p className="text-red-700 dark:text-red-400 text-sm leading-relaxed bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-900/50">
                {leave.rejectionReason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
