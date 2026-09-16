import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Menu, Sun, Moon, Bell, ArrowLeft, ClipboardList } from './Icon';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { NotificationModal } from './NotificationModal';
import { SidebarDrawer } from './SidebarDrawer';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  navigation?: any;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  showThemeToggle?: boolean;
  showNotification?: boolean;
  showProfile?: boolean;
  onMenuPress?: () => void;
  onNotifPress?: () => void;
  onProfilePress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'ETM',
  subtitle = 'Workspace',
  navigation,
  showBack = false,
  onBack,
  showMenu = true,
  showThemeToggle = true,
  showNotification = true,
  showProfile = true,
  onMenuPress,
  onNotifPress,
  onProfilePress,
}) => {
  const { user } = useAuth();
  const { mode, colors, toggleTheme } = useTheme();
  const isDark = mode === 'dark';

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    } else {
      setDrawerVisible(true);
    }
  };

  const handleNotifPress = () => {
    if (onNotifPress) {
      onNotifPress();
    } else {
      setNotifModalVisible(true);
    }
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else if (navigation) {
      navigation.navigate('ProfileTab');
    } else {
      setDrawerVisible(true);
    }
  };

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const getUserInitials = () => {
    const name = user?.name?.trim() || 'User';
    const parts = name.split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <>
      <View style={[styles.headerContainer, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderColor }]}>
        {/* Left Section: Back / Menu + ETM Logo */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleBackPress}
              activeOpacity={0.7}
              accessibilityLabel="Go Back"
            >
              <ArrowLeft color={colors.textPrimary} size={22} />
            </TouchableOpacity>
          ) : showMenu ? (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleMenuPress}
              activeOpacity={0.7}
              accessibilityLabel="Open Menu"
            >
              <Menu color={colors.textPrimary} size={22} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.brandRow}
            onPress={() => navigation?.navigate?.('DashboardTab')}
            activeOpacity={0.8}
          >
            <View style={[styles.logoIconBox, { backgroundColor: isDark ? '#ffffff' : '#09090b' }]}>
              <ClipboardList color={isDark ? '#09090b' : '#ffffff'} size={16} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>{title}</Text>
              {subtitle ? (
                <Text style={[styles.brandSubtitle, { color: isDark ? '#818cf8' : '#4f46e5' }]} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        </View>

        {/* Right Section: Theme Toggle + Notifications + User Profile */}
        <View style={styles.rightSection}>
          {showThemeToggle && (
            <TouchableOpacity
              style={[
                styles.iconBtn,
                {
                  backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                  borderColor: colors.borderColor,
                },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.7}
              accessibilityLabel="Toggle Theme"
            >
              {isDark ? <Sun color="#fbbf24" size={17} /> : <Moon color="#4f46e5" size={17} />}
            </TouchableOpacity>
          )}

          {showNotification && (
            <TouchableOpacity
              style={[
                styles.iconBtn,
                {
                  backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                  borderColor: colors.borderColor,
                },
              ]}
              onPress={handleNotifPress}
              activeOpacity={0.7}
              accessibilityLabel="Notifications"
            >
              <Bell color={colors.textPrimary} size={17} />
              <View style={styles.unreadBadgeDot} />
            </TouchableOpacity>
          )}

          {showProfile && (
            <TouchableOpacity
              style={[
                styles.profileBtn,
                { borderColor: isDark ? '#334155' : '#e2e8f0' }
              ]}
              onPress={handleProfilePress}
              activeOpacity={0.8}
              accessibilityLabel="User Profile"
            >
              {user?.profilePicture ? (
                <Image source={{ uri: user.profilePicture }} style={styles.profileImg} />
              ) : (
                <View style={styles.avatarBubble}>
                  <Text style={styles.avatarText}>{getUserInitials()}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Embedded Drawer & Notification Modals */}
      <SidebarDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigation}
      />

      <NotificationModal
        visible={notifModalVisible}
        onClose={() => setNotifModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  actionBtn: {
    padding: 6,
    marginRight: 6,
    borderRadius: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  logoIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  titleContainer: {
    justifyContent: 'center',
    flexShrink: 1,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
    lineHeight: 12,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadBadgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  profileBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImg: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
  },
  avatarBubble: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
});
