import Foundation
import Combine

/// Production Socket.IO / WebSocket Realtime Client for live updates.
public final class SocketManager: ObservableObject {
    public static let shared = SocketManager()
    
    @Published public private(set) var connectionState: SocketConnectionState = .disconnected
    
    // Combine event streams for reactive UI updates
    public let messageCreatedSubject = PassthroughSubject<MessageItem, Never>()
    public let notificationCreatedSubject = PassthroughSubject<NotificationItem, Never>()
    public let taskUpdatedSubject = PassthroughSubject<TaskItem, Never>()
    public let attendanceUpdatedSubject = PassthroughSubject<Attendance, Never>()
    public let forceLogoutSubject = PassthroughSubject<Void, Never>()
    
    private var webSocketTask: URLSessionWebSocketTask?
    private var isReconnecting = false
    private var authToken: String?
    
    #if targetEnvironment(simulator)
    private let serverURLString = "ws://localhost:5000/socket.io/?EIO=4&transport=websocket"
    #else
    private let serverURLString = "ws://localhost:5000/socket.io/?EIO=4&transport=websocket"
    #endif
    
    private init() {}
    
    // MARK: - Connect
    public func connect(token: String? = nil) {
        let activeToken = token ?? KeychainService.shared.getAccessToken()
        guard let validToken = activeToken, !validToken.isEmpty else {
            self.connectionState = .disconnected
            return
        }
        self.authToken = validToken
        
        guard let url = URL(string: "\(serverURLString)&token=\(validToken)") else {
            self.connectionState = .error("Invalid WebSocket URL")
            return
        }
        
        disconnect()
        self.connectionState = .connecting
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(validToken)", forHTTPHeaderField: "Authorization")
        
        let session = URLSession(configuration: .default)
        webSocketTask = session.webSocketTask(with: request)
        webSocketTask?.resume()
        
        self.connectionState = .connected
        listenForMessages()
    }
    
    // MARK: - Dynamic Room Join
    public func joinConversation(conversationId: String) {
        guard !conversationId.isEmpty else { return }
        // Socket.IO message format: 42["join_conversation", "conversationId"]
        let payload = "42[\"join_conversation\", \"\(conversationId)\"]"
        let message = URLSessionWebSocketTask.Message.string(payload)
        webSocketTask?.send(message) { error in
            if let error = error {
                print("Failed to join conversation room: \(error)")
            }
        }
    }
    
    // MARK: - Listen for incoming packets
    private func listenForMessages() {
        webSocketTask?.receive { [weak self] result in
            guard let self = self else { return }
            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    self.handleIncomingPacket(text)
                case .data(let data):
                    if let text = String(data: data, encoding: .utf8) {
                        self.handleIncomingPacket(text)
                    }
                @unknown default:
                    break
                }
                // Continue listening
                self.listenForMessages()
                
            case .failure(let error):
                print("WebSocket receive error: \(error.localizedDescription)")
                DispatchQueue.main.async {
                    self.connectionState = .error(error.localizedDescription)
                }
            }
        }
    }
    
    // MARK: - Parse and publish packet
    private func handleIncomingPacket(_ text: String) {
        // Handle Socket.IO Ping/Pong (Engine.IO)
        if text == "2" {
            // Send pong back
            webSocketTask?.send(.string("3")) { _ in }
            return
        }
        
        // Handle Event Message packet (starts with 42)
        if text.starts(with: "42") {
            let jsonString = String(text.dropFirst(2))
            guard let data = jsonString.data(using: .utf8) else { return }
            
            // Expected format: ["eventName", { envelope }]
            if let jsonArray = try? JSONSerialization.jsonObject(with: data) as? [Any],
               jsonArray.count >= 2,
               let eventName = jsonArray[0] as? String,
               let payloadDict = jsonArray[1] as? [String: Any],
               let payloadData = try? JSONSerialization.data(withJSONObject: payloadDict) {
                
                let decoder = JSONDecoder()
                decoder.dateDecodingStrategy = .iso8601
                
                DispatchQueue.main.async {
                    switch eventName {
                    case SocketEvent.messageCreated.rawValue:
                        if let env = try? decoder.decode(RealtimeEventEnvelope<MessageItem>.self, from: payloadData),
                           let item = env.data {
                            self.messageCreatedSubject.send(item)
                        } else if let item = try? decoder.decode(MessageItem.self, from: payloadData) {
                            self.messageCreatedSubject.send(item)
                        }
                        
                    case SocketEvent.notificationCreated.rawValue:
                        if let env = try? decoder.decode(RealtimeEventEnvelope<NotificationItem>.self, from: payloadData),
                           let item = env.data {
                            self.notificationCreatedSubject.send(item)
                        } else if let item = try? decoder.decode(NotificationItem.self, from: payloadData) {
                            self.notificationCreatedSubject.send(item)
                        }
                        
                    case SocketEvent.taskCreated.rawValue, SocketEvent.taskUpdated.rawValue:
                        if let env = try? decoder.decode(RealtimeEventEnvelope<TaskItem>.self, from: payloadData),
                           let item = env.data {
                            self.taskUpdatedSubject.send(item)
                        }
                        
                    case SocketEvent.attendanceCheckedIn.rawValue, SocketEvent.attendanceCheckedOut.rawValue:
                        if let env = try? decoder.decode(RealtimeEventEnvelope<Attendance>.self, from: payloadData),
                           let item = env.data {
                            self.attendanceUpdatedSubject.send(item)
                        }
                        
                    case "auth.force_logout":
                        self.forceLogoutSubject.send(())
                        
                    default:
                        break
                    }
                }
            }
        }
    }
    
    // MARK: - Disconnect
    public func disconnect() {
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        webSocketTask = nil
        self.connectionState = .disconnected
    }
}
