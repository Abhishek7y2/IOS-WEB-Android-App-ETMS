import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Linking,
} from 'react-native';
import { Employee } from '../types/task';
import { useTheme } from '../context/ThemeContext';
import { X, User, Mail, Phone, Shield, Briefcase, CheckCircle2, AlertCircle } from './Icon';

interface EmployeeProfileModalProps {
  visible: boolean;
  employee: Employee | null;
  onClose: () => void;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  visible,
  employee,
  onClose,
}) => {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';

  if (!visible || !employee) return null;

  const handleEmail = () => {
    if (employee.email) Linking.openURL(`mailto:${employee.email}`);
  };

  const handleCall = () => {
    if (employee.mobileNumber) Linking.openURL(`tel:${employee.mobileNumber}`);
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
                <View style={[styles.iconBox, { backgroundColor: isDark ? '#1e3a8a30' : '#eff6ff' }]}>
                  <User color={isDark ? '#60a5fa' : '#2563eb'} size={20} />
                </View>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Employee Profile</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X color={colors.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {/* Profile Top Avatar & Monogram */}
              <View style={styles.avatarSection}>
                {employee.avatarUrl ? (
                  <Image source={{ uri: employee.avatarUrl }} style={styles.avatarImg} />
                ) : (
                  <View style={[styles.avatarBubble, { backgroundColor: isDark ? '#3b82f6' : '#2563eb' }]}>
                    <Text style={styles.avatarText}>
                      {employee.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={[styles.name, { color: colors.textPrimary }]}>{employee.name}</Text>
                <View style={styles.badgesRow}>
                  <View
                    style={[
                      styles.designationPill,
                      {
                        backgroundColor: isDark ? '#581c8730' : '#f3e8ff',
                        borderColor: isDark ? '#7e22ce' : '#d8b4fe',
                      },
                    ]}
                  >
                    <Text style={[styles.designationText, { color: isDark ? '#c084fc' : '#7e22ce' }]}>
                      {employee.designation || 'Specialist'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.rolePill,
                      {
                        backgroundColor: isDark ? '#78350f30' : '#fef3c7',
                        borderColor: isDark ? '#b45309' : '#fde68a',
                      },
                    ]}
                  >
                    <Text style={[styles.roleText, { color: isDark ? '#fbbf24' : '#b45309' }]}>
                      {employee.role === 'user' || employee.role === 'member' ? 'Employee' : employee.role?.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Information Cards List */}
              <View style={[styles.infoCard, { backgroundColor: isDark ? '#0f172a80' : '#f8fafc', borderColor: colors.borderColor }]}>
                {/* Employee ID */}
                <View style={[styles.infoRow, { borderBottomColor: colors.borderColor }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Employee ID</Text>
                  <Text style={[styles.infoVal, { color: colors.textPrimary }]}>{employee.id}</Text>
                </View>

                {/* Email Address */}
                <TouchableOpacity
                  style={[styles.infoRow, { borderBottomColor: colors.borderColor }]}
                  onPress={handleEmail}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email Address</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                    <Mail color="#38bdf8" size={14} style={{ marginRight: 6 }} />
                    <Text style={[styles.infoVal, { color: '#38bdf8' }]} numberOfLines={1}>
                      {employee.email}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Contact Number */}
                <TouchableOpacity
                  style={[styles.infoRow, { borderBottomColor: colors.borderColor }]}
                  onPress={handleCall}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Contact Number</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                    <Phone color="#34d399" size={14} style={{ marginRight: 6 }} />
                    <Text style={[styles.infoVal, { color: employee.mobileNumber ? '#34d399' : colors.textSecondary }]}>
                      {employee.mobileNumber || 'Not Available'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Account Status */}
                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Account Status</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {employee.isBlocked ? (
                      <>
                        <AlertCircle color="#ef4444" size={14} style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#ef4444' }}>Blocked</Text>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 color="#10b981" size={14} style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#10b981' }}>Active</Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: colors.borderColor }]}>
              <TouchableOpacity
                style={[styles.closeModalBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderColor: colors.borderColor }]}
                onPress={onClose}
              >
                <Text style={[styles.closeModalText, { color: colors.textPrimary }]}>Close Profile</Text>
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
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
  },
  avatarBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  designationPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  designationText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 110,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  closeModalBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  closeModalText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
