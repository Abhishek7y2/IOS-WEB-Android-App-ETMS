import * as ImagePicker from 'expo-image-picker';

export async function requestMediaPermissions(): Promise<boolean> {
  const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
  const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return cameraStatus.granted && libraryStatus.granted;
}

export async function pickPhotoFromGallery(): Promise<string | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.base64) {
        return `data:image/jpeg;base64,${asset.base64}`;
      }
      return asset.uri;
    }
    return null;
  } catch {
    return null;
  }
}

export async function capturePhotoWithCamera(): Promise<string | null> {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return null;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.base64) {
        return `data:image/jpeg;base64,${asset.base64}`;
      }
      return asset.uri;
    }
    return null;
  } catch {
    return null;
  }
}
