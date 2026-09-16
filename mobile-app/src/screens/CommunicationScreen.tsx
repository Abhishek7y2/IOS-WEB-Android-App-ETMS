import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import {
  getAnnouncementsApi,
  getConversationsApi,
  sendBroadcastApi,
  Announcement,
  Conversation,
} from '../services/commApi';
import { Megaphone, MessageSquare, User, Calendar, Shield, ChevronRight, Plus, Users, Send, X, Menu, Sun, Moon } from '../components/Icon';
import { socketService } from '../services/socketService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SidebarDrawer } from '../components/SidebarDrawer';
import { AppHeader } from '../components/AppHeader';

export const CommunicationScreen = ({ navigation }: any) => {
  const { mode, colors, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'announcements'>('chat');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Broadcast Modal state
  const [broadcastVisible, setBroadcastVisible] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastPriority, setBroadcastPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [annRes, convRes] = await Promise.all([
        getAnnouncementsApi(),
        getConversationsApi(),
      ]);
      setAnnouncements(annRes);
      setConversations(convRes);
    } catch (err) {
      console.error('Failed to load communication data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    socketService.connect();

    const unsubAnn = socketService.subscribe('announcement.created', () => {
      loadData();
    });

    const unsubMsg = socketService.subscribe('message.received', () => {
      loadData();
    });

    return () => {
      unsubAnn();
      unsubMsg();
    };
  }, [loadData]);

  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) {
      Alert.alert('Validation', 'Please provide both title and announcement details.');
      return;
    }

    setSendingBroadcast(true);
    try {
      const res = await sendBroadcastApi(broadcastTitle, broadcastMsg, broadcastPriority);
      if (res) {
        Alert.alert('Success', 'Broadcast message transmitted to all organization devices!');
        setBroadcastVisible(false);
        setBroadcastTitle('');
        setBroadcastMsg('');
      } else {
        Alert.alert('Error', 'Failed to send broadcast');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to send broadcast');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const renderAnnouncementItem = ({ item }: { item: Announcement }) => (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.authorBadge, { backgroundColor: mode === 'dark' ? '#312e81' : '#e0e7ff' }]}>
          <Shield color={colors.accent} size={14} style={{ marginRight: 6 }} />
          <Text style={[styles.authorText, { color: mode === 'dark' ? '#c7d2fe' : colors.accent }]}>{item.authorName}</Text>
        </View>
        <Text style={[styles.priorityPill, { color: getPriorityColor(item.priority) }]}>
          {item.priority.toUpperCase()}
        </Text>
      </View>
      <Text style={[styles.announcementTitle, { color: colors.textPrimary }]}>{item.title}</Text>
      <Text style={[styles.announcementContent, { color: colors.textSecondary }]}>{item.content}</Text>
      <View style={[styles.cardFooter, { borderTopColor: colors.borderColor }]}>
        <Calendar color={colors.textSecondary} size={14} style={{ marginRight: 4 }} />
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>Published: {item.createdAt.split('T')[0]}</Text>
      </View>
    </View>
  );

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[styles.chatCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}
      onPress={() => navigation.navigate('ChatDetail', { conversationId: item.id, title: item.groupName || item.participantNames.join(', ') })}
      activeOpacity={0.8}
    >
      <View style={[styles.avatarBox, { backgroundColor: mode === 'dark' ? '#312e81' : '#e0e7ff' }]}>
        {item.isGroup ? <Users color={colors.accent} size={20} /> : <User color={colors.accent} size={20} />}
      </View>
      <View style={styles.chatInfo}>
        <Text style={[styles.chatName, { color: colors.textPrimary }]} numberOfLines={1}>
          {item.groupName || item.participantNames.join(', ') || 'Team Chat'}
        </Text>
        <Text style={[styles.lastMsg, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      {(item.unreadCount || 0) > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
      <ChevronRight color={colors.textSecondary} size={20} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBg} />

      {/* Top Header Navbar */}
      <AppHeader
        title="ETM"
        subtitle="Communication"
        navigation={navigation}
      />

      {/* Action Strip: Broadcast & New Group */}
      <View style={[styles.actionStrip, { backgroundColor: colors.cardBg, borderBottomColor: colors.borderColor }]}>
        <TouchableOpacity
          style={[styles.createGroupHeaderBtn, { backgroundColor: colors.accent, flex: 1 }]}
          onPress={() => navigation.navigate('CreateGroup')}
          activeOpacity={0.8}
        >
          <Plus color="#ffffff" size={16} style={{ marginRight: 6 }} />
          <Text style={styles.createGroupText}>New Group Chat</Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={[styles.broadcastActionBtn, { backgroundColor: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.3)' }]}
            onPress={() => setBroadcastVisible(true)}
            activeOpacity={0.8}
          >
            <Megaphone color="#f43f5e" size={16} style={{ marginRight: 6 }} />
            <Text style={[styles.createGroupText, { color: '#f43f5e' }]}>Broadcast</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Banner Link for Full Noticeboard */}
      <TouchableOpacity
        style={[styles.noticeboardBanner, { backgroundColor: colors.cardBg, borderColor: mode === 'dark' ? 'rgba(234, 179, 8, 0.4)' : 'rgba(234, 179, 8, 0.6)' }]}
        onPress={() => navigation.navigate('Announcements')}
        activeOpacity={0.85}
      >
        <Megaphone color="#eab308" size={20} />
        <View style={styles.bannerTextWrapper}>
          <Text style={[styles.bannerTitle, { color: colors.textPrimary }]}>Company Noticeboard</Text>
          <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>Tap to view pinboard & notices</Text>
        </View>
        <ChevronRight color="#eab308" size={18} />
      </TouchableOpacity>

      {/* Segmented Tab Control */}
      <View style={[styles.tabContainer, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'chat' && { backgroundColor: colors.accent }]}
          onPress={() => setActiveTab('chat')}
        >
          <MessageSquare color={activeTab === 'chat' ? '#ffffff' : colors.textSecondary} size={18} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'chat' && styles.tabTextActive]}>Team Chats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'announcements' && { backgroundColor: colors.accent }]}
          onPress={() => setActiveTab('announcements')}
        >
          <Megaphone color={activeTab === 'announcements' ? '#ffffff' : colors.textSecondary} size={18} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'announcements' && styles.tabTextActive]}>Announcements</Text>
        </TouchableOpacity>
      </View>

      {/* Content List */}
      {activeTab === 'announcements' ? (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          renderItem={renderAnnouncementItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.accent} />}
          ListEmptyComponent={
            <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No company announcements available.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.accent} />}
          ListEmptyComponent={
            <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No active chat conversations found.</Text>
            </View>
          }
        />
      )}

      {/* Broadcast Modal for Admins */}
      <Modal visible={broadcastVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Megaphone color="#f43f5e" size={22} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Broadcast Alert</Text>
              </View>
              <TouchableOpacity onPress={() => setBroadcastVisible(false)}>
                <X color={colors.textSecondary} size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginBottom: 16 }}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Alert Title *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]}
                placeholder="e.g. Server Maintenance at 10 PM"
                placeholderTextColor={colors.textSecondary}
                value={broadcastTitle}
                onChangeText={setBroadcastTitle}
              />

              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Broadcast Message *</Text>
              <TextInput
                style={[styles.modalTextArea, { backgroundColor: colors.bg, borderColor: colors.borderColor, color: colors.textPrimary }]}
                placeholder="Message will be broadcasted to all active team members..."
                placeholderTextColor={colors.textSecondary}
                value={broadcastMsg}
                onChangeText={setBroadcastMsg}
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setBroadcastVisible(false)}>
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendBroadcastBtn, sendingBroadcast && styles.disabledBtn]}
                onPress={handleSendBroadcast}
                disabled={sendingBroadcast}
              >
                {sendingBroadcast ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Send color="#ffffff" size={16} style={{ marginRight: 6 }} />
                    <Text style={styles.sendBroadcastBtnText}>Send Alert</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

function getPriorityColor(p: string): string {
  switch (p) {
    case 'urgent': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#818cf8';
    default: return '#10b981';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionIconBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    padding: 8,
    borderRadius: 8,
  },
  createGroupHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createGroupText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  noticeboardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 14,
    borderWidth: 1,
  },
  bannerTextWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  bannerSub: {
    fontSize: 11,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  actionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
  },
  broadcastActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  authorText: {
    fontSize: 12,
    fontWeight: '700',
  },
  priorityPill: {
    fontSize: 11,
    fontWeight: '800',
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  announcementContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  dateText: {
    fontSize: 12,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  lastMsg: {
    fontSize: 13,
  },
  unreadBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: 6,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyBox: {
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
  },
  modalTextArea: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelBtnText: {
    fontWeight: '600',
  },
  sendBroadcastBtn: {
    backgroundColor: '#f43f5e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendBroadcastBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});

