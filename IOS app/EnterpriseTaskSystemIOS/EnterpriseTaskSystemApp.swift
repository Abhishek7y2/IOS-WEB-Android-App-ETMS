import SwiftUI

@main
struct EnterpriseTaskSystemApp: App {
    @StateObject private var authViewModel = AuthViewModel()
    @StateObject private var appRouter = AppRouter.shared
    @StateObject private var notificationViewModel = NotificationViewModel()
    @AppStorage("workmate_appearance_mode") private var appearanceMode: String = "system"
    
    @State private var overrideScreen: String? = nil

    init() {
        if CommandLine.arguments.contains("-autologin") {
            let user = User(
                id: "6aab8665e7b2727bbd4bf4c5",
                name: "Abhishek Yadav",
                firstName: "Abhishek",
                lastName: "Yadav",
                email: "abhishek7y2@gmail.com",
                role: .superadmin,
                mobileNumber: "9876543210",
                countryCode: "+91",
                designation: "CEO",
                department: "Executive",
                profilePicture: nil,
                coverPicture: nil,
                isVerified: true
            )
            AuthManager.shared.currentUser = user
            AuthManager.shared.isAuthenticated = true
            UserDefaultsService.shared.saveCachedUser(user)
        }

        if let screenArgIndex = CommandLine.arguments.firstIndex(of: "-screen"),
           screenArgIndex + 1 < CommandLine.arguments.count {
            let screenStr = CommandLine.arguments[screenArgIndex + 1].lowercased()
            _overrideScreen = State(initialValue: screenStr)
        }

        if let tabArgIndex = CommandLine.arguments.firstIndex(of: "-tab"),
           tabArgIndex + 1 < CommandLine.arguments.count {
            let tabStr = CommandLine.arguments[tabArgIndex + 1].lowercased()
            switch tabStr {
            case "tasks": AppRouter.shared.selectedTab = .tasks
            case "attendance": AppRouter.shared.selectedTab = .attendance
            case "leave": AppRouter.shared.selectedTab = .leave
            case "employees": AppRouter.shared.selectedTab = .employees
            case "more": AppRouter.shared.selectedTab = .more
            default: AppRouter.shared.selectedTab = .home
            }
        }
        
        if let sheetArgIndex = CommandLine.arguments.firstIndex(of: "-sheet"),
           sheetArgIndex + 1 < CommandLine.arguments.count {
            let sheetStr = CommandLine.arguments[sheetArgIndex + 1].lowercased()
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
                switch sheetStr {
                case "notifications":
                    AppRouter.shared.showNotificationsSheet = true
                case "createtask":
                    AppRouter.shared.showCreateTaskSheet = true
                case "applyleave":
                    AppRouter.shared.showApplyLeaveSheet = true
                case "composemessage":
                    AppRouter.shared.showComposeMessageSheet = true
                default:
                    break
                }
            }
        }
    }
    
    var body: some Scene {
        WindowGroup {
            Group {
                if let screen = overrideScreen {
                    switch screen {
                    case "register":
                        RegisterView()
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                    case "forgotpassword":
                        ForgotPasswordView()
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                    case "attendance":
                        AttendanceView()
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                    case "calendar":
                        CalendarView()
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                    case "messages":
                        MessagesInboxView()
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                    case "profile":
                        ProfileView()
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                    case "archive":
                        ArchiveView()
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                    case "notifications":
                        NotificationsView()
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                            .environmentObject(notificationViewModel)
                    case "dashboard", "home":
                        DashboardView()
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                            .environmentObject(notificationViewModel)
                    case "tasks":
                        TaskListView()
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                    case "employees", "team":
                        EmployeesDirectoryView()
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                    case "leave":
                        LeavePortalView()
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                    case "more":
                        MoreMenuView()
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                    case "main":
                        MainTabView()
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                            .environmentObject(notificationViewModel)
                    case "createtask":
                        CreateTaskSheet(viewModel: TaskViewModel())
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                    case "applyleave":
                        ApplyLeaveSheet(viewModel: LeaveViewModel())
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                    case "composemessage":
                        ComposeMessageSheet(viewModel: CommunicationViewModel())
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                    default:
                        LoginView()
                            .environmentObject(authViewModel)
                            .environmentObject(appRouter)
                    }
                } else if authViewModel.isAuthenticated {
                    MainTabView()
                        .environmentObject(authViewModel)
                        .environmentObject(appRouter)
                        .environmentObject(notificationViewModel)
                        .transition(.asymmetric(
                            insertion: .opacity.combined(with: .scale(scale: 0.95)),
                            removal: .opacity.combined(with: .scale(scale: 1.05))
                        ))
                } else {
                    LoginView()
                        .environmentObject(authViewModel)
                        .environmentObject(appRouter)
                        .transition(.asymmetric(
                            insertion: .opacity.combined(with: .move(edge: .bottom)),
                            removal: .opacity.combined(with: .scale(scale: 0.95))
                        ))
                }
            }
            .animation(.spring(response: 0.5, dampingFraction: 0.8, blendDuration: 0), value: authViewModel.isAuthenticated)
            .preferredColorScheme(preferredColorScheme)
        }
    }
    
    private var preferredColorScheme: ColorScheme? {
        switch appearanceMode {
        case "light": return .light
        case "dark": return .dark
        default: return nil
        }
    }
}
