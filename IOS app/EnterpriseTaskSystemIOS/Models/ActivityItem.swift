import Foundation

/// Activity log item representing team actions on tasks and workflow.
public struct ActivityItem: Identifiable, Codable, Equatable {
    public let id: String
    public let employeeName: String
    public let action: String
    public let taskTitle: String
    public let details: String?
    public let timestamp: Date
    
    public init(
        id: String = UUID().uuidString,
        employeeName: String,
        action: String,
        taskTitle: String,
        details: String? = nil,
        timestamp: Date = Date()
    ) {
        self.id = id
        self.employeeName = employeeName
        self.action = action
        self.taskTitle = taskTitle
        self.details = details
        self.timestamp = timestamp
    }
}
