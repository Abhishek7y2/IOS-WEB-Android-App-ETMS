import SwiftUI

public struct AttendanceQuickCard: View {
    @ObservedObject var viewModel: DashboardViewModel
    
    public var body: some View {
        let total = max(1, viewModel.totalTasksCount) // prevent div by 0
        let completed = viewModel.completedTasksCount
        let progress = CGFloat(completed) / CGFloat(total)
        
        AppCard(padding: AppSpacing.lg) {
            VStack(spacing: AppSpacing.md) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Weekly Productivity")
                            .font(AppTypography.headline)
                            .foregroundColor(AppColors.textPrimary)
                        
                        Text("You've completed \(completed) out of \(viewModel.totalTasksCount) tasks")
                            .font(AppTypography.subheadline)
                            .foregroundColor(AppColors.textSecondary)
                    }
                    
                    Spacer()
                    
                    // Donut Chart
                    ExplodedDonutChart(segments: [
                        DonutSegmentData(value: Double(viewModel.completedTasksCount), color: .red, isExploded: false),
                        DonutSegmentData(value: Double(viewModel.inProgressTasksCount), color: .orange, isExploded: false),
                        DonutSegmentData(value: Double(viewModel.pendingTasksCount), color: .green, isExploded: false)
                    ])
                    .frame(width: 80, height: 80)
                }
            }
        }
    }
}


