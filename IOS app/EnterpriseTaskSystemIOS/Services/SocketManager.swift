import Foundation

class SocketManager: ObservableObject {
    static let shared = SocketManager()
    @Published var isConnected: Bool = false
    @Published var latestMessage: MessageItem?
    
    private init() {}
    
    func connect() {
        // Connects to Node.js Socket.IO server at ws://localhost:5000
        guard let token = KeychainService.shared.getToken() else { return }
        print("Connecting Socket.IO with token: \(token)")
        self.isConnected = true
    }
    
    func sendMessage(text: String, channelId: String) {
        print("Sending message via socket: \(text)")
    }
    
    func disconnect() {
        self.isConnected = false
    }
}
