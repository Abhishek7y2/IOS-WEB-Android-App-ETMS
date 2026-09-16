import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { X, User, Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle } from './Icon';
import { registerUser, updateUserProfile } from '../services/authApi';

interface AddMemberModalProps {
  visible: boolean;
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

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { refreshTasks } = useTasks();
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [designation, setDesignation] = useState('Employee');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleOpen = () => {
    generatePassword();
  };

  const handleSubmit = async () => {
    if (!firstName.trim()) {
      setError('Please enter first name');
      return;
    }
    if (!lastName.trim()) {
      setError('Please enter last name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const randomMobile = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

      const regRes = await registerUser({
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: 'Other',
        mobileNumber: randomMobile,
        qualification: 'N/A',
        countryCode: '+91',
        email: email.trim().toLowerCase(),
        password,
      });

      const userId = regRes.user?.id || (regRes.user as any)?._id;
      if (userId) {
        await updateUserProfile(userId, {
          designation,
          role,
        });
      }

      await refreshTasks();
      onClose();
      if (onSuccess) onSuccess();
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setDesignation('Employee');
      setRole('member');
    } catch (err: any) {
      setError(err.message || 'Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onShow={handleOpen} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.cardBg, borderColor: colors.borderColor },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? '#134e4a30' : '#ccfbf1' }]}>
                <User color={isDark ? '#2dd4bf' : '#0d9488'} size={20} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Add New Member</Text>
                <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                  Create employee credentials and workspace access.
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={colors.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {error && (
              <View style={styles.errorBox}>
                <AlertCircle color="#ef4444" size={16} style={{ marginRight: 6 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Name Fields (First & Last Name Row) */}
            <View style={styles.nameRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>First Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#0f172a80' : '#f8fafc', borderColor: colors.borderColor, color: colors.textPrimary }]}
                  placeholder="e.g. Abhishek"
                  placeholderTextColor={colors.textSecondary}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Last Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? '#0f172a80' : '#f8fafc', borderColor: colors.borderColor, color: colors.textPrimary }]}
                  placeholder="e.g. Yadav"
                  placeholderTextColor={colors.textSecondary}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            {/* Email */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Email Address *</Text>
            <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#0f172a80' : '#f8fafc', borderColor: colors.borderColor }]}>
              <Mail color={colors.textSecondary} size={16} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.flexInput, { color: colors.textPrimary }]}
                placeholder="employee@company.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password with Generator */}
            <View style={styles.passwordHeaderRow}>
              <Text style={[styles.label, { color: colors.textPrimary, marginBottom: 0 }]}>Password *</Text>
              <TouchableOpacity style={styles.generateBtn} onPress={generatePassword}>
                <Sparkles color="#6366f1" size={13} style={{ marginRight: 4 }} />
                <Text style={styles.generateBtnText}>Auto-Generate</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#0f172a80' : '#f8fafc', borderColor: colors.borderColor }]}>
              <Lock color={colors.textSecondary} size={16} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.flexInput, { color: colors.textPrimary }]}
                placeholder="Temporary Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                {showPassword ? <EyeOff color={colors.textSecondary} size={16} /> : <Eye color={colors.textSecondary} size={16} />}
              </TouchableOpacity>
            </View>

            {/* Designation Selector */}
            <Text style={[styles.label, { color: colors.textPrimary }]}>Designation</Text>
            <View style={styles.pillsContainer}>
              {DESIGNATIONS.map((d) => {
                const isSelected = designation === d;
                return (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isSelected ? (isDark ? '#6b21a850' : '#f3e8ff') : (isDark ? '#0f172a60' : '#f8fafc'),
                        borderColor: isSelected ? '#a855f7' : colors.borderColor,
                      },
                    ]}
                    onPress={() => setDesignation(d)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: isSelected ? '#a855f7' : colors.textSecondary, fontWeight: isSelected ? '700' : '600' },
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Role Type Selector */}
            <Text style={[styles.label, { color: colors.textPrimary, marginTop: 14 }]}>Role Type</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  {
                    backgroundColor: role === 'member' ? (isDark ? '#1e3a8a30' : '#eff6ff') : (isDark ? '#0f172a60' : '#f8fafc'),
                    borderColor: role === 'member' ? '#3b82f6' : colors.borderColor,
                  },
                ]}
                onPress={() => setRole('member')}
              >
                <Text style={[styles.roleCardTitle, { color: role === 'member' ? '#3b82f6' : colors.textPrimary }]}>
                  Employee (Member)
                </Text>
                <Text style={[styles.roleCardSub, { color: colors.textSecondary }]}>
                  Standard access to assigned tasks and team hub.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleCard,
                  {
                    backgroundColor: role === 'admin' ? (isDark ? '#78350f30' : '#fef3c7') : (isDark ? '#0f172a60' : '#f8fafc'),
                    borderColor: role === 'admin' ? '#f59e0b' : colors.borderColor,
                  },
                ]}
                onPress={() => setRole('admin')}
              >
                <Text style={[styles.roleCardTitle, { color: role === 'admin' ? '#f59e0b' : colors.textPrimary }]}>
                  Workspace Admin
                </Text>
                <Text style={[styles.roleCardSub, { color: colors.textSecondary }]}>
                  Full privileges to create, assign, and manage users.
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={[styles.footer, { borderTopColor: colors.borderColor }]}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.borderColor }]} onPress={onClose}>
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>+ Create Member</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    maxHeight: '90%',
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  iconBox: {
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
  headerSub: {
    fontSize: 10,
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
  nameRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  flexInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  generateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366f1',
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
    marginBottom: 20,
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
    marginBottom: 4,
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
  submitBtn: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0d9488',
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
