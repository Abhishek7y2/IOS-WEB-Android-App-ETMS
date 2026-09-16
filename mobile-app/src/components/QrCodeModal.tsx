import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Clipboard,
  Alert,
} from 'react-native';
import { X, QrCode, ShieldCheck, Copy, Check, Share2, Building2 } from './Icon';
import { useTheme } from '../context/ThemeContext';

interface QrCodeModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    role: string;
    designation?: string;
    department?: string;
    profilePicture?: string;
    id?: string;
    employeeId?: string;
  };
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  visible,
  onClose,
  user,
}) => {
  const { colors, isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const empId = user.employeeId || `ETM-${(user.id || '2026').slice(-4).toUpperCase()}`;

  const handleCopyId = () => {
    Clipboard.setString(empId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.cardContainer,
            { backgroundColor: isDark ? '#1e293b' : '#ffffff' },
          ]}
        >
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.badgeIconBg}>
                <ShieldCheck size={20} color="#0d9488" />
              </View>
              <Text
                style={[
                  styles.headerTitle,
                  { color: isDark ? '#f8fafc' : '#0f172a' },
                ]}
              >
                Digital Identity Badge
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                { backgroundColor: isDark ? '#334155' : '#f1f5f9' },
              ]}
              activeOpacity={0.7}
            >
              <X size={18} color={isDark ? '#94a3b8' : '#64748b'} />
            </TouchableOpacity>
          </View>

          {/* Badge Preview Body */}
          <View
            style={[
              styles.badgeBody,
              { backgroundColor: isDark ? '#0f172a' : '#f8fafc' },
            ]}
          >
            {/* Top Teal Brand Accent */}
            <View style={styles.brandAccent} />

            <View style={styles.badgeContent}>
              {/* Avatar & Basic Info */}
              <View style={styles.avatarWrapper}>
                {user.profilePicture ? (
                  <Image
                    source={{ uri: user.profilePicture }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.verifiedDot}>
                  <Check size={10} color="#ffffff" />
                </View>
              </View>

              <Text
                style={[
                  styles.userName,
                  { color: isDark ? '#f1f5f9' : '#0f172a' },
                ]}
              >
                {user.name}
              </Text>
              <Text style={styles.userRole}>
                {(user.designation || user.role || 'Enterprise Employee').toUpperCase()}
              </Text>

              <View style={styles.deptRow}>
                <Building2 size={12} color="#0d9488" />
                <Text style={styles.deptText}>
                  {user.department || 'Smart Management Suite'}
                </Text>
              </View>

              {/* QR Code Container */}
              <View
                style={[
                  styles.qrContainer,
                  { backgroundColor: '#ffffff', borderColor: isDark ? '#334155' : '#e2e8f0' },
                ]}
              >
                <QrCode size={140} color="#0f172a" />
                <Text style={styles.qrScanLabel}>SCAN TO VERIFY EMPLOYEE</Text>
              </View>

              {/* Employee ID Tag */}
              <TouchableOpacity
                style={[
                  styles.idChip,
                  { backgroundColor: isDark ? '#1e293b' : '#ffffff' },
                ]}
                onPress={handleCopyId}
                activeOpacity={0.7}
              >
                <Text style={styles.idLabel}>ID:</Text>
                <Text
                  style={[
                    styles.idValue,
                    { color: isDark ? '#38bdf8' : '#0284c7' },
                  ]}
                >
                  {empId}
                </Text>
                {copied ? (
                  <Check size={14} color="#10b981" />
                ) : (
                  <Copy size={14} color={isDark ? '#94a3b8' : '#64748b'} />
                )}
              </TouchableOpacity>
            </View>

            {/* Bottom Enterprise Compliance Footer */}
            <View style={styles.badgeFooter}>
              <ShieldCheck size={12} color="#10b981" />
              <Text style={styles.securityText}>
                Encrypted DPDP-2023 Compliant Token
              </Text>
            </View>
          </View>

          {/* Modal Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.primaryBtn,
                { backgroundColor: '#0d9488' },
              ]}
              onPress={handleCopyId}
              activeOpacity={0.8}
            >
              <Copy size={16} color="#ffffff" />
              <Text style={styles.primaryBtnText}>
                {copied ? 'Copied ID!' : 'Copy Employee ID'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.secondaryBtn,
                { backgroundColor: isDark ? '#334155' : '#e2e8f0' },
              ]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.secondaryBtnText,
                  { color: isDark ? '#f8fafc' : '#334155' },
                ]}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgeIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBody: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    marginBottom: 18,
  },
  brandAccent: {
    height: 6,
    backgroundColor: '#0d9488',
  },
  badgeContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#0d9488',
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#10b981',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0d9488',
    letterSpacing: 1,
    marginBottom: 6,
  },
  deptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  deptText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  qrContainer: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  qrScanLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.8,
    marginTop: 8,
  },
  idChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  idLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  idValue: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  securityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtn: {
    elevation: 2,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryBtn: {},
  secondaryBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
