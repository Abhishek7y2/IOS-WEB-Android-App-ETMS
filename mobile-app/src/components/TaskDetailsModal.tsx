import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Share,
} from 'react-native';
import { Task, Employee, TaskStatus } from '../types/task';
import { useTheme } from '../context/ThemeContext';
import { TaskAttachmentSection } from './TaskAttachmentSection';
import { AttachmentItem } from '../utils/fileUploader';
import {
  X,
  FileText,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CircleDashed,
  Download,
  Pencil,
  Trash2,
} from './Icon';

interface TaskDetailsModalProps {
  visible: boolean;
  task: Task | null;
  employees: Employee[];
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onAddAttachment?: (taskId: string, attachment: AttachmentItem) => void;
  onRemoveAttachment?: (taskId: string, attachmentId: string) => void;
  isAdmin?: boolean;
}


const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  medium: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  high: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  urgent: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
};

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  visible,
  task,
  employees,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onAddAttachment,
  onRemoveAttachment,
  isAdmin = true,
}) => {

  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';

  if (!visible || !task) return null;

  const assignedEmployee = employees.find(
    (e) => e.id === task.assignedTo || (task.assignedTo as any)?.id === e.id
  );
  const assigneeName =
    assignedEmployee?.name ||
    (typeof task.assignedTo === 'object' && (task.assignedTo as any)?.name) ||
    'Unassigned';
  const assigneeRole = assignedEmployee?.designation || 'Team Member';

  const handleShareOrDownload = async () => {
    const content = `Task: ${task.title}\nDescription: ${task.description}\nAssigned To: ${assigneeName}\nPriority: ${task.priority}\nStatus: ${task.status}\nDue Date: ${task.dueDate || 'N/A'}`;
    try {
      await Share.share({
        title: `Task_${task.id.substring(0, 8)}`,
        message: content,
      });
    } catch {
      Alert.alert('Share Task', 'Unable to export task details.');
    }
  };

  const getPriorityStyle = (priority: string) => {
    const p = priority?.toLowerCase() || 'medium';
    return priorityColors[p] || priorityColors.medium;
  };

  const pStyle = getPriorityStyle(task.priority);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.borderColor,
            },
          ]}
        >
          <SafeAreaView style={{ flexShrink: 1 }}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
              <View style={styles.headerLeft}>
                <View style={[styles.headerIconBox, { backgroundColor: isDark ? '#134e4a30' : '#ccfbf1' }]}>
                  <FileText color={isDark ? '#2dd4bf' : '#0d9488'} size={20} />
                </View>
                <View>
                  <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Task Details</Text>
                  <Text style={[styles.refId, { color: colors.textSecondary }]}>
                    ID: {task.id.substring(0, 12)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color={colors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {/* Task Title */}
              <Text style={[styles.title, { color: colors.textPrimary }]}>{task.title}</Text>

              {/* Description Card */}
              <View
                style={[
                  styles.descBox,
                  {
                    backgroundColor: isDark ? '#0f172a80' : '#f8fafc',
                    borderColor: colors.borderColor,
                  },
                ]}
              >
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DESCRIPTION</Text>
                <Text style={[styles.descText, { color: colors.textPrimary }]}>
                  {task.description || 'No detailed description provided for this task.'}
                </Text>
              </View>

              {/* Metadata 2x2 Grid */}
              <View style={styles.gridContainer}>
                {/* Assigned To */}
                <View
                  style={[
                    styles.gridCard,
                    {
                      backgroundColor: isDark ? '#0f172a60' : '#f8fafc',
                      borderColor: colors.borderColor,
                    },
                  ]}
                >
                  <View style={styles.cardHeaderRow}>
                    <User color={isDark ? '#818cf8' : '#4f46e5'} size={16} />
                    <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>ASSIGNED TO</Text>
                  </View>
                  <Text style={[styles.gridValue, { color: colors.textPrimary }]} numberOfLines={1}>
                    {assigneeName}
                  </Text>
                  <Text style={[styles.gridSub, { color: colors.textSecondary }]} numberOfLines={1}>
                    {assigneeRole}
                  </Text>
                </View>

                {/* Due Date */}
                <View
                  style={[
                    styles.gridCard,
                    {
                      backgroundColor: isDark ? '#0f172a60' : '#f8fafc',
                      borderColor: colors.borderColor,
                    },
                  ]}
                >
                  <View style={styles.cardHeaderRow}>
                    <Calendar color={isDark ? '#38bdf8' : '#0284c7'} size={16} />
                    <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>DUE DATE</Text>
                  </View>
                  <Text style={[styles.gridValue, { color: colors.textPrimary }]}>
                    {task.dueDate || 'No deadline'}
                  </Text>
                  <Text style={[styles.gridSub, { color: colors.textSecondary }]}>Target Completion</Text>
                </View>

                {/* Priority */}
                <View
                  style={[
                    styles.gridCard,
                    {
                      backgroundColor: isDark ? '#0f172a60' : '#f8fafc',
                      borderColor: colors.borderColor,
                    },
                  ]}
                >
                  <View style={styles.cardHeaderRow}>
                    <AlertTriangle color={pStyle.text} size={16} />
                    <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>PRIORITY</Text>
                  </View>
                  <View
                    style={[
                      styles.priorityPill,
                      {
                        backgroundColor: isDark ? pStyle.bg + '30' : pStyle.bg,
                        borderColor: pStyle.border,
                      },
                    ]}
                  >
                    <Text style={[styles.priorityPillText, { color: pStyle.text }]}>
                      {task.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Status */}
                <View
                  style={[
                    styles.gridCard,
                    {
                      backgroundColor: isDark ? '#0f172a60' : '#f8fafc',
                      borderColor: colors.borderColor,
                    },
                  ]}
                >
                  <View style={styles.cardHeaderRow}>
                    <Clock color={colors.textSecondary} size={16} />
                    <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>STATUS</Text>
                  </View>
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color:
                          task.status === 'completed'
                            ? '#10b981'
                            : task.status === 'in_progress'
                            ? '#6366f1'
                            : '#f59e0b',
                      },
                    ]}
                  >
                    {task.status.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Status Action Switcher */}
              <View style={[styles.statusSwitcherBox, { borderColor: colors.borderColor }]}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginBottom: 8 }]}>
                  QUICK STATUS UPDATE
                </Text>
                <View style={styles.statusButtonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.statusSelectBtn,
                      task.status === 'todo' && styles.statusSelectBtnActive,
                      { borderColor: '#f59e0b' },
                    ]}
                    onPress={() => onStatusChange(task.id, 'todo')}
                  >
                    <CircleDashed color="#f59e0b" size={14} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#f59e0b' }}>Pending</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusSelectBtn,
                      task.status === 'in_progress' && styles.statusSelectBtnActive,
                      { borderColor: '#6366f1' },
                    ]}
                    onPress={() => onStatusChange(task.id, 'in_progress')}
                  >
                    <Clock color="#6366f1" size={14} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#6366f1' }}>In Progress</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusSelectBtn,
                      task.status === 'completed' && styles.statusSelectBtnActive,
                      { borderColor: '#10b981' },
                    ]}
                    onPress={() => onStatusChange(task.id, 'completed')}
                  >
                    <CheckCircle2 color="#10b981" size={14} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#10b981' }}>Completed</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Task Attachments Section */}
              <TaskAttachmentSection
                attachments={task.attachments || []}
                onAddAttachment={
                  onAddAttachment ? (att) => onAddAttachment(task.id, att) : undefined
                }
                onRemoveAttachment={
                  onRemoveAttachment ? (attId) => onRemoveAttachment(task.id, attId) : undefined
                }
                readOnly={!onAddAttachment && !onRemoveAttachment}
              />
            </ScrollView>


            {/* Bottom Actions Footer */}
            <View style={[styles.footer, { borderTopColor: colors.borderColor }]}>
              <TouchableOpacity
                style={[
                  styles.downloadBtn,
                  {
                    backgroundColor: isDark ? '#1e3a8a25' : '#eff6ff',
                    borderColor: isDark ? '#1e40af50' : '#bfdbfe',
                  },
                ]}
                onPress={handleShareOrDownload}
                activeOpacity={0.8}
              >
                <Download color={isDark ? '#60a5fa' : '#2563eb'} size={16} style={{ marginRight: 6 }} />
                <Text style={[styles.downloadBtnText, { color: isDark ? '#60a5fa' : '#2563eb' }]}>
                  Export / Share
                </Text>
              </TouchableOpacity>

              {isAdmin && (
                <View style={styles.adminActions}>
                  <TouchableOpacity
                    style={[
                      styles.editActionBtn,
                      {
                        backgroundColor: isDark ? '#312e8130' : '#e0e7ff',
                        borderColor: isDark ? '#4338ca' : '#c7d2fe',
                      },
                    ]}
                    onPress={() => {
                      onClose();
                      onEdit(task);
                    }}
                  >
                    <Pencil color={isDark ? '#818cf8' : '#4f46e5'} size={15} style={{ marginRight: 4 }} />
                    <Text style={[styles.editActionText, { color: isDark ? '#818cf8' : '#4f46e5' }]}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.deleteActionBtn,
                      {
                        backgroundColor: isDark ? '#450a0a30' : '#fef2f2',
                        borderColor: isDark ? '#7f1d1d' : '#fecaca',
                      },
                    ]}
                    onPress={() => {
                      onClose();
                      onDelete(task);
                    }}
                  >
                    <Trash2 color="#ef4444" size={15} style={{ marginRight: 4 }} />
                    <Text style={styles.deleteActionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    maxHeight: '88%',
    paddingBottom: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  refId: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 14,
  },
  descBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  descText: {
    fontSize: 13,
    lineHeight: 19,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  gridCard: {
    width: '48.5%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  gridLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  gridSub: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  priorityPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  priorityPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  statusSwitcherBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusSelectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  statusSelectBtnActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  downloadBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  adminActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  editActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  deleteActionText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
});
