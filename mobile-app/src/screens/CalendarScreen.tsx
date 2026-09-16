import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { AppHeader } from '../components/AppHeader';
import { getNoteByDateApi, saveNoteByDateApi } from '../services/notesApi';
import { getHolidaysApi, createHolidayApi, deleteHolidayApi, HolidayItem } from '../services/holidayApi';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Menu,
  CheckCircle2,
  Clock,
  CircleDashed,
  AlertTriangle,
  User,
  Plus,
  Trash2,
  X,
  Sun,
  Moon,
} from '../components/Icon';
import { Task } from '../types/task';

export const CalendarScreen = ({ navigation }: any) => {
  const { tasks } = useTasks();
  const { user } = useAuth();
  const { mode, colors, toggleTheme } = useTheme();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dateNotes, setDateNotes] = useState<Record<string, string>>({});

  // Holiday Modal state
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [holidayTitle, setHolidayTitle] = useState('');
  const [holidayDate, setHolidayDate] = useState(new Date().toISOString().split('T')[0]);
  const [holidayType, setHolidayType] = useState<'mandatory' | 'optional'>('mandatory');
  const [savingHoliday, setSavingHoliday] = useState(false);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    const list = await getHolidaysApi();
    setHolidays(list);
  };

  const handleAddHoliday = async () => {
    if (!holidayTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter a holiday title.');
      return;
    }
    setSavingHoliday(true);
    try {
      const created = await createHolidayApi({
        name: holidayTitle.trim(),
        date: holidayDate,
        type: holidayType,
      });
      setHolidays((prev) => [created, ...prev]);
      setHolidayTitle('');
      Alert.alert('Success', `Holiday "${created.title}" added to company calendar!`);
    } catch {
      Alert.alert('Error', 'Failed to add holiday.');
    } finally {
      setSavingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    await deleteHolidayApi(id);
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  };

  useEffect(() => {
    let isMounted = true;
    const fetchNote = async () => {
      const remoteNote = await getNoteByDateApi(selectedDate);
      if (isMounted && remoteNote) {
        setDateNotes((prev) => ({ ...prev, [selectedDate]: remoteNote }));
      }
    };
    fetchNote();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  const handleNoteChange = (val: string) => {
    setDateNotes((prev) => ({ ...prev, [selectedDate]: val }));
    saveNoteByDateApi(selectedDate, val);
  };

  // Month navigation state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate days matrix for calendar grid
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

  // Build grid items (padding empty slots + day numbers)
  const gridItems = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    gridItems.push({ type: 'empty', key: `empty-${i}` });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateFormatted = `${currentYear}-${monthStr}-${dayStr}`;
    
    // Find tasks matching due date
    const dayTasks = tasks.filter(t => t.dueDate === dateFormatted);
    gridItems.push({
      type: 'day',
      key: `day-${day}`,
      dayNumber: day,
      dateFormatted,
      tasks: dayTasks,
    });
  }

  // Tasks due on selected date
  const selectedDayTasks = tasks.filter(t => t.dueDate === selectedDate);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBg} />

      {/* Top Header Navbar */}
      <AppHeader
        title="ETM"
        subtitle="Calendar"
        navigation={navigation}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Month Navigator Banner */}
        <View style={[styles.monthHeader, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <TouchableOpacity onPress={handlePrevMonth} style={[styles.navBtn, { backgroundColor: colors.bg }]} activeOpacity={0.8}>
            <ChevronLeft color={colors.textPrimary} size={20} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity
              style={[styles.holidaysBtn, { backgroundColor: colors.bg, borderColor: colors.borderColor }]}
              onPress={() => setHolidayModalOpen(true)}
            >
              <Calendar color="#f59e0b" size={14} style={{ marginRight: 4 }} />
              <Text style={[styles.holidaysBtnText, { color: colors.textPrimary }]}>Holidays</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNextMonth} style={[styles.navBtn, { backgroundColor: colors.bg }]} activeOpacity={0.8}>
              <ChevronRight color={colors.textPrimary} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Days of Week Row */}
        <View style={styles.weekRow}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
            <Text key={i} style={[styles.weekDayText, { color: colors.textSecondary }]}>
              {d}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={[styles.gridContainer, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          {gridItems.map((item) => {
            if (item.type === 'empty') {
              return <View key={item.key} style={styles.dayTileEmpty} />;
            }

            const isSelected = item.dateFormatted === selectedDate;
            const isToday =
              item.dateFormatted === new Date().toISOString().split('T')[0];
            const hasTasks = item.tasks && item.tasks.length > 0;

            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.dayTile,
                  isSelected && { backgroundColor: colors.accent },
                  isToday && !isSelected && styles.dayTileToday,
                ]}
                onPress={() => setSelectedDate(item.dateFormatted!)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dayNum,
                    { color: colors.textPrimary },
                    isSelected && styles.dayNumSelected,
                    isToday && !isSelected && styles.dayNumToday,
                  ]}
                >
                  {item.dayNumber}
                </Text>
                {hasTasks ? (
                  <View style={styles.dotsRow}>
                    {item.tasks!.slice(0, 3).map((t, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.dot,
                          {
                            backgroundColor:
                              t.status === 'completed'
                                ? '#10b981'
                                : t.priority === 'urgent' || t.priority === 'high'
                                ? '#ef4444'
                                : '#60a5fa',
                          },
                        ]}
                      />
                    ))}
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Date Summary Header */}
        <View style={[styles.eventsSection, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <View style={[styles.eventsHeader, { borderBottomColor: colors.borderColor }]}>
            <Calendar color={colors.accent} size={18} style={{ marginRight: 8 }} />
            <Text style={[styles.eventsTitle, { color: colors.textPrimary }]}>
              Schedule for {selectedDate}
            </Text>
          </View>

          {selectedDayTasks.length > 0 ? (
            selectedDayTasks.map((t) => (
              <View key={t.id} style={[styles.taskEventCard, { backgroundColor: colors.bg, borderColor: colors.borderColor }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskTitle, { color: colors.textPrimary }]}>{t.title}</Text>
                  <Text style={[styles.taskDesc, { color: colors.textSecondary }]} numberOfLines={2}>{t.description}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    t.status === 'completed'
                      ? styles.pillCompleted
                      : t.status === 'in_progress'
                      ? styles.pillInProgress
                      : styles.pillPending,
                  ]}
                >
                  <Text style={styles.pillText}>{t.status.replace('_', ' ').toUpperCase()}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noEventsBox}>
              <Text style={[styles.noEventsText, { color: colors.textSecondary }]}>No tasks or events scheduled for this date.</Text>
            </View>
          )}

          {/* Quick Notepad for Selected Date */}
          <View style={[styles.notepadContainer, { borderTopColor: colors.borderColor }]}>
            <Text style={[styles.notepadTitle, { color: colors.accent }]}>Date Quick Notepad ({selectedDate})</Text>
            <View style={[styles.notepadInputRow, { backgroundColor: colors.bg, borderColor: colors.borderColor }]}>
              <TextInput
                style={[styles.notepadInput, { color: colors.textPrimary }]}
                placeholder="Add private note for this date..."
                placeholderTextColor={colors.textSecondary}
                value={dateNotes[selectedDate] || ''}
                onChangeText={handleNoteChange}
                multiline
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Company Holiday Management Modal */}
      <Modal visible={holidayModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Calendar color="#f59e0b" size={20} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Company Holidays</Text>
              </View>
              <TouchableOpacity onPress={() => setHolidayModalOpen(false)}>
                <X color={colors.textSecondary} size={22} />
              </TouchableOpacity>
            </View>

            {isAdmin && (
              <View style={[styles.addHolidayBox, { backgroundColor: colors.bg, borderColor: colors.borderColor }]}>
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Holiday Name *</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.cardBg, borderColor: colors.borderColor, color: colors.textPrimary }]}
                  placeholder="e.g. Independence Day"
                  placeholderTextColor={colors.textSecondary}
                  value={holidayTitle}
                  onChangeText={setHolidayTitle}
                />
                <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Date (YYYY-MM-DD) *</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.cardBg, borderColor: colors.borderColor, color: colors.textPrimary }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                  value={holidayDate}
                  onChangeText={setHolidayDate}
                />

                <TouchableOpacity
                  style={[styles.addHolidayBtn, savingHoliday && { opacity: 0.5 }]}
                  onPress={handleAddHoliday}
                  disabled={savingHoliday}
                >
                  {savingHoliday ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Plus color="#ffffff" size={16} style={{ marginRight: 6 }} />
                      <Text style={styles.addHolidayBtnText}>Add Company Holiday</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <Text style={[styles.holidayListTitle, { color: colors.textSecondary }]}>Official Annual Holidays ({holidays.length})</Text>
            <ScrollView style={{ maxHeight: 220 }}>
              {holidays.map((h) => (
                <View key={h.id} style={[styles.holidayItem, { backgroundColor: colors.bg, borderColor: colors.borderColor }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.holidayItemTitle, { color: colors.textPrimary }]}>{h.title}</Text>
                    <Text style={styles.holidayItemSub}>{h.dateStr} • {h.type.toUpperCase()}</Text>
                  </View>
                  {isAdmin && (
                    <TouchableOpacity onPress={() => handleDeleteHoliday(h.id)} style={{ padding: 6 }}>
                      <Trash2 color="#ef4444" size={16} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
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
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  holidaysBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  holidaysBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  dayTileEmpty: {
    width: '14.28%',
    height: 48,
  },
  dayTile: {
    width: '14.28%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  dayTileToday: {
    borderWidth: 1.5,
    borderColor: '#38bdf8',
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '700',
  },
  dayNumSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  dayNumToday: {
    color: '#38bdf8',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  eventsSection: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  eventsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  eventsTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  taskEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  taskDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  pillCompleted: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  pillInProgress: {
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
  },
  pillPending: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f8fafc',
  },
  noEventsBox: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  noEventsText: {
    fontSize: 13,
  },
  notepadContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  notepadTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  notepadInputRow: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  notepadInput: {
    fontSize: 13,
    minHeight: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  addHolidayBox: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 6,
  },
  modalInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
  },
  addHolidayBtn: {
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  addHolidayBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  holidayListTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  holidayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  holidayItemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  holidayItemSub: {
    fontSize: 11,
    color: '#f59e0b',
    marginTop: 2,
  },
});



