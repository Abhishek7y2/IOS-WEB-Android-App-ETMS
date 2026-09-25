import SwiftUI

/// Main Tab Navigation Container for WorkMate.
public struct MainTabView: View {
    @EnvironmentObject private var appRouter: AppRouter
    @EnvironmentObject private var authViewModel: AuthViewModel
    @State private var showMoreMenu: Bool = false
    
    public var body: some View {
        TabView(selection: $appRouter.selectedTab) {
            // Tab 1: Home / Dashboard
            DashboardView()
                .tabItem {
                    Image(systemName: AppIcons.tabHome)
                    if appRouter.selectedTab == .home { Text("Home") }
                }
                .tag(AppTab.home)
            
            // Tab 2: Tasks
            TaskListView()
                .tabItem {
                    Image(systemName: AppIcons.tabTasks)
                    if appRouter.selectedTab == .tasks { Text("Tasks") }
                }
                .tag(AppTab.tasks)
            
            // Tab 3: Team
            EmployeesDirectoryView()
                .tabItem {
                    Image(systemName: AppIcons.employeeDirectory)
                    if appRouter.selectedTab == .employees { Text("Team") }
                }
                .tag(AppTab.employees)
            
            // Tab 4: Leave
            LeavePortalView()
                .tabItem {
                    Image(systemName: AppIcons.tabLeave)
                    if appRouter.selectedTab == .leave { Text("Leave") }
                }
                .tag(AppTab.leave)
            
            
            // Tab 10: More (Profile, Calendar, Employees, Notifications)
            MoreMenuView()
                .tabItem {
                    Image(systemName: AppIcons.tabMore)
                    if appRouter.selectedTab == .more { Text("More") }
                }
                .tag(AppTab.more)
        }
        .accentColor(AppColors.primary)
        .fullScreenCover(isPresented: $appRouter.showNotificationsSheet) {
            NotificationsView()
        }
    }
}

/// More Menu Screen providing fast access to Profile, Calendar, Employees, and Notifications.
public struct MoreMenuView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @EnvironmentObject private var appRouter: AppRouter
    
    public var body: some View {
        NavigationStack {
            List {
                Section("Workspace") {
                    NavigationLink(destination: MessagesInboxView()) {
                        HStack(spacing: AppSpacing.sm) {
                            Image(systemName: AppIcons.tabMessages)
                                .foregroundColor(AppColors.primary)
                                .frame(width: 24)
                            Text("Communication")
                                .foregroundColor(AppColors.textPrimary)
                        }
                    }
                    NavigationLink(destination: CalendarView()) {
                        HStack(spacing: AppSpacing.sm) {
                            Image(systemName: AppIcons.calendar)
                                .foregroundColor(AppColors.primary)
                                .frame(width: 24)
                            Text("Calendar & Holidays")
                                .foregroundColor(AppColors.textPrimary)
                        }
                    }
                    NavigationLink(destination: AttendanceView()) {
                        HStack(spacing: AppSpacing.sm) {
                            Image(systemName: AppIcons.tabAttendance)
                                .foregroundColor(AppColors.primary)
                                .frame(width: 24)
                            Text("Attendance")
                                .foregroundColor(AppColors.textPrimary)
                        }
                    }
                    Button(action: {
                        appRouter.showNotificationsSheet = true
                    }) {
                        HStack(spacing: AppSpacing.sm) {
                            Image(systemName: AppIcons.tabNotifications)
                                .foregroundColor(AppColors.primary)
                                .frame(width: 24)
                            Text("Notifications")
                                .foregroundColor(AppColors.textPrimary)
                        }
                    }
                }
                
                if let currentUser = authViewModel.currentUser, currentUser.isAdmin {
                    Section("Administration") {
                        NavigationLink(destination: ArchiveView()) {
                            HStack(spacing: AppSpacing.sm) {
                                Image(systemName: "archivebox")
                                    .foregroundColor(AppColors.primary)
                                    .frame(width: 24)
                                Text("Archive Manager")
                                    .foregroundColor(AppColors.textPrimary)
                            }
                        }
                    }
                }
                
                Section("Account & Settings") {
                    NavigationLink(destination: ProfileView()) {
                        HStack(spacing: AppSpacing.sm) {
                            Image(systemName: AppIcons.tabProfile)
                                .foregroundColor(AppColors.primary)
                                .frame(width: 24)
                            Text("My Profile")
                                .foregroundColor(AppColors.textPrimary)
                        }
                    }
                }
                
                Section {
                    Button(role: .destructive, action: {
                        authViewModel.logout()
                    }) {
                        HStack(spacing: AppSpacing.sm) {
                            Image(systemName: AppIcons.signOut)
                                .foregroundColor(AppColors.danger)
                                .frame(width: 24)
                            Text("Sign Out")
                                .foregroundColor(AppColors.danger)
                        }
                    }
                }
            }
            .navigationTitle("More")
        }
    }
}
