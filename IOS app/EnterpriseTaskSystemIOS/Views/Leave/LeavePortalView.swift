import SwiftUI

/// Leave Management Screen with Admin Approvals matching Web Frontend.
public struct LeavePortalView: View {
    @StateObject private var viewModel = LeaveViewModel()
    @EnvironmentObject private var appRouter: AppRouter
    @EnvironmentObject private var authViewModel: AuthViewModel
    
    @State private var selectedSegment: Int = 0 // 0: My Leaves, 1: Team Requests
    @State private var rejectTargetLeave: Leave?
    @State private var rejectionReasonText: String = ""
    @State private var showRejectModal: Bool = false
    
    private var isAdmin: Bool {
        guard let currentUser = authViewModel.currentUser else { return false }
        return currentUser.isAdmin
    }
    
    public var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: AppSpacing.lg) {
                    // Header Bar
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Leave Management")
                                .font(AppTypography.title)
                                .foregroundColor(AppColors.textPrimary)
                            
                            Text("Balance, applications, and approvals")
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
                    
                    // Admin Segmented Tab Picker
                    if isAdmin {
                        Picker("View", selection: $selectedSegment) {
                            Text("My Leaves").tag(0)
                            Text("Approve Leave (\(viewModel.pendingLeaves.count))").tag(1)
                        }
                        .pickerStyle(.segmented)
                        .padding(.horizontal, AppSpacing.md)
                    }
                    
                    if selectedSegment == 0 {
                        // Available Balance Card
                        LeaveBalanceCard(daysRemaining: viewModel.availableBalanceDays)
                            .padding(.horizontal, AppSpacing.md)
                        
                        // Leave Types Breakdown List
                        VStack(alignment: .leading, spacing: AppSpacing.sm) {
                            Text("Leave Types")
                                .font(AppTypography.headline)
                                .foregroundColor(AppColors.textPrimary)
                                .padding(.horizontal, AppSpacing.md)
                            
                            AppCard(padding: AppSpacing.sm) {
                                VStack(spacing: 0) {
                                    ForEach(Array(viewModel.leaveTypesBreakdown.enumerated()), id: \.offset) { index, item in
                                        VStack(alignment: .leading, spacing: 12) {
                                            HStack(spacing: AppSpacing.md) {
                                                ZStack {
                                                    Circle()
                                                        .fill(item.color.opacity(0.15))
                                                        .frame(width: 36, height: 36)
                                                    
                                                    Image(systemName: "calendar.badge.clock")
                                                        .font(.system(size: 15))
                                                        .foregroundColor(item.color)
                                                }
                                                
                                                Text(item.name)
                                                    .font(AppTypography.body)
                                                    .foregroundColor(AppColors.textPrimary)
                                                
                                                Spacer()
                                                
                                                VStack(alignment: .trailing, spacing: 2) {
                                                    Text("\(item.used) / \(item.total) used")
                                                        .font(AppTypography.captionBold)
                                                        .foregroundColor(AppColors.textPrimary)
                                                    Text("\(item.remaining) remaining")
                                                        .font(AppTypography.caption)
                                                        .foregroundColor(AppColors.textSecondary)
                                                }
                                            }
                                            
                                            // Progress Bar Graph
                                            let progress = item.total > 0 ? Double(item.used) / Double(item.total) : 0.0
                                            ProgressBar(progress: progress, height: 6, barColor: item.color)
                                        }
                                        .padding(.vertical, 10)
                                        .padding(.horizontal, AppSpacing.xs)
                                        
                                        if index < viewModel.leaveTypesBreakdown.count - 1 {
                                            Divider()
                                                .background(AppColors.border)
                                        }
                                    }
                                }
                            }
                            .padding(.horizontal, AppSpacing.md)
                        }
                        
                        // Full-width "Apply Leave" Vibrant Action Button
                        AppButton("Apply Leave", icon: "plus.circle.fill") {
                            viewModel.showApplySheet = true
                        }
                        .padding(.horizontal, AppSpacing.md)
                        .padding(.top, AppSpacing.xs)
                        
                        // Recent Leave Applications History Section
                        if !viewModel.myLeaves.isEmpty {
                            VStack(alignment: .leading, spacing: AppSpacing.sm) {
                                Text("My Applications")
                                    .font(AppTypography.headline)
                                    .foregroundColor(AppColors.textPrimary)
                                    .padding(.horizontal, AppSpacing.md)
                                
                                VStack(spacing: AppSpacing.sm) {
                                    ForEach(viewModel.myLeaves) { leave in
                                        AppCard(padding: AppSpacing.md) {
                                            HStack {
                                                VStack(alignment: .leading, spacing: 4) {
                                                    Text(leave.leaveType.rawValue)
                                                        .font(AppTypography.headline)
                                                        .foregroundColor(AppColors.textPrimary)
                                                    
                                                    Text("\(DateFormatter.localizedString(from: leave.startDate, dateStyle: .short, timeStyle: .none)) - \(DateFormatter.localizedString(from: leave.endDate, dateStyle: .short, timeStyle: .none)) (\(String(format: "%.1f", leave.totalDays)) days)")
                                                        .font(AppTypography.caption)
                                                        .foregroundColor(AppColors.textSecondary)
                                                }
                                                
                                                Spacer()
                                                
                                                StatusBadge(leaveStatus: leave.status)
                                            }
                                        }
                                    }
                                }
                                .padding(.horizontal, AppSpacing.md)
                            }
                        }
                    } else {
                        // Team Approvals Section (Admin)
                        VStack(alignment: .leading, spacing: AppSpacing.sm) {
                            Text("Pending Team Leave Requests")
                                .font(AppTypography.headline)
                                .foregroundColor(AppColors.textPrimary)
                                .padding(.horizontal, AppSpacing.md)
                            
                            if viewModel.pendingLeaves.isEmpty {
                                EmptyStateView(
                                    icon: "checkmark.circle.badge.questionmark",
                                    title: "All Clear!",
                                    message: "There are no pending leave requests awaiting approval."
                                )
                                .padding(.top, 40)
                            } else {
                                VStack(spacing: AppSpacing.md) {
                                    ForEach(viewModel.pendingLeaves) { leave in
                                        AppCard(padding: AppSpacing.md) {
                                            VStack(alignment: .leading, spacing: AppSpacing.sm) {
                                                HStack {
                                                    VStack(alignment: .leading, spacing: 2) {
                                                        Text(leave.employeeName)
                                                            .font(AppTypography.headline)
                                                            .foregroundColor(AppColors.textPrimary)
                                                        
                                                        Text(leave.leaveType.rawValue)
                                                            .font(AppTypography.footnote)
                                                            .foregroundColor(AppColors.primary)
                                                    }
                                                    Spacer()
                                                    StatusBadge(leaveStatus: leave.status)
                                                }
                                                
                                                Text("Dates: \(DateFormatter.localizedString(from: leave.startDate, dateStyle: .medium, timeStyle: .none)) → \(DateFormatter.localizedString(from: leave.endDate, dateStyle: .medium, timeStyle: .none)) (\(String(format: "%.1f", leave.totalDays)) days)")
                                                    .font(AppTypography.caption)
                                                    .foregroundColor(AppColors.textSecondary)
                                                
                                                if !leave.reason.isEmpty {
                                                    Text("Reason: \"\(leave.reason)\"")
                                                        .font(AppTypography.caption)
                                                        .italic()
                                                        .foregroundColor(AppColors.textPrimary)
                                                }
                                                
                                                // Action Buttons (Approve / Reject)
                                                HStack(spacing: AppSpacing.sm) {
                                                    Button(action: {
                                                        Task {
                                                            _ = await viewModel.updateLeaveStatus(leaveId: leave.id, status: "approved")
                                                        }
                                                    }) {
                                                        HStack(spacing: 4) {
                                                            Image(systemName: "checkmark")
                                                            Text("Approve")
                                                        }
                                                        .font(AppTypography.captionBold)
                                                        .foregroundColor(.white)
                                                        .frame(maxWidth: .infinity)
                                                        .padding(.vertical, 8)
                                                        .background(RoundedRectangle(cornerRadius: 8).fill(AppColors.success))
                                                    }
                                                    
                                                    Button(action: {
                                                        self.rejectTargetLeave = leave
                                                        self.showRejectModal = true
                                                    }) {
                                                        HStack(spacing: 4) {
                                                            Image(systemName: "xmark")
                                                            Text("Reject")
                                                        }
                                                        .font(AppTypography.captionBold)
                                                        .foregroundColor(AppColors.danger)
                                                        .frame(maxWidth: .infinity)
                                                        .padding(.vertical, 8)
                                                        .background(RoundedRectangle(cornerRadius: 8).stroke(AppColors.danger, lineWidth: 1))
                                                    }
                                                }
                                                .padding(.top, 4)
                                            }
                                        }
                                    }
                                }
                                .padding(.horizontal, AppSpacing.md)
                            }
                        }
                    }
                    
                    Spacer(minLength: 40)
                }
            }
            .appScreenBackground()
            .navigationBarHidden(true)
            .refreshable {
                await viewModel.fetchLeaveData()
            }
            .task {
                await viewModel.fetchLeaveData()
            }
            .sheet(isPresented: $viewModel.showApplySheet) {
                ApplyLeaveSheet(viewModel: viewModel)
            }
            .alert("Reject Leave Request", isPresented: $showRejectModal) {
                TextField("Rejection reason (optional)", text: $rejectionReasonText)
                Button("Cancel", role: .cancel) {}
                Button("Reject", role: .destructive) {
                    if let target = rejectTargetLeave {
                        Task {
                            _ = await viewModel.updateLeaveStatus(leaveId: target.id, status: "rejected", rejectionReason: rejectionReasonText)
                            rejectionReasonText = ""
                        }
                    }
                }
            } message: {
                Text("Confirm rejecting this leave application?")
            }
        }
    }
}
