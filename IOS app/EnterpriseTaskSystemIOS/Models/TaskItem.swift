import Foundation

struct User: Identifiable, Codable {
    let id: String
    let name: String
    let email: String
    let role: String
    var token: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case name, email, role, token
    }
}

struct TaskItem: Identifiable, Codable {
    let id: String
    let title: String
    let description: String?
    var status: TaskStatus
    let priority: TaskPriority
    let assigneeId: String?
    var subtasks: [Subtask]?
    let createdAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case title, description, status, priority, assigneeId, subtasks, createdAt
    }
}

enum TaskStatus: String, Codable, CaseIterable {
    case todo = "todo"
    case inProgress = "in_progress"
    case review = "review"
    case completed = "completed"
}

enum TaskPriority: String, Codable {
    case low = "low"
    case medium = "medium"
    case high = "high"
    case urgent = "urgent"
}

struct Subtask: Identifiable, Codable {
    var id: String { title }
    let title: String
    var isCompleted: Bool
}
