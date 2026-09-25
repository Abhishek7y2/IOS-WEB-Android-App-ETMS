import React, { useState, useEffect } from 'react';
import { useLeave } from '../../context/LeaveContext';
import { LeaveType } from '../../types/leave';

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const LeaveForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const { applyLeave, balance } = useLeave();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    leaveType: 'Sick Leave' as LeaveType,
    startDate: '',
    endDate: '',
    halfDay: false,
    halfDaySession: 'Morning',
    reason: ''
  });

  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      if (formData.halfDay) {
        setTotalDays(0.5);
      } else {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(diffDays > 0 ? diffDays : 0);
      }
    } else {
      setTotalDays(0);
    }
  }, [formData.startDate, formData.endDate, formData.halfDay]);

  const getBalanceForType = (type: string) => {
    if (!balance || !balance.balances) return 0; // Default if not loaded yet
    const item = balance.balances.find(b => b.leaveType === type);
    return item ? item.remaining : 0;
  };

  const availableBalance = getBalanceForType(formData.leaveType);

  const getValidationError = () => {
    // We only validate against balance if it's loaded, otherwise we let it pass for now to avoid false errors while loading.
    if (balance && balance.balances) {
      if (availableBalance === 0) {
        return `You don't have remaining leaves for ${formData.leaveType}.`;
      }
      if (totalDays > availableBalance) {
        return `You have only ${availableBalance} leaves remaining. You are applying for ${totalDays.toFixed(1)} days.`;
      }
    }

    if (formData.startDate) {
        const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
        if (formData.startDate === todayStr) {
            const now = new Date();
            const timeInMinutes = now.getHours() * 60 + now.getMinutes();

            if (!formData.halfDay) {
                if (timeInMinutes >= 600) {
                    return "Full day leaves for today must be applied before 10:00 AM.";
                }
            } else {
                if (formData.halfDaySession === 'Morning') {
                    if (timeInMinutes >= 540) {
                        return "Morning half-day leaves for today must be applied before 9:00 AM.";
                    }
                } else {
                    if (timeInMinutes >= 780) {
                        return "Afternoon half-day leaves for today must be applied before 1:00 PM.";
                    }
                }
            }
        }
    }
    return null;
  };

  const validationError = getValidationError();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date cannot be before start date.');
      return;
    }

    if (formData.reason.length < 10) {
      setError('Reason must be at least 10 characters long.');
      return;
    }

    try {
      setLoading(true);
      await applyLeave({ ...formData, totalDays });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const leaveTypes = [
    'Sick Leave', 'Casual Leave', 'Earned Leave', 'Annual Leave', 
    'Half-Day Leave', 'Work From Home', 'Maternity Leave', 
    'Paternity Leave', 'Marriage Leave', 'Bereavement Leave', 
    'Compensatory Leave', 'Unpaid Leave'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/40 font-semibold">{error}</div>}
      {validationError && <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/40 font-semibold">{validationError}</div>}
      
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
          Leave Type <span className="text-red-500">*</span>
        </label>
        <select 
          name="leaveType" 
          value={formData.leaveType} 
          onChange={handleChange}
          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none transition duration-200 focus:border-teal-700 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-700/20 font-semibold cursor-pointer"
          required
        >
          {leaveTypes.map(type => (
            <option key={type} value={type}>
              {type} ({balance ? getBalanceForType(type) : 0} left)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input 
            type="date" 
            name="startDate" 
            value={formData.startDate} 
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none transition duration-200 focus:border-teal-700 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-700/20"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            End Date <span className="text-red-500">*</span>
          </label>
          <input 
            type="date" 
            name="endDate" 
            value={formData.endDate} 
            onChange={handleChange}
            disabled={formData.halfDay}
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none transition duration-200 focus:border-teal-700 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-700/20 disabled:opacity-50"
            required
            min={formData.startDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            name="halfDay" 
            checked={formData.halfDay} 
            onChange={(e) => {
              handleChange(e);
              if (e.target.checked && formData.startDate) {
                setFormData(prev => ({ ...prev, endDate: prev.startDate }));
              }
            }}
            className="w-4 h-4 text-teal-700 rounded border-zinc-300 focus:ring-teal-700/20 cursor-pointer"
          />
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Half Day</span>
        </label>
        
        {formData.halfDay && (
          <select 
            name="halfDaySession" 
            value={formData.halfDaySession} 
            onChange={handleChange}
            className="p-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 outline-none focus:border-teal-700 font-semibold cursor-pointer"
          >
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
          </select>
        )}
      </div>

      <div className="p-3 bg-teal-50 dark:bg-teal-950/20 text-teal-800 dark:text-teal-300 rounded-xl text-xs font-bold border border-teal-100 dark:border-teal-900/30">
        Total Days: {totalDays}
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
          Reason <span className="text-red-500">*</span>
        </label>
        <textarea 
          name="reason" 
          value={formData.reason} 
          onChange={handleChange}
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none transition duration-200 focus:border-teal-700 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-700/20 resize-none"
          placeholder="Please provide a valid reason..."
          required
        />
        <div className="text-right text-[10px] font-semibold text-zinc-500 mt-1">{formData.reason.length}/500</div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          disabled={loading || totalDays === 0 || validationError !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f3f33] hover:bg-[#0c3128] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-900/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>}
          Submit Request
        </button>
      </div>
    </form>
  );
};
