import Foundation

struct MessageItem: Identifiable, Codable {
    let id: String
    let senderId: String
    let senderName: String
    let text: String
    let timestamp: String
    let isCurrentUser: Bool?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case senderId, senderName, text, timestamp, isCurrentUser
    }
}
