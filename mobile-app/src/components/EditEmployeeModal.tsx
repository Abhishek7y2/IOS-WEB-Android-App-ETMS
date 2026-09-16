import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Employee } from '../types/task';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { X, Pencil, Shield, Briefcase, AlertCircle } from './Icon';
import { updateUserProfile } from '../services/authApi';

interface EditEmployeeModalProps {
  visible: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const DESIGNATIONS = [
  'CEO',
  'Admin',
  'Employee',
  'Software Developer',
  'Senior Developer',
  'Product Designer',
  'QA Analyst',
  'Project Manager',
  'HR Specialist',
  'Intern',
];

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  visible,
  employee,
  onClose,
  onSuccess,
}) => {
  const { refreshTasks } = useTasks();
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';

  const [selectedDesignation, setSelectedDesignation] = useState('Employee');
  const [selectedRole, setSelectedRole] = useState<'member' | 'admin'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employee) {
      setSelectedDesignation(employee.designation || 'Employee');
      setSelectedRole(employee.role === 'admin' ? 'admin' : 'member');
      setError(null);
    }
  }, [employee]);

  if (!visible || !employee) return null;

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateUserProfile(employee.id, {
        designation: selectedDesignation,
        role: selectedRole,
      });
      await refreshTasks();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update employee details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
          ]}
        >
          <SafeAreaView style={{ flexShrink: 1 }}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? '#312e8130' : '#e0e7ff' }]}>
                  <Pencil color={isDark ? '#818cf8' : '#4f46e5'} size={18} />
                </View>
                <View>
                  <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Edit Member</Text>
                  <Text style={[styles.empNameSub, { color: colors.textSecondary }]} numberOfLines={1}>
                    {employee.name}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color={colors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {error && (
                <View style={styles.errorBox}>
                  <AlertCircle color="#ef4444" size={16} style={{ marginRight: 6 }} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Designation Selector */}
              <Text style={[styles.label, { color: colors.textPrimary }]}>Select Designation</Text>
              <View style={styles.pillsContainer}>
                {DESIGNATIONS.map((d) => {
                  const isSelected = selectedDesignation === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.pill,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? '#581c8750'
                              : '#f3e8ff'
                            : isDark
                            ? '#0f172a60'
                            : '#f8fafc',
                          borderColor: isSelected ? '#a855f7' : colors.borderColor,
                        },
                      ]}
                      onPress={() => setSelectedDesignation(d)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          {
                            color: isSelected ? '#a855f7' : colors.textSecondary,
                            fontWeight: isSelected ? '700' : '600',
                          },
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Role Type Selector */}
              <Text style={[styles.label, { color: colors.textPrimary, marginTop: 16 }]}>Workspace Role</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    {
                      backgroundColor:
                        selectedRole === 'member'
                          ? isDark
                            ? '#1e3a8a30'
                            : '#eff6ff'
                          : isDark
                          ? '#0f172a60'
                          : '#f8fafc',
                      borderColor: selectedRole === 'member' ? '#3b82f6' : colors.borderColor,
                    },
                  ]}
                  onPress={() => setSelectedRole('member')}
                >
                  <Text
                    style={[
                      styles.roleCardTitle,
                      { color: selectedRole === 'member' ? '#3b82f6' : colors.textPrimary },
                    ]}
                  >
                    Employee
                  </Text>
                  <Text style={[styles.roleCardSub, { color: colors.textSecondary }]}>
                    Standard permissions.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    {
                      backgroundColor:
                        selectedRole === 'admin'
                          ? isDark
                            ? '#78350f30'
                            : '#fef3c7'
                          : isDark
                          ? '#0f172a60'
                          : '#f8fafc',
                      borderColor: selectedRole === 'admin' ? '#f59e0b' : colors.borderColor,
                    },
                  ]}
                  onPress={() => setSelectedRole('admin')}
                >
                  <Text
                    style={[
                      styles.roleCardTitle,
                      { color: selectedRole === 'admin' ? '#f59e0b' : colors.textPrimary },
                    ]}
                  >
                    Admin
                  </Text>
                  <Text style={[styles.roleCardSub, { color: colors.textSecondary }]}>
                    Full manager access.
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: colors.borderColor }]}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.borderColor }]}
                onPress={onClose}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
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
    maxHeight: '85%',
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
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  empNameSub: {
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  roleCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  roleCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
  },
  roleCardSub: {
    fontSize: 10,
    lineHeight: 14,
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
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
