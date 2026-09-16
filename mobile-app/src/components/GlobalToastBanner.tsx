import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from './Icon';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface GlobalToastBannerProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const GlobalToastBanner: React.FC<GlobalToastBannerProps> = ({ toast, onDismiss }) => {
  const { colors, mode } = useTheme();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 12,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        dismissToast();
      }, 3500);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-120);
      opacity.setValue(0);
    }
  }, [toast]);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!toast) return null;

  const getToastColors = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: mode === 'dark' ? '#064e3b' : '#ecfdf5',
          border: '#10b981',
          text: mode === 'dark' ? '#6ee7b7' : '#047857',
          IconComponent: CheckCircle2,
          iconColor: '#10b981',
        };
      case 'error':
        return {
          bg: mode === 'dark' ? '#451a1a' : '#fef2f2',
          border: '#ef4444',
          text: mode === 'dark' ? '#fca5a5' : '#b91c1c',
          IconComponent: AlertCircle,
          iconColor: '#ef4444',
        };
      case 'warning':
        return {
          bg: mode === 'dark' ? '#451a03' : '#fffbeb',
          border: '#f59e0b',
          text: mode === 'dark' ? '#fde68a' : '#b45309',
          IconComponent: AlertTriangle,
          iconColor: '#f59e0b',
        };
      case 'info':
      default:
        return {
          bg: mode === 'dark' ? '#134e4a66' : '#f0fdfa',
          border: colors.accent,
          text: colors.accent,
          IconComponent: Info,
          iconColor: colors.accent,
        };
    }
  };

  const styleConfig = getToastColors();
  const Icon = styleConfig.IconComponent;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: styleConfig.bg,
          borderColor: styleConfig.border,
        },
      ]}
    >
      <View style={styles.iconWrapper}>
        <Icon color={styleConfig.iconColor} size={22} />
      </View>
      <View style={styles.textWrapper}>
        {toast.title && (
          <Text style={[styles.toastTitle, { color: styleConfig.text }]}>{toast.title}</Text>
        )}
        <Text style={[styles.toastMessage, { color: styleConfig.text }]} numberOfLines={2}>
          {toast.message}
        </Text>
      </View>
      <TouchableOpacity onPress={dismissToast} style={styles.closeBtn} activeOpacity={0.7}>
        <X color={styleConfig.text} size={16} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 999999,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  iconWrapper: {
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 13,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
    borderRadius: 12,
  },
});
