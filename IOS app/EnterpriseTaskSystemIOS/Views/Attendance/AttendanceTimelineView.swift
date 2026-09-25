import SwiftUI

/// Today's Timeline list showing Check-in and Break timestamps matching Mockup #4.
public struct AttendanceTimelineView: View {
    @ObservedObject var viewModel: AttendanceViewModel
    
    public var body: some View {
        AppCard(padding: AppSpacing.md, cornerRadius: AppRadius.lg) {
            VStack(alignment: .leading, spacing: AppSpacing.md) {
                Text("Today's Timeline")
                    .font(AppTypography.headline)
                    .foregroundColor(AppColors.textPrimary)
                
                VStack(spacing: AppSpacing.md) {
                    // Item 1: Checked In
                    TimelineRow(
                        title: "Checked In",
                        time: viewModel.todayRecord?.checkInTime != nil ? DateFormatter.localizedString(from: viewModel.todayRecord!.checkInTime!, dateStyle: .none, timeStyle: .short) : "09:14 AM",
                        statusColor: AppColors.success,
                        isLast: false
                    )
                    
                    // Item 2: Break Started
                    TimelineRow(
                        title: "Break Started",
                        time: viewModel.todayRecord?.breakStart != nil ? DateFormatter.localizedString(from: viewModel.todayRecord!.breakStart!, dateStyle: .none, timeStyle: .short) : "12:30 PM",
                        statusColor: AppColors.textTertiary,
                        isLast: false
                    )
                    
                    // Item 3: Break Ended
                    TimelineRow(
                        title: "Break Ended",
                        time: viewModel.todayRecord?.breakEnd != nil ? DateFormatter.localizedString(from: viewModel.todayRecord!.breakEnd!, dateStyle: .none, timeStyle: .short) : "01:18 PM",
                        statusColor: AppColors.textTertiary,
                        isLast: true
                    )
                }
            }
        }
    }
}

private struct TimelineRow: View {
    let title: String
    let time: String
    let statusColor: Color
    let isLast: Bool
    
    var body: some View {
        HStack(alignment: .top, spacing: AppSpacing.md) {
            VStack(spacing: 0) {
                Circle()
                    .fill(statusColor)
                    .frame(width: 10, height: 10)
                
                if !isLast {
                    Rectangle()
                        .fill(AppColors.border)
                        .frame(width: 1.5, height: 26)
                }
            }
            .padding(.top, 4)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(AppTypography.bodyMedium)
                    .foregroundColor(AppColors.textPrimary)
                
                Text(time)
                    .font(AppTypography.caption)
                    .foregroundColor(AppColors.textSecondary)
            }
            
            Spacer()
        }
    }
}
