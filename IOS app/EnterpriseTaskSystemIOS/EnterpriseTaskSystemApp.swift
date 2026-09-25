import SwiftUI

@main
struct EnterpriseTaskSystemApp: App {
    @StateObject private var authViewModel = AuthViewModel()
    @StateObject private var appRouter = AppRouter.shared
    @StateObject private var notificationViewModel = NotificationViewModel()
    @AppStorage("workmate_appearance_mode") private var appearanceMode: String = "system"
    
    init() {
        if let tabArgIndex = CommandLine.arguments.firstIndex(of: "-tab"),
           tabArgIndex + 1 < CommandLine.arguments.count {
            let tabStr = CommandLine.arguments[tabArgIndex + 1].lowercased()
            switch tabStr {
            case "tasks": AppRouter.shared.selectedTab = .tasks
            case "attendance": AppRouter.shared.selectedTab = .attendance
            case "leave": AppRouter.shared.selectedTab = .leave
            case "messages": AppRouter.shared.selectedTab = .messages
            case "employees": AppRouter.shared.selectedTab = .employees
            case "archive": AppRouter.shared.selectedTab = .archive
            case "calendar": AppRouter.shared.selectedTab = .calendar
            case "profile": AppRouter.shared.selectedTab = .profile
            case "more": AppRouter.shared.selectedTab = .more
            default: AppRouter.shared.selectedTab = .home
            }
        }
        
        if let sheetArgIndex = CommandLine.arguments.firstIndex(of: "-sheet"),
           sheetArgIndex + 1 < CommandLine.arguments.count {
            let sheetStr = CommandLine.arguments[sheetArgIndex + 1].lowercased()
            if sheetStr == "notifications" {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    AppRouter.shared.showNotificationsSheet = true
                }
            }
        }
    }
    
    var body: some Scene {
        WindowGroup {
            Group {
                if authViewModel.isAuthenticated {
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
