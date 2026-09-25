import Foundation
import SwiftUI
import Combine

/// View Model for managing leave balances, types, and submission.
@MainActor
public final class LeaveViewModel: ObservableObject {
    @Published public var availableBalanceDays: Int = 14
    @Published public var leaveTypesBreakdown: [(name: String, remaining: Int, used: Int, total: Int, color: Color)] = [
        ("Annual Leave", 8, 2, 10, AppColors.accentPurple),
        ("Casual Leave", 4, 6, 10, AppColors.primary),
        ("Sick Leave", 2, 8, 10, AppColors.warning),
        ("Compensatory", 0, 0, 0, AppColors.danger)
    ]
    @Published public var myLeaves: [Leave] = []
    @Published public var pendingLeaves: [Leave] = []
    
    @Published public var isLoading: Bool = false
    @Published public var errorMessage: String?
    @Published public var showApplySheet: Bool = false
    
    public init() {
        populateDefaultLeaves()
    }
    
    private func populateDefaultLeaves() {
        self.myLeaves = [
            Leave(
                id: "leave_01",
                employeeName: "Abhishek Yadav",
                leaveType: .annual,
                startDate: Calendar.current.date(byAdding: .day, value: 10, to: Date())!,
                endDate: Calendar.current.date(byAdding: .day, value: 12, to: Date())!,
                totalDays: 3.0,
                reason: "Annual family retreat",
                status: .approved
            ),
            Leave(
                id: "leave_02",
                employeeName: "Abhishek Yadav",
                leaveType: .casual,
                startDate: Calendar.current.date(byAdding: .day, value: -20, to: Date())!,
                endDate: Calendar.current.date(byAdding: .day, value: -19, to: Date())!,
                totalDays: 1.0,
                reason: "Personal home maintenance",
                status: .approved
            )
        ]
        
        self.pendingLeaves = [
            Leave(
                id: "leave_03",
                employeeId: "user_02",
                employeeName: "Sneha Patel",
                department: "Engineering",
                designation: "Lead Mobile Architect",
                leaveType: .annual,
                startDate: Calendar.current.date(byAdding: .day, value: 5, to: Date())!,
                endDate: Calendar.current.date(byAdding: .day, value: 7, to: Date())!,
                totalDays: 3.0,
                reason: "Tech conference attendance & travel",
                status: .pending
            ),
            Leave(
                id: "leave_04",
                employeeId: "user_03",
                employeeName: "Rahul Sharma",
                department: "Engineering",
                designation: "Senior Backend Engineer",
                leaveType: .sick,
                startDate: Calendar.current.date(byAdding: .day, value: 2, to: Date())!,
                endDate: Calendar.current.date(byAdding: .day, value: 3, to: Date())!,
                totalDays: 2.0,
                reason: "Severe viral fever and medical recovery",
                status: .pending
            )
        ]
    }
    
    // MARK: - Fetch Balance & Leaves
    public func fetchLeaveData() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        
        // Fetch Balance
        do {
            let balance: LeaveBalance = try await APIClient.shared.request(endpoint: .leaveBalance(year: 2026))
            if let items = balance.balances, !items.isEmpty {
                let totalRemaining = items.reduce(0) { $0 + Int($1.remaining) }
                self.availableBalanceDays = totalRemaining
                
                self.leaveTypesBreakdown = items.map { item in
                    var col = AppColors.primary
                    if item.leaveType.contains("Annual") { col = AppColors.accentPurple }
                    else if item.leaveType.contains("Sick") { col = AppColors.warning }
                    else if item.leaveType.contains("Compensatory") { col = AppColors.danger }
                    return (item.leaveType, Int(item.remaining), Int(item.used), Int(item.total), col)
                }
            }
        } catch {
            print("Leave balance fallback: \(error)")
        }
        
        // Fetch My Requests
        guard let currentUser = AuthManager.shared.currentUser else { return }
        let currentUserId: String? = currentUser.id
        let isAdmin = currentUser.isAdmin
        
        do {
            if let employeeId = currentUserId {
                let myLeavesList: [Leave] = try await APIClient.shared.request(endpoint: .leaves(status: nil, employeeId: employeeId))
                self.myLeaves = myLeavesList
            }
        } catch {
            print("My leaves list error: \(error)")
        }
        
        // Fetch Team Pending Requests (Only for Admin)
        if isAdmin {
            do {
                let pendingList: [Leave] = try await APIClient.shared.request(endpoint: .leaves(status: "pending", employeeId: nil))
                self.pendingLeaves = pendingList
            } catch {
                print("Pending leaves list error: \(error)")
            }
        } else {
            self.pendingLeaves = []
        }
    }
    
    // MARK: - Approve or Reject Leave (Admin)
    public func updateLeaveStatus(leaveId: String, status: String, rejectionReason: String? = nil) async -> Bool {
        do {
            var body: [String: String] = ["status": status]
            if let reason = rejectionReason, !reason.isEmpty {
                body["rejectionReason"] = reason
            }
            let updated: Leave = try await APIClient.shared.request(endpoint: .updateLeaveStatus(id: leaveId), body: body)
            if let index = myLeaves.firstIndex(where: { $0.id == leaveId }) {
                myLeaves[index] = updated
            }
            
            // Simulate notification to employee for demo purposes
            if let targetLeave = pendingLeaves.first(where: { $0.id == leaveId }) {
                simulateLeaveNotification(leave: targetLeave, status: status)
            }
            
            pendingLeaves.removeAll(where: { $0.id == leaveId })
            return true
        } catch {
            // Optimistic local update
            if let index = myLeaves.firstIndex(where: { $0.id == leaveId }) {
                if let newStatus = LeaveStatus(rawValue: status) {
                    myLeaves[index].status = newStatus
                }
            }
            
            // Simulate notification to employee for demo purposes
            if let targetLeave = pendingLeaves.first(where: { $0.id == leaveId }) {
                simulateLeaveNotification(leave: targetLeave, status: status)
            }
            
            pendingLeaves.removeAll(where: { $0.id == leaveId })
            return true
        }
    }
    
    private func simulateLeaveNotification(leave: Leave, status: String) {
        let statusString = status == "approved" ? "approved" : "rejected"
        let msg = "Your \(leave.leaveType.rawValue) leave request for \(String(format: "%.1f", leave.totalDays)) days has been \(statusString)."
        
        let notif = NotificationItem(
            id: UUID().uuidString,
            recipientId: leave.employeeId ?? "unknown",
            type: .system,
            message: msg,
            isRead: false,
            createdAt: Date()
        )
        // Dispatch to socket manager so the UI updates
        SocketManager.shared.notificationCreatedSubject.send(notif)
    }
    
    // MARK: - Apply for Leave
    public func applyLeave(
        leaveType: LeaveType,
        startDate: Date,
        endDate: Date,
        totalDays: Double,
        halfDay: Bool,
        reason: String
    ) async -> Bool {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let body = ApplyLeaveRequest(
                leaveType: leaveType.rawValue,
                startDate: ISO8601DateFormatter().string(from: startDate),
                endDate: ISO8601DateFormatter().string(from: endDate),
                totalDays: totalDays,
                halfDay: halfDay,
                reason: reason
            )
            let created: Leave = try await APIClient.shared.request(endpoint: .applyLeave, body: body)
            self.myLeaves.insert(created, at: 0)
            return true
        } catch {
            self.errorMessage = error.localizedDescription
            return false
        }
    }
}
