import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Bell, X, CheckCircle2, Clock, Calendar, AlertCircle } from './Icon';
import { getNotificationsApi, markNotificationAsReadApi, AppNotification } from '../services/notificationService';
import { useTheme } from '../context/ThemeContext';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ visible, onClose }) => {
  const { colors, mode } = useTheme();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      const fetchNotifs = async () => {
        setLoading(true);
        try {
          const list = await getNotificationsApi();
          setNotifications(list);
        } finally {
          setLoading(false);
        }
      };
      fetchNotifs();
    }
  }, [visible]);

  const handleMarkRead = async (id: string) => {
    await markNotificationAsReadApi(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      style={[
        styles.itemCard,
        { backgroundColor: colors.bg, borderColor: colors.borderColor },
        !item.read && { borderColor: colors.accent, backgroundColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.06)' }
      ]}
      onPress={() => handleMarkRead(item.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconCircle, { backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}>
        {item.title.includes('Task') ? (
          <CheckCircle2 color="#818cf8" size={20} />
        ) : item.title.includes('Leave') ? (
          <Calendar color="#10b981" size={20} />
        ) : (
          <Clock color="#f59e0b" size={20} />
        )}
      </View>

      <View style={styles.textCol}>
        <View style={styles.titleRow}>
          <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.itemTime, { color: colors.textSecondary }]}>{item.timestamp}</Text>
        </View>
        <Text style={[styles.itemBody, { color: colors.textSecondary }]}>{item.body}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Bell color={colors.accent} size={22} style={{ marginRight: 8 }} />
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notifications</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color={colors.textSecondary} size={22} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.accent} size="large" />
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ padding: 16 }}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications yet.</Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    borderWidth: 1,
    maxHeight: '75%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemTime: {
    fontSize: 11,
  },
  itemBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  emptyBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

