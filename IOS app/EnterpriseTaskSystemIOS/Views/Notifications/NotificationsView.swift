import SwiftUI

/// Notifications Screen matching Reference Mockup #7.
public struct NotificationsView: View {
    @EnvironmentObject private var viewModel: NotificationViewModel
    @Environment(\.presentationMode) private var presentationMode
    @State private var navigationPath = NavigationPath()
    
    public var body: some View {
        NavigationStack(path: $navigationPath) {
            ScrollView(showsIndicators: false) {
                VStack(spacing: AppSpacing.lg) {
                    // Header Bar
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Notifications")
                                .font(AppTypography.title)
                                .foregroundColor(AppColors.textPrimary)
                            
                            Text("Stay updated")
                                .font(AppTypography.subheadline)
                                .foregroundColor(AppColors.textSecondary)
                        }
                        
                        Spacer()
                        
                        HStack(spacing: AppSpacing.md) {
                            Button("Mark all read") {
                                Task {
                                    await viewModel.markAllAsRead()
                                }
                            }
                            .font(AppTypography.footnote)
                            .foregroundColor(AppColors.primary)
                            
                            Button(action: {
                                presentationMode.wrappedValue.dismiss()
                            }) {
                                ZStack {
                                    Circle()
                                        .fill(AppColors.cardSurface)
                                        .frame(width: 36, height: 36)
                                        .overlay(Circle().stroke(AppColors.border, lineWidth: 1))
                                    
                                    Image(systemName: "xmark")
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(AppColors.textPrimary)
                                }
                            }
                        }
                    }
                    .padding(.horizontal, AppSpacing.md)
                    .padding(.top, AppSpacing.sm)
                    
                    if viewModel.isLoading && viewModel.notifications.isEmpty {
                        LoadingView(message: "Loading notifications...")
                            .padding(.top, 40)
                    } else if viewModel.notifications.isEmpty {
                        EmptyStateView(
                            icon: "bell.slash",
                            title: "No Notifications",
                            message: "You have no new alerts or announcements."
                        )
                        .padding(.top, 40)
                    } else {
                        // Section: Today
                        if !viewModel.todayNotifications.isEmpty {
                            VStack(alignment: .leading, spacing: AppSpacing.sm) {
                                Text("Today")
                                    .font(AppTypography.headline)
                                    .foregroundColor(AppColors.textSecondary)
                                    .padding(.horizontal, AppSpacing.md)
                                
                                LazyVStack(spacing: AppSpacing.sm) {
                                    ForEach(viewModel.todayNotifications) { item in
                                        NotificationCardRow(notification: item) {
                                            Task {
                                                await viewModel.markAsRead(notification: item)
                                            }
                                            navigationPath.append(item)
                                        }
                                    }
                                }
                                .padding(.horizontal, AppSpacing.md)
                            }
                        }
                        
                        // Section: Earlier
                        if !viewModel.earlierNotifications.isEmpty {
                            VStack(alignment: .leading, spacing: AppSpacing.sm) {
                                Text("Earlier")
                                    .font(AppTypography.headline)
                                    .foregroundColor(AppColors.textSecondary)
                                    .padding(.horizontal, AppSpacing.md)
                                
                                LazyVStack(spacing: AppSpacing.sm) {
                                    ForEach(viewModel.earlierNotifications) { item in
                                        NotificationCardRow(notification: item) {
                                            Task {
                                                await viewModel.markAsRead(notification: item)
                                            }
                                            navigationPath.append(item)
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
                await viewModel.fetchNotifications()
            }
            .task {
                await viewModel.fetchNotifications()
            }
            .navigationDestination(for: NotificationItem.self) { item in
                switch item.type {
                case .task:
                    TaskDetailView(task: TaskItem(
                        id: item.referenceId ?? UUID().uuidString,
                        title: itemTitle(for: item),
                        description: item.message,
                        status: .todo,
                        priority: .medium
                    ))
                case .message:
                    MessagesInboxView()
                case .announcement:
                    CalendarView()
                case .system:
                    AttendanceView()
                }
            }
        }
    }
    
    private func itemTitle(for notification: NotificationItem) -> String {
        switch notification.type {
        case .task: return "Task assigned"
        case .announcement: return "New announcement"
        case .message: return "New message"
        case .system: return "System update"
        }
    }
}

private struct NotificationCardRow: View {
    let notification: NotificationItem
    let onRead: () -> Void
    
    var body: some View {
        Button(action: onRead) {
            AppCard(padding: AppSpacing.md) {
                HStack(spacing: AppSpacing.md) {
                    // Type Icon
                    ZStack {
                        Circle()
                            .fill(iconColor.opacity(0.15))
                            .frame(width: 40, height: 40)
                        
                        Image(systemName: iconName)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(iconColor)
                    }
                    
                    VStack(alignment: .leading, spacing: 3) {
                        Text(notificationTitle)
                            .font(AppTypography.headline)
                            .foregroundColor(AppColors.textPrimary)
                        
                        Text(notification.message)
                            .font(AppTypography.subheadline)
                            .foregroundColor(AppColors.textSecondary)
                            .lineLimit(2)
                        
                        Text(relativeTime)
                            .font(AppTypography.caption)
                            .foregroundColor(AppColors.textTertiary)
                    }
                    
                    Spacer()
                    
                    Image(systemName: AppIcons.chevronRight)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(AppColors.textTertiary)
                }
            }
        }
    }
    
    private var notificationTitle: String {
        switch notification.type {
        case .task: return "Task assigned"
        case .announcement: return "New announcement"
        case .message: return "New message"
        case .system: return "System update"
        }
    }
    
    private var iconName: String {
        switch notification.type {
        case .task: return "doc.text.fill"
        case .announcement: return "megaphone.fill"
        case .message: return "bubble.left.fill"
        case .system: return "bell.fill"
        }
    }
    
    private var iconColor: Color {
        switch notification.type {
        case .task: return AppColors.primary
        case .announcement: return AppColors.accentOrange
        case .message: return AppColors.accentSky
        case .system: return AppColors.accentPurple
        }
    }
    
    private var relativeTime: String {
        guard let date = notification.createdAt else { return "Recently" }
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .short
        return formatter.localizedString(for: date, relativeTo: Date())
    }
}
