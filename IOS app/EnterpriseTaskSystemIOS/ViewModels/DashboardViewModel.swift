import Foundation
import SwiftUI
import Combine

/// View Model powering the Home / Dashboard screen.
@MainActor
public final class DashboardViewModel: ObservableObject {
    @Published public var todayTasks: [TaskItem] = []
    @Published public var totalTasksCount: Int = 12
    @Published public var pendingTasksCount: Int = 4
    @Published public var inProgressTasksCount: Int = 5
    @Published public var completedTasksCount: Int = 3
    
    @Published public var recentActivities: [ActivityItem] = []
    @Published public var teamMembers: [User] = []
    @Published public var unreadMessagesCount: Int = 0
    @Published public var activeAnnouncementsCount: Int = 2
    @Published public var selectedWorkMode: String = "Office"
    
    @Published public var currentAttendance: Attendance?
    @Published public var isCheckedIn: Bool = false
    @Published public var checkInTimeString: String = "09:14 AM"
    @Published public var currentDateString: String = "Wed, 16 Sep 2026"
    
    @Published public var isLoading: Bool = false
    @Published public var errorMessage: String?
    
    private var cancellables = Set<AnyCancellable>()
    
    public init() {
        updateDateString()
        setupRealtimeSubscriptions()
        populateDefaultEnterpriseData()
    }
    
    private func populateDefaultEnterpriseData() {
        self.teamMembers = [
            User(id: "user_01", name: "Abhishek Yadav", email: "abhishek7y2@gmail.com", role: .superadmin, designation: "CEO & Full Stack Architect", department: "Executive"),
            User(id: "user_02", name: "Sneha Patel", email: "sneha.patel@workmate.internal", role: .admin, designation: "Lead Mobile Architect", department: "Engineering"),
            User(id: "user_03", name: "Rahul Sharma", email: "rahul.s@workmate.internal", role: .member, designation: "Senior Backend Engineer", department: "Engineering"),
            User(id: "user_04", name: "Pooja Verma", email: "pooja.v@workmate.internal", role: .member, designation: "Senior Product Designer", department: "Design"),
            User(id: "user_05", name: "Amit Kumar", email: "amit.k@workmate.internal", role: .member, designation: "Lead QA Automation", department: "Quality Assurance")
        ]
        
        self.todayTasks = [
            TaskItem(
                id: "task_01",
                title: "Security Audit & JWT Hardening",
                description: "Review and enforce AES-256-GCM encryption and JWT token revocation.",
                status: .inProgress,
                priority: .high,
                dueDate: Calendar.current.date(byAdding: .day, value: 2, to: Date()),
                assignedTo: TaskUserRef(id: "user_01", name: "Abhishek Yadav")
            ),
            TaskItem(
                id: "task_02",
                title: "WorkMode Geo-Fence Verification",
                description: "Ensure GPS coordinate validation occurs only during punch-in/out events.",
                status: .todo,
                priority: .high,
                dueDate: Calendar.current.date(byAdding: .day, value: 1, to: Date()),
                assignedTo: TaskUserRef(id: "user_02", name: "Sneha Patel")
            ),
            TaskItem(
                id: "task_03",
                title: "MongoDB Index Optimizations",
                description: "Analyze slow query logs on task collection and add compound indexes.",
                status: .completed,
                priority: .medium,
                dueDate: Date(),
                assignedTo: TaskUserRef(id: "user_03", name: "Rahul Sharma")
            ),
            TaskItem(
                id: "task_04",
                title: "Workplace Leave Approval API",
                description: "Connect multi-level management escalation triggers.",
                status: .inProgress,
                priority: .high,
                dueDate: Calendar.current.date(byAdding: .day, value: 3, to: Date()),
                assignedTo: TaskUserRef(id: "user_04", name: "Pooja Verma")
            )
        ]
        
        self.recentActivities = [
            ActivityItem(employeeName: "Abhishek Yadav", action: "completed", taskTitle: "Security Audit & JWT Hardening"),
            ActivityItem(employeeName: "Sneha Patel", action: "in_progress", taskTitle: "Native iOS Attendance UI Flow"),
            ActivityItem(employeeName: "Rahul Sharma", action: "created", taskTitle: "MongoDB Index Optimizations"),
            ActivityItem(employeeName: "Pooja Verma", action: "status_changed", taskTitle: "Workplace Leave Approval API")
        ]
        
        self.totalTasksCount = 18
        self.pendingTasksCount = 5
        self.inProgressTasksCount = 8
        self.completedTasksCount = 5
        self.unreadMessagesCount = 3
        self.activeAnnouncementsCount = 2
        self.isCheckedIn = true
        self.currentAttendance = Attendance(
            id: "att_today_01",
            employeeId: "user_01",
            employeeName: "Abhishek Yadav",
            department: "Executive",
            designation: "CEO & Full Stack Architect",
            attendanceDate: "2026-09-16",
            checkInTime: Calendar.current.date(byAdding: .hour, value: -6, to: Date()),
            totalWorkingHours: 6.4,
            breakDuration: 0.5,
            attendanceStatus: .present,
            location: "San Francisco HQ - Floor 4",
            workMode: .office
        )
    }
    
    private func updateDateString() {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE, d MMM yyyy"
        self.currentDateString = formatter.string(from: Date())
    }
    
    private func setupRealtimeSubscriptions() {
        // React to task updates
        SocketManager.shared.taskUpdatedSubject
            .receive(on: DispatchQueue.main)
            .sink { [weak self] _ in
                Task {
                    await self?.fetchDashboardData()
                }
            }
            .store(in: &cancellables)
        
        // React to live attendance check-in/out
        SocketManager.shared.attendanceUpdatedSubject
            .receive(on: DispatchQueue.main)
            .sink { [weak self] updatedAttendance in
                self?.currentAttendance = updatedAttendance
                self?.isCheckedIn = updatedAttendance.isCurrentlyCheckedIn
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Fetch Data
    public func fetchDashboardData() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        
        // 1. Fetch Tasks
        do {
            let taskData: PaginatedTasksData = try await APIClient.shared.request(endpoint: .tasks(status: nil, priority: nil, search: nil, page: 1, limit: 10))
            let allTasks = taskData.tasks
            self.todayTasks = Array(allTasks.prefix(4))
            
            self.totalTasksCount = allTasks.count
            self.pendingTasksCount = allTasks.filter { $0.status == .todo }.count
            self.inProgressTasksCount = allTasks.filter { $0.status == .inProgress }.count
            self.completedTasksCount = allTasks.filter { $0.status == .completed }.count
            
            // Build dynamic activities from tasks
            if !allTasks.isEmpty {
                self.recentActivities = allTasks.prefix(6).map { task in
                    ActivityItem(
                        id: task.id,
                        employeeName: task.assignedTo?.name ?? "Team Member",
                        action: task.status.displayName,
                        taskTitle: task.title,
                        details: "Task is currently \(task.status.displayName)",
                        timestamp: task.updatedAt ?? Date()
                    )
                }
            }
        } catch {
            print("Dashboard task fetch fallback to default metrics: \(error)")
        }
        
        // 2. Fetch Team Members
        do {
            let responseData: UsersListData = try await APIClient.shared.request(endpoint: .users(search: nil, role: nil))
            self.teamMembers = Array(responseData.users.prefix(5))
        } catch {
            print("Dashboard team members fetch error: \(error)")
        }
        
        // 3. Fetch Attendance InfoAttendance
        do {
            let records: [Attendance] = try await APIClient.shared.request(endpoint: .attendance(date: nil, startDate: nil, endDate: nil, employeeId: nil))
            if let latest = records.first {
                self.currentAttendance = latest
                self.isCheckedIn = latest.isCurrentlyCheckedIn
                if let checkIn = latest.checkInTime {
                    let timeFormatter = DateFormatter()
                    timeFormatter.dateFormat = "hh:mm a"
                    self.checkInTimeString = timeFormatter.string(from: checkIn)
                }
            }
        } catch {
            print("Dashboard attendance fetch fallback: \(error)")
        }
        
        // 3. Fetch Team Members
        do {
            let employees: [User] = try await APIClient.shared.request(endpoint: .users(search: nil, role: nil))
            self.teamMembers = Array(employees.prefix(5))
        } catch {
            print("Dashboard employees fetch fallback: \(error)")
        }
        
        // 4. Fetch Conversations for unread counter
        do {
            let convos: [Conversation] = try await APIClient.shared.request(endpoint: .conversations(type: nil, search: nil))
            self.unreadMessagesCount = convos.reduce(0) { $0 + ($1.unreadCount ?? 0) }
        } catch {
            print("Dashboard conversations fetch fallback: \(error)")
        }
    }
    
    // MARK: - Quick Check In / Check Out Action
    public func toggleCheckInOut() async {
        if isCheckedIn {
            do {
                let updated: Attendance = try await APIClient.shared.request(endpoint: .checkOut, body: ["remarks": "Checked out from WorkMate iOS"])
                self.currentAttendance = updated
                self.isCheckedIn = false
            } catch {
                self.isCheckedIn = false
            }
        } else {
            do {
                let loc = LocationManager.shared.locationName
                let updated: Attendance = try await APIClient.shared.request(endpoint: .checkIn, body: ["location": loc, "workMode": selectedWorkMode])
                self.currentAttendance = updated
                self.isCheckedIn = true
                self.checkInTimeString = DateFormatter.localizedString(from: Date(), dateStyle: .none, timeStyle: .short)
            } catch {
                self.isCheckedIn = true
            }
        }
    }
}
