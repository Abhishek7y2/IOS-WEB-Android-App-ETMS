import Foundation

/// Core Conversation model matching backend Conversation schema.
public struct Conversation: Identifiable, Codable, Equatable {
    public let id: String
    public var type: ConversationType
    public var subject: String
    public var groupName: String?
    public var groupAdmins: [String]?
    public var priority: String?
    public var participants: [String]
    public var participantNames: [String]?
    public var participantAvatars: [String]?
    public var lastMessage: String?
    public var lastMessageTime: Date?
    public var lastMessageSender: String?
    public var unreadCount: Int?
    public var isRead: Bool?
    public var isPinned: Bool?
    public var isArchived: Bool?
    public var createdBy: String?
    public var createdAt: Date?
    public var updatedAt: Date?
    
    public enum CodingKeys: String, CodingKey {
        case id = "_id"
        case type, subject, groupName, groupAdmins, priority
        case participants, participantNames, participantAvatars
        case lastMessage, lastMessageTime, lastMessageSender
        case unreadCount, isRead, isPinned, isArchived, createdBy, createdAt, updatedAt
    }
    
    public init(
        id: String,
        type: ConversationType = .direct,
        subject: String,
        groupName: String? = nil,
        groupAdmins: [String]? = nil,
        priority: String? = "medium",
        participants: [String] = [],
        participantNames: [String]? = nil,
        participantAvatars: [String]? = nil,
        lastMessage: String? = nil,
        lastMessageTime: Date? = nil,
        lastMessageSender: String? = nil,
        unreadCount: Int? = 0,
        isRead: Bool? = false,
        isPinned: Bool? = false,
        isArchived: Bool? = false,
        createdBy: String? = nil,
        createdAt: Date? = nil,
        updatedAt: Date? = nil
    ) {
        self.id = id
        self.type = type
        self.subject = subject
        self.groupName = groupName
        self.groupAdmins = groupAdmins
        self.priority = priority
        self.participants = participants
        self.participantNames = participantNames
        self.participantAvatars = participantAvatars
        self.lastMessage = lastMessage
        self.lastMessageTime = lastMessageTime
        self.lastMessageSender = lastMessageSender
        self.unreadCount = unreadCount
        self.isRead = isRead
        self.isPinned = isPinned
        self.isArchived = isArchived
        self.createdBy = createdBy
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
    
    @MainActor
    public var displayTitle: String {
        if type == .group, let name = groupName, !name.isEmpty {
            return name
        }
        if type == .direct, let names = participantNames, !names.isEmpty {
            // WhatsApp style: Only show the other person's name
            let currentUserName = AuthManager.shared.currentUser?.name ?? "Me"
            let otherNames = names.filter { $0 != currentUserName && $0 != "You" }
            if !otherNames.isEmpty {
                return otherNames.joined(separator: ", ")
            }
        }
        if let names = participantNames, !names.isEmpty {
            return names.joined(separator: ", ")
        }
        return subject
    }
}

public enum ConversationType: String, Codable, CaseIterable {
    case direct = "direct"
    case group = "group"
    case announcement = "announcement"
    case broadcast = "broadcast"
}

public struct CreateConversationRequest: Encodable {
    public let type: String
    public let subject: String
    public let groupName: String?
    public let participants: [String]
    public let content: String?
}

public struct CreateGroupRequest: Encodable {
    public let groupName: String
    public let participants: [String]
    public let initialMessage: String?
}

