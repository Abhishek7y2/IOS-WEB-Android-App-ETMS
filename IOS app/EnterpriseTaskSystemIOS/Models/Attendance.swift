import Foundation

/// Core Attendance Record model matching backend Attendance schema.
public struct Attendance: Identifiable, Codable, Equatable {
    public let id: String
    public let employeeId: String?
    public var employeeName: String
    public var employeeAvatar: String?
    public var department: String?
    public var designation: String?
    public var attendanceDate: String // YYYY-MM-DD
    public var checkInTime: Date?
    public var checkOutTime: Date?
    public var breakStart: Date?
    public var breakEnd: Date?
    public var totalWorkingHours: Double?
    public var breakDuration: Double?
    public var attendanceStatus: AttendanceStatus
    public var isLate: Bool?
    public var lateByMinutes: Int?
    public var location: String?
    public var workMode: WorkMode?
    public var remarks: String?
    
    public enum CodingKeys: String, CodingKey {
        case id = "_id"
        case employeeId, employeeName, employeeAvatar, department, designation
        case attendanceDate, checkInTime, checkOutTime, breakStart, breakEnd
        case totalWorkingHours, breakDuration, attendanceStatus, isLate
        case lateByMinutes, location, workMode, remarks
    }
    
    public init(
        id: String,
        employeeId: String? = nil,
        employeeName: String,
        employeeAvatar: String? = nil,
        department: String? = nil,
        designation: String? = nil,
        attendanceDate: String,
        checkInTime: Date? = nil,
        checkOutTime: Date? = nil,
        breakStart: Date? = nil,
        breakEnd: Date? = nil,
        totalWorkingHours: Double? = 0,
        breakDuration: Double? = 0,
        attendanceStatus: AttendanceStatus = .present,
        isLate: Bool? = false,
        lateByMinutes: Int? = 0,
        location: String? = nil,
        workMode: WorkMode? = .office,
        remarks: String? = nil
    ) {
        self.id = id
        self.employeeId = employeeId
        self.employeeName = employeeName
        self.employeeAvatar = employeeAvatar
        self.department = department
        self.designation = designation
        self.attendanceDate = attendanceDate
        self.checkInTime = checkInTime
        self.checkOutTime = checkOutTime
        self.breakStart = breakStart
        self.breakEnd = breakEnd
        self.totalWorkingHours = totalWorkingHours
        self.breakDuration = breakDuration
        self.attendanceStatus = attendanceStatus
        self.isLate = isLate
        self.lateByMinutes = lateByMinutes
        self.location = location
        self.workMode = workMode
        self.remarks = remarks
    }
    
    public var isCurrentlyCheckedIn: Bool {
        return checkInTime != nil && checkOutTime == nil
    }
    
    public var isOnBreak: Bool {
        return breakStart != nil && breakEnd == nil
    }
    
    public var formattedWorkHours: String {
        let hours = Int(totalWorkingHours ?? 0)
        let minutes = Int(((totalWorkingHours ?? 0) - Double(hours)) * 60)
        return String(format: "%02d:%02d", hours, minutes)
    }
    
    public var formattedBreakHours: String {
        let hours = Int(breakDuration ?? 0)
        let minutes = Int(((breakDuration ?? 0) - Double(hours)) * 60)
        return String(format: "%02d:%02d", hours, minutes)
    }
}

public enum AttendanceStatus: String, Codable {
    case present = "Present"
    case absent = "Absent"
    case late = "Late"
    case halfDay = "Half Day"
    case workFromHome = "Work From Home"
    case onSite = "On-Site Visit"
    case holiday = "Holiday"
    case weekend = "Weekend"
    case leave = "Leave"
}

public enum WorkMode: String, Codable, CaseIterable {
    case office = "Office"
    case workFromHome = "Work From Home"
    case hybrid = "Hybrid"
    case onSite = "On-Site Visit"
}

public struct AttendanceAnalytics: Codable {
    public let presentDays: Int?
    public let absentDays: Int?
    public let totalHours: Double?
    public let averageHoursPerDay: Double?
}
