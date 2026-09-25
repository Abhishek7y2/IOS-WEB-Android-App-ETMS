import Foundation
import SwiftUI
import Combine

public enum MessageCategory: String, CaseIterable {
    case inbox = "Inbox"
    case announcements = "Announcements"
}

/// View Model for Employee-to-Employee Communication, Conversations, and Realtime messaging.
@MainActor
public final class CommunicationViewModel: ObservableObject {
    @Published public var conversations: [Conversation] = []
    @Published public var filteredConversations: [Conversation] = []
    @Published public var searchText: String = ""
    @Published public var selectedCategory: MessageCategory = .inbox
    
    // Active Conversation Messages
    @Published public var activeConversationMessages: [MessageItem] = []
    @Published public var messageInputText: String = ""
    
    @Published public var employeeRoster: [User] = []
    @Published public var isLoading: Bool = false
    @Published public var errorMessage: String?
    @Published public var showComposeSheet: Bool = false
    
    private var cancellables = Set<AnyCancellable>()
    
    public init() {
        populateDefaultConversations()
        
        Publishers.CombineLatest3($conversations, $searchText, $selectedCategory)
            .map { (convs, search, category) -> [Conversation] in
                var filtered = convs
                
                // Filter by category
                if category == .inbox {
                    filtered = filtered.filter { $0.type == .direct || $0.type == .group }
                } else if category == .announcements {
                    filtered = filtered.filter { $0.type == .announcement }
                }
                
                // Filter by search
                if !search.isEmpty {
                    filtered = filtered.filter {
                        $0.displayTitle.localizedCaseInsensitiveContains(search) ||
                        ($0.lastMessage?.localizedCaseInsensitiveContains(search) ?? false)
                    }
                }
                
                return filtered
            }
            .assign(to: &$filteredConversations)
        
        setupRealtime()
    }
    
    private func populateDefaultConversations() {
        self.conversations = []
        self.activeConversationMessages = []
    }
    
    private func setupRealtime() {
        SocketManager.shared.messageCreatedSubject
            .receive(on: DispatchQueue.main)
            .sink { [weak self] newMessage in
                guard let self = self else { return }
                // Append to active conversation if open
                self.activeConversationMessages.append(newMessage)
                
                // Update conversation preview
                if let idx = self.conversations.firstIndex(where: { $0.id == newMessage.conversationId }) {
                    var updated = self.conversations[idx]
                    updated.lastMessage = newMessage.content
                    updated.lastMessageTime = newMessage.timestamp
                    updated.lastMessageSender = newMessage.senderName
                    self.conversations[idx] = updated
                }
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Fetch Conversations
    public func fetchConversations() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        
        do {
            let list: [Conversation] = try await APIClient.shared.request(endpoint: .conversations(type: nil, search: nil))
            self.conversations = list
        } catch let error as APIError {
            self.errorMessage = error.localizedDescription
        } catch {
            self.errorMessage = error.localizedDescription
        }
    }
    
    // MARK: - Fetch Messages for Conversation
    public func fetchMessages(conversationId: String) async {
        // Clear previous messages to avoid flashing data from another chat
        self.activeConversationMessages = []
        
        // Dynamic Room Join on WebSocket
        SocketManager.shared.joinConversation(conversationId: conversationId)
        
        // Mark as read locally
        if let idx = self.conversations.firstIndex(where: { $0.id == conversationId }) {
            var updated = self.conversations[idx]
            updated.unreadCount = 0
            updated.isRead = true
            self.conversations[idx] = updated
        }
        
        do {
            let response: MessagesResponseData = try await APIClient.shared.request(endpoint: .messages(conversationId: conversationId, page: 1, limit: 50))
            self.activeConversationMessages = response.messages.reversed() // Reverse to show latest at bottom
        } catch {
            print("Failed to fetch messages: \(error)")
        }
    }
    
    // MARK: - Send Message
    public func sendMessage(conversationId: String) async {
        let text = messageInputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        
        messageInputText = ""
        
        // Optimistic UI Append
        let optimisticMsg = MessageItem(
            id: UUID().uuidString,
            conversationId: conversationId,
            senderId: KeychainService.shared.getUserId() ?? "me",
            senderName: AuthManager.shared.currentUser?.name ?? "Me",
            content: text,
            timestamp: Date()
        )
        activeConversationMessages.append(optimisticMsg)
        
        do {
            let body = ["content": text]
            let sent: MessageItem = try await APIClient.shared.request(endpoint: .sendMessage(conversationId: conversationId), body: body)
            if let idx = activeConversationMessages.firstIndex(where: { $0.id == optimisticMsg.id }) {
                activeConversationMessages[idx] = sent
            }
        } catch {
            print("Failed to send message: \(error)")
        }
    }
    
    // MARK: - Fetch Employees Roster
    public func fetchEmployeesRoster() async {
        do {
            let users: [User] = try await APIClient.shared.request(endpoint: .communicationEmployees(search: nil))
            self.employeeRoster = users
        } catch {
            print("Failed to fetch employees roster: \(error)")
        }
    }
    
    // MARK: - Start New Conversation
    public func startConversation(subject: String, participantIds: [String], isGroup: Bool = false, groupName: String? = nil) async -> Bool {
        do {
            if isGroup {
                let body = CreateGroupRequest(groupName: groupName ?? "Group", participants: participantIds, initialMessage: "Group created")
                let response: [String: Conversation] = try await APIClient.shared.request(endpoint: .groups, body: body)
                if let created = response["conversation"] {
                    self.conversations.insert(created, at: 0)
                }
                return true
            } else {
                let body = CreateConversationRequest(
                    type: "direct",
                    subject: subject,
                    groupName: nil,
                    participants: participantIds,
                    content: nil // Empty message for initial creation
                )
                let created: Conversation = try await APIClient.shared.request(endpoint: .createConversation, body: body)
                self.conversations.insert(created, at: 0)
                return true
            }
        } catch {
            self.errorMessage = error.localizedDescription
            return false
        }
    }
    
    // MARK: - WhatsApp Style 1-on-1 Chat Starter
    public func findOrCreateDirectConversation(with employeeId: String) async -> Conversation? {
        // First check if we already have a conversation with this exact user
        if let existing = self.conversations.first(where: { 
            $0.type == .direct && $0.participants.contains(employeeId) && $0.participants.count == 2
        }) {
            return existing
        }
        
        // Otherwise, create one on the backend without an initial message
        do {
            let body = CreateConversationRequest(
                type: "direct",
                subject: "Direct Message",
                groupName: nil,
                participants: [employeeId],
                content: nil
            )
            let created: Conversation = try await APIClient.shared.request(endpoint: .createConversation, body: body)
            self.conversations.insert(created, at: 0)
            return created
        } catch {
            self.errorMessage = error.localizedDescription
            return nil
        }
    }
}
