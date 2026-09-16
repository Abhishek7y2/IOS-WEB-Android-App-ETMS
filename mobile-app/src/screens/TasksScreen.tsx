import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Task, TaskPriority, TaskStatus } from '../types/task';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { TaskDetailsModal } from '../components/TaskDetailsModal';
import { AppHeader } from '../components/AppHeader';
import {
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  CircleDashed,
  Trash2,
  Download,
  Eye,
  Pencil,
  FileText,
  X,
  ArrowRight,
  FilterX,
  User,
} from '../components/Icon';

const priorityColorMap: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  medium: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  high: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  urgent: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
};

export const TasksScreen = ({ navigation }: any) => {
  const {
    tasks,
    employees,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    loading,
    refreshTasks,
    updateTaskStatus,
    updateTask,
    deleteTask,
  } = useTasks();

  const { user } = useAuth();
  const { mode, colors } = useTheme();
  const isDark = mode === 'dark';

  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'superadmin' ||
    user?.designation?.toLowerCase() === 'admin' ||
    user?.designation?.toLowerCase() === 'ceo' ||
    user?.designation?.toLowerCase() === 'project manager';

  // Filters State
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Modals State
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Filtered & Sorted Tasks matching Web Frontend logic
  const displayedTasks = useMemo(() => {
    return tasks.filter((task) => {
      const query = searchQuery.trim().toLowerCase();
      const assignedEmp = employees.find((e) => e.id === task.assignedTo);
      const assigneeName = assignedEmp ? assignedEmp.name.toLowerCase() : '';

      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        (task.description || '').toLowerCase().includes(query) ||
        assigneeName.includes(query);

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'pending'
          ? task.status === 'todo'
          : task.status === statusFilter;

      const matchesPriority =
        priorityFilter === 'all' ? true : task.priority === priorityFilter;

      let matchesDate = true;
      if (startDateFilter) {
        matchesDate = matchesDate && Boolean(task.dueDate && task.dueDate >= startDateFilter);
      }
      if (endDateFilter) {
        matchesDate = matchesDate && Boolean(task.dueDate && task.dueDate <= endDateFilter);
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });
  }, [tasks, employees, searchQuery, statusFilter, priorityFilter, startDateFilter, endDateFilter]);

  // Date Presets (Matching Web Parity)
  const setPresetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDateFilter(today);
    setEndDateFilter(today);
  };

  const setPresetThisWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diffToMon));
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    setStartDateFilter(mon.toISOString().split('T')[0]);
    setEndDateFilter(sun.toISOString().split('T')[0]);
  };

  const setPresetThisMonth = () => {
    const d = new Date();
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    setStartDateFilter(firstDay.toISOString().split('T')[0]);
    setEndDateFilter(lastDay.toISOString().split('T')[0]);
  };

  const clearDateFilters = () => {
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const isDateFiltered = Boolean(startDateFilter || endDateFilter);

  // Export CSV
  const handleExportCsv = async () => {
    if (displayedTasks.length === 0) {
      Alert.alert('Export Tasks', 'No tasks available to export.');
      return;
    }

    const headers = 'S.No,Title,Description,Assigned To,Priority,Status,Due Date\n';
    const rows = displayedTasks
      .map((t, idx) => {
        const emp = employees.find((e) => e.id === t.assignedTo);
        const name = emp ? `${emp.name} (${emp.designation || 'Staff'})` : 'Unassigned';
        return `"${idx + 1}","${t.title.replace(/"/g, '""')}","${(t.description || '').replace(/"/g, '""')}","${name}","${t.priority}","${t.status}","${t.dueDate || 'N/A'}"`;
      })
      .join('\n');

    try {
      await Share.share({
        title: 'Task_Manager_Report.csv',
        message: headers + rows,
      });
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  const handleDownloadSingleTask = async (task: Task) => {
    const emp = employees.find((e) => e.id === task.assignedTo);
    const name = emp ? `${emp.name} (${emp.designation || 'Staff'})` : 'Unassigned';
    const content = `Task: ${task.title}\nDescription: ${task.description}\nAssigned To: ${name}\nPriority: ${task.priority}\nStatus: ${task.status}\nDue Date: ${task.dueDate || 'N/A'}`;
    try {
      await Share.share({
        title: `Task_${task.id.substring(0, 8)}`,
        message: content,
      });
    } catch {}
  };

  const handleConfirmDelete = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(task.id);
          },
        },
      ]
    );
  };

  const handleOpenEdit = (task: Task) => {
    setSelectedTaskForEdit(task);
    setEditModalVisible(true);
  };

  const handleOpenDetails = (task: Task) => {
    setViewingTask(task);
    setDetailsModalVisible(true);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No deadline';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  };

  const getPriorityStyle = (priority: string) => {
    const p = priority?.toLowerCase() || 'medium';
    return priorityColorMap[p] || priorityColorMap.medium;
  };

  // Render Task Item Card
  const renderTaskCard = ({ item, index }: { item: Task; index: number }) => {
    const assignedEmp = employees.find(
      (e) => e.id === item.assignedTo || (item.assignedTo as any)?.id === e.id
    );
    const empName =
      assignedEmp?.name ||
      (typeof item.assignedTo === 'object' && (item.assignedTo as any)?.name) ||
      'Unassigned';
    const empRole = assignedEmp?.designation || 'Specialist';
    const pStyle = getPriorityStyle(item.priority);

    return (
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
        {/* Card Top: S.No & Title & Actions */}
        <View style={styles.cardTopRow}>
          {/* S.No Badge */}
          <View style={[styles.snoBadge, { backgroundColor: isDark ? '#1e3a8a30' : '#eff6ff', borderColor: isDark ? '#1e40af' : '#bfdbfe' }]}>
            <Text style={[styles.snoText, { color: isDark ? '#60a5fa' : '#2563eb' }]}>
              {index + 1}
            </Text>
          </View>

          {/* Title and Description */}
          <TouchableOpacity
            style={styles.cardTitleBox}
            onPress={() => handleOpenDetails(item)}
            activeOpacity={0.7}
          >
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description || 'No description provided.'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card Middle: Assigned To */}
        <View style={[styles.assigneeRow, { borderTopColor: colors.borderColor, borderBottomColor: colors.borderColor }]}>
          <View style={styles.assigneeLeft}>
            <View style={[styles.empAvatar, { backgroundColor: isDark ? '#0f766e' : '#0d9488' }]}>
              <Text style={styles.empAvatarText}>
                {empName
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, marginRight: 6 }}>
              <Text style={[styles.empName, { color: colors.textPrimary }]} numberOfLines={1}>
                {empName}
              </Text>
              <Text style={[styles.empRole, { color: colors.textSecondary }]} numberOfLines={1}>
                {empRole}
              </Text>
            </View>
          </View>

          {/* Priority Badge */}
          <View
            style={[
              styles.priorityPill,
              {
                backgroundColor: isDark ? pStyle.bg + '25' : pStyle.bg,
                borderColor: pStyle.border,
              },
            ]}
          >
            <Text style={[styles.priorityText, { color: pStyle.text }]}>
              {item.priority.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Card Bottom: Status, Due Date & Action Icons */}
        <View style={styles.cardBottomRow}>
          {/* Status Badge & Due Date */}
          <View style={styles.statusAndDate}>
            <View
              style={[
                styles.statusBadge,
                item.status === 'completed'
                  ? styles.badgeCompleted
                  : item.status === 'in_progress'
                  ? styles.badgeInProgress
                  : styles.badgePending,
              ]}
            >
              {item.status === 'completed' ? (
                <CheckCircle2 color="#10b981" size={13} style={{ marginRight: 4 }} />
              ) : item.status === 'in_progress' ? (
                <Clock color="#6366f1" size={13} style={{ marginRight: 4 }} />
              ) : (
                <CircleDashed color="#f59e0b" size={13} style={{ marginRight: 4 }} />
              )}
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      item.status === 'completed'
                        ? '#10b981'
                        : item.status === 'in_progress'
                        ? '#6366f1'
                        : '#f59e0b',
                  },
                ]}
              >
                {item.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>

            <View style={styles.dateBox}>
              <Calendar color={colors.textSecondary} size={13} style={{ marginRight: 4 }} />
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {formatDate(item.dueDate)}
              </Text>
            </View>
          </View>

          {/* Action Buttons (Download, View, Edit, Delete) */}
          <View style={styles.actionButtons}>
            {/* Download/Share */}
            <TouchableOpacity
              style={[styles.actionIconBtn, { backgroundColor: isDark ? '#1e3a8a25' : '#eff6ff' }]}
              onPress={() => handleDownloadSingleTask(item)}
              activeOpacity={0.7}
            >
              <Download color={isDark ? '#60a5fa' : '#2563eb'} size={15} />
            </TouchableOpacity>

            {/* View Details */}
            <TouchableOpacity
              style={[styles.actionIconBtn, { backgroundColor: isDark ? '#064e3b25' : '#ecfdf5' }]}
              onPress={() => handleOpenDetails(item)}
              activeOpacity={0.7}
            >
              <Eye color={isDark ? '#34d399' : '#059669'} size={15} />
            </TouchableOpacity>

            {/* Edit (Admin) */}
            {isAdmin && (
              <TouchableOpacity
                style={[styles.actionIconBtn, { backgroundColor: isDark ? '#312e8125' : '#e0e7ff' }]}
                onPress={() => handleOpenEdit(item)}
                activeOpacity={0.7}
              >
                <Pencil color={isDark ? '#818cf8' : '#4f46e5'} size={15} />
              </TouchableOpacity>
            )}

            {/* Delete (Admin) */}
            {isAdmin && (
              <TouchableOpacity
                style={[styles.actionIconBtn, { backgroundColor: isDark ? '#450a0a25' : '#fef2f2' }]}
                onPress={() => handleConfirmDelete(item)}
                activeOpacity={0.7}
              >
                <Trash2 color="#ef4444" size={15} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBg} />

      {/* Top Header Navbar */}
      <AppHeader
        title="ETM"
        subtitle="Workspace"
        navigation={navigation}
      />

      <FlatList
        data={displayedTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshTasks} tintColor={colors.accent} />
        }
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {/* ── 1. TASKS BANNER HEADER (Exact Web Parity) ── */}
            <View style={styles.titleBannerRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>Tasks</Text>
                <Text style={[styles.mainSubtitle, { color: colors.textSecondary }]}>
                  Review, create, and update task tracking logs assigned to employees.
                </Text>
              </View>
            </View>

            {/* Top Action Buttons (Export CSV & Create New Task) */}
            <View style={styles.topActionsRow}>
              <TouchableOpacity
                style={[styles.exportCsvBtn, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}
                onPress={handleExportCsv}
                activeOpacity={0.8}
              >
                <Download color={colors.textPrimary} size={15} style={{ marginRight: 6 }} />
                <Text style={[styles.exportCsvText, { color: colors.textPrimary }]}>Export CSV</Text>
              </TouchableOpacity>

              {isAdmin && (
                <TouchableOpacity
                  style={styles.createTaskBtn}
                  onPress={() => setCreateModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <Plus color="#ffffff" size={16} style={{ marginRight: 6 }} />
                  <Text style={styles.createTaskText}>+ Create New Task</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── 2. SEARCH BAR ── */}
            <View style={[styles.searchBar, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
              <Search color={colors.textSecondary} size={18} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search tasks..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                  <X color={colors.textSecondary} size={16} />
                </TouchableOpacity>
              )}
            </View>

            {/* ── 3. STATUS FILTER PILLS ── */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterGroupLabel, { color: colors.textSecondary }]}>STATUS</Text>
              <View style={styles.pillsRow}>
                {[
                  { key: 'all', label: 'All Statuses' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'in_progress', label: 'In Progress' },
                  { key: 'completed', label: 'Completed' },
                ].map((tab) => {
                  const isActive = statusFilter === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      style={[
                        styles.filterPill,
                        {
                          backgroundColor: isActive
                            ? isDark
                              ? '#3b82f6'
                              : '#2563eb'
                            : colors.cardBg,
                          borderColor: isActive ? '#3b82f6' : colors.borderColor,
                        },
                      ]}
                      onPress={() => setStatusFilter(tab.key)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          { color: isActive ? '#ffffff' : colors.textSecondary, fontWeight: isActive ? '700' : '600' },
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── 4. PRIORITY FILTER PILLS ── */}
            <View style={styles.filterSection}>
              <Text style={[styles.filterGroupLabel, { color: colors.textSecondary }]}>PRIORITY</Text>
              <View style={styles.pillsRow}>
                {[
                  { key: 'all', label: 'All Priorities' },
                  { key: 'low', label: 'Low' },
                  { key: 'medium', label: 'Medium' },
                  { key: 'high', label: 'High' },
                  { key: 'urgent', label: 'Urgent' },
                ].map((p) => {
                  const isActive = priorityFilter === p.key;
                  return (
                    <TouchableOpacity
                      key={p.key}
                      style={[
                        styles.filterPill,
                        {
                          backgroundColor: isActive
                            ? isDark
                              ? '#6366f1'
                              : '#4f46e5'
                            : colors.cardBg,
                          borderColor: isActive ? '#6366f1' : colors.borderColor,
                        },
                      ]}
                      onPress={() => setPriorityFilter(p.key)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          { color: isActive ? '#ffffff' : colors.textSecondary, fontWeight: isActive ? '700' : '600' },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── 5. ENTERPRISE DATE RANGE PICKER (Exact Web Parity) ── */}
            <View style={[styles.dateFilterCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
              <View style={styles.dateInputsRow}>
                {/* From Date Box */}
                <View style={[styles.dateBoxInput, { backgroundColor: isDark ? '#0f172a80' : '#f8fafc', borderColor: colors.borderColor }]}>
                  <Calendar color={isDark ? '#2dd4bf' : '#0d9488'} size={15} style={{ marginRight: 6 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.dateInputLabel, { color: colors.textSecondary }]}>FROM DATE</Text>
                    <TextInput
                      style={[styles.dateInputVal, { color: colors.textPrimary }]}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textSecondary}
                      value={startDateFilter}
                      onChangeText={setStartDateFilter}
                    />
                  </View>
                  {startDateFilter.length > 0 && (
                    <TouchableOpacity onPress={() => setStartDateFilter('')} style={{ padding: 2 }}>
                      <X color={colors.textSecondary} size={14} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Arrow */}
                <View style={styles.dateArrowBox}>
                  <ArrowRight color={colors.textSecondary} size={14} />
                </View>

                {/* To Date Box */}
                <View style={[styles.dateBoxInput, { backgroundColor: isDark ? '#0f172a80' : '#f8fafc', borderColor: colors.borderColor }]}>
                  <Calendar color={isDark ? '#2dd4bf' : '#0d9488'} size={15} style={{ marginRight: 6 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.dateInputLabel, { color: colors.textSecondary }]}>TO DATE</Text>
                    <TextInput
                      style={[styles.dateInputVal, { color: colors.textPrimary }]}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textSecondary}
                      value={endDateFilter}
                      onChangeText={setEndDateFilter}
                    />
                  </View>
                  {endDateFilter.length > 0 && (
                    <TouchableOpacity onPress={() => setEndDateFilter('')} style={{ padding: 2 }}>
                      <X color={colors.textSecondary} size={14} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Date Presets Row */}
              <View style={styles.datePresetsRow}>
                <View style={styles.presetButtons}>
                  <TouchableOpacity
                    style={[styles.presetBtn, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: colors.borderColor }]}
                    onPress={setPresetToday}
                  >
                    <Text style={[styles.presetBtnText, { color: colors.textPrimary }]}>Today</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.presetBtn, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: colors.borderColor }]}
                    onPress={setPresetThisWeek}
                  >
                    <Text style={[styles.presetBtnText, { color: colors.textPrimary }]}>This Week</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.presetBtn, { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: colors.borderColor }]}
                    onPress={setPresetThisMonth}
                  >
                    <Text style={[styles.presetBtnText, { color: colors.textPrimary }]}>This Month</Text>
                  </TouchableOpacity>
                </View>

                {isDateFiltered && (
                  <TouchableOpacity style={styles.resetDatesBtn} onPress={clearDateFilters}>
                    <FilterX color="#ef4444" size={13} style={{ marginRight: 4 }} />
                    <Text style={styles.resetDatesText}>Reset Dates</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Total Results Count */}
            <View style={styles.resultsCountRow}>
              <Text style={[styles.resultsCountText, { color: colors.textSecondary }]}>
                Showing <Text style={{ fontWeight: '800', color: colors.textPrimary }}>{displayedTasks.length}</Text> tasks
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
            <FileText color={colors.textSecondary} size={40} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No tasks available</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              There are no matching tasks right now. Try resetting your search filters.
            </Text>
          </View>
        }
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        visible={editModalVisible}
        task={selectedTaskForEdit}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedTaskForEdit(null);
        }}
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        visible={detailsModalVisible}
        task={viewingTask}
        employees={employees}
        isAdmin={isAdmin}
        onClose={() => {
          setDetailsModalVisible(false);
          setViewingTask(null);
        }}
        onEdit={(t) => handleOpenEdit(t)}
        onDelete={(t) => handleConfirmDelete(t)}
        onStatusChange={(taskId, status) => updateTaskStatus(taskId, status)}
        onAddAttachment={(taskId, att) => {
          const currentAttachments = viewingTask?.attachments || [];
          const updatedAttachments = [...currentAttachments, att];
          updateTask(taskId, { attachments: updatedAttachments });
          setViewingTask((prev) => (prev ? { ...prev, attachments: updatedAttachments } : null));
        }}
        onRemoveAttachment={(taskId, attId) => {
          const currentAttachments = viewingTask?.attachments || [];
          const updatedAttachments = currentAttachments.filter((a) => a.id !== attId);
          updateTask(taskId, { attachments: updatedAttachments });
          setViewingTask((prev) => (prev ? { ...prev, attachments: updatedAttachments } : null));
        }}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  headerSection: {
    paddingTop: 14,
    paddingBottom: 10,
  },
  titleBannerRow: {
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  mainSubtitle: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },
  exportCsvBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  exportCsvText: {
    fontSize: 13,
    fontWeight: '700',
  },
  createTaskBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d9488',
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  createTaskText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterGroupLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 11,
  },
  dateFilterCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  dateInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  dateBoxInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateInputLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateInputVal: {
    fontSize: 11,
    fontWeight: '700',
    paddingVertical: 0,
    marginTop: 1,
  },
  dateArrowBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePresetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  presetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  presetBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  resetDatesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
  },
  resetDatesText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '700',
  },
  resultsCountRow: {
    paddingVertical: 4,
    marginBottom: 6,
  },
  resultsCountText: {
    fontSize: 11,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  snoBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  snoText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardTitleBox: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  cardDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  assigneeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  empAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  empAvatarText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  empName: {
    fontSize: 12,
    fontWeight: '700',
  },
  empRole: {
    fontSize: 10,
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '800',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusAndDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeCompleted: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  badgeInProgress: {
    backgroundColor: '#e0e7ff',
    borderColor: '#c7d2fe',
  },
  badgePending: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
});
