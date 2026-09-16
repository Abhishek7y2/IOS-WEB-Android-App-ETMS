import React, { useState, useEffect } from 'react';
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
import { Task, TaskPriority, TaskStatus, SubtaskItem } from '../types/task';
import { X, Calendar, User, AlertCircle, Plus, CheckSquare, Square, Trash2 } from './Icon';
import { useTheme } from '../context/ThemeContext';
import { TaskAttachmentSection } from './TaskAttachmentSection';
import { AttachmentItem } from '../utils/fileUploader';

interface EditTaskModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ visible, task, onClose }) => {
  const { updateTask, employees } = useTasks();
  const { colors, mode } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [subtasks, setSubtasks] = useState<SubtaskItem[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagText, setNewTagText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setStatus(task.status || 'todo');
      setAssignedTo(task.assignedTo || '');
      setDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
      setAttachments(task.attachments || []);
      setSubtasks(task.subtasks || []);
      setTags(task.tags || ['Frontend', 'API']);
      setFormError(null);
    }
  }, [task]);


  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newItem: SubtaskItem = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      isCompleted: false,
    };
    setSubtasks((prev) => [...prev, newItem]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddTag = () => {
    if (!newTagText.trim()) return;
    const tagClean = newTagText.trim().replace(/^#/, '');
    if (!tags.includes(tagClean)) {
      setTags((prev) => [...prev, tagClean]);
    }
    setNewTagText('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!task) return;
    if (!title.trim()) {
      setFormError('Please enter a task title.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        assignedTo: assignedTo || undefined,
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        attachments,
        subtasks,
        tags,
      });
      onClose();

    } catch (err: any) {
      setFormError(err.message || 'Failed to update task.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          {/* Modal Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Edit Task</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color={colors.textSecondary} size={22} />
            </TouchableOpacity>
          </View>

          {formError && (
            <View style={styles.errorCard}>
              <AlertCircle color="#ef4444" size={18} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}

          <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled">
            {/* Title */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Task Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]}
              placeholder="e.g. Update UI Components"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            {/* Description */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]}
              placeholder="Detailed description of task..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            {/* Status Selection */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Status</Text>
            <View style={styles.chipRow}>
              {(['todo', 'in_progress', 'completed'] as TaskStatus[]).map((st) => {
                const isActive = status === st;
                return (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.bg, borderColor: colors.borderColor },
                      isActive && { backgroundColor: '#3b82f6', borderColor: '#3b82f6' }
                    ]}
                    onPress={() => setStatus(st)}
                  >
                    <Text style={[styles.chipText, { color: colors.textSecondary }, isActive && { color: '#ffffff' }]}>
                      {st === 'todo' ? 'To Do' : st === 'in_progress' ? 'In Progress' : 'Completed'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Priority Selection */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Priority</Text>
            <View style={styles.chipRow}>
              {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
                const isActive = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.bg, borderColor: colors.borderColor },
                      isActive && { backgroundColor: colors.accent, borderColor: colors.accent }
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[styles.chipText, { color: colors.textSecondary }, isActive && { color: '#ffffff' }]}>
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Assignee Selection */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Assigned To</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.empRow}>
              <TouchableOpacity
                style={[
                  styles.empChip,
                  { backgroundColor: colors.bg, borderColor: colors.borderColor },
                  !assignedTo && { backgroundColor: colors.accent, borderColor: colors.accent }
                ]}
                onPress={() => setAssignedTo('')}
              >
                <User color={!assignedTo ? '#ffffff' : colors.textSecondary} size={16} style={{ marginRight: 4 }} />
                <Text style={[styles.empChipText, { color: colors.textSecondary }, !assignedTo && { color: '#ffffff', fontWeight: '600' }]}>
                  Unassigned
                </Text>
              </TouchableOpacity>

              {employees.map((emp) => {
                const isSelected = assignedTo === emp.id;
                return (
                  <TouchableOpacity
                    key={emp.id}
                    style={[
                      styles.empChip,
                      { backgroundColor: colors.bg, borderColor: colors.borderColor },
                      isSelected && { backgroundColor: colors.accent, borderColor: colors.accent }
                    ]}
                    onPress={() => setAssignedTo(emp.id)}
                  >
                    <Text style={[styles.empChipText, { color: colors.textSecondary }, isSelected && { color: '#ffffff', fontWeight: '600' }]}>
                      {emp.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Due Date */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Due Date (YYYY-MM-DD)</Text>
            <View style={[styles.inputIconRow, { backgroundColor: colors.bg, borderColor: colors.borderColor }]}>
              <Calendar color={colors.textSecondary} size={18} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: 'transparent', borderWidth: 0, color: colors.textPrimary }]}
                placeholder="2026-09-30"
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

            {/* Subtasks Checklist Section */}

            <Text style={[styles.label, { color: colors.textPrimary, marginTop: 16 }]}>Subtask Checklist</Text>
            <View style={styles.subtaskInputRow}>
              <TextInput
                style={[styles.subtaskInput, { backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]}
                placeholder="Add subtask item..."
                placeholderTextColor={colors.textSecondary}
                value={newSubtaskTitle}
                onChangeText={setNewSubtaskTitle}
                onSubmitEditing={handleAddSubtask}
              />
              <TouchableOpacity style={[styles.addSubtaskBtn, { backgroundColor: colors.accent }]} onPress={handleAddSubtask}>
                <Plus color="#ffffff" size={16} />
              </TouchableOpacity>
            </View>

            {subtasks.length > 0 && (
              <View style={[styles.subtaskList, { backgroundColor: colors.bg, borderColor: colors.borderColor }]}>
                {subtasks.map((item) => (
                  <View key={item.id} style={[styles.subtaskItemRow, { borderBottomColor: colors.borderColor }]}>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                      onPress={() => handleToggleSubtask(item.id)}
                    >
                      {item.isCompleted ? (
                        <CheckSquare color="#10b981" size={18} style={{ marginRight: 8 }} />
                      ) : (
                        <Square color={colors.textSecondary} size={18} style={{ marginRight: 8 }} />
                      )}
                      <Text style={[styles.subtaskTitle, { color: colors.textPrimary }, item.isCompleted && styles.subtaskTitleCompleted]}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveSubtask(item.id)} style={{ padding: 4 }}>
                      <Trash2 color="#ef4444" size={14} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Category Tags Manager */}
            <Text style={[styles.label, { color: colors.textPrimary, marginTop: 16 }]}>Category Tags</Text>
            <View style={styles.subtaskInputRow}>
              <TextInput
                style={[styles.subtaskInput, { backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]}
                placeholder="Add tag (e.g. Frontend, API)..."
                placeholderTextColor={colors.textSecondary}
                value={newTagText}
                onChangeText={setNewTagText}
                onSubmitEditing={handleAddTag}
              />
              <TouchableOpacity style={[styles.addSubtaskBtn, { backgroundColor: colors.accent }]} onPress={handleAddTag}>
                <Plus color="#ffffff" size={16} />
              </TouchableOpacity>
            </View>

            {tags.length > 0 && (
              <View style={styles.tagsRow}>
                {tags.map((tag, idx) => (
                  <View key={idx} style={[styles.tagPill, { backgroundColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)', borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.3)' }]}>
                    <Text style={[styles.tagText, { color: colors.accent }]}>#{tag}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(tag)} style={{ marginLeft: 4 }}>
                      <X color={colors.accent} size={12} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Submit Action */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.accent }, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
  },
  formScroll: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 6,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  chip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  empRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  empChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  empChipText: {
    fontSize: 12,
  },
  inputIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  subtaskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtaskInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginRight: 8,
  },
  addSubtaskBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskList: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  subtaskItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  subtaskTitle: {
    fontSize: 13,
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

