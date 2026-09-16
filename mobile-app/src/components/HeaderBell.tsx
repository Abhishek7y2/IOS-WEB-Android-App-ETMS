import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Bell } from './Icon';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

export const HeaderBell = ({ navigation }: { navigation?: any }) => {
  const { unreadCount } = useNotifications();
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.bellBtn}
      onPress={() => navigation?.navigate('Notifications')}
      activeOpacity={0.8}
    >
      <Bell color={colors.textPrimary} size={22} />
      {unreadCount > 0 && (
        <View style={[styles.badge, { borderColor: colors.headerBg }]}>
          <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bellBtn: {
    padding: 6,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ef4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
});

