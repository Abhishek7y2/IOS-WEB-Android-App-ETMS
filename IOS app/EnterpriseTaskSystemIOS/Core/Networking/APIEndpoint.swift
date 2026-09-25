import Foundation

/// Centralized endpoint definition for all backend services.
public enum APIEndpoint {
    // MARK: - Auth
    case login
    case register
    case logout
    case refresh
    case profile
    case requestLoginOtp
    case loginWithOtp
    case requestRegistrationOtp
    case verifyRegistrationOtp
    case requestRegistrationEmailOtp
    case verifyRegistrationEmailOtp
    case requestPhoneChangeOtp
    case verifyPhoneChangeOtp
    case forgotPassword
    case resetPassword
    case users(search: String?, role: String?)
    case updateUser(id: String)
    case blockUser(id: String)
    case unblockUser(id: String)
    case deleteUser(id: String)
    case archivedUsers
    case restoreUser(id: String)
    case permanentDeleteUser(id: String)
    case purgeAccount
    
    // MARK: - Tasks
    case tasks(status: String?, priority: String?, search: String?, page: Int?, limit: Int?)
    case taskDetail(id: String)
    case createTask
    case updateTask(id: String)
    case deleteTask(id: String)
    case archivedTasks
    case restoreTask(id: String)
    case permanentDeleteTask(id: String)
    
    // MARK: - Attendance
    case attendance(date: String?, startDate: String?, endDate: String?, employeeId: String?)
    case checkIn
    case checkOut
    case breakStart
    case breakEnd
    case attendanceAnalytics(month: Int?, year: Int?)
    
    // MARK: - Leaves
    case leaves(status: String?, employeeId: String?)
    case leaveBalance(year: Int?)
    case leaveStats
    case applyLeave
    case leaveDetail(id: String)
    case updateLeaveStatus(id: String)
    case updateLeaveBalance(employeeId: String)
    case deleteLeave(id: String)
    
    // MARK: - Communication
    case conversations(type: String?, search: String?)
    case conversationDetail(id: String)
    case createConversation
    case messages(conversationId: String, page: Int?, limit: Int?)
    case sendMessage(conversationId: String)
    case announcements
    case createAnnouncement
    case communicationEmployees(search: String?)
    case groups
    
    // MARK: - Notifications
    case notifications
    case readAllNotifications
    case readNotification(id: String)
    
    // MARK: - Holidays
    case holidays(year: Int?)
    case holidayStats
    
    // MARK: - Profile / Settings
    case profilePreferences
    case profilePassword
    case exportUserData

    // MARK: - Path Resolution
    public var path: String {
        switch self {
        // Auth
        case .login: return "/auth/login"
        case .register: return "/auth/register"
        case .logout: return "/auth/logout"
        case .refresh: return "/auth/refresh"
        case .profile: return "/auth/profile"
        case .requestLoginOtp: return "/auth/request-login-otp"
        case .loginWithOtp: return "/auth/login-with-otp"
        case .requestRegistrationOtp: return "/auth/request-registration-otp"
        case .verifyRegistrationOtp: return "/auth/verify-registration-otp"
        case .requestRegistrationEmailOtp: return "/auth/request-registration-email-otp"
        case .verifyRegistrationEmailOtp: return "/auth/verify-registration-email-otp"
        case .requestPhoneChangeOtp: return "/auth/request-phone-change-otp"
        case .verifyPhoneChangeOtp: return "/auth/verify-phone-change-otp"
        case .forgotPassword: return "/auth/forgot-password"
        case .resetPassword: return "/auth/reset-password"
        case .users: return "/auth/users"
        case .updateUser(let id): return "/auth/users/\(id)"
        case .blockUser(let id): return "/auth/users/\(id)/block"
        case .unblockUser(let id): return "/auth/users/\(id)/unblock"
        case .deleteUser(let id): return "/auth/users/\(id)"
        case .archivedUsers: return "/auth/users/archived"
        case .restoreUser(let id): return "/auth/users/\(id)/restore"
        case .permanentDeleteUser(let id): return "/auth/users/\(id)/permanent"
        case .purgeAccount: return "/auth/me/purge"
            
        // Tasks
        case .tasks: return "/tasks"
        case .taskDetail(let id): return "/tasks/\(id)"
        case .createTask: return "/tasks"
        case .updateTask(let id): return "/tasks/\(id)"
        case .deleteTask(let id): return "/tasks/\(id)"
        case .archivedTasks: return "/tasks/archived"
        case .restoreTask(let id): return "/tasks/\(id)/restore"
        case .permanentDeleteTask(let id): return "/tasks/\(id)/permanent"
            
        // Attendance
        case .attendance: return "/attendance"
        case .checkIn: return "/attendance/check-in"
        case .checkOut: return "/attendance/check-out"
        case .breakStart: return "/attendance/break-start"
        case .breakEnd: return "/attendance/break-end"
        case .attendanceAnalytics: return "/attendance/analytics"
            
        // Leaves
        case .leaves: return "/leaves"
        case .leaveBalance: return "/leaves/balance"
        case .leaveStats: return "/leaves/stats"
        case .applyLeave: return "/leaves"
        case .leaveDetail(let id): return "/leaves/\(id)"
        case .updateLeaveStatus(let id): return "/leaves/\(id)"
        case .updateLeaveBalance(let employeeId): return "/leaves/balance/\(employeeId)"
        case .deleteLeave(let id): return "/leaves/\(id)"
            
        // Communication
        case .conversations: return "/communication/conversations"
        case .conversationDetail(let id): return "/communication/conversations/\(id)"
        case .createConversation: return "/communication/conversations"
        case .messages(let conversationId, _, _): return "/communication/conversations/\(conversationId)/messages"
        case .sendMessage(let conversationId): return "/communication/conversations/\(conversationId)/messages"
        case .announcements: return "/communication/announcements"
        case .createAnnouncement: return "/communication/announcements"
        case .communicationEmployees: return "/communication/employees"
        case .groups: return "/communication/groups"
            
        // Notifications
        case .notifications: return "/notifications"
        case .readAllNotifications: return "/notifications/read-all"
        case .readNotification(let id): return "/notifications/\(id)/read"
            
        // Holidays
        case .holidays: return "/holidays"
        case .holidayStats: return "/holidays/stats"
            
        // Profile
        case .profilePreferences: return "/profile/preferences"
        case .profilePassword: return "/profile/password"
        case .exportUserData: return "/profile/export-data"
        }
    }
    
    // MARK: - HTTP Method Resolution
    public var method: HTTPMethod {
        switch self {
        case .login, .register, .logout, .refresh, .requestLoginOtp, .loginWithOtp,
             .requestRegistrationOtp, .verifyRegistrationOtp, .requestRegistrationEmailOtp, .verifyRegistrationEmailOtp,
             .requestPhoneChangeOtp, .verifyPhoneChangeOtp,
             .forgotPassword, .resetPassword, .createTask, .checkIn, .checkOut,
             .breakStart, .breakEnd, .applyLeave, .createConversation, .sendMessage,
             .createAnnouncement, .groups:
            return .post
            
        case .updateUser, .blockUser, .unblockUser, .updateTask, .restoreTask, .restoreUser, .updateLeaveStatus,
             .updateLeaveBalance, .readAllNotifications, .readNotification, .profilePreferences, .profilePassword:
            return .put
            
        case .deleteUser, .permanentDeleteUser, .deleteTask, .permanentDeleteTask, .deleteLeave, .purgeAccount:
            return .delete
            
        default:
            return .get
        }
    }
    
    // MARK: - Query Items
    public var queryItems: [URLQueryItem]? {
        var items = [URLQueryItem]()
        
        switch self {
        case .users(let search, let role):
            if let s = search, !s.isEmpty { items.append(URLQueryItem(name: "search", value: s)) }
            if let r = role, !r.isEmpty { items.append(URLQueryItem(name: "role", value: r)) }
            
        case .tasks(let status, let priority, let search, let page, let limit):
            if let st = status, !st.isEmpty, st != "all" { items.append(URLQueryItem(name: "status", value: st)) }
            if let pr = priority, !pr.isEmpty { items.append(URLQueryItem(name: "priority", value: pr)) }
            if let sr = search, !sr.isEmpty { items.append(URLQueryItem(name: "search", value: sr)) }
            if let p = page { items.append(URLQueryItem(name: "page", value: "\(p)")) }
            if let l = limit { items.append(URLQueryItem(name: "limit", value: "\(l)")) }
            
        case .attendance(let date, let startDate, let endDate, let employeeId):
            if let d = date { items.append(URLQueryItem(name: "date", value: d)) }
            if let sd = startDate { items.append(URLQueryItem(name: "startDate", value: sd)) }
            if let ed = endDate { items.append(URLQueryItem(name: "endDate", value: ed)) }
            if let emp = employeeId { items.append(URLQueryItem(name: "employeeId", value: emp)) }
            
        case .attendanceAnalytics(let month, let year):
            if let m = month { items.append(URLQueryItem(name: "month", value: "\(m)")) }
            if let y = year { items.append(URLQueryItem(name: "year", value: "\(y)")) }
            
        case .leaves(let status, let employeeId):
            if let st = status, !st.isEmpty, st != "All" { items.append(URLQueryItem(name: "status", value: st)) }
            if let emp = employeeId { items.append(URLQueryItem(name: "employeeId", value: emp)) }
            
        case .leaveBalance(let year):
            if let y = year { items.append(URLQueryItem(name: "year", value: "\(y)")) }
            
        case .conversations(let type, let search):
            if let t = type, !t.isEmpty { items.append(URLQueryItem(name: "type", value: t)) }
            if let s = search, !s.isEmpty { items.append(URLQueryItem(name: "search", value: s)) }
            
        case .messages(_, let page, let limit):
            if let p = page { items.append(URLQueryItem(name: "page", value: "\(p)")) }
            if let l = limit { items.append(URLQueryItem(name: "limit", value: "\(l)")) }
            
        case .communicationEmployees(let search):
            if let s = search, !s.isEmpty { items.append(URLQueryItem(name: "search", value: s)) }
            
        case .holidays(let year):
            if let y = year { items.append(URLQueryItem(name: "year", value: "\(y)")) }
            
        default:
            return nil
        }
        
        return items.isEmpty ? nil : items
    }
}
