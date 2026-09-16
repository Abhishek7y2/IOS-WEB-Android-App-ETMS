import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Megaphone, Plus, Search, Pin, X } from '../components/Icon';
import { getAnnouncementsApi, createAnnouncementApi, togglePinAnnouncementApi, Announcement } from '../services/commApi';
import { useAuth } from '../context/AuthContext';

export const AnnouncementsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, mode } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  // Create Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getAnnouncementsApi();
      setAnnouncements(data);
    } catch {
      Alert.alert('Error', 'Failed to fetch announcements.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  const handleTogglePin = async (id: string) => {
    const isPinned = pinnedIds.includes(id);
    if (isPinned) {
      setPinnedIds((prev) => prev.filter((i) => i !== id));
    } else {
      setPinnedIds((prev) => [...prev, id]);
    }
    await togglePinAnnouncementApi(id);
  };

  const handleCreateAnnouncement = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Validation Error', 'Please fill in both title and announcement content.');
      return;
    }

    try {
      setSubmitting(true);
      const created = await createAnnouncementApi(title.trim(), content.trim(), priority);
      setAnnouncements((prev) => [created, ...prev]);
      setModalVisible(false);
      setTitle('');
      setContent('');
      setPriority('medium');
      Alert.alert('Published', 'New announcement published successfully!');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to post announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pinned items sorted to top
  const sorted = [...filtered].sort((a, b) => {
    const aPin = pinnedIds.includes(a.id) ? 1 : 0;
    const bPin = pinnedIds.includes(b.id) ? 1 : 0;
    return bPin - aPin;
  });

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return colors.primary;
      default:
        return colors.success;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <View style={styles.headerTextWrapper}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Announcements</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>Company noticeboard & updates</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(true)}>
            <Plus color="#ffffff" size={20} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        {/* Search Input */}
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search color={colors.textMuted} size={18} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search announcements..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={sorted}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Megaphone color={colors.textMuted} size={48} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Announcements</Text>
                <Text style={[styles.emptySub, { color: colors.textMuted }]}>Check back later for official company updates.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isPinned = pinnedIds.includes(item.id);
              const priorityColor = getPriorityColor(item.priority);

              return (
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.card,
                      borderColor: isPinned ? '#eab308' : colors.border,
                    },
                  ]}
                >
                  {isPinned && (
                    <View style={styles.pinnedBanner}>
                      <Pin color="#eab308" size={14} />
                      <Text style={styles.pinnedText}>PINNED ANNOUNCEMENT</Text>
                    </View>
                  )}

                  <View style={styles.cardHeader}>
                    <View style={styles.authorBadge}>
                      <View style={[styles.authorAvatar, { backgroundColor: colors.primary + '30' }]}>
                        <Text style={[styles.avatarText, { color: colors.primary }]}>{item.authorName[0]?.toUpperCase()}</Text>
                      </View>
                      <View>
                        <Text style={[styles.authorName, { color: colors.text }]}>{item.authorName}</Text>
                        <Text style={[styles.dateText, { color: colors.textMuted }]}>
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.headerActions}>
                      <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20', borderColor: priorityColor }]}>
                        <Text style={[styles.priorityText, { color: priorityColor }]}>
                          {item.priority.toUpperCase()}
                        </Text>
                      </View>

                      {isAdmin && (
                        <TouchableOpacity style={styles.pinBtn} onPress={() => handleTogglePin(item.id)}>
                          <Pin color={isPinned ? '#eab308' : colors.textMuted} size={18} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.cardContent, { color: colors.textMuted }]}>{item.content}</Text>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Admin Create Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Post New Announcement</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={colors.textMuted} size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Title *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="Notice headline..."
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Priority Level</Text>
              <View style={styles.prioritySelector}>
                {(['low', 'medium', 'high', 'urgent'] as const).map((p) => {
                  const pColor = getPriorityColor(p);
                  const isSelected = priority === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityChip,
                        {
                          backgroundColor: isSelected ? pColor : colors.background,
                          borderColor: isSelected ? pColor : colors.border,
                        },
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <Text
                        style={[
                          styles.priorityChipText,
                          { color: isSelected ? '#ffffff' : colors.textMuted },
                        ]}
                      >
                        {p.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Announcement Details *</Text>
              <TextInput
                style={[styles.modalTextArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="Write full announcement description..."
                placeholderTextColor={colors.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={5}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.publishBtn, { backgroundColor: colors.primary }, submitting && styles.disabledBtn]}
                onPress={handleCreateAnnouncement}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.publishBtnText}>Publish Notice</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
  },
  headerTextWrapper: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 12,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 16,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  centered: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  pinnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pinnedText: {
    color: '#eab308',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontWeight: '700',
    fontSize: 13,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
  },
  pinBtn: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 20,
    maxHeight: '85%',
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
  modalBody: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
  },
  modalTextArea: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 90,
  },
  prioritySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  priorityChipText: {
    fontSize: 11,
    fontWeight: '700',
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
  publishBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  publishBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
