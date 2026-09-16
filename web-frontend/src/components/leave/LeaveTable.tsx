import React from 'react';
import { LeaveRequest } from '../../types/leave';
import { Eye, Check, X, FileText } from 'lucide-react';

interface Props {
  leaves: LeaveRequest[];
  loading: boolean;
  isAdmin: boolean;
  currentUserId?: string;
  onView: (leave: LeaveRequest) => void;
  onApprove?: (leave: LeaveRequest) => void;
  onReject?: (leave: LeaveRequest) => void;
  onCancel?: (leave: LeaveRequest) => void;
}

export const LeaveTable: React.FC<Props> = ({ leaves, loading, isAdmin, currentUserId, onView, onApprove, onReject, onCancel }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 grid grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => <div key={i} className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>)}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, j) => <div key={j} className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse"></div>)}
          </div>
        ))}
      </div>
    );
  }

  if (leaves.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col items-center justify-center">
        <FileText size={48} className="text-zinc-300 dark:text-zinc-700 mb-4" />
        <p className="text-zinc-600 dark:text-zinc-400 font-medium">No leave requests found.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Cancelled': 
      case 'Withdrawn': return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
            <th className="px-6 py-4 font-semibold">Employee</th>
            <th className="px-6 py-4 font-semibold">Leave Type</th>
            <th className="px-6 py-4 font-semibold">Duration</th>
            <th className="px-6 py-4 font-semibold">Days</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold">Applied On</th>
            <th className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {leaves.map((leave) => (
            <tr key={leave._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{leave.employeeName}</p>
                <p className="text-xs text-zinc-600">{leave.department || 'Employee'}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">{leave.leaveType}</p>
                {leave.halfDay && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mt-1 inline-block">Half Day ({leave.halfDaySession})</span>}
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                  {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {leave.totalDays} Day{leave.totalDays !== 1 && 's'}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(leave.status)}`}>
                  {leave.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                {new Date(leave.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onView(leave)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors" title="View Details">
                    <Eye size={16} />
                  </button>
                  
                  {isAdmin && leave.status === 'Pending' && (
                    <>
                      <button onClick={() => onApprove && onApprove(leave)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors" title="Approve">
                        <Check size={16} />
                      </button>
                      <button onClick={() => onReject && onReject(leave)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" title="Reject">
                        <X size={16} />
                      </button>
                    </>
                  )}

                  {!isAdmin && leave.status === 'Pending' && leave.employeeId === currentUserId && (
                    <button onClick={() => onCancel && onCancel(leave)} className="p-1.5 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors text-xs font-medium" title="Withdraw Request">
                      Withdraw
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
