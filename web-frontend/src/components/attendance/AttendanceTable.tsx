import React from 'react';
import { AttendanceRecord } from '../../types/attendance';
import { Eye, FileText, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  records: AttendanceRecord[];
  loading: boolean;
  isAdmin: boolean;
  onView: (record: AttendanceRecord) => void;
  onEdit?: (record: AttendanceRecord) => void;
}

export const AttendanceTable: React.FC<Props> = ({ records, loading, isAdmin, onView, onEdit }) => {
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

  if (records.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col items-center justify-center">
        <FileText size={48} className="text-zinc-300 dark:text-zinc-700 mb-4" />
        <p className="text-zinc-600 dark:text-zinc-400 font-medium">No attendance records found.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Present': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Absent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Late': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Half Day': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Work From Home': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400';
      case 'On-Site Visit': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'Holiday': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Leave': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Weekend': return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
            <th className="px-6 py-4 font-semibold">Employee</th>
            <th className="px-6 py-4 font-semibold">Date</th>
            <th className="px-6 py-4 font-semibold">Check-In / Out</th>
            <th className="px-6 py-4 font-semibold">Working Hours</th>
            <th className="px-6 py-4 font-semibold">Work Mode</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {records.map((record) => (
            <tr key={record._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{record.employeeName}</p>
                <p className="text-xs text-zinc-600">{record.department || 'Employee'}</p>
              </td>
              <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                {new Date(record.attendanceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              <td className="px-6 py-4 text-sm">
                <p className="text-zinc-900 dark:text-zinc-100">
                  <span className="text-zinc-600 text-xs">In: </span>
                  {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </p>
                <p className="text-zinc-900 dark:text-zinc-100 mt-1">
                  <span className="text-zinc-600 text-xs">Out: </span>
                  {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </p>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{record.totalWorkingHours ? `${record.totalWorkingHours}h` : '-'}</p>
                {record.overtimeHours ? <p className="text-[10px] text-green-600 font-semibold">+{record.overtimeHours}h OT</p> : null}
              </td>
              <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                {record.workMode}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(record.attendanceStatus)}`}>
                  {record.attendanceStatus}
                </span>
                {record.isLate && <span className="block text-[10px] text-orange-600 mt-1 font-semibold">Late by {record.lateByMinutes}m</span>}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onView(record)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors" title="View Details">
                    <Eye size={16} />
                  </button>
                  {isAdmin && onEdit && (
                    <button onClick={() => onEdit(record)} className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1.5 rounded transition-colors">
                      Edit
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
