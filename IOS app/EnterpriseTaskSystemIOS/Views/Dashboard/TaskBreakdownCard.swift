import SwiftUI

public struct TaskBreakdownCard: View {
    @ObservedObject var viewModel: DashboardViewModel
    
    public var body: some View {
        let total = max(1, viewModel.totalTasksCount)
        let completed = viewModel.completedTasksCount
        let pending = viewModel.pendingTasksCount
        let inProgress = viewModel.inProgressTasksCount
        
        let completedPct = String(format: "%.1f%%", Double(completed) / Double(total) * 100)
        let pendingPct = String(format: "%.1f%%", Double(pending) / Double(total) * 100)
        let inProgressPct = String(format: "%.1f%%", Double(inProgress) / Double(total) * 100)
        
        AppCard(padding: AppSpacing.lg) {
            VStack(alignment: .leading, spacing: AppSpacing.md) {
                HStack {
                    Text("TASK BREAKDOWN")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(AppColors.textPrimary)
                    
                    Spacer()
                    
                    Image(systemName: "line.3.horizontal")
                        .foregroundColor(AppColors.textTertiary)
                }
                
                HStack {
                    Spacer()
                    ExplodedDonutChart(segments: [
                        DonutSegmentData(value: Double(completed), color: .blue, isExploded: false),
                        DonutSegmentData(value: Double(inProgress), color: .orange, isExploded: false),
                        DonutSegmentData(value: Double(pending), color: .green, isExploded: true)
                    ])
                    .frame(width: 140, height: 140)
                    Spacer()
                }
                .padding(.vertical, AppSpacing.sm)
                
                // Legend
                HStack {
                    Spacer()
                    BreakdownLegendItem(title: "COMPLETED", percentage: completedPct, color: .blue)
                    Spacer()
                    BreakdownLegendItem(title: "PENDING", percentage: pendingPct, color: .green)
                    Spacer()
                    BreakdownLegendItem(title: "IN PROGRESS", percentage: inProgressPct, color: .orange)
                    Spacer()
                }
                
                HStack {
                    Spacer()
                    Button(action: {}) {
                        Text("VIEW FULL REPORT")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(AppColors.textPrimary)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(
                                Capsule().stroke(AppColors.border, lineWidth: 1)
                            )
                    }
                    .buttonStyle(ScaleButtonStyle())
                    Spacer()
                }
                .padding(.top, AppSpacing.sm)
            }
        }
    }
}

public struct BreakdownLegendItem: View {
    let title: String
    let percentage: String
    let color: Color
    
    public var body: some View {
        VStack(spacing: 4) {
            RoundedRectangle(cornerRadius: 2)
                .fill(color)
                .frame(width: 12, height: 12)
            
            Text(title)
                .font(.system(size: 9, weight: .semibold))
                .foregroundColor(AppColors.textSecondary)
            
            Text(percentage)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(AppColors.textPrimary)
        }
    }
}
