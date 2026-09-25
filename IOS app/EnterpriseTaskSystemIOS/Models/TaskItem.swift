import Foundation

/// Core Task model aligned with backend Task schema.
public struct TaskItem: Identifiable, Codable, Equatable {
    public let id: String
    public var title: String
    public var description: String
    public var status: TaskStatus
    public var priority: TaskPriority
    public var dueDate: Date?
    public var assignedTo: TaskUserRef?
    public var assignedBy: TaskUserRef?
    public var attachments: [TaskAttachment]?
    public var isArchived: Bool?
    public var createdAt: Date?
    public var updatedAt: Date?
    
    public enum CodingKeys: String, CodingKey {
        case id = "_id"
        case title, description, status, priority, dueDate
        case assignedTo, assignedBy, attachments, isArchived, createdAt, updatedAt
    }
    
    public init(
        id: String,
        title: String,
        description: String,
        status: TaskStatus = .todo,
        priority: TaskPriority = .medium,
        dueDate: Date? = nil,
        assignedTo: TaskUserRef? = nil,
        assignedBy: TaskUserRef? = nil,
        attachments: [TaskAttachment]? = nil,
        isArchived: Bool? = false,
        createdAt: Date? = nil,
        updatedAt: Date? = nil
    ) {
        self.id = id
        self.title = title
        self.description = description
        self.status = status
        self.priority = priority
        self.dueDate = dueDate
        self.assignedTo = assignedTo
        self.assignedBy = assignedBy
        self.attachments = attachments
        self.isArchived = isArchived
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
    
    /// Estimated progress based on status
    public var progressPercent: Double {
        switch status {
        case .todo: return 0.0
        case .inProgress: return 0.65
        case .completed: return 1.0
        }
    }
}

public enum TaskStatus: String, Codable, CaseIterable {
    case todo = "todo"
    case inProgress = "in_progress"
    case completed = "completed"
    
    public var displayName: String {
        switch self {
        case .todo: return "Pending"
        case .inProgress: return "In Progress"
        case .completed: return "Completed"
        }
    }
}

public enum TaskPriority: String, Codable, CaseIterable {
    case low = "low"
    case medium = "medium"
    case high = "high"
    case critical = "critical"
    
    public var displayName: String {
        switch self {
        case .low: return "Low"
        case .medium: return "Medium"
        case .high: return "High"
        case .critical: return "Critical"
        }
    }
    
    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        let value = try container.decode(String.self)
        if let priority = TaskPriority(rawValue: value) {
            self = priority
        } else if value == "critical" {
            self = .high
        } else {
            self = .medium
        }
    }
}

public struct TaskUserRef: Codable, Equatable {
    public let id: String?
    public let name: String?
    public let email: String?
    public let profilePicture: String?
    
    public enum CodingKeys: String, CodingKey {
        case id = "_id"
        case name, email, profilePicture
    }
    
    public init(from decoder: Decoder) throws {
        // Can be a full object or just a string ID
        if let container = try? decoder.container(keyedBy: CodingKeys.self) {
            id = try? container.decode(String.self, forKey: .id)
            name = try? container.decode(String.self, forKey: .name)
            email = try? container.decode(String.self, forKey: .email)
            profilePicture = try? container.decode(String.self, forKey: .profilePicture)
        } else if let singleContainer = try? decoder.singleValueContainer(),
                  let stringId = try? singleContainer.decode(String.self) {
            id = stringId
            name = nil
            email = nil
            profilePicture = nil
        } else {
            id = nil
            name = nil
            email = nil
            profilePicture = nil
        }
    }
    
    public init(id: String?, name: String?, email: String? = nil, profilePicture: String? = nil) {
        self.id = id
        self.name = name
        self.email = email
        self.profilePicture = profilePicture
    }
}

public struct TaskAttachment: Codable, Equatable, Identifiable {
    public var id: String { name + url }
    public let name: String
    public let url: String
    public let size: Int?
    public let type: String?
}

public struct CreateTaskRequest: Encodable {
    public let title: String
    public let description: String
    public let priority: String
    public let dueDate: String
    public let assignedTo: String
}
// Force recompilation

