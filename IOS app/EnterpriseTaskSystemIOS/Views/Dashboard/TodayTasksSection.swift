import SwiftUI

/// Today's Tasks Section on Dashboard matching Mockup #2.
public struct TodayTasksSection: View {
    let tasks: [TaskItem]
    let onViewAll: () -> Void
    let onSelectTask: (TaskItem) -> Void
    
    public var body: some View {
        VStack(spacing: AppSpacing.sm) {
            SectionHeader("Today's Tasks", actionTitle: "View All", action: onViewAll)
            
            if tasks.isEmpty {
                AppCard(padding: AppSpacing.lg) {
                    HStack {
                        Image(systemName: "checkmark.circle")
                            .foregroundColor(AppColors.success)
                            .font(.system(size: 24))
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("All caught up!")
                                .font(AppTypography.headline)
                                .foregroundColor(AppColors.textPrimary)
                            Text("No pending tasks due today.")
                                .font(AppTypography.subheadline)
                                .foregroundColor(AppColors.textSecondary)
                        }
                        Spacer()
                    }
                }
            } else {
                VStack(spacing: AppSpacing.sm) {
                    ForEach(tasks) { task in
                        Button(action: {
                            onSelectTask(task)
                        }) {
                            AppCard(padding: AppSpacing.md) {
                                HStack(spacing: AppSpacing.md) {
                                    // Status circle icon
                                    Circle()
                                        .fill(task.priority == .high ? AppColors.danger.opacity(0.15) : AppColors.accentSky.opacity(0.15))
                                        .frame(width: 36, height: 36)
                                        .overlay(
                                            Image(systemName: task.status == .completed ? "checkmark" : "doc.text.fill")
                                                .font(.system(size: 14, weight: .semibold))
                                                .foregroundColor(task.priority == .high ? AppColors.danger : AppColors.primary)
                                        )
                                    
                                    VStack(alignment: .leading, spacing: 3) {
                                        Text(task.title)
                                            .font(AppTypography.headline)
                                            .foregroundColor(AppColors.textPrimary)
                                            .lineLimit(1)
                                        
                                        HStack(spacing: AppSpacing.xs) {
                                            Text(task.priority.displayName)
                                                .font(AppTypography.caption)
                                                .foregroundColor(task.priority == .high ? AppColors.danger : AppColors.textSecondary)
                                            
                                            Text("•")
                                                .foregroundColor(AppColors.textTertiary)
                                            
                                            Text("Due Today")
                                                .font(AppTypography.caption)
                                                .foregroundColor(AppColors.textSecondary)
                                        }
                                    }
                                    
                                    Spacer()
                                    
                                    Image(systemName: AppIcons.chevronRight)
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundColor(AppColors.textTertiary)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
