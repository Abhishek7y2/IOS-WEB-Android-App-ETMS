import Foundation

/// Realtime Socket Event envelope matching backend contract: `EventEnvelope<T>`
public struct RealtimeEventEnvelope<T: Codable>: Codable {
    public let eventId: String
    public let event: String
    public let version: Int?
    public let timestamp: String?
    public let organizationId: String?
    public let actorId: String?
    public let data: T?
}

public enum SocketEvent: String {
    case taskCreated = "task.created"
    case taskUpdated = "task.updated"
    case taskDeleted = "task.deleted"
    case taskAssigned = "task.assigned"
    
    case leaveCreated = "leave.created"
    case leaveApproved = "leave.approved"
    case leaveRejected = "leave.rejected"
    
    case attendanceCheckedIn = "attendance.checked_in"
    case attendanceCheckedOut = "attendance.checked_out"
    
    case announcementCreated = "announcement.created"
    case messageCreated = "message.created"
    case notificationCreated = "notification.created"
    
    case realtimeEvent = "realtime.event"
}

public enum SocketConnectionState {
    case disconnected
    case connecting
    case connected
    case error(String)
}
