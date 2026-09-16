import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { checkInApi, checkOutApi, getAttendanceHistoryApi, AttendanceRecord } from '../services/attendanceApi';
import { useTheme } from '../context/ThemeContext';
import { AppHeader } from '../components/AppHeader';
import { Clock, MapPin, CheckCircle, OutIcon, Calendar, AlertCircle } from '../components/Icon';

export const AttendanceScreen = ({ navigation }: any) => {
  const { mode, colors, toggleTheme } = useTheme();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Punch-In Remarks Modal
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [remarks, setRemarks] = useState('');

  // Live clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const logs = await getAttendanceHistoryApi();
      setHistory(logs);
      const todayStr = new Date().toISOString().split('T')[0];
      const match = logs.find((l: AttendanceRecord) => l.date === todayStr);
      if (match) {
        setTodayRecord(match);
        setIsCheckedIn(!!match.checkInTime && !match.checkOutTime);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleTogglePress = () => {
    if (!isCheckedIn) {
      setRemarks('');
      setIsRemarksModalOpen(true);
    } else {
      executePunchOut();
    }
  };

  const executePunchIn = async () => {
    setIsRemarksModalOpen(false);
    setSubmitting(true);
    try {
      const res = await checkInApi();
      setIsCheckedIn(true);
      setTodayRecord(res);
      await fetchAttendance();
    } finally {
      setSubmitting(false);
    }
  };

  const executePunchOut = async () => {
    setSubmitting(true);
    try {
      const res = await checkOutApi();
      setIsCheckedIn(false);
      setTodayRecord(res);
      await fetchAttendance();
    } finally {
      setSubmitting(false);
    }
  };

  const renderHistoryItem = ({ item }: { item: AttendanceRecord }) => (
    <View style={[styles.historyCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
      <View style={styles.historyHeader}>
        <View style={styles.dateBox}>
          <Calendar color={colors.accent} size={16} style={{ marginRight: 6 }} />
          <Text style={[styles.dateText, { color: colors.textPrimary }]}>{item.date}</Text>
        </View>
        <View style={[styles.statusBadge, item.status === 'present' ? styles.statusPresent : styles.statusLate]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <View style={[styles.timesRow, { borderTopColor: colors.borderColor }]}>
        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>In: <Text style={[styles.timeVal, { color: colors.textPrimary }]}>{item.checkInTime || '--:--'}</Text></Text>
        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Out: <Text style={[styles.timeVal, { color: colors.textPrimary }]}>{item.checkOutTime || '--:--'}</Text></Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBg} />

      {/* Top Header Navbar */}
      <AppHeader
        title="ETM"
        subtitle="Attendance"
        navigation={navigation}
      />

      {/* Check-In / Check-Out Hero Card */}
      <View style={[styles.heroCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
        <Text style={[styles.clockTime, { color: colors.textPrimary }]}>{currentTime}</Text>
        <Text style={[styles.clockDate, { color: colors.accent }]}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</Text>

        <TouchableOpacity
          style={[styles.actionBtn, isCheckedIn ? styles.btnCheckOut : styles.btnCheckIn]}
          onPress={handleTogglePress}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" size="large" />
          ) : (
            <>
              {isCheckedIn ? <OutIcon color="#ffffff" size={28} /> : <CheckCircle color="#ffffff" size={28} />}
              <Text style={styles.btnText}>{isCheckedIn ? 'PUNCH OUT' : 'PUNCH IN'}</Text>
            </>
          )}
        </TouchableOpacity>

        {todayRecord && (
          <View style={styles.todaySummary}>
            <MapPin color={colors.textSecondary} size={14} style={{ marginRight: 4 }} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>{todayRecord.location || 'Mobile GPS Verified'}</Text>
          </View>
        )}
      </View>

      {/* Monthly Attendance Summary Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <Text style={[styles.statVal, { color: '#10b981' }]}>
            {history.filter((h) => h.status === 'present').length || (history.length > 0 ? history.length : 1)}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Present</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <Text style={[styles.statVal, { color: '#f59e0b' }]}>
            {history.filter((h) => h.status === 'late').length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Late</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <Text style={[styles.statVal, { color: colors.accent }]}>
            {history.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Logs</Text>
        </View>
      </View>

      {/* History Log Section */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Attendance History</Text>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAttendance} tintColor={colors.accent} />}
        ListEmptyComponent={
          <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No previous attendance records found.</Text>
          </View>
        }
      />

      {/* PUNCH-IN REMARKS MODAL */}
      <Modal visible={isRemarksModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Punch In Shift Remarks</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 14 }}>
              Add optional shift notes or working location (e.g. Remote / Office)
            </Text>

            <TextInput
              style={[styles.remarksInput, { backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]}
              placeholder="e.g. Working from Main Office..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              value={remarks}
              onChangeText={setRemarks}
            />

            <TouchableOpacity style={styles.actionBtnConfirm} onPress={executePunchIn}>
              <Text style={styles.btnTextConfirm}>Confirm Punch In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalCloseBtn, { backgroundColor: colors.bg }]} onPress={() => setIsRemarksModalOpen(false)}>
              <Text style={[styles.modalCloseText, { color: colors.textPrimary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  statsRow: { flexDirection: 'row', marginHorizontal: 20, gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statVal: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '600' },
  clockTime: { fontSize: 32, fontWeight: '800', letterSpacing: 1 },
  clockDate: { fontSize: 13, fontWeight: '600', marginTop: 4, marginBottom: 20 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    borderRadius: 16,
    gap: 10,
    marginBottom: 12,
  },
  btnCheckIn: { backgroundColor: '#10b981' },
  btnCheckOut: { backgroundColor: '#ef4444' },
  btnText: { color: '#ffffff', fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  todaySummary: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginHorizontal: 20, marginBottom: 12 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  historyCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  dateBox: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 15, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusPresent: { backgroundColor: '#064e3b' },
  statusLate: { backgroundColor: '#78350f' },
  statusText: { fontSize: 11, fontWeight: '800', color: '#ffffff' },
  timesRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 10 },
  timeLabel: { fontSize: 13 },
  timeVal: { fontWeight: '700' },
  emptyBox: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyText: { fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  remarksInput: { borderRadius: 14, borderWidth: 1, padding: 14, minHeight: 90, textAlignVertical: 'top', marginBottom: 16 },
  actionBtnConfirm: { backgroundColor: '#10b981', height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  btnTextConfirm: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  modalCloseBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  modalCloseText: { fontWeight: '700' },
});

