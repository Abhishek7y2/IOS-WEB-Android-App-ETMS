import Foundation

/// Detailed validation error mapping
public struct APIValidationError: Decodable {
    public let field: String?
    public let message: String
}

/// Standard backend JSON response envelope: `{ success: true, message: "...", data: T }`
public struct APIResponse<T: Decodable>: Decodable {
    public let success: Bool?
    public let message: String?
    public let data: T?
    public let error: String?
    public let errors: [APIValidationError]?
}

/// Simple empty response for operations returning only `{ success: true, message: "..." }`
public struct EmptyData: Decodable {}

/// Standard pagination metadata wrapper
public struct PaginationMetadata: Codable {
    public let page: Int?
    public let limit: Int?
    public let total: Int?
    public let totalPages: Int?
}

/// Paginated list response wrapper for tasks
public struct PaginatedTasksData: Decodable {
    public let tasks: [TaskItem]
    public let pagination: PaginationMetadata?
}

/// Single task response wrapper
public struct SingleTaskData: Decodable {
    public let task: TaskItem
}

/// Users list response wrapper
public struct UsersListData: Decodable {
    public let users: [User]
}

/// Single User response wrapper
public struct SingleUserData: Decodable {
    public let user: User
}

/// Messages list response wrapper
public struct MessagesResponseData: Decodable {
    public let messages: [MessageItem]
    public let total: Int?
}
