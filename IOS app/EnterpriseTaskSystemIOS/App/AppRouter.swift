import SwiftUI

/// Active tab navigation identifier.
public enum AppTab: String, CaseIterable, Identifiable {
    case home = "Home"
    case tasks = "Tasks"
    case attendance = "Attendance"
    case leave = "Leave"
    case more = "More"
    case messages = "Messages"
    case notifications = "Notifications"
    case profile = "Profile"
    case calendar = "Calendar"
    case employees = "Employees"
    case archive = "Archive"
    
    public var id: String { rawValue }
    
    public var icon: String {
        switch self {
        case .home: return AppIcons.tabHome
        case .tasks: return AppIcons.tabTasks
        case .attendance: return AppIcons.tabAttendance
        case .leave: return AppIcons.tabLeave
        case .more: return AppIcons.tabMore
        case .messages: return AppIcons.tabMessages
        case .notifications: return AppIcons.tabNotifications
        case .profile: return AppIcons.tabProfile
        case .calendar: return AppIcons.calendar
        case .employees: return AppIcons.employeeDirectory
        case .archive: return "archivebox"
        }
    }
}

/// Global Application Routing State.
public final class AppRouter: ObservableObject {
    public static let shared = AppRouter()
    
    @Published public var selectedTab: AppTab = .home
    @Published public var showNotificationsSheet: Bool = false
    @Published public var showCreateTaskSheet: Bool = false
    @Published public var showApplyLeaveSheet: Bool = false
    @Published public var showComposeMessageSheet: Bool = false
    @Published public var requestedTaskFilter: String? = nil
    @Published public var requestedEmployeeProfileId: String? = nil
    
    private init() {}
}

/// Types of Toast notifications
public enum ToastType {
    case info
    case success
    case error
    
    var icon: String {
        switch self {
        case .info: return "info.circle.fill"
        case .success: return "checkmark.circle.fill"
        case .error: return "xmark.circle.fill"
        }
    }
    
    var color: Color {
        switch self {
        case .info: return AppColors.accentSky
        case .success: return Color.green
        case .error: return AppColors.danger
        }
    }
}

/// Global Toast Manager
public final class ToastManager: ObservableObject {
    public static let shared = ToastManager()
    
    @Published public var isShowing: Bool = false
    @Published public var message: String = ""
    @Published public var type: ToastType = .info
    
    private init() {}
    
    public func showToast(message: String, type: ToastType = .info, duration: TimeInterval = 3.0) {
        DispatchQueue.main.async {
            self.message = message
            self.type = type
            
            withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
                self.isShowing = true
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + duration) {
                self.hideToast()
            }
        }
    }
    
    public func hideToast() {
        DispatchQueue.main.async {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
                self.isShowing = false
            }
        }
    }
}

public struct ToastViewModifier: ViewModifier {
    @ObservedObject var manager = ToastManager.shared
    
    public func body(content: Content) -> some View {
        ZStack(alignment: .top) {
            content
            
            if manager.isShowing {
                VStack {
                    HStack(spacing: AppSpacing.sm) {
                        Image(systemName: manager.type.icon)
                            .foregroundColor(manager.type.color)
                            .font(.system(size: 20))
                        
                        Text(manager.message)
                            .font(AppTypography.subheadline)
                            .foregroundColor(.white)
                            .multilineTextAlignment(.leading)
                            .lineLimit(2)
                        
                        Spacer(minLength: 0)
                    }
                    .padding(.horizontal, AppSpacing.md)
                    .padding(.vertical, AppSpacing.sm)
                    .background(
                        Capsule()
                            .fill(Color.black.opacity(0.85))
                            .shadow(color: manager.type.color.opacity(0.3), radius: 10, x: 0, y: 5)
                            .overlay(
                                Capsule().stroke(Color.white.opacity(0.1), lineWidth: 1)
                            )
                    )
                    .padding(.horizontal, AppSpacing.lg)
                    .padding(.top, 50) // Safe area offset
                    .onTapGesture {
                        manager.hideToast()
                    }
                    .transition(.asymmetric(
                        insertion: .move(edge: .top).combined(with: .opacity),
                        removal: .move(edge: .top).combined(with: .opacity)
                    ))
                    .zIndex(100)
                }
            }
        }
    }
}

public extension View {
    func withToast() -> some View {
        self.modifier(ToastViewModifier())
    }
}

/// Enterprise grade pressable button style that scales and fades on press.
public struct PressableButtonStyle: ButtonStyle {
    public init() {}
    
    public func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .opacity(configuration.isPressed ? 0.8 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7, blendDuration: 0), value: configuration.isPressed)
    }
}
