import Foundation

public enum APIError: LocalizedError, Equatable {
    case invalidURL
    case noInternet
    case unauthorized
    case forbidden
    case notFound
    case serverError(statusCode: Int, message: String)
    case decodingError(String)
    case networkFailure(String)
    case custom(String)
    
    public var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "The requested URL is invalid."
        case .noInternet:
            return "No internet connection. Please check your network."
        case .unauthorized:
            return "Your session has expired. Please sign in again."
        case .forbidden:
            return "You do not have permission to perform this action."
        case .notFound:
            return "The requested resource was not found."
        case .serverError(_, let message):
            return message.isEmpty ? "A server error occurred. Please try again later." : message
        case .decodingError(let detail):
            return "Failed to parse data: \(detail)"
        case .networkFailure(let msg):
            return msg
        case .custom(let msg):
            return msg
        }
    }
}
