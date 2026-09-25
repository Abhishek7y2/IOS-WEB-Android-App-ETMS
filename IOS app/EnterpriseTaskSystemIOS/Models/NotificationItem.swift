import Foundation

/// Core Notification model matching backend Notification schema.
public struct NotificationItem: Identifiable, Codable, Equatable, Hashable {
    public let id: String
    public let recipientId: String
    public var senderId: String?
    public var senderName: String?
    public var senderAvatar: String?
    public var type: NotificationType
    public var referenceId: String?
    public var message: String
    public var isRead: Bool
    public var createdAt: Date?
    
    public enum CodingKeys: String, CodingKey {
        case id = "_id"
        case recipientId, senderId, senderName, senderAvatar
        case type, referenceId, message, isRead, createdAt
    }
    
    public init(
        id: String,
        recipientId: String,
        senderId: String? = nil,
        senderName: String? = "System",
        senderAvatar: String? = nil,
        type: NotificationType = .system,
        referenceId: String? = nil,
        message: String,
        isRead: Bool = false,
        createdAt: Date? = nil
    ) {
        self.id = id
        self.recipientId = recipientId
        self.senderId = senderId
        self.senderName = senderName
        self.senderAvatar = senderAvatar
        self.type = type
        self.referenceId = referenceId
        self.message = message
        self.isRead = isRead
        self.createdAt = createdAt
    }
}

public enum NotificationType: String, Codable {
    case message = "message"
    case announcement = "announcement"
    case task = "task"
    case system = "system"
}
