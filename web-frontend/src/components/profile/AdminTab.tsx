'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/axios';
import { Users, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  isVerified: boolean;
}

export const AdminTab: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await axiosInstance.get('/profile/team');
        setTeam(res.data.data);
      } catch (error) {
        console.error('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
          Admin Area <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Restricted</span>
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">View team members and administrative scope.</p>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
          <ShieldAlert className="text-red-500" size={16} /> Permission Scope
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
          As an Administrator, you have full access to manage employee profiles, task assignments, and leave requests. 
          Please exercise caution as changes made here are permanent and affect the entire workspace.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
          <Users className="text-blue-500" size={16} />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Team Members Overview</h3>
        </div>
        
        {loading ? (
          <div className="p-8 flex justify-center"><div className="animate-spin h-6 w-6 border-b-2 border-blue-500 rounded-full"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-xs uppercase text-zinc-600">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Designation</th>
                  <th className="px-6 py-3 font-medium">Department</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {team.map(member => (
                  <tr key={member._id} className="text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-3">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{member.name}</p>
                      <p className="text-xs text-zinc-600">{member.email}</p>
                    </td>
                    <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400">{member.designation || '-'}</td>
                    <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400">{member.department || '-'}</td>
                    <td className="px-6 py-3">
                      {member.isVerified ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle size={14} /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
                          <XCircle size={14} /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
