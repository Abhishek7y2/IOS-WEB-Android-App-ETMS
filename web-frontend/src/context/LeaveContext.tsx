'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axiosInstance from '../services/axios';
import { socketClient } from '../services/socketClient';
import { LeaveRequest, LeaveBalance, LeaveStats } from '../types/leave';

interface LeaveContextType {
  leaves: LeaveRequest[];
  balance: LeaveBalance | null;
  stats: LeaveStats | null;
  loading: boolean;
  fetchLeaves: (filters?: any) => Promise<void>;
  fetchBalance: () => Promise<void>;
  fetchStats: () => Promise<void>;
  applyLeave: (data: any) => Promise<void>;
  updateLeaveStatus: (id: string, status: string, rejectionReason?: string) => Promise<void>;
  deleteLeave: (id: string) => Promise<void>;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const LeaveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [stats, setStats] = useState<LeaveStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLeaves = useCallback(async (filters: any = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      const res = await axiosInstance.get(`/leaves?${params.toString()}`);
      setLeaves(res.data.data);
    } catch (error) {
      console.error('Failed to fetch leaves', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/leaves/balance');
      setBalance(res.data.data);
    } catch (error) {
      console.error('Failed to fetch balance', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/leaves/stats');
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  }, []);

  useEffect(() => {
    socketClient.connect();

    const refreshAll = () => {
      fetchLeaves();
      fetchBalance();
      fetchStats();
    };

    const unsubCreated = socketClient.subscribe('leave.created', (envelope) => {
      console.log('[Web Realtime] leave.created event received:', envelope);
      refreshAll();
    });

    const unsubApproved = socketClient.subscribe('leave.approved', (envelope) => {
      console.log('[Web Realtime] leave.approved event received:', envelope);
      refreshAll();
    });

    const unsubRejected = socketClient.subscribe('leave.rejected', (envelope) => {
      console.log('[Web Realtime] leave.rejected event received:', envelope);
      refreshAll();
    });

    return () => {
      unsubCreated();
      unsubApproved();
      unsubRejected();
    };
  }, [fetchLeaves, fetchBalance, fetchStats]);

  const applyLeave = async (data: any) => {
    try {
      await axiosInstance.post('/leaves', data);
      await fetchLeaves();
      await fetchBalance();
      await fetchStats();
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to apply leave';
    }
  };

  const updateLeaveStatus = async (id: string, status: string, rejectionReason?: string) => {
    try {
      await axiosInstance.put(`/leaves/${id}`, { status, rejectionReason });
      await fetchLeaves();
      await fetchBalance();
      await fetchStats();
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to update leave status';
    }
  };

  const deleteLeave = async (id: string) => {
    try {
      await axiosInstance.delete(`/leaves/${id}`);
      await fetchLeaves();
      await fetchStats();
    } catch (error: any) {
      throw error.response?.data?.message || 'Failed to delete leave';
    }
  };

  return (
    <LeaveContext.Provider value={{
      leaves, balance, stats, loading,
      fetchLeaves, fetchBalance, fetchStats,
      applyLeave, updateLeaveStatus, deleteLeave
    }}>
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (context === undefined) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};
