import SwiftUI

/// Modern enterprise task card matching Reference Mockup #3.
public struct TaskCardView: View {
    let task: TaskItem
    let onStatusChange: (TaskStatus) -> Void
    let onDelete: () -> Void
    
    public var body: some View {
        AppCard(padding: AppSpacing.md, cornerRadius: AppRadius.lg) {
            VStack(alignment: .leading, spacing: AppSpacing.sm) {
                // Header: Title & More Menu
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 3) {
                        Text(task.title)
                            .font(AppTypography.headline)
                            .foregroundColor(AppColors.textPrimary)
                            .lineLimit(1)
                        
                        Text(task.description)
                            .font(AppTypography.subheadline)
                            .foregroundColor(AppColors.textSecondary)
                            .lineLimit(2)
                    }
                    
                    Spacer()
                    
                    Menu {
                        Section("Change Status") {
                            Button("Pending") { onStatusChange(.todo) }
                            Button("In Progress") { onStatusChange(.inProgress) }
                            Button("Completed") { onStatusChange(.completed) }
                        }
                        if AuthManager.shared.currentUser?.isAdmin == true {
                            Section {
                            Button(role: .destructive, action: onDelete) {
                                Label("Delete Task", systemImage: "trash")
                            }
                        }
                        }
                    } label: {
                        Image(systemName: AppIcons.moreDots)
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(AppColors.textTertiary)
                            .padding(4)
                    }
                }
                
                // Badges: Priority + Due Date
                HStack(spacing: AppSpacing.xs) {
                    PriorityBadge(priority: task.priority)
                    
                    HStack(spacing: 3) {
                        Circle()
                            .fill(AppColors.danger)
                            .frame(width: 5, height: 5)
                        Text(task.status == .completed ? "Done" : "Due Today")
                            .font(AppTypography.captionBold)
                            .foregroundColor(AppColors.danger)
                    }
                    .padding(.horizontal, AppSpacing.sm)
                    .padding(.vertical, 4)
                    .background(
                        Capsule()
                            .fill(AppColors.dangerSoft)
                    )
                    
                    Spacer()
                    
                    // Assignee Avatar
                    ZStack {
                        Circle()
                            .fill(AppColors.accentSky.opacity(0.2))
                            .frame(width: 26, height: 26)
                        
                        Text(task.assignedTo?.name?.prefix(2).uppercased() ?? "EM")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(AppColors.primary)
                    }
                }
                .padding(.top, 2)
                
                // Progress Bar & Percentage
                if task.status != .completed {
                    HStack(spacing: AppSpacing.sm) {
                        ProgressBar(
                            progress: task.progressPercent,
                            height: 5,
                            barColor: task.priority == .high ? AppColors.primary : AppColors.accentSky
                        )
                        
                        Text("\(Int(task.progressPercent * 100))%")
                            .font(AppTypography.captionBold)
                            .foregroundColor(AppColors.textSecondary)
                    }
                    .padding(.top, 4)
                }
            }
        }
    }
}
