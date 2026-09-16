import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, LogOut, Shield, Mail, Briefcase, Smartphone, CheckCircle, Sun, Moon } from '../components/Icon';

export const HomeScreen = () => {
  const { user, logout, loading } = useAuth();
  const { colors, mode, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.card}
      />
      {/* Top Header with Theme Toggle */}
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.topBarTitle, { color: colors.text }]}>Workspace Account</Text>
        <TouchableOpacity
          style={[styles.themeToggleBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          {mode === 'dark' ? <Sun color="#f59e0b" size={18} /> : <Moon color="#6366f1" size={18} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Banner */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.background, borderColor: colors.primary }]}>
            <User color={colors.primary} size={40} />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Employee'}</Text>
          <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user?.email || 'user@company.com'}</Text>

          <View style={styles.badgeRow}>
            <View style={[styles.roleBadge, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' }]}>
              <Shield color={colors.primary} size={14} style={{ marginRight: 6 }} />
              <Text style={[styles.roleBadgeText, { color: colors.primary }]}>{(user?.role || 'User').toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* System Info Box */}
        <View style={[styles.infoSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Overview</Text>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Briefcase color={colors.textMuted} size={20} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Designation</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user?.designation || 'Software Engineer'}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Mail color={colors.textMuted} size={20} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Email</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Smartphone color={colors.textMuted} size={20} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Mobile Client Status</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>Connected to REST Server</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <CheckCircle color={colors.success} size={20} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Authentication Session</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>Active (Token Persisted)</Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LogOut color="#ef4444" size={20} style={{ marginRight: 10 }} />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoSection: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ef444415',
    borderWidth: 1,
    borderColor: '#ef444440',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
});
