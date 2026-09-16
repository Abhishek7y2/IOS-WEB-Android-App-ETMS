import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { User, Briefcase, Shield, Settings, Activity } from './Icon';
import { useTheme } from '../context/ThemeContext';

export type ProfileTabKey = 'personal' | 'work' | 'security' | 'preferences' | 'activity';

interface ProfileTabItem {
  key: ProfileTabKey;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
}

const TABS: ProfileTabItem[] = [
  { key: 'personal', label: 'Personal', icon: User },
  { key: 'work', label: 'Work Profile', icon: Briefcase },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'preferences', label: 'Preferences', icon: Settings },
  { key: 'activity', label: 'Activity', icon: Activity },
];

interface ProfileTabsSectionProps {
  activeTab: ProfileTabKey;
  onSelectTab: (tab: ProfileTabKey) => void;
}

export const ProfileTabsSection: React.FC<ProfileTabsSectionProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const IconComp = tab.icon;
          const iconColor = isActive
            ? '#ffffff'
            : isDark
            ? '#94a3b8'
            : '#64748b';

          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                isActive
                  ? styles.activeTab
                  : [
                      styles.inactiveTab,
                      { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' },
                    ],
              ]}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.7}
            >
              <IconComp size={16} color={iconColor} />
              <Text
                style={[
                  styles.tabText,
                  isActive
                    ? styles.activeTabText
                    : [
                        styles.inactiveTabText,
                        { color: isDark ? '#94a3b8' : '#64748b' },
                      ],
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#0d9488',
    elevation: 3,
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  inactiveTab: {},
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
  },
  inactiveTabText: {},
});
