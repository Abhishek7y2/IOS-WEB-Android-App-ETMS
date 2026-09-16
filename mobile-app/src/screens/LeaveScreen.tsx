import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { applyLeaveApi, getMyLeavesApi, LeaveRequest, LeaveBalance } from '../services/leaveApi';
import { AppHeader } from '../components/AppHeader';
import { Calendar, Plus, X, AlertCircle, CheckCircle2, Clock, XCircle } from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { socketService } from '../services/socketService';

export const LeaveScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { mode, colors, toggleTheme } = useTheme();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance>({ sickLeave: 12, casualLeave: 12, earnedLeave: 15 });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Form State
  const [leaveType, setLeaveType] = useState<'sick' | 'casual' | 'earned'>('sick');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyLeavesApi();
      setLeaves(data.leaves);
      setBalances(data.balances);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();

    socketService.connect();

    const unsubCreated = socketService.subscribe('leave.created', (envelope) => {
      fetchLeaves();
    });

    const unsubApproved = socketService.subscribe('leave.approved', (envelope) => {
      fetchLeaves();
    });

    const unsubRejected = socketService.subscribe('leave.rejected', (envelope) => {
      fetchLeaves();
    });

    return () => {
      unsubCreated();
      unsubApproved();
      unsubRejected();
    };
  }, [fetchLeaves]);

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    setLeaves((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const handleApplyLeave = async () => {
    if (!reason.trim() || reason.trim().length < 10) {
      setError('Please provide a reason of at least 10 characters.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('Please enter valid dates in YYYY-MM-DD format.');
      return;
    }

    if (start > end) {
      setError('Start date cannot be after end date.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (startDate < todayStr) {
      setError('Planned leave start date cannot be in the past.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const newLeave = await applyLeaveApi({
        leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      });
      setLeaves((prev) => [newLeave, ...prev]);
      setModalVisible(false);
      setReason('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  const isManager = user?.role === 'admin' || user?.role === 'superadmin';

  const renderLeaveItem = ({ item }: { item: LeaveRequest }) => (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.typeText, { color: colors.textPrimary }]}>{item.leaveType.toUpperCase()} LEAVE</Text>
        <View style={[styles.statusBadge, item.status === 'approved' ? styles.bgApproved : item.status === 'rejected' ? styles.bgRejected : styles.bgPending]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={[styles.reasonText, { color: colors.textSecondary }]}>{item.reason}</Text>
      <View style={[styles.cardFooter, { borderTopColor: colors.borderColor }]}>
        <Calendar color={colors.textSecondary} size={14} style={{ marginRight: 6 }} />
        <Text style={[styles.dateRange, { color: colors.accent }]}>{item.startDate} → {item.endDate}</Text>
      </View>

      {/* Admin / Manager Action Controls */}
      {isManager && item.status === 'pending' && (
        <View style={[styles.adminActionRow, { borderTopColor: colors.borderColor }]}>
          <TouchableOpacity
            style={[styles.adminBtn, { backgroundColor: 'rgba(52, 211, 153, 0.15)', borderColor: '#10b981' }]}
            onPress={() => handleUpdateStatus(item.id, 'approved')}
          >
            <CheckCircle2 color="#10b981" size={14} style={{ marginRight: 4 }} />
            <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '700' }}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.adminBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444' }]}
            onPress={() => handleUpdateStatus(item.id, 'rejected')}
          >
            <XCircle color="#ef4444" size={14} style={{ marginRight: 4 }} />
            <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '700' }}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBg} />

      {/* Top Header Navbar */}
      <AppHeader
        title="ETM"
        subtitle="Leave Portal"
        navigation={navigation}
      />

      {/* Quotas Grid */}
      <View style={styles.quotaRow}>
        <View style={[styles.quotaCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <Text style={[styles.quotaVal, { color: colors.accent }]}>{balances.sickLeave}</Text>
          <Text style={[styles.quotaLabel, { color: colors.textSecondary }]}>Sick Leave</Text>
        </View>
        <View style={[styles.quotaCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <Text style={[styles.quotaVal, { color: colors.accent }]}>{balances.casualLeave}</Text>
          <Text style={[styles.quotaLabel, { color: colors.textSecondary }]}>Casual Leave</Text>
        </View>
        <View style={[styles.quotaCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <Text style={[styles.quotaVal, { color: colors.accent }]}>{balances.earnedLeave}</Text>
          <Text style={[styles.quotaLabel, { color: colors.textSecondary }]}>Earned Leave</Text>
        </View>
      </View>

      {/* Leave Applications Header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>My Applications</Text>
        <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colors.accent }]} onPress={() => setModalVisible(true)}>
          <Plus color="#ffffff" size={16} style={{ marginRight: 4 }} />
          <Text style={styles.applyBtnText}>Apply Leave</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={leaves}
        keyExtractor={(item) => item.id}
        renderItem={renderLeaveItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchLeaves} tintColor={colors.accent} />}
        ListEmptyComponent={
          <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No leave applications submitted yet.</Text>
          </View>
        }
      />

      {/* Apply Leave Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderColor }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Apply For Leave</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              {error && (
                <View style={styles.errorBox}>
                  <AlertCircle color="#ef4444" size={18} style={{ marginRight: 8 }} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Leave Type */}
              <Text style={[styles.label, { color: colors.textPrimary }]}>Leave Category</Text>
              <View style={styles.typeRow}>
                {(['sick', 'casual', 'earned'] as const).map((t) => {
                  const isActive = leaveType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.typePill,
                        { backgroundColor: colors.bg, borderColor: colors.borderColor },
                        isActive && { backgroundColor: colors.accent, borderColor: colors.accent }
                      ]}
                      onPress={() => setLeaveType(t)}
                    >
                      <Text style={[styles.typePillText, { color: colors.textSecondary }, isActive && { color: '#ffffff' }]}>{t.toUpperCase()}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Start Date */}
              <Text style={[styles.label, { color: colors.textPrimary }]}>Start Date (YYYY-MM-DD)</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]} value={startDate} onChangeText={setStartDate} placeholder="2026-10-01" placeholderTextColor={colors.textSecondary} />

              {/* End Date */}
              <Text style={[styles.label, { color: colors.textPrimary }]}>End Date (YYYY-MM-DD)</Text>
              <TextInput style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]} value={endDate} onChangeText={setEndDate} placeholder="2026-10-05" placeholderTextColor={colors.textSecondary} />

              {/* Reason */}
              <Text style={[styles.label, { color: colors.textPrimary }]}>Reason For Leave *</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 10, backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]}
                value={reason}
                onChangeText={setReason}
                multiline
                placeholder="Brief reason for your leave application..."
                placeholderTextColor={colors.textSecondary}
              />

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.accent }, submitting && { opacity: 0.7 }]}
                onPress={handleApplyLeave}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.submitBtnText}>Submit Application</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  quotaRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 14,
    marginBottom: 20,
  },
  quotaCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  quotaVal: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 2,
  },
  quotaLabel: {
    fontSize: 11,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bgApproved: { backgroundColor: '#064e3b' },
  bgRejected: { backgroundColor: '#451a1a' },
  bgPending: { backgroundColor: '#451a03' },
  statusText: { fontSize: 10, fontWeight: '800', color: '#ffffff' },
  reasonText: { fontSize: 14, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: 10 },
  dateRange: { fontSize: 12, fontWeight: '600' },
  adminActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  adminBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  emptyBox: { borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1 },
  emptyText: { fontSize: 14 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.8)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#451a1a', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText: { color: '#fca5a5', fontSize: 13 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  typePill: { flex: 1, borderRadius: 12, borderWidth: 1, paddingVertical: 10, alignItems: 'center' },
  typePillText: { fontSize: 11, fontWeight: '700' },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 48, fontSize: 15, marginBottom: 14 },
  submitBtn: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 30 },
  submitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});

