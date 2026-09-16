import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export interface AttachmentItem {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

/**
 * Request camera roll permissions and allow picking an image/document photo from device library
 */
export async function pickTaskAttachment(): Promise<AttachmentItem | null> {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Permission to access media library is required to attach files to tasks.'
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const fileName = asset.fileName || `Attachment_${Date.now()}.jpg`;
    const fileSize = asset.fileSize || 1024 * 150; // default estimated size if missing
    const mimeType = asset.mimeType || 'image/jpeg';
    
    // Construct data URL or base64 URI
    let dataUrl = asset.uri;
    if (asset.base64) {
      dataUrl = `data:${mimeType};base64,${asset.base64}`;
    }

    return {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: fileName,
      size: fileSize,
      type: mimeType,
      dataUrl: dataUrl,
    };
  } catch (error) {
    console.error('Error picking attachment:', error);
    Alert.alert('Error', 'Failed to pick attachment from device.');
    return null;
  }
}

/**
 * Format file bytes size into human readable string (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || isNaN(bytes)) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
