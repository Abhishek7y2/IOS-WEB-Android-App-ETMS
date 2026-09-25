import Foundation

/// Production-grade API Client using Swift concurrency (async/await)
public final class APIClient {
    public static let shared = APIClient()
    
    /// Base API URL pointing to the Node.js Express Backend
    #if targetEnvironment(simulator)
    public var baseURLString = "http://localhost:5000/api"
    #else
    // Default localhost or update to your LAN IP (e.g. http://192.168.1.x:5000/api)
    public var baseURLString = "http://localhost:5000/api"
    #endif
    
    private let session: URLSession
    private let jsonDecoder: JSONDecoder
    private let jsonEncoder: JSONEncoder
    
    private init() {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 20.0
        configuration.timeoutIntervalForResource = 60.0
        self.session = URLSession(configuration: configuration)
        
        self.jsonDecoder = JSONDecoder()
        // Formatter for ISO 8601 timestamps
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        self.jsonDecoder.dateDecodingStrategy = .custom { decoder -> Date in
            let container = try decoder.singleValueContainer()
            let dateStr = try container.decode(String.self)
            if let date = formatter.date(from: dateStr) {
                return date
            }
            let standardIso = ISO8601DateFormatter()
            if let date = standardIso.date(from: dateStr) {
                return date
            }
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Invalid date format: \(dateStr)")
        }
        
        self.jsonEncoder = JSONEncoder()
        self.jsonEncoder.dateEncodingStrategy = .iso8601
    }
    
    // MARK: - Execute Request
    public func request<T: Decodable>(
        endpoint: APIEndpoint,
        body: (any Encodable)? = nil,
        tokenOverride: String? = nil
    ) async throws -> T {
        // Build URL
        guard var components = URLComponents(string: "\(baseURLString)\(endpoint.path)") else {
            throw APIError.invalidURL
        }
        
        if let queryItems = endpoint.queryItems {
            components.queryItems = queryItems
        }
        
        guard let url = components.url else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        // Attach Bearer Token if available
        let token = tokenOverride ?? KeychainService.shared.getAccessToken()
        if let token = token, !token.isEmpty {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        // Encode Body
        if let body = body {
            do {
                request.httpBody = try jsonEncoder.encode(AnyEncodable(body))
            } catch {
                throw APIError.custom("Failed to encode request body: \(error.localizedDescription)")
            }
        }
        
        // Perform Network Request
        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch let urlError as URLError {
            if urlError.code == .notConnectedToInternet || urlError.code == .networkConnectionLost {
                throw APIError.noInternet
            }
            throw APIError.networkFailure(urlError.localizedDescription)
        } catch {
            throw APIError.networkFailure(error.localizedDescription)
        }
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.networkFailure("Invalid HTTP response.")
        }
        
        // Handle HTTP Status Codes
        switch httpResponse.statusCode {
        case 200...299:
            // First attempt to decode using standard backend envelope: APIResponse<T>
            if let envelope = try? jsonDecoder.decode(APIResponse<T>.self, from: data), let resultData = envelope.data {
                return resultData
            }
            
            // If T is EmptyData or Decodable root directly
            if let directResult = try? jsonDecoder.decode(T.self, from: data) {
                return directResult
            }
            
            // If T is EmptyData and success was true
            if T.self == EmptyData.self {
                return EmptyData() as! T
            }
            
            throw APIError.decodingError("Unable to decode \(T.self) from response envelope.")
            
        case 401:
            if endpoint.path != "/auth/refresh" {
                let refreshSuccess = await AuthManager.shared.refreshToken()
                if refreshSuccess {
                    return try await self.request(endpoint: endpoint, body: body)
                } else {
                    await MainActor.run {
                        AuthManager.shared.logout()
                    }
                }
            }
            
            var serverMessage = ""
            if let errorEnvelope = try? jsonDecoder.decode(APIResponse<EmptyData>.self, from: data) {
                serverMessage = errorEnvelope.message ?? errorEnvelope.error ?? ""
            }
            if !serverMessage.isEmpty && serverMessage != "Unauthorized access" {
                throw APIError.custom(serverMessage)
            }
            throw APIError.unauthorized
        case 403:
            throw APIError.forbidden
        case 404:
            throw APIError.notFound
        default:
            // Parse error message from server envelope if present
            var serverMessage = ""
            if let errorEnvelope = try? jsonDecoder.decode(APIResponse<EmptyData>.self, from: data) {
                if let detailedErrors = errorEnvelope.errors, !detailedErrors.isEmpty {
                    // Combine all specific field errors into one helpful string
                    serverMessage = detailedErrors.map { $0.message }.joined(separator: "\n")
                } else {
                    serverMessage = errorEnvelope.message ?? errorEnvelope.error ?? ""
                }
            }
            if !serverMessage.isEmpty {
                throw APIError.custom(serverMessage)
            }
            throw APIError.serverError(statusCode: httpResponse.statusCode, message: "Server returned \(httpResponse.statusCode)")
        }
    }
}

// Helper wrapper for type-erased encodable
private struct AnyEncodable: Encodable {
    private let encodeFunc: (Encoder) throws -> Void
    
    init<T: Encodable>(_ encodable: T) {
        self.encodeFunc = encodable.encode
    }
    
    func encode(to encoder: Encoder) throws {
        try encodeFunc(encoder)
    }
}
