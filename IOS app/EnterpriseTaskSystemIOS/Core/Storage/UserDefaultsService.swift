import Foundation

/// Local preferences storage for theme, last email, and user settings.
public final class UserDefaultsService {
    public static let shared = UserDefaultsService()
    
    private let defaults = UserDefaults.standard
    private let lastEmailKey = "workmate_last_login_email"
    private let appearanceKey = "workmate_appearance_mode" // "system", "light", "dark"
    private let notificationsEnabledKey = "workmate_notifications_enabled"
    private let cachedUserKey = "workmate_cached_user_json"
    
    private init() {}
    
    public var lastLoginEmail: String {
        get { defaults.string(forKey: lastEmailKey) ?? "" }
        set { defaults.set(newValue, forKey: lastEmailKey) }
    }
    
    public var appearanceMode: String {
        get { defaults.string(forKey: appearanceKey) ?? "system" }
        set { defaults.set(newValue, forKey: appearanceKey) }
    }
    
    public var notificationsEnabled: Bool {
        get { defaults.bool(forKey: notificationsEnabledKey) }
        set { defaults.set(newValue, forKey: notificationsEnabledKey) }
    }
    
    public func saveCachedUser<T: Encodable>(_ user: T) {
        if let data = try? JSONEncoder().encode(user) {
            defaults.set(data, forKey: cachedUserKey)
        }
    }
    
    public func getCachedUser<T: Decodable>() -> T? {
        guard let data = defaults.data(forKey: cachedUserKey) else { return nil }
        return try? JSONDecoder().decode(T.self, from: data)
    }
    
    public func clearCachedUser() {
        defaults.removeObject(forKey: cachedUserKey)
    }
}
