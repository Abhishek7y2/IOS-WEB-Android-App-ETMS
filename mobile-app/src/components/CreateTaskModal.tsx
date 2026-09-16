import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTasks } from '../context/TaskContext';
import { TaskPriority, TaskStatus } from '../types/task';
import { X, Calendar, User, AlertCircle } from './Icon';
import { useTheme } from '../context/ThemeContext';
import { TaskAttachmentSection } from './TaskAttachmentSection';
import { AttachmentItem } from '../utils/fileUploader';

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ visible, onClose }) => {
  const { addTask, employees } = useTasks();
  const { colors, mode } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await addTask({
        title: title.trim(),
        description: description.trim() || 'No description provided.',
        status: 'todo',
        priority,
        assignedTo: assignedTo || (employees[0]?.id ?? ''),
        dueDate,
        attachments,
      });
      setTitle('');
      setDescription('');
      setAttachments([]);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.borderColor }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Create New Task</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color={colors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
            {error && (
              <View style={styles.errorBox}>
                <AlertCircle color="#ef4444" size={18} style={{ marginRight: 8 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Title */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Task Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]}
              placeholder="e.g. Update API Documentation"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            {/* Description */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]}
              placeholder="Provide task details or acceptance criteria..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            {/* Priority Selector */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Priority Level</Text>
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => {
                const isActive = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityPill,
                      { backgroundColor: colors.bg, borderColor: colors.borderColor },
                      isActive && { backgroundColor: colors.accent, borderColor: colors.accent },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: colors.textSecondary },
                        isActive && { color: '#ffffff' },
                      ]}
                    >
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Assigned Employee Picker */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Assign To Team Member</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.employeeRow}>
              {employees.map((emp) => {
                const isSelected = assignedTo === emp.id || (!assignedTo && employees[0]?.id === emp.id);
                return (
                  <TouchableOpacity
                    key={emp.id}
                    style={[
                      styles.employeeChip,
                      { backgroundColor: colors.bg, borderColor: colors.borderColor },
                      isSelected && { backgroundColor: mode === 'dark' ? '#312e81' : '#e0e7ff', borderColor: colors.accent },
                    ]}
                    onPress={() => setAssignedTo(emp.id)}
                  >
                    <User color={isSelected ? colors.accent : colors.textSecondary} size={16} />
                    <Text
                      style={[
                        styles.employeeChipText,
                        { color: colors.textSecondary },
                        isSelected && { color: mode === 'dark' ? '#ffffff' : colors.accent, fontWeight: '600' },
                      ]}
                    >
                      {emp.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Due Date */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Due Date (YYYY-MM-DD)</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.bg, borderColor: colors.borderColor }]}>
              <Calendar color={colors.textSecondary} size={20} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.dateInput, { color: colors.textPrimary }]}
                placeholder="2026-12-31"
                placeholderTextColor={colors.textSecondary}
                value={dueDate}
                onChangeText={setDueDate}
              />
            </View>

            {/* Task Attachments Section */}
            <TaskAttachmentSection
              attachments={attachments}
              onAddAttachment={(newAtt) => setAttachments((prev) => [...prev, newAtt])}
              onRemoveAttachment={(attId) =>
                setAttachments((prev) => prev.filter((a) => a.id !== attId))
              }
            />

            {/* Submit Button */}
            <TouchableOpacity

              style={[styles.submitButton, { backgroundColor: colors.accent }, submitting && { opacity: 0.7 }]}
              onPress={handleCreate}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Create Task</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#451a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  priorityPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  employeeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  employeeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
  },
  employeeChipText: {
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
    fontSize: 15,
  },
  submitButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

