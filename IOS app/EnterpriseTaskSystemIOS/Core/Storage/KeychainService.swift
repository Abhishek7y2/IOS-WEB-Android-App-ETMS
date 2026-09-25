import Foundation
import Security

/// Secure enclave & Keychain service for sensitive authentication tokens.
public final class KeychainService {
    public static let shared = KeychainService()
    
    private let serviceName = "com.workmate.app.tokens"
    private let accessTokenKey = "workmate_access_token"
    private let refreshTokenKey = "workmate_refresh_token"
    private let userIdKey = "workmate_user_id"
    
    private init() {}
    
    // MARK: - Access Token
    public func saveAccessToken(_ token: String) {
        save(key: accessTokenKey, data: token)
    }
    
    public func getAccessToken() -> String? {
        return get(key: accessTokenKey)
    }
    
    public func deleteAccessToken() {
        delete(key: accessTokenKey)
    }
    
    // MARK: - Refresh Token
    public func saveRefreshToken(_ token: String) {
        save(key: refreshTokenKey, data: token)
    }
    
    public func getRefreshToken() -> String? {
        return get(key: refreshTokenKey)
    }
    
    public func deleteRefreshToken() {
        delete(key: refreshTokenKey)
    }
    
    // MARK: - User ID
    public func saveUserId(_ userId: String) {
        save(key: userIdKey, data: userId)
    }
    
    public func getUserId() -> String? {
        return get(key: userIdKey)
    }
    
    public func deleteUserId() {
        delete(key: userIdKey)
    }
    
    // MARK: - Clear All
    public func clearAll() {
        deleteAccessToken()
        deleteRefreshToken()
        deleteUserId()
    }
    
    // MARK: - Keychain Primitive Helpers
    private func save(key: String, data: String) {
        guard let data = data.data(using: .utf8) else { return }
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key
        ]
        
        SecItemDelete(query as CFDictionary)
        
        let attributes: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]
        
        SecItemAdd(attributes as CFDictionary, nil)
    }
    
    private func get(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
        
        if status == errSecSuccess, let retrievedData = dataTypeRef as? Data {
            return String(data: retrievedData, encoding: .utf8)
        }
        return nil
    }
    
    private func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: serviceName,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(query as CFDictionary)
    }
}
