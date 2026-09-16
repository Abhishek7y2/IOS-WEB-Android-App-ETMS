import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  Image,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { AppHeader } from '../components/AppHeader';
import { DashboardChartsSection } from '../components/DashboardChartsSection';

import {
  CheckCircle2,
  ListTodo,
  Clock3,
  Bell,
  Menu,
  Sun,
  Moon,
  BarChart3,
  ClipboardList,
  MessageSquare,
  Inbox,
  Megaphone,
  Users,
  Target,
  Zap,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  CircleDashed,
  TimerReset,
} from '../components/Icon';
import { NotificationModal } from '../components/NotificationModal';
import { SidebarDrawer } from '../components/SidebarDrawer';
import { getAnnouncementsApi, getConversationsApi, Announcement, Conversation } from '../services/commApi';
import axiosInstance from '../services/axios';

interface ActivityItem {
  id: string;
  employeeName: string;
  actionText: string;
  timestamp: string;
}

export const DashboardScreen = ({ navigation }: any) => {
  const { metrics, tasks, employees, loading, refreshTasks, setStatusFilter } = useTasks();
  const { user } = useAuth();
  const { mode, colors, toggleTheme } = useTheme();

  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [teamPage, setTeamPage] = useState(1);

  const isDark = mode === 'dark';

  const getEmpName = (assignedToId: string | any) => {
    if (!assignedToId) return 'Team Member';
    if (typeof assignedToId === 'object' && assignedToId.name) return assignedToId.name;
    return employees.find((e) => e.id === assignedToId)?.name || 'Team Member';
  };

  // Load communication data and activity logs
  useEffect(() => {
    loadDashboardExtraData();
  }, []);

  const loadDashboardExtraData = async () => {
    try {
      const [annData, convData] = await Promise.all([
        getAnnouncementsApi(),
        getConversationsApi(),
      ]);
      setAnnouncements(annData);
      setConversations(convData);

      // Fetch activity logs from server or fallback to task-based events
      try {
        const res = await axiosInstance.get<{ success: boolean; data: any }>('/profile/export-data');
        const payload = res.data?.data?.activity;
        const parsed: ActivityItem[] = [];

        if (payload?.tasks && Array.isArray(payload.tasks)) {
          payload.tasks.slice(0, 10).forEach((t: any, idx: number) => {
            const empName = t.assignedTo?.name || getEmpName(t.assignedTo) || user?.name || 'Team Member';
            parsed.push({
              id: `act-task-${idx}`,
              employeeName: empName,
              actionText: `updated status for "${t.title || 'Task'}" to ${t.status || 'Active'}`,
              timestamp: t.updatedAt || t.createdAt || new Date().toISOString(),
            });
          });
        }

        if (parsed.length > 0) {
          setActivities(parsed);
        } else {
          generateFallbackActivities();
        }
      } catch {
        generateFallbackActivities();
      }
    } catch {
      generateFallbackActivities();
    }
  };

  const generateFallbackActivities = () => {
    const sampleActs: ActivityItem[] = tasks.slice(0, 6).map((t, idx) => ({
      id: `fallback-act-${idx}`,
      employeeName: getEmpName(t.assignedTo) || user?.name || 'Abhishek Yadav',
      actionText: `assigned task "${t.title}" to ${getEmpName(t.assignedTo)}`,
      timestamp: t.createdAt || new Date().toISOString(),
    }));

    if (sampleActs.length === 0) {
      sampleActs.push({
        id: 'default-act-1',
        employeeName: user?.name || 'Abhishek Yadav',
        actionText: 'authenticated and initialized workspace session',
        timestamp: new Date().toISOString(),
      });
    }
    setActivities(sampleActs);
  };

  const handleRefreshAll = async () => {
    await Promise.all([refreshTasks(), loadDashboardExtraData()]);
  };

  // Recent tasks (5 items like web)
  const recentTasks = useMemo(() => tasks.slice(0, 5), [tasks]);

  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 768;
  const cardWidth = isTablet
    ? (windowWidth - 32 - 36) / 4
    : (windowWidth - 32 - 12) / 2;

  // Realtime KPI calculations (fallback to tasks array so counts are never 0)
  const totalTasks = tasks.length > 0 ? tasks.length : (metrics.total || 0);
  const completedTasks = tasks.length > 0 ? tasks.filter((t) => t.status === 'completed').length : (metrics.completed || 0);
  const inProgressTasks = tasks.length > 0 ? tasks.filter((t) => t.status === 'in_progress').length : (metrics.inProgress || 0);
  const pendingTasks = tasks.length > 0 ? tasks.filter((t) => t.status === 'todo' || (t.status as any) === 'pending' || t.status === 'overdue').length : (metrics.pending || 0);
  const overdueTasks = tasks.length > 0 ? tasks.filter((t) => t.status === 'overdue').length : (metrics.overdue || 0);

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeRate = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
  const highPriorityPending = tasks.filter((t) => (t.priority === 'high' || t.priority === 'urgent') && t.status !== 'completed').length;

  const urgentCount = tasks.filter((t) => t.priority === 'urgent').length;
  const highCount = tasks.filter((t) => t.priority === 'high').length;
  const mediumCount = tasks.filter((t) => t.priority === 'medium').length;
  const lowCount = tasks.filter((t) => t.priority === 'low').length;

  const urgentPct = totalTasks > 0 ? Math.round((urgentCount / totalTasks) * 100) : 0;
  const highPct = totalTasks > 0 ? Math.round((highCount / totalTasks) * 100) : 0;
  const mediumPct = totalTasks > 0 ? Math.round((mediumCount / totalTasks) * 100) : 0;
  const lowPct = totalTasks > 0 ? Math.round((lowCount / totalTasks) * 100) : 0;

  const unreadMessageCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // Pagination for Team Members (4 per page like web)
  const TEAM_PER_PAGE = 4;
  const totalTeamPages = Math.max(1, Math.ceil((employees?.length || 0) / TEAM_PER_PAGE));
  const paginatedEmployees = useMemo(
    () => (employees || []).slice((teamPage - 1) * TEAM_PER_PAGE, teamPage * TEAM_PER_PAGE),
    [employees, teamPage]
  );

  // Donut chart calculations (circumference = 2 * PI * r)
  const radius = 46;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  const completedRatio = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const inProgressRatio = totalTasks > 0 ? inProgressTasks / totalTasks : 0;
  const pendingRatio = totalTasks > 0 ? pendingTasks / totalTasks : 0;

  const completedStroke = completedRatio * circumference;
  const inProgressStroke = inProgressRatio * circumference;
  const pendingStroke = pendingRatio * circumference;

  const inProgressOffset = -completedStroke;
  const pendingOffset = -(completedStroke + inProgressStroke);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.headerBg}
      />

      {/* Top Header Navbar */}
      <AppHeader
        title="ETM"
        subtitle="Workspace"
        navigation={navigation}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefreshAll} tintColor={colors.accent} />
        }
      >
        {/* ── 1. WELCOME HEADER BANNER (Exact Web Parity) ── */}
        <View style={[styles.bannerCard, isDark ? styles.bannerCardDark : styles.bannerCardLight]}>
          <Text style={styles.bannerTitle}>
            {(user as any)?.isNewUser ? `Welcome, ${user?.name || 'Employee'}` : `Welcome Back, ${user?.name || 'Employee'}`}
          </Text>
        </View>

        {/* ── TASK COMPLETION RATE PROGRESS (Exact Image 2 Parity) ── */}
        <View style={[styles.completionCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <View style={styles.completionHeader}>
            <Text style={[styles.completionTitle, { color: colors.textPrimary }]}>Task Completion Rate</Text>
            <Text style={[styles.completionPercent, { color: isDark ? '#818cf8' : '#4f46e5' }]}>{completionRate}%</Text>
          </View>
          <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
            <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, completionRate))}%`, backgroundColor: isDark ? '#818cf8' : '#4f46e5' }]} />
          </View>
        </View>

        {/* ── 2. TOP METRICS 2x2 GRID (Total, Pending, In Progress, Completed) ── */}
        <View style={styles.metricsContainer}>
          {/* Row 1: Total Tasks & Pending */}
          <View style={styles.metricsRow}>
            {/* Total Tasks (Blue) */}
            <TouchableOpacity
              style={[
                styles.metricCard,
                { backgroundColor: colors.cardBg, borderColor: isDark ? '#3b82f670' : '#bfdbfe' },
              ]}
              onPress={() => {
                setStatusFilter('all');
                navigation.navigate('TasksTab');
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: isDark ? '#1e3a8a40' : '#dbeafe' }]}>
                <ListTodo color={isDark ? '#60a5fa' : '#2563eb'} size={22} />
              </View>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{totalTasks}</Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Tasks</Text>
            </TouchableOpacity>

            {/* Pending Tasks (Amber) */}
            <TouchableOpacity
              style={[
                styles.metricCard,
                { backgroundColor: colors.cardBg, borderColor: isDark ? '#f59e0b70' : '#fde68a' },
              ]}
              onPress={() => {
                setStatusFilter('pending');
                navigation.navigate('TasksTab');
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: isDark ? '#78350f40' : '#fef3c7' }]}>
                <CircleDashed color={isDark ? '#fbbf24' : '#d97706'} size={22} />
              </View>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{pendingTasks}</Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Pending</Text>
            </TouchableOpacity>
          </View>

          {/* Row 2: In Progress & Completed */}
          <View style={styles.metricsRow}>
            {/* In Progress (Indigo) */}
            <TouchableOpacity
              style={[
                styles.metricCard,
                { backgroundColor: colors.cardBg, borderColor: isDark ? '#6366f170' : '#c7d2fe' },
              ]}
              onPress={() => {
                setStatusFilter('in_progress');
                navigation.navigate('TasksTab');
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: isDark ? '#312e8140' : '#e0e7ff' }]}>
                <Clock3 color={isDark ? '#818cf8' : '#4f46e5'} size={22} />
              </View>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{inProgressTasks}</Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>In Progress</Text>
            </TouchableOpacity>

            {/* Completed (Green) */}
            <TouchableOpacity
              style={[
                styles.metricCard,
                { backgroundColor: colors.cardBg, borderColor: isDark ? '#10b98170' : '#a7f3d0' },
              ]}
              onPress={() => {
                setStatusFilter('completed');
                navigation.navigate('TasksTab');
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: isDark ? '#064e3b40' : '#d1fae5' }]}>
                <CheckCircle2 color={isDark ? '#34d399' : '#059669'} size={22} />
              </View>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{completedTasks}</Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Completed</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── NATIVE SVG CHARTS & VISUAL ANALYTICS ── */}
        <DashboardChartsSection
          tasks={tasks}
          metrics={metrics}
          onFilterStatus={(st) => {
            setStatusFilter(st);
            navigation.navigate('TasksTab');
          }}
        />

        {/* ── PRIORITY PRODUCTIVITY DISTRIBUTION (Exact Image 2 Parity) ── */}

        <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <Text style={[styles.sectionMainTitle, { color: colors.textPrimary, marginBottom: 14 }]}>
            Priority Productivity Distribution
          </Text>

          {/* Urgent Priority */}
          <View style={styles.priorityRow}>
            <View style={styles.priorityLabelRow}>
              <Text style={[styles.priorityName, { color: '#ef4444' }]}>Urgent Priority ({urgentCount})</Text>
              <Text style={[styles.priorityPercent, { color: colors.textSecondary }]}>{urgentPct}%</Text>
            </View>
            <View style={[styles.priorityBarTrack, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
              <View style={[styles.priorityBarFill, { width: `${urgentPct}%`, backgroundColor: '#ef4444' }]} />
            </View>
          </View>

          {/* High Priority */}
          <View style={styles.priorityRow}>
            <View style={styles.priorityLabelRow}>
              <Text style={[styles.priorityName, { color: '#f59e0b' }]}>High Priority ({highCount})</Text>
              <Text style={[styles.priorityPercent, { color: colors.textSecondary }]}>{highPct}%</Text>
            </View>
            <View style={[styles.priorityBarTrack, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
              <View style={[styles.priorityBarFill, { width: `${highPct}%`, backgroundColor: '#f59e0b' }]} />
            </View>
          </View>

          {/* Medium Priority */}
          <View style={styles.priorityRow}>
            <View style={styles.priorityLabelRow}>
              <Text style={[styles.priorityName, { color: '#3b82f6' }]}>Medium Priority ({mediumCount})</Text>
              <Text style={[styles.priorityPercent, { color: colors.textSecondary }]}>{mediumPct}%</Text>
            </View>
            <View style={[styles.priorityBarTrack, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
              <View style={[styles.priorityBarFill, { width: `${mediumPct}%`, backgroundColor: '#3b82f6' }]} />
            </View>
          </View>

          {/* Low Priority */}
          <View style={[styles.priorityRow, { marginBottom: 0 }]}>
            <View style={styles.priorityLabelRow}>
              <Text style={[styles.priorityName, { color: '#10b981' }]}>Low Priority ({lowCount})</Text>
              <Text style={[styles.priorityPercent, { color: colors.textSecondary }]}>{lowPct}%</Text>
            </View>
            <View style={[styles.priorityBarTrack, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
              <View style={[styles.priorityBarFill, { width: `${lowPct}%`, backgroundColor: '#10b981' }]} />
            </View>
          </View>
        </View>

        {/* ── 3. ANALYTICS OVERVIEW SECTION (Charts & KPIs) ── */}
        <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <BarChart3 color={colors.accent} size={20} />
              <Text style={[styles.sectionMainTitle, { color: colors.textPrimary }]}>Analytics Overview</Text>
            </View>
          </View>

          {/* A. Task Distribution Donut Chart Card */}
          <View style={[styles.subCard, { backgroundColor: isDark ? '#0f172a80' : '#f8fafc', borderColor: colors.borderColor }]}>
            <Text style={[styles.subCardTitle, { color: colors.textPrimary }]}>Task Distribution</Text>
            <Text style={[styles.subCardSub, { color: colors.textSecondary }]}>Breakdown of tasks by active status.</Text>

            <View style={styles.donutContainer}>
              <View style={styles.donutSvgWrapper}>
                <Svg width={130} height={130} viewBox="0 0 130 130">
                  <G rotation="-90" origin="65, 65">
                    {/* Background Track */}
                    <Circle
                      cx="65"
                      cy="65"
                      r={radius}
                      stroke={isDark ? '#334155' : '#e2e8f0'}
                      strokeWidth={strokeWidth}
                      fill="none"
                    />
                    {/* Completed Ring (Green) */}
                    {completedStroke > 0 && (
                      <Circle
                        cx="65"
                        cy="65"
                        r={radius}
                        stroke="#10b981"
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${completedStroke} ${circumference}`}
                        strokeDashoffset={0}
                        fill="none"
                      />
                    )}
                    {/* In Progress Ring (Blue/Indigo) */}
                    {inProgressStroke > 0 && (
                      <Circle
                        cx="65"
                        cy="65"
                        r={radius}
                        stroke="#6366f1"
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${inProgressStroke} ${circumference}`}
                        strokeDashoffset={inProgressOffset}
                        fill="none"
                      />
                    )}
                    {/* Pending Ring (Amber/Yellow) */}
                    {pendingStroke > 0 && (
                      <Circle
                        cx="65"
                        cy="65"
                        r={radius}
                        stroke="#f59e0b"
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${pendingStroke} ${circumference}`}
                        strokeDashoffset={pendingOffset}
                        fill="none"
                      />
                    )}
                  </G>
                </Svg>
                <View style={styles.donutCenterLabel}>
                  <Text style={[styles.donutCenterVal, { color: colors.textPrimary }]}>{totalTasks}</Text>
                  <Text style={[styles.donutCenterSub, { color: colors.textSecondary }]}>Tasks</Text>
                </View>
              </View>

              {/* Legend & Percentages */}
              <View style={styles.donutLegend}>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                  <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Completed</Text>
                  <Text style={[styles.legendVal, { color: colors.textPrimary }]}>
                    {completedTasks} ({totalTasks > 0 ? Math.round(completedRatio * 100) : 0}%)
                  </Text>
                </View>

                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#6366f1' }]} />
                  <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>In Progress</Text>
                  <Text style={[styles.legendVal, { color: colors.textPrimary }]}>
                    {inProgressTasks} ({totalTasks > 0 ? Math.round(inProgressRatio * 100) : 0}%)
                  </Text>
                </View>

                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                  <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Pending</Text>
                  <Text style={[styles.legendVal, { color: colors.textPrimary }]}>
                    {pendingTasks} ({totalTasks > 0 ? Math.round(pendingRatio * 100) : 0}%)
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* B. Key Performance Indicators (KPICards) */}
          <View style={[styles.subCard, { backgroundColor: isDark ? '#0f172a80' : '#f8fafc', borderColor: colors.borderColor, marginTop: 14 }]}>
            <Text style={[styles.subCardTitle, { color: colors.textPrimary }]}>Key Performance Indicators</Text>
            <Text style={[styles.subCardSub, { color: colors.textSecondary }]}>Real-time snapshot of team productivity metrics.</Text>

            <View style={styles.kpiGrid}>
              {/* Completion Rate */}
              <View
                style={[
                  styles.kpiTile,
                  {
                    backgroundColor: completionRate >= 60 ? '#10b98115' : '#f59e0b15',
                    borderColor: completionRate >= 60 ? '#10b98140' : '#f59e0b40',
                  },
                ]}
              >
                <View style={styles.kpiHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Target color={completionRate >= 60 ? '#10b981' : '#f59e0b'} size={14} />
                    <Text style={[styles.kpiLabel, { color: completionRate >= 60 ? '#10b981' : '#f59e0b' }]}>Completion Rate</Text>
                  </View>
                  {completionRate >= 50 ? (
                    <TrendingUp color="#10b981" size={14} />
                  ) : (
                    <TrendingDown color="#ef4444" size={14} />
                  )}
                </View>
                <Text style={[styles.kpiValue, { color: completionRate >= 60 ? '#10b981' : '#f59e0b' }]}>{completionRate}%</Text>
                <Text style={[styles.kpiSub, { color: colors.textSecondary }]}>{completedTasks} of {totalTasks} tasks done</Text>
              </View>

              {/* Active Work Rate */}
              <View
                style={[
                  styles.kpiTile,
                  {
                    backgroundColor: '#6366f115',
                    borderColor: '#6366f140',
                  },
                ]}
              >
                <View style={styles.kpiHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Zap color="#6366f1" size={14} />
                    <Text style={[styles.kpiLabel, { color: '#818cf8' }]}>Active Work Rate</Text>
                  </View>
                  <TrendingUp color="#6366f1" size={14} />
                </View>
                <Text style={[styles.kpiValue, { color: '#818cf8' }]}>{activeRate}%</Text>
                <Text style={[styles.kpiSub, { color: colors.textSecondary }]}>{inProgressTasks} tasks in progress</Text>
              </View>

              {/* High Priority Open */}
              <View
                style={[
                  styles.kpiTile,
                  {
                    backgroundColor: highPriorityPending === 0 ? '#10b98115' : '#f9731615',
                    borderColor: highPriorityPending === 0 ? '#10b98140' : '#f9731640',
                  },
                ]}
              >
                <View style={styles.kpiHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <AlertCircle color={highPriorityPending === 0 ? '#10b981' : '#f97316'} size={14} />
                    <Text style={[styles.kpiLabel, { color: highPriorityPending === 0 ? '#10b981' : '#f97316' }]}>High Priority Open</Text>
                  </View>
                  {highPriorityPending === 0 ? (
                    <TrendingUp color="#10b981" size={14} />
                  ) : (
                    <TrendingDown color="#f97316" size={14} />
                  )}
                </View>
                <Text style={[styles.kpiValue, { color: highPriorityPending === 0 ? '#10b981' : '#f97316' }]}>{highPriorityPending}</Text>
                <Text style={[styles.kpiSub, { color: colors.textSecondary }]}>
                  {highPriorityPending === 0 ? 'No urgent tasks pending' : `${highPriorityPending} need attention`}
                </Text>
              </View>

              {/* Overdue / On Track Status */}
              <View
                style={[
                  styles.kpiTile,
                  {
                    backgroundColor: overdueTasks === 0 ? '#10b98115' : '#ef444415',
                    borderColor: overdueTasks === 0 ? '#10b98140' : '#ef444440',
                  },
                ]}
              >
                <View style={styles.kpiHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock3 color={overdueTasks === 0 ? '#10b981' : '#ef4444'} size={14} />
                    <Text style={[styles.kpiLabel, { color: overdueTasks === 0 ? '#10b981' : '#ef4444' }]}>Overdue Tasks</Text>
                  </View>
                </View>
                <Text style={[styles.kpiValue, { color: overdueTasks === 0 ? '#10b981' : '#ef4444' }]}>{overdueTasks}</Text>
                <Text style={[styles.kpiSub, { color: colors.textSecondary }]}>
                  {overdueTasks === 0 ? 'All deadlines on schedule' : `${overdueTasks} past deadline`}
                </Text>
              </View>
            </View>
          </View>

          {/* C. Team Workload Breakdown */}
          <View style={[styles.subCard, { backgroundColor: isDark ? '#0f172a80' : '#f8fafc', borderColor: colors.borderColor, marginTop: 14 }]}>
            <Text style={[styles.subCardTitle, { color: colors.textPrimary }]}>Team Workload Breakdown</Text>
            <Text style={[styles.subCardSub, { color: colors.textSecondary }]}>Number of tasks per employee by status.</Text>

            <View style={{ marginTop: 12, gap: 10 }}>
              {(employees || []).slice(0, 4).map((emp) => {
                const empTasks = tasks.filter((t) => t.assignedTo === emp.id || (t as any).assignedTo?.id === emp.id);
                const empCompleted = empTasks.filter((t) => t.status === 'completed').length;
                const empInProg = empTasks.filter((t) => t.status === 'in_progress').length;
                const empPending = empTasks.filter((t) => t.status === 'todo' || (t.status as any) === 'pending').length;
                const empTotal = empTasks.length || 1;

                return (
                  <View key={emp.id} style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>{emp.name}</Text>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>{empTasks.length} tasks</Text>
                    </View>

                    {/* Stacked Bar */}
                    <View style={[styles.stackedBarTrack, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                      {empCompleted > 0 && (
                        <View style={{ height: '100%', backgroundColor: '#10b981', width: `${(empCompleted / empTotal) * 100}%` }} />
                      )}
                      {empInProg > 0 && (
                        <View style={{ height: '100%', backgroundColor: '#6366f1', width: `${(empInProg / empTotal) * 100}%` }} />
                      )}
                      {empPending > 0 && (
                        <View style={{ height: '100%', backgroundColor: '#f59e0b', width: `${(empPending / empTotal) * 100}%` }} />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── 4. MIDDLE SECTION: Recent Tasks & Communication Quick Access ── */}
        {/* Recent Tasks Card */}
        <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ClipboardList color={colors.accent} size={20} />
              <Text style={[styles.sectionMainTitle, { color: colors.textPrimary }]}>Recent Tasks</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('TasksTab')}>
              <Text style={[styles.linkText, { color: isDark ? '#818cf8' : '#4f46e5' }]}>View All Tasks &rarr;</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 12, gap: 10 }}>
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <View
                  key={task.id}
                  style={[
                    styles.recentTaskItem,
                    { backgroundColor: isDark ? '#0f172a80' : '#f8fafc', borderColor: colors.borderColor },
                  ]}
                >
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.taskItemTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                      {task.title}
                    </Text>
                    <Text style={[styles.taskItemDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                      {task.description || 'No description provided.'}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={styles.dueRow}>
                      <TimerReset color={colors.textSecondary} size={12} style={{ marginRight: 4 }} />
                      <Text style={[styles.dueText, { color: colors.textSecondary }]}>
                        {task.dueDate ? `Due ${task.dueDate}` : 'No deadline'}
                      </Text>
                    </View>
                    <View style={[styles.priorityTagSmall, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                      <Text style={[styles.priorityTagText, { color: getPriorityColor(task.priority) }]}>
                        {task.priority.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center', paddingVertical: 14 }}>
                No tasks found. Create tasks to see them tracked in real time.
              </Text>
            )}
          </View>
        </View>

        {/* Communication Quick Access Card */}
        <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MessageSquare color={colors.accent} size={20} />
              <Text style={[styles.sectionMainTitle, { color: colors.textPrimary }]}>Communication</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('CommTab')}>
              <Text style={[styles.linkText, { color: isDark ? '#818cf8' : '#4f46e5' }]}>Open Hub &rarr;</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Tiles: Inbox & Announcements */}
          <View style={styles.commTileGrid}>
            <TouchableOpacity
              style={[
                styles.commTile,
                { backgroundColor: isDark ? '#1e3a8a25' : '#eff6ff', borderColor: isDark ? '#1e40af50' : '#bfdbfe' },
              ]}
              onPress={() => navigation.navigate('CommTab')}
              activeOpacity={0.8}
            >
              <View style={[styles.commTileIcon, { backgroundColor: isDark ? '#1e40af40' : '#dbeafe' }]}>
                <Inbox color={isDark ? '#60a5fa' : '#2563eb'} size={18} />
              </View>
              <View>
                <Text style={[styles.commTileTitle, { color: colors.textPrimary }]}>Inbox</Text>
                <Text style={[styles.commTileSub, { color: colors.textSecondary }]}>{unreadMessageCount} unread</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.commTile,
                { backgroundColor: isDark ? '#451a0325' : '#fffbeb', borderColor: isDark ? '#78350f50' : '#fde68a' },
              ]}
              onPress={() => navigation.navigate('Announcements')}
              activeOpacity={0.8}
            >
              <View style={[styles.commTileIcon, { backgroundColor: isDark ? '#78350f40' : '#fef3c7' }]}>
                <Megaphone color={isDark ? '#fbbf24' : '#d97706'} size={18} />
              </View>
              <View>
                <Text style={[styles.commTileTitle, { color: colors.textPrimary }]}>Announcements</Text>
                <Text style={[styles.commTileSub, { color: colors.textSecondary }]}>{announcements.length} active</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Conversations Preview List */}
          {conversations.length > 0 && (
            <View style={{ marginTop: 12, gap: 8 }}>
              {conversations.slice(0, 3).map((conv) => (
                <TouchableOpacity
                  key={conv.id}
                  style={[
                    styles.convRow,
                    { backgroundColor: isDark ? '#0f172a60' : '#f8fafc', borderColor: colors.borderColor },
                  ]}
                  onPress={() => navigation.navigate('ChatDetail', { conversationId: conv.id, title: conv.groupName || conv.participantNames[0] })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.convDot, { backgroundColor: (conv.unreadCount || 0) > 0 ? '#3b82f6' : colors.borderColor }]} />
                  <Text style={[styles.convSubject, { color: colors.textPrimary }]} numberOfLines={1}>
                    {conv.groupName || conv.lastMessage || 'Team Chat'}
                  </Text>
                  <Text style={[styles.convSender, { color: colors.textSecondary }]} numberOfLines={1}>
                    {conv.participantNames[0] || 'Team'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── 5. BOTTOM SECTION: Recent Activity (Left) & Team Members (Right) ── */}
        {/* Recent Activity Card */}
        <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Activity color={colors.accent} size={18} />
                <Text style={[styles.sectionMainTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
              </View>
              <Text style={[styles.subCardSub, { color: colors.textSecondary, marginTop: 2 }]}>
                Latest team actions across tasks.
              </Text>
            </View>
            <View style={[styles.latestBadge, { backgroundColor: isDark ? '#064e3b30' : '#d1fae5', borderColor: '#10b98150' }]}>
              <Text style={[styles.latestBadgeText, { color: isDark ? '#34d399' : '#059669' }]}>Latest 10</Text>
            </View>
          </View>

          {/* Timeline */}
          <View style={{ marginTop: 14, paddingLeft: 8, position: 'relative' }}>
            <View style={[styles.timelineLine, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]} />
            <View style={{ gap: 14 }}>
              {activities.slice(0, 6).map((act) => (
                <View key={act.id} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <Text style={[styles.timelineText, { color: colors.textSecondary }]}>
                    <Text style={{ fontWeight: '800', color: colors.textPrimary }}>{act.employeeName}</Text>{' '}
                    {act.actionText}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Team Members Card (With Pagination & View All) */}
        <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.borderColor }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Users color={colors.accent} size={20} />
              <Text style={[styles.sectionMainTitle, { color: colors.textPrimary }]}>Team Members</Text>
            </View>
            <Text style={[styles.pageCounter, { color: colors.textSecondary }]}>
              Page {teamPage} of {totalTeamPages}
            </Text>
          </View>

          <View style={{ marginTop: 12, gap: 10 }}>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((emp) => (
                <View
                  key={emp.id}
                  style={[
                    styles.teamMemberItem,
                    { backgroundColor: isDark ? '#0f172a80' : '#f8fafc', borderColor: colors.borderColor },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    {emp.avatarUrl || (emp as any).profilePicture ? (
                      <Image source={{ uri: emp.avatarUrl || (emp as any).profilePicture }} style={styles.empAvatar} />
                    ) : (
                      <View style={[styles.empAvatarFallback, { backgroundColor: isDark ? '#0f766e' : '#0d9488' }]}>
                        <Text style={styles.empAvatarText}>
                          {emp.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)
                            .toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.empName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {emp.name}
                      </Text>
                      <Text style={[styles.empRole, { color: colors.textSecondary }]} numberOfLines={1}>
                        {emp.designation || 'Specialist'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.activeBadge, { backgroundColor: isDark ? '#064e3b30' : '#d1fae5', borderColor: '#10b98150' }]}>
                    <Text style={[styles.activeBadgeText, { color: isDark ? '#34d399' : '#059669' }]}>Active</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center', paddingVertical: 14 }}>
                No members found.
              </Text>
            )}
          </View>

          {/* Pagination & Prominent View All Button */}
          <View style={[styles.teamFooter, { borderTopColor: isDark ? '#334155' : '#e2e8f0' }]}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={[
                  styles.pageBtn,
                  { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderColor: colors.borderColor },
                  teamPage === 1 && { opacity: 0.4 },
                ]}
                disabled={teamPage === 1}
                onPress={() => setTeamPage((prev) => Math.max(1, prev - 1))}
              >
                <Text style={[styles.pageBtnText, { color: colors.textPrimary }]}>&larr; Prev</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.pageBtn,
                  { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderColor: colors.borderColor },
                  teamPage >= totalTeamPages && { opacity: 0.4 },
                ]}
                disabled={teamPage >= totalTeamPages}
                onPress={() => setTeamPage((prev) => Math.min(totalTeamPages, prev + 1))}
              >
                <Text style={[styles.pageBtnText, { color: colors.textPrimary }]}>Next &rarr;</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.viewAllMembersBtn,
                { backgroundColor: isDark ? '#0f766e25' : '#ccfbf1', borderColor: isDark ? '#14b8a6' : '#0d9488' },
              ]}
              onPress={() => navigation.navigate('TeamTab')}
              activeOpacity={0.8}
            >
              <Text style={[styles.viewAllMembersText, { color: isDark ? '#2dd4bf' : '#0f766e' }]}>
                View All &rarr;
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Notification Drawer Modal */}
      <NotificationModal visible={notifModalVisible} onClose={() => setNotifModalVisible(false)} />

      {/* Sidebar Navigation Drawer */}
      <SidebarDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} navigation={navigation} />
    </SafeAreaView>
  );
};

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return '#ef4444';
    case 'high':
      return '#f97316';
    case 'medium':
      return '#3b82f6';
    default:
      return '#10b981';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuBtn: {
    padding: 6,
    marginRight: 10,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  appSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ef4444',
  },
  profileAvatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  avatarInitialBubble: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0d9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  bannerCard: {
    borderRadius: 22,
    padding: 18,
  },
  bannerCardDark: {
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#3730a3',
  },
  bannerCardLight: {
    backgroundColor: '#4338ca',
    borderWidth: 1,
    borderColor: '#3730a3',
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  bannerTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  completionCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  completionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  completionPercent: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricsContainer: {
    gap: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  priorityRow: {
    marginBottom: 12,
  },
  priorityLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priorityName: {
    fontSize: 13,
    fontWeight: '700',
  },
  priorityPercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  priorityBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionMainTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  subCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  subCardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  subCardSub: {
    fontSize: 11,
    marginTop: 2,
  },
  donutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    justifyContent: 'space-around',
  },
  donutSvgWrapper: {
    position: 'relative',
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  donutCenterSub: {
    fontSize: 10,
    fontWeight: '600',
  },
  donutLegend: {
    gap: 8,
    flex: 1,
    paddingLeft: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  legendVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  kpiTile: {
    width: '48.5%',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  stackedBarTrack: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  linkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  recentTaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  taskItemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  taskItemDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueText: {
    fontSize: 10,
    fontWeight: '600',
  },
  priorityTagSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  commTileGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  commTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  commTileIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commTileTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  commTileSub: {
    fontSize: 10,
    marginTop: 2,
  },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  convDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  convSubject: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  convSender: {
    fontSize: 10,
  },
  latestBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  latestBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 6,
    bottom: 6,
    width: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginTop: 4,
  },
  timelineText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  pageCounter: {
    fontSize: 11,
    fontWeight: '600',
  },
  teamMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  empAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  empAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empAvatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  empName: {
    fontSize: 12,
    fontWeight: '700',
  },
  empRole: {
    fontSize: 10,
    marginTop: 1,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  teamFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 10,
    borderTopWidth: 1,
  },
  pageBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  pageBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  viewAllMembersBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewAllMembersText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
