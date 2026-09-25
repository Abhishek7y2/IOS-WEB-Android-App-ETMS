import React, { useState, useEffect } from 'react';
import { X, Save, ShieldAlert } from 'lucide-react';
import axiosInstance from '../../services/axios';

interface LeaveBalanceEditorModalProps {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
}

interface BalanceItem {
  leaveType: string;
  total: number;
  used: number;
  remaining: number;
}

export const LeaveBalanceEditorModal: React.FC<LeaveBalanceEditorModalProps> = ({ employeeId, employeeName, onClose }) => {
  const [balances, setBalances] = useState<BalanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const year = new Date().getFullYear();
        const res = await axiosInstance.get(`/leaves/balance?employeeId=${employeeId}&year=${year}`);
        if (res.data.data && res.data.data.balances && res.data.data.balances.length > 0) {
          setBalances(res.data.data.balances);
        } else {
          // Defaults if none exist
          setBalances([
            { leaveType: 'Annual Leave', total: 10, used: 0, remaining: 10 },
            { leaveType: 'Sick Leave', total: 10, used: 0, remaining: 10 },
            { leaveType: 'Casual Leave', total: 10, used: 0, remaining: 10 }
          ]);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load leave balances.');
      } finally {
        setLoading(false);
      }
    };
    fetchBalances();
  }, [employeeId]);

  const handleTotalChange = (index: number, newTotal: string) => {
    const total = parseInt(newTotal) || 0;
    const newBalances = [...balances];
    newBalances[index].total = total;
    newBalances[index].remaining = total - newBalances[index].used;
    setBalances(newBalances);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const year = new Date().getFullYear();
      await axiosInstance.put(`/leaves/balance/${employeeId}`, {
        year,
        newBalances: balances.map(b => ({ leaveType: b.leaveType, total: b.total }))
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update leave balances.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldAlert className="text-red-500" size={16} /> 
              Edit Leave Balance
            </h3>
            <p className="text-xs text-zinc-500">{employeeName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {loading ? (
            <div className="flex justify-center p-4"><div className="animate-spin h-6 w-6 border-b-2 border-blue-500 rounded-full"></div></div>
          ) : error ? (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>
          ) : (
            balances.map((balance, idx) => (
              <div key={balance.leaveType} className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{balance.leaveType}</span>
                  <span className="text-xs text-zinc-500">Used: <strong className="text-zinc-700 dark:text-zinc-300">{balance.used}</strong></span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-semibold text-zinc-500 mb-1 block">Total Allowance</label>
                    <input 
                      type="number" 
                      min="0"
                      value={balance.total} 
                      onChange={(e) => handleTotalChange(idx, e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-semibold text-zinc-500 mb-1 block">Remaining</label>
                    <div className={`w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-center font-semibold ${balance.remaining < 0 ? 'text-red-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      {balance.remaining}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-900/50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || loading || !!error}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
