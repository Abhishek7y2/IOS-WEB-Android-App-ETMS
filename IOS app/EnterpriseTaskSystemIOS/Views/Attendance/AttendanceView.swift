import SwiftUI

/// Attendance Screen matching Reference Mockup #4.
public struct AttendanceView: View {
    @StateObject private var viewModel = AttendanceViewModel()
    @EnvironmentObject private var appRouter: AppRouter
    
    public var body: some View {
        ScrollView(showsIndicators: false) {
                VStack(spacing: AppSpacing.lg) {
                    // Header Bar
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Attendance")
                                .font(AppTypography.title)
                                .foregroundColor(AppColors.textPrimary)
                            
                            Text("Track your work hours")
                                .font(AppTypography.subheadline)
                                .foregroundColor(AppColors.textSecondary)
                        }
                        
                        Spacer()
                        
                        Button(action: {
                            appRouter.showNotificationsSheet = true
                        }) {
                            ZStack {
                                Circle()
                                    .fill(AppColors.cardSurface)
                                    .frame(width: 40, height: 40)
                                    .overlay(Circle().stroke(AppColors.border, lineWidth: 1))
                                
                                Image(systemName: AppIcons.notificationBell)
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundColor(AppColors.textPrimary)
                            }
                        }
                    }
                    .padding(.horizontal, AppSpacing.md)
                    .padding(.top, AppSpacing.xs)
                    
                    // Large Animated Circular Progress Ring
                    CircularProgressRing(
                        timeString: viewModel.liveClockString,
                        statusString: viewModel.isOnBreak ? "On Break" : (viewModel.isCheckedIn ? "Working" : "Checked Out"),
                        progress: viewModel.isCheckedIn ? 0.75 : 0.0,
                        isWorking: viewModel.isCheckedIn && !viewModel.isOnBreak
                    )
                    
                    // Work Mode Selector (when not checked in)
                    if !viewModel.isCheckedIn {
                        HStack {
                            Text("Work Mode:")
                                .font(AppTypography.subheadline)
                                .foregroundColor(AppColors.textSecondary)
                            
                            Menu {
                                Button("🏢 Office") { viewModel.selectedWorkMode = "Office" }
                                Button("🏠 Work From Home") { viewModel.selectedWorkMode = "Remote" }
                                Button("🌐 Hybrid") { viewModel.selectedWorkMode = "Hybrid" }
                                Button("🚗 On-Site Visit") { viewModel.selectedWorkMode = "On-site" }
                            } label: {
                                HStack(spacing: 6) {
                                    Text(viewModel.selectedWorkMode)
                                        .font(AppTypography.captionBold)
                                    Image(systemName: "chevron.up.chevron.down")
                                        .font(.system(size: 11))
                                }
                                .foregroundColor(AppColors.primary)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Capsule().fill(AppColors.primary.opacity(0.1)))
                            }
                        }
                    }
                    
                    // Primary Action Button (Check In / Check Out)
                    AppButton(
                        viewModel.isCheckedIn ? "Check Out" : "Check In",
                        icon: viewModel.isCheckedIn ? "door.right.hand.open" : "door.left.hand.closed"
                    ) {
                        Task {
                            await viewModel.toggleCheckInOut()
                        }
                    }
                    .padding(.horizontal, AppSpacing.md)
                    
                    // Break Action Button (if checked in)
                    if viewModel.isCheckedIn {
                        SecondaryButton(
                            viewModel.isOnBreak ? "Resume Work" : "Take a Break",
                            icon: AppIcons.breakCoffee
                        ) {
                            Task {
                                await viewModel.toggleBreak()
                            }
                        }
                        .padding(.horizontal, AppSpacing.md)
                    }
                    
                    // 2 Stats Cards (Work Hours, Break Time)
                    HStack(spacing: AppSpacing.md) {
                        // Work Hours Card
                        AppCard(padding: AppSpacing.md) {
                            HStack(spacing: AppSpacing.sm) {
                                ZStack {
                                    Circle()
                                        .fill(AppColors.successSoft)
                                        .frame(width: 38, height: 38)
                                    Image(systemName: "clock.fill")
                                        .foregroundColor(AppColors.success)
                                }
                                
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(viewModel.totalWorkHoursString)
                                        .font(AppTypography.headline)
                                        .foregroundColor(AppColors.textPrimary)
                                    Text("Work Hours")
                                        .font(AppTypography.caption)
                                        .foregroundColor(AppColors.textSecondary)
                                }
                                Spacer()
                            }
                        }
                        
                        // Break Time Card
                        AppCard(padding: AppSpacing.md) {
                            HStack(spacing: AppSpacing.sm) {
                                ZStack {
                                    Circle()
                                        .fill(AppColors.infoSoft)
                                        .frame(width: 38, height: 38)
                                    Image(systemName: AppIcons.breakCoffee)
                                        .foregroundColor(AppColors.info)
                                }
                                
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(viewModel.totalBreakHoursString)
                                        .font(AppTypography.headline)
                                        .foregroundColor(AppColors.textPrimary)
                                    Text("Break Time")
                                        .font(AppTypography.caption)
                                        .foregroundColor(AppColors.textSecondary)
                                }
                                Spacer()
                            }
                        }
                    }
                    .padding(.horizontal, AppSpacing.md)
                    
                    // Today's Timeline
                    AttendanceTimelineView(viewModel: viewModel)
                        .padding(.horizontal, AppSpacing.md)
                    
                    Spacer(minLength: 40)
                }
            }
            .appScreenBackground()
            .refreshable {
                await viewModel.fetchAttendance()
            }
            .task {
                await viewModel.fetchAttendance()
            }
    }
}
