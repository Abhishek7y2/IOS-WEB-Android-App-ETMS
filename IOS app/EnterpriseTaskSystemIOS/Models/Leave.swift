import Foundation

/// Core Leave Request model matching backend Leave schema.
public struct Leave: Identifiable, Codable, Equatable {
    public let id: String
    public let employeeId: String?
    public var employeeName: String
    public var employeeAvatar: String?
    public var department: String?
    public var designation: String?
    public var leaveType: LeaveType
    public var startDate: Date
    public var endDate: Date
    public var totalDays: Double
    public var halfDay: Bool
    public var halfDaySession: String?
    public var reason: String
    public var status: LeaveStatus
    public var rejectionReason: String?
    public var createdAt: Date?
    
    public enum CodingKeys: String, CodingKey {
        case id = "_id"
        case employeeId, employeeName, employeeAvatar, department, designation
        case leaveType, startDate, endDate, totalDays, halfDay, halfDaySession
        case reason, status, rejectionReason, createdAt
    }
    
    public init(
        id: String,
        employeeId: String? = nil,
        employeeName: String,
        employeeAvatar: String? = nil,
        department: String? = nil,
        designation: String? = nil,
        leaveType: LeaveType,
        startDate: Date,
        endDate: Date,
        totalDays: Double,
        halfDay: Bool = false,
        halfDaySession: String? = nil,
        reason: String,
        status: LeaveStatus = .pending,
        rejectionReason: String? = nil,
        createdAt: Date? = nil
    ) {
        self.id = id
        self.employeeId = employeeId
        self.employeeName = employeeName
        self.employeeAvatar = employeeAvatar
        self.department = department
        self.designation = designation
        self.leaveType = leaveType
        self.startDate = startDate
        self.endDate = endDate
        self.totalDays = totalDays
        self.halfDay = halfDay
        self.halfDaySession = halfDaySession
        self.reason = reason
        self.status = status
        self.rejectionReason = rejectionReason
        self.createdAt = createdAt
    }
}

public enum LeaveType: String, Codable, CaseIterable {
    case annual = "Annual Leave"
    case casual = "Casual Leave"
    case sick = "Sick Leave"
    case earned = "Earned Leave"
    case compensatory = "Compensatory Leave"
    case unpaid = "Unpaid Leave"
    case workFromHome = "Work From Home"
    
    public var displayName: String {
        return rawValue
    }
}

public enum LeaveStatus: String, Codable {
    case pending = "Pending"
    case approved = "Approved"
    case rejected = "Rejected"
    case cancelled = "Cancelled"
    case withdrawn = "Withdrawn"
}

public struct LeaveBalance: Codable, Equatable {
    public let employeeId: String?
    public let year: Int?
    public let balances: [LeaveBalanceItem]?
}

public struct LeaveBalanceItem: Codable, Equatable, Identifiable {
    public var id: String { leaveType }
    public let leaveType: String
    public let total: Double
    public let used: Double
    public let remaining: Double
}

public struct ApplyLeaveRequest: Encodable {
    public let leaveType: String
    public let startDate: String
    public let endDate: String
    public let totalDays: Double
    public let halfDay: Bool
    public let reason: String
}

