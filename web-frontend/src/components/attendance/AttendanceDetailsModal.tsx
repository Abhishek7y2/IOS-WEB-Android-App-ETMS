import React from 'react';
import { AttendanceRecord } from '../../types/attendance';
import { X, Clock, MapPin, Building2, Calendar, User } from 'lucide-react';

interface Props {
  record: AttendanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceDetailsModal: React.FC<Props> = ({ record, isOpen, onClose }) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Attendance Details</h3>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-start justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{record.employeeName}</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">{record.designation} • {record.department}</p>
            </div>
            <div className="text-right">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold bg-zinc-100 text-zinc-800`}>
                {record.attendanceStatus}
              </span>
              <p className="text-sm text-zinc-600 mt-2 font-medium">{new Date(record.attendanceDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-4">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2">Timings</h4>
              
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-green-500" />
                <span className="text-zinc-600 dark:text-zinc-400 w-24">Check In:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '--:--:--'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-red-500" />
                <span className="text-zinc-600 dark:text-zinc-400 w-24">Check Out:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '--:--:--'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-blue-500" />
                <span className="text-zinc-600 dark:text-zinc-400 w-24">Total Hours:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{record.totalWorkingHours || 0}h</span>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-4">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2">Details</h4>
              
              <div className="flex items-center gap-3 text-sm">
                <Building2 size={16} className="text-zinc-500" />
                <span className="text-zinc-600 dark:text-zinc-400 w-24">Work Mode:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{record.workMode}</span>
              </div>
              
              {record.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={16} className="text-zinc-500" />
                  <span className="text-zinc-600 dark:text-zinc-400 w-24">Location:</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{record.location}</span>
                </div>
              )}
              
              {record.isLate && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={16} className="text-orange-500" />
                  <span className="text-zinc-600 dark:text-zinc-400 w-24">Late By:</span>
                  <span className="font-medium text-orange-600">{record.lateByMinutes} mins</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
