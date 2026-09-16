import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { AppNotification } from '../services/notificationApi';
import { Bell, CheckCheck, Clock, ArrowLeft, Megaphone, CheckSquare, MessageSquare } from '../components/Icon';

export const NotificationsScreen = ({ navigation }: any) => {
  const { notifications, unreadCount, loading, refreshNotifications, markAsRead, markAllAsRead } = useNotifications();
  const { colors, mode } = useTheme();
  const [filter, setFilter] = useState<'all' | 'unread' | 'announcement'>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'announcement') return n.type === 'announcement';
    return true;
  });

  const renderIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Megaphone color={colors.info} size={18} />;
      case 'task':
        return <CheckSquare color={colors.primary} size={18} />;
      case 'message':
        return <MessageSquare color={colors.success} size={18} />;
      default:
        return <Bell color={colors.warning} size={18} />;
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: item.isRead ? colors.card : mode === 'dark' ? '#1a233a' : '#f0f4ff',
          borderColor: item.isRead ? colors.border : colors.primary,
        },
      ]}
      onPress={() => markAsRead(item._id || item.id || '')}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.background }]}>{renderIcon(item.type)}</View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {item.title || 'Notification'}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>

        <Text style={[styles.message, { color: colors.textMuted }]}>{item.message}</Text>

        {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={22} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications ({unreadCount})</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Workspace alerts & real-time updates</Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={[styles.markAllBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={markAllAsRead}
          >
            <CheckCheck color={colors.primary} size={18} style={{ marginRight: 4 }} />
            <Text style={[styles.markAllText, { color: colors.primary }]}>Read All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'unread', 'announcement'] as const).map((tab) => {
          const isActive = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterTab,
                {
                  backgroundColor: isActive ? colors.primary : colors.card,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: isActive ? '#ffffff' : colors.textMuted },
                ]}
              >
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={filteredNotifs}
        keyExtractor={(item, idx) => item._id || item.id || `notif-${idx}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshNotifications} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Bell color={colors.textMuted} size={40} style={{ marginBottom: 10 }} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notifications</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>You're all caught up with your workspace alerts!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { padding: 6, marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  markAllText: { fontSize: 12, fontWeight: '700' },
  filterRow: { flexDirection: 'row', marginHorizontal: 20, marginVertical: 14, gap: 8 },
  filterTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10, borderWidth: 1 },
  filterTabText: { fontSize: 11, fontWeight: '700' },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { flexDirection: 'row', borderRadius: 16, padding: 14, borderWidth: 1, marginBottom: 10 },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontSize: 14, fontWeight: '700', flex: 1 },
  time: { fontSize: 11 },
  message: { fontSize: 13, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  emptyBox: { alignItems: 'center', paddingVertical: 50 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  emptySubtitle: { fontSize: 13 },
});
