import { Platform } from 'react-native';

const getDefaultApiUrl = () => {
  if (Platform.OS === 'web' || Platform.OS === 'ios') {
    return 'http://localhost:5000/api';
  }
  return 'http://10.0.2.2:5000/api';
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getDefaultApiUrl();
