import Foundation

/// Core Message model matching backend Message schema.
public struct MessageItem: Identifiable, Codable, Equatable {
    public let id: String
    public var conversationId: String
    public var senderId: String
    public var senderName: String
    public var senderAvatar: String?
    public var content: String
    public var timestamp: Date
    public var status: String?
    public var attachments: [MessageAttachment]?
    public var isEdited: Bool?
    public var replyToId: String?
    public var createdAt: Date?
    
    public enum CodingKeys: String, CodingKey {
        case id = "_id"
        case conversationId, senderId, senderName, senderAvatar
        case content, timestamp, status, attachments, isEdited, replyToId, createdAt
    }
    
    public init(
        id: String,
        conversationId: String,
        senderId: String,
        senderName: String,
        senderAvatar: String? = nil,
        content: String,
        timestamp: Date = Date(),
        status: String? = "sent",
        attachments: [MessageAttachment]? = nil,
        isEdited: Bool? = false,
        replyToId: String? = nil,
        createdAt: Date? = nil
    ) {
        self.id = id
        self.conversationId = conversationId
        self.senderId = senderId
        self.senderName = senderName
        self.senderAvatar = senderAvatar
        self.content = content
        self.timestamp = timestamp
        self.status = status
        self.attachments = attachments
        self.isEdited = isEdited
        self.replyToId = replyToId
        self.createdAt = createdAt
    }
}

public struct MessageAttachment: Identifiable, Codable, Equatable {
    public var id: String { name + url }
    public let name: String
    public let type: String
    public let url: String
    public let size: Int?
}
