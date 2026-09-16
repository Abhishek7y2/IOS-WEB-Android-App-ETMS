import { Platform } from 'react-native';

const getDefaultApiUrl = () => {
  // Use host LAN IP (172.16.1.217) so physical mobile devices on Wi-Fi can connect to the backend server (port 5000)
  return 'http://172.16.1.217:5000/api';
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getDefaultApiUrl();
