import Foundation

@MainActor
class ChatViewModel: ObservableObject {
    @Published var messages: [MessageItem] = []
    @Published var newMessageText: String = ""
    @Published var isLoading: Bool = false
    
    func fetchChatHistory() async {
        isLoading = true
        // Simulated initial team message history
        self.messages = [
            MessageItem(id: "1", senderId: "admin", senderName: "Admin", text: "Welcome to the team chat channel!", timestamp: "10:00 AM", isCurrentUser: false),
            MessageItem(id: "2", senderId: "user", senderName: "You", text: "Hi Admin! Checked in for today's shift.", timestamp: "10:02 AM", isCurrentUser: true)
        ]
        isLoading = false
    }
    
    func sendMessage() {
        guard !newMessageText.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        let newMsg = MessageItem(id: UUID().uuidString, senderId: "user", senderName: "You", text: newMessageText, timestamp: "Now", isCurrentUser: true)
        messages.append(newMsg)
        SocketManager.shared.sendMessage(text: newMessageText, channelId: "general")
        newMessageText = ""
    }
}
