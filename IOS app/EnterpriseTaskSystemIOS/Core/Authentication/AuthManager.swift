import Foundation
import SwiftUI
import Combine

/// Centralized Authentication and User Session Manager.
@MainActor
public final class AuthManager: ObservableObject {
    public static let shared = AuthManager()
    
    @Published public var currentUser: User?
    @Published public var isAuthenticated: Bool = false
    @Published public var isLoading: Bool = false
    @Published public var errorMessage: String?
    
    private var cancellables = Set<AnyCancellable>()
    
    private init() {
        // Attempt session restore on launch
        restoreSession()
        
        // Listen for force logout events
        SocketManager.shared.forceLogoutSubject
            .receive(on: RunLoop.main)
            .sink { [weak self] _ in
                self?.logout()
                self?.errorMessage = "Your session was terminated by an administrator."
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Restore Session
    public func restoreSession() {
        if let token = KeychainService.shared.getAccessToken(), !token.isEmpty {
            self.isAuthenticated = true
            // Load cached user if available
            if let cached: User = UserDefaultsService.shared.getCachedUser() {
                self.currentUser = cached
            }
            // Fetch fresh profile in background
            Task {
                await fetchProfile()
            }
        } else {
            self.isAuthenticated = false
        }
    }
    
    // MARK: - Login with Email & Password
    public func login(email: String, password: String) async -> Bool {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        
        do {
            let body = ["email": email.trimmingCharacters(in: .whitespacesAndNewlines), "password": password]
            let authData: AuthResponseData = try await APIClient.shared.request(endpoint: .login, body: body)
            
            // Persist tokens securely
            KeychainService.shared.saveAccessToken(authData.token)
            if let refresh = authData.refreshToken {
                KeychainService.shared.saveRefreshToken(refresh)
            }
            KeychainService.shared.saveUserId(authData.user.id)
            
            UserDefaultsService.shared.lastLoginEmail = email
            UserDefaultsService.shared.saveCachedUser(authData.user)
            
            self.currentUser = authData.user
            self.isAuthenticated = true
            
            // Connect Realtime Socket
            SocketManager.shared.connect(token: authData.token)
            return true
        } catch {
            self.errorMessage = error.localizedDescription
            return false
        }
    }
    
    // MARK: - Register
    public func register(firstName: String, lastName: String, gender: String, qualification: String, countryCode: String, mobileNumber: String, email: String, password: String, profilePicture: String?) async -> Bool {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        
        do {
            var body = [
                "firstName": firstName,
                "lastName": lastName,
                "gender": gender,
                "qualification": qualification,
                "countryCode": countryCode,
                "mobileNumber": mobileNumber,
                "email": email.trimmingCharacters(in: .whitespacesAndNewlines),
                "password": password
            ]
            if let pic = profilePicture, !pic.isEmpty {
                body["profilePicture"] = pic
            }

            let authData: AuthResponseData = try await APIClient.shared.request(endpoint: .register, body: body)
            
            KeychainService.shared.saveAccessToken(authData.token)
            if let refresh = authData.refreshToken {
                KeychainService.shared.saveRefreshToken(refresh)
            }
            KeychainService.shared.saveUserId(authData.user.id)
            
            UserDefaultsService.shared.saveCachedUser(authData.user)
            self.currentUser = authData.user
            self.isAuthenticated = true
            
            SocketManager.shared.connect(token: authData.token)
            return true
        } catch let error as APIError {
            self.errorMessage = error.localizedDescription
            return false
        } catch {
            self.errorMessage = error.localizedDescription
            return false
        }
    }
    
    // MARK: - Registration OTP Flows
    public func requestMobileOtp(mobileNumber: String, countryCode: String) async throws {
        let body = ["mobileNumber": mobileNumber, "countryCode": countryCode]
        _ = try await APIClient.shared.request(endpoint: .requestRegistrationOtp, body: body) as EmptyData
    }
    
    public func verifyMobileOtp(mobileNumber: String, countryCode: String, otp: String) async throws {
        let body = ["mobileNumber": mobileNumber, "countryCode": countryCode, "otp": otp]
        _ = try await APIClient.shared.request(endpoint: .verifyRegistrationOtp, body: body) as EmptyData
    }
    
    public func requestEmailOtp(email: String) async throws {
        let body = ["email": email]
        _ = try await APIClient.shared.request(endpoint: .requestRegistrationEmailOtp, body: body) as EmptyData
    }
    
    public func verifyEmailOtp(email: String, otp: String) async throws {
        let body = ["email": email, "otp": otp]
        _ = try await APIClient.shared.request(endpoint: .verifyRegistrationEmailOtp, body: body) as EmptyData
    }
    
    // MARK: - Phone Change OTP
    public func requestPhoneChangeOtp(mobileNumber: String, countryCode: String) async throws -> String {
        let body = ["mobileNumber": mobileNumber, "countryCode": countryCode]
        _ = try await APIClient.shared.request(endpoint: .requestPhoneChangeOtp, body: body) as EmptyData
        return "OTP sent successfully"
    }
    
    public func verifyPhoneChangeOtp(otp: String) async throws {
        let body = ["otp": otp]
        _ = try await APIClient.shared.request(endpoint: .verifyPhoneChangeOtp, body: body) as EmptyData
        await fetchProfile()
    }
    
    // MARK: - Fetch Profile
    public func fetchProfile() async {
        do {
            let user: User = try await APIClient.shared.request(endpoint: .profile)
            self.currentUser = user
            UserDefaultsService.shared.saveCachedUser(user)
        } catch {
            print("Failed to fetch fresh profile: \(error)")
        }
    }
    
    // MARK: - Refresh Token
    public func refreshToken() async -> Bool {
        guard let refreshToken = KeychainService.shared.getRefreshToken() else { return false }
        
        do {
            let body = ["refreshToken": refreshToken]
            let authData: AuthResponseData = try await APIClient.shared.request(endpoint: .refresh, body: body)
            
            KeychainService.shared.saveAccessToken(authData.token)
            if let newRefresh = authData.refreshToken {
                KeychainService.shared.saveRefreshToken(newRefresh)
            }
            
            self.currentUser = authData.user
            return true
        } catch {
            return false
        }
    }
    
    // MARK: - Logout
    public func logout() {
        Task {
            let body: [String: String]? = {
                if let refresh = KeychainService.shared.getRefreshToken() {
                    return ["refreshToken": refresh]
                }
                return nil
            }()
            _ = try? await APIClient.shared.request(endpoint: .logout, body: body) as EmptyData
        }
        KeychainService.shared.clearAll()
        UserDefaultsService.shared.clearCachedUser()
        SocketManager.shared.disconnect()
        
        self.currentUser = nil
        self.isAuthenticated = false
    }
}
