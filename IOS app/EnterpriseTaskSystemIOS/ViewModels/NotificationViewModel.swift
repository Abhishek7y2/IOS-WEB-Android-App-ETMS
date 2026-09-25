import Foundation
import SwiftUI
import Combine

/// View Model for managing user in-app notifications and realtime alert events.
@MainActor
public final class NotificationViewModel: ObservableObject {
    @Published public var notifications: [NotificationItem] = []
    @Published public var todayNotifications: [NotificationItem] = []
    @Published public var earlierNotifications: [NotificationItem] = []
    
    @Published public var isLoading: Bool = false
    @Published public var errorMessage: String?
    
    private var cancellables = Set<AnyCancellable>()
    
    public init() {
        populateDefaultNotifications()
        setupRealtime()
    }
    
    private func populateDefaultNotifications() {
        self.notifications = [
            NotificationItem(
                id: "notif_01",
                recipientId: "user_01",
                type: .task,
                message: "Sneha Patel assigned you task 'Security Audit & JWT Hardening'.",
                isRead: false,
                createdAt: Calendar.current.date(byAdding: .minute, value: -25, to: Date())
            ),
            NotificationItem(
                id: "notif_02",
                recipientId: "user_01",
                type: .announcement,
                message: "Company All-Hands meeting scheduled for tomorrow at 10:00 AM.",
                isRead: false,
                createdAt: Calendar.current.date(byAdding: .hour, value: -2, to: Date())
            ),
            NotificationItem(
                id: "notif_03",
                recipientId: "user_01",
                type: .message,
                message: "Rahul Sharma sent a new message in Engineering All-Hands.",
                isRead: true,
                createdAt: Calendar.current.date(byAdding: .hour, value: -5, to: Date())
            ),
            NotificationItem(
                id: "notif_04",
                recipientId: "user_01",
                type: .system,
                message: "Your attendance check-in at 09:14 AM has been recorded.",
                isRead: true,
                createdAt: Calendar.current.date(byAdding: .day, value: -1, to: Date())
            )
        ]
        splitNotifications()
    }
    
    private func setupRealtime() {
        SocketManager.shared.notificationCreatedSubject
            .receive(on: DispatchQueue.main)
            .sink { [weak self] item in
                self?.notifications.insert(item, at: 0)
                self?.splitNotifications()
            }
            .store(in: &cancellables)
    }
    
    private func splitNotifications() {
        let calendar = Calendar.current
        self.todayNotifications = notifications.filter {
            guard let date = $0.createdAt else { return true }
            return calendar.isDateInToday(date)
        }
        self.earlierNotifications = notifications.filter {
            guard let date = $0.createdAt else { return false }
            return !calendar.isDateInToday(date)
        }
    }
    
    // MARK: - Fetch Notifications
    public func fetchNotifications() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        
        do {
            let list: [NotificationItem] = try await APIClient.shared.request(endpoint: .notifications)
            if !list.isEmpty {
                self.notifications = list
                splitNotifications()
            }
        } catch {
            print("Notifications fetch fallback: \(error)")
        }
    }
    
    // MARK: - Mark All As Read
    public func markAllAsRead() async {
        do {
            let _: EmptyData = try await APIClient.shared.request(endpoint: .readAllNotifications)
            notifications.removeAll()
            splitNotifications()
        } catch {
            print("Failed to mark all as read: \(error)")
            notifications.removeAll() // Fallback for dummy data
            splitNotifications()
        }
    }
    
    // MARK: - Mark Single As Read
    public func markAsRead(notification: NotificationItem) async {
        do {
            let _: NotificationItem = try await APIClient.shared.request(endpoint: .readNotification(id: notification.id))
            if let idx = notifications.firstIndex(where: { $0.id == notification.id }) {
                notifications.remove(at: idx)
                splitNotifications()
            }
        } catch {
            print("Failed to mark notification as read: \(error)")
            if let idx = notifications.firstIndex(where: { $0.id == notification.id }) {
                notifications.remove(at: idx) // Fallback for dummy data
                splitNotifications()
            }
        }
    }
}
