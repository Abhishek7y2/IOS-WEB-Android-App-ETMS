import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AttachmentItem, pickTaskAttachment, formatFileSize } from '../utils/fileUploader';
import { useTheme } from '../context/ThemeContext';
import { FileText, Paperclip, Trash2, Eye, X, ImageIcon } from './Icon';

interface TaskAttachmentSectionProps {
  attachments: AttachmentItem[];
  onAddAttachment?: (attachment: AttachmentItem) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
  readOnly?: boolean;
}

export const TaskAttachmentSection: React.FC<TaskAttachmentSectionProps> = ({
  attachments = [],
  onAddAttachment,
  onRemoveAttachment,
  readOnly = false,
}) => {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';
  const [loading, setLoading] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<AttachmentItem | null>(null);

  const handlePickFile = async () => {
    if (!onAddAttachment) return;
    setLoading(true);
    const newAttachment = await pickTaskAttachment();
    setLoading(false);
    if (newAttachment) {
      onAddAttachment(newAttachment);
    }
  };

  const isImageType = (item: AttachmentItem) => {
    return (
      item.type?.startsWith('image/') ||
      item.dataUrl?.startsWith('data:image') ||
      /\.(png|jpe?g|webp|gif|svg)$/i.test(item.name || '') ||
      item.dataUrl?.includes('cloudinary')
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Paperclip color={isDark ? '#38bdf8' : '#0284c7'} size={16} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            ATTACHMENTS ({attachments.length})
          </Text>
        </View>

        {!readOnly && onAddAttachment && (
          <TouchableOpacity
            style={[
              styles.addBtn,
              {
                backgroundColor: isDark ? '#0284c730' : '#e0f2fe',
                borderColor: isDark ? '#0369a1' : '#bae6fd',
              },
            ]}
            onPress={handlePickFile}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#0284c7" />
            ) : (
              <>
                <Paperclip color={isDark ? '#38bdf8' : '#0284c7'} size={13} style={{ marginRight: 4 }} />
                <Text style={[styles.addBtnText, { color: isDark ? '#38bdf8' : '#0284c7' }]}>
                  + Attach File
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Attachment List */}
      {attachments.length === 0 ? (
        <View
          style={[
            styles.emptyBox,
            {
              backgroundColor: isDark ? '#0f172a50' : '#f8fafc',
              borderColor: colors.borderColor,
            },
          ]}
        >
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No attachments added yet.
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {attachments.map((item, index) => {
            const isImage = isImageType(item);
            return (
              <View
                key={item.id || `att_${index}`}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: isDark ? '#0f172a80' : '#f8fafc',
                    borderColor: colors.borderColor,
                  },
                ]}
              >
                {/* Thumbnail / Icon */}
                <TouchableOpacity
                  style={styles.itemLeft}
                  onPress={() => isImage && setPreviewAttachment(item)}
                  activeOpacity={0.8}
                >
                  {isImage && item.dataUrl ? (
                    <Image source={{ uri: item.dataUrl }} style={styles.thumbnail} />
                  ) : (
                    <View style={[styles.iconBox, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                      {isImage ? (
                        <ImageIcon color={isDark ? '#38bdf8' : '#0284c7'} size={18} />
                      ) : (
                        <FileText color={isDark ? '#a7f3d0' : '#059669'} size={18} />
                      )}
                    </View>
                  )}

                  <View style={styles.fileInfo}>
                    <Text style={[styles.fileName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {item.name || `Attachment ${index + 1}`}
                    </Text>
                    <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                      {formatFileSize(item.size)}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Actions */}
                <View style={styles.itemRight}>
                  {isImage && (
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => setPreviewAttachment(item)}
                    >
                      <Eye color={colors.textSecondary} size={16} />
                    </TouchableOpacity>
                  )}

                  {!readOnly && onRemoveAttachment && (
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => onRemoveAttachment(item.id)}
                    >
                      <Trash2 color="#ef4444" size={16} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Fullscreen Image Preview Modal */}
      {previewAttachment && (
        <Modal
          visible={!!previewAttachment}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewAttachment(null)}
        >
          <View style={styles.previewOverlay}>
            <SafeAreaView style={styles.previewSafeArea}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle} numberOfLines={1}>
                  {previewAttachment.name}
                </Text>
                <TouchableOpacity
                  style={styles.previewCloseBtn}
                  onPress={() => setPreviewAttachment(null)}
                >
                  <X color="#ffffff" size={24} />
                </TouchableOpacity>
              </View>

              <View style={styles.previewBody}>
                <Image
                  source={{ uri: previewAttachment.dataUrl }}
                  style={styles.previewFullImage}
                  resizeMode="contain"
                />
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  listContainer: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  thumbnail: {
    width: 38,
    height: 38,
    borderRadius: 8,
    marginRight: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '700',
  },
  fileSize: {
    fontSize: 11,
    marginTop: 2,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconBtn: {
    padding: 6,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: '#000000ef',
  },
  previewSafeArea: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  previewTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  previewCloseBtn: {
    padding: 4,
  },
  previewBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  previewFullImage: {
    width: '100%',
    height: '100%',
  },
});
