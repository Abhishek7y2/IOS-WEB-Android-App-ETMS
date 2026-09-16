import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Zap,
  MessageSquare,
  Calendar,
  Clock,
  Archive,
  FileText,
  Settings,
  LogOut,
  X,
  Sun,
  Moon,
} from './Icon';

interface SidebarDrawerProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  currentScreen?: string;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  visible,
  onClose,
  navigation,
  currentScreen,
}) => {
  const { user, logout } = useAuth();
  const { mode, colors, toggleTheme } = useTheme();
  const isDark = mode === 'dark';

  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'superadmin' ||
    user?.designation?.toLowerCase() === 'admin' ||
    user?.designation?.toLowerCase() === 'ceo' ||
    user?.designation?.toLowerCase() === 'project manager';

  const handleNavigate = (screenName: string) => {
    onClose();
    if (navigation) {
      navigation.navigate(screenName);
    }
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  if (!visible) return null;

  // Active navigation items matching web frontend exact order & names
  const navigationItems = [
    {
      name: 'Dashboard',
      screen: 'DashboardTab',
      icon: LayoutDashboard,
    },
    {
      name: isAdmin ? 'Task Manager' : 'Task List',
      screen: 'TasksTab',
      icon: ClipboardList,
    },
    {
      name: isAdmin ? 'Team Member Manager' : 'Team Members',
      screen: 'TeamTab',
      icon: Users,
    },
    {
      name: 'Chatbot',
      screen: 'ChatbotTab',
      icon: Zap,
    },
    {
      name: 'Communication',
      screen: 'CommTab',
      icon: MessageSquare,
    },
    {
      name: 'Calendar',
      screen: 'CalendarTab',
      icon: Calendar,
    },
    {
      name: isAdmin ? 'Attendance Manager' : 'Attendance',
      screen: 'AttendanceTab',
      icon: Clock,
    },
    {
      name: isAdmin ? 'Leave Manager' : 'Leave',
      screen: 'LeaveTab',
      icon: Calendar,
    },
  ];

  if (isAdmin) {
    navigationItems.push({
      name: 'Archive',
      screen: 'TasksTab',
      icon: Archive,
    });

    navigationItems.push({
      name: 'Document RAG',
      screen: 'RagTab',
      icon: FileText,
    });
  }

  // Settings at the very end
  navigationItems.push({
    name: 'Settings',
    screen: 'ProfileTab',
    icon: Settings,
  });

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop Tap to Close */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        {/* Sidebar Drawer Panel */}
        <View
          style={[
            styles.drawerPanel,
            {
              backgroundColor: isDark ? '#090d16' : '#ffffff',
              borderRightColor: colors.borderColor,
            },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header: User Profile Badge & Actions */}
            <View
              style={[
                styles.userHeader,
                {
                  backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                  borderBottomColor: colors.borderColor,
                },
              ]}
            >
              <View style={styles.userRow}>
                <View style={[styles.avatarCircle, { backgroundColor: isDark ? '#3b82f6' : '#2563eb' }]}>
                  <Text style={styles.avatarText}>
                    {user?.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.userCol}>
                  <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {user?.name || 'Employee'}
                  </Text>
                  <Text style={[styles.userRole, { color: isDark ? '#818cf8' : '#4f46e5' }]} numberOfLines={1}>
                    {user?.designation || (isAdmin ? 'Admin' : 'Team Member')}
                  </Text>
                </View>

                {/* Theme Toggle Button */}
                <TouchableOpacity
                  onPress={toggleTheme}
                  style={[
                    styles.headerIconBtn,
                    {
                      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                      borderColor: colors.borderColor,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  {isDark ? <Sun color="#fbbf24" size={17} /> : <Moon color="#6366f1" size={17} />}
                </TouchableOpacity>

                {/* Close Drawer Button */}
                <TouchableOpacity
                  onPress={onClose}
                  style={[
                    styles.headerIconBtn,
                    {
                      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                      borderColor: colors.borderColor,
                      marginLeft: 6,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <X color={colors.textSecondary} size={17} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Navigation Menu List */}
            <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
              {/* WORKSPACE Category Header (Exact Web Parity) */}
              <View style={styles.workspaceHeaderContainer}>
                <Text style={[styles.workspaceLabel, { color: isDark ? '#94a3b8' : '#475569' }]}>
                  WORKSPACE
                </Text>
              </View>

              <View style={styles.itemsContainer}>
                {navigationItems.map((item, idx) => {
                  const IconComp = item.icon;
                  const isActive = currentScreen === item.screen;

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.navItem,
                        isActive
                          ? {
                              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(241, 245, 249, 0.95)',
                              borderLeftColor: '#3b82f6',
                            }
                          : {
                              borderLeftColor: 'transparent',
                            },
                      ]}
                      onPress={() => handleNavigate(item.screen)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.iconWrapper}>
                        <IconComp
                          color={isActive ? '#3b82f6' : isDark ? '#cbd5e1' : '#475569'}
                          size={19}
                        />
                      </View>
                      <Text
                        style={[
                          styles.navLabel,
                          {
                            color: isActive ? (isDark ? '#60a5fa' : '#2563eb') : colors.textPrimary,
                            fontWeight: isActive ? '700' : '600',
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Sidebar Footer (Exact Web Parity) */}
            <View
              style={[
                styles.footer,
                {
                  backgroundColor: isDark ? '#090d16' : '#ffffff',
                  borderTopColor: colors.borderColor,
                },
              ]}
            >
              {/* Log Out Button */}
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <LogOut color="#ef4444" size={18} style={{ marginRight: 12 }} />
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>

              {/* Mode Server API Badge */}
              <View
                style={[
                  styles.modeBox,
                  {
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(248, 250, 252, 0.95)',
                    borderColor: colors.borderColor,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.modeTitle, { color: colors.textPrimary }]}>
                    Mode:{' '}
                  </Text>
                  <Text style={styles.modeHighlight}>Server API</Text>
                </View>
                <Text style={[styles.modeSub, { color: colors.textSecondary }]}>
                  Connected to MongoDB backend.
                </Text>
              </View>
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
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
  },
  drawerPanel: {
    width: '78%',
    maxWidth: 300,
    height: '100%',
    borderRightWidth: 1,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  safeArea: {
    flex: 1,
  },
  userHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  userCol: {
    flex: 1,
    marginRight: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
  userRole: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  headerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuScroll: {
    flex: 1,
  },
  workspaceHeaderContainer: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  workspaceLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  itemsContainer: {
    paddingHorizontal: 10,
    gap: 2,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  iconWrapper: {
    width: 26,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: 8,
  },
  navLabel: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
  },
  modeBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  modeTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  modeHighlight: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3b82f6',
  },
  modeSub: {
    fontSize: 10,
    marginTop: 2,
  },
});
