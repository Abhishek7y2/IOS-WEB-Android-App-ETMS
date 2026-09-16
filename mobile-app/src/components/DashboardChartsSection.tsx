import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CircularProgressRing } from './CircularProgressRing';
import { Task } from '../types/task';
import {
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Clock,
  CircleDashed,
  AlertTriangle,
  Zap,
} from './Icon';

interface DashboardChartsSectionProps {
  tasks: Task[];
  metrics: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    overdue: number;
  };
  onFilterStatus?: (status: string) => void;
}

export const DashboardChartsSection: React.FC<DashboardChartsSectionProps> = ({
  tasks = [],
  metrics,
  onFilterStatus,
}) => {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';

  const totalTasks = metrics.total || tasks.length || 1;
  const completionRate = Math.round((metrics.completed / totalTasks) * 100) || 0;

  // Calculate priority breakdown from task list
  const priorityCounts = tasks.reduce(
    (acc, t) => {
      const p = t.priority?.toLowerCase() || 'medium';
      if (p === 'low') acc.low++;
      else if (p === 'high') acc.high++;
      else if (p === 'urgent' || p === 'critical') acc.urgent++;
      else acc.medium++;
      return acc;
    },
    { low: 0, medium: 0, high: 0, urgent: 0 }
  );

  const maxPriorityCount = Math.max(
    1,
    priorityCounts.low,
    priorityCounts.medium,
    priorityCounts.high,
    priorityCounts.urgent
  );

  return (
    <View style={styles.container}>
      {/* ── CARD 1: OVERALL PRODUCTIVITY & RING CHART ── */}
      <View
        style={[
          styles.chartCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.borderColor,
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderTitleBox}>
            <View style={[styles.headerIconBox, { backgroundColor: isDark ? '#0d948830' : '#ccfbf1' }]}>
              <TrendingUp color={isDark ? '#2dd4bf' : '#0d9488'} size={18} />
            </View>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Task Completion Rate</Text>
              <Text style={[styles.cardSubTitle, { color: colors.textSecondary }]}>
                Real-time workspace productivity
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.rateBadge,
              {
                backgroundColor: completionRate >= 60 ? (isDark ? '#064e3b40' : '#ecfdf5') : (isDark ? '#451a1a40' : '#fef2f2'),
                borderColor: completionRate >= 60 ? '#10b981' : '#f87171',
              },
            ]}
          >
            <Text
              style={[
                styles.rateBadgeText,
                { color: completionRate >= 60 ? '#10b981' : '#ef4444' },
              ]}
            >
              {completionRate >= 60 ? '⚡ High Yield' : '⚠️ Action Needed'}
            </Text>
          </View>
        </View>

        <View style={styles.ringBodyRow}>
          {/* Circular SVG Ring */}
          <CircularProgressRing
            size={110}
            strokeWidth={11}
            progress={completionRate}
            color={isDark ? '#2dd4bf' : '#0d9488'}
            backgroundColor={isDark ? '#1e293b' : '#e2e8f0'}
            subtitle="Done"
            textColor={colors.textPrimary}
          />

          {/* Metrics Column */}
          <View style={styles.metricsCol}>
            <TouchableOpacity
              style={[styles.metricRowItem, { backgroundColor: isDark ? '#0f172a60' : '#f8fafc', borderColor: colors.borderColor }]}
              onPress={() => onFilterStatus?.('completed')}
            >
              <View style={styles.metricItemLeft}>
                <CheckCircle2 color="#10b981" size={14} style={{ marginRight: 6 }} />
                <Text style={[styles.metricItemLabel, { color: colors.textSecondary }]}>Completed</Text>
              </View>
              <Text style={[styles.metricItemVal, { color: colors.textPrimary }]}>{metrics.completed}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.metricRowItem, { backgroundColor: isDark ? '#0f172a60' : '#f8fafc', borderColor: colors.borderColor }]}
              onPress={() => onFilterStatus?.('in_progress')}
            >
              <View style={styles.metricItemLeft}>
                <Clock color="#6366f1" size={14} style={{ marginRight: 6 }} />
                <Text style={[styles.metricItemLabel, { color: colors.textSecondary }]}>In Progress</Text>
              </View>
              <Text style={[styles.metricItemVal, { color: colors.textPrimary }]}>{metrics.inProgress}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.metricRowItem, { backgroundColor: isDark ? '#0f172a60' : '#f8fafc', borderColor: colors.borderColor }]}
              onPress={() => onFilterStatus?.('todo')}
            >
              <View style={styles.metricItemLeft}>
                <CircleDashed color="#f59e0b" size={14} style={{ marginRight: 6 }} />
                <Text style={[styles.metricItemLabel, { color: colors.textSecondary }]}>Pending</Text>
              </View>
              <Text style={[styles.metricItemVal, { color: colors.textPrimary }]}>{metrics.pending}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.metricRowItem, { backgroundColor: isDark ? '#0f172a60' : '#f8fafc', borderColor: colors.borderColor }]}
              onPress={() => onFilterStatus?.('overdue')}
            >
              <View style={styles.metricItemLeft}>
                <AlertTriangle color="#ef4444" size={14} style={{ marginRight: 6 }} />
                <Text style={[styles.metricItemLabel, { color: colors.textSecondary }]}>Overdue</Text>
              </View>
              <Text style={[styles.metricItemVal, { color: colors.textPrimary }]}>{metrics.overdue}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Proportional Segment Bar */}
        <View style={styles.segmentBarContainer}>
          <Text style={[styles.segmentLabel, { color: colors.textSecondary }]}>
            STATUS PROPORTION BREAKDOWN
          </Text>
          <View style={styles.segmentBarTrack}>
            {metrics.completed > 0 && (
              <View
                style={[
                  styles.segmentPiece,
                  { flex: metrics.completed, backgroundColor: '#10b981' },
                ]}
              />
            )}
            {metrics.inProgress > 0 && (
              <View
                style={[
                  styles.segmentPiece,
                  { flex: metrics.inProgress, backgroundColor: '#6366f1' },
                ]}
              />
            )}
            {metrics.pending > 0 && (
              <View
                style={[
                  styles.segmentPiece,
                  { flex: metrics.pending, backgroundColor: '#f59e0b' },
                ]}
              />
            )}
            {metrics.overdue > 0 && (
              <View
                style={[
                  styles.segmentPiece,
                  { flex: metrics.overdue, backgroundColor: '#ef4444' },
                ]}
              />
            )}
          </View>
        </View>
      </View>

      {/* ── CARD 2: PRIORITY DISTRIBUTION BAR CHART ── */}
      <View
        style={[
          styles.chartCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.borderColor,
            marginTop: 14,
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderTitleBox}>
            <View style={[styles.headerIconBox, { backgroundColor: isDark ? '#312e8130' : '#e0e7ff' }]}>
              <BarChart3 color={isDark ? '#818cf8' : '#4f46e5'} size={18} />
            </View>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Task Priority Breakdown</Text>
              <Text style={[styles.cardSubTitle, { color: colors.textSecondary }]}>
                Distribution across urgency levels
              </Text>
            </View>
          </View>
          <View style={[styles.headerBadge, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
            <Zap color={colors.textSecondary} size={12} style={{ marginRight: 4 }} />
            <Text style={[styles.headerBadgeText, { color: colors.textSecondary }]}>
              {tasks.length} Active Tasks
            </Text>
          </View>
        </View>

        {/* Priority Bar Chart Graph */}
        <View style={styles.barChartContainer}>
          {[
            { label: 'Low', count: priorityCounts.low, color: '#10b981', bg: isDark ? '#064e3b30' : '#ecfdf5' },
            { label: 'Medium', count: priorityCounts.medium, color: '#3b82f6', bg: isDark ? '#1e3a8a30' : '#eff6ff' },
            { label: 'High', count: priorityCounts.high, color: '#f59e0b', bg: isDark ? '#451a1a30' : '#fffbeb' },
            { label: 'Urgent', count: priorityCounts.urgent, color: '#ef4444', bg: isDark ? '#450a0a30' : '#fef2f2' },
          ].map((bar, idx) => {
            const heightPercent = Math.max(15, Math.round((bar.count / maxPriorityCount) * 100));
            return (
              <View key={idx} style={styles.barColumn}>
                <Text style={[styles.barCountVal, { color: colors.textPrimary }]}>{bar.count}</Text>
                <View style={[styles.barTrack, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${heightPercent}%`,
                        backgroundColor: bar.color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabelText, { color: colors.textSecondary }]}>{bar.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  chartCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardSubTitle: {
    fontSize: 11,
    marginTop: 1,
  },
  rateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  rateBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ringBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricsCol: {
    flex: 1,
    marginLeft: 16,
    gap: 6,
  },
  metricRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  metricItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricItemLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricItemVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  segmentBarContainer: {
    marginTop: 4,
  },
  segmentLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  segmentBarTrack: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
  },
  segmentPiece: {
    height: '100%',
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 140,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barCountVal: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  barTrack: {
    width: 22,
    height: 90,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barLabelText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
});
