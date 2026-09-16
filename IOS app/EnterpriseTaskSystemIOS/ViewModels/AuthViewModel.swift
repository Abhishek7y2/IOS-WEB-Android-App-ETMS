import Foundation

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated: Bool = false
    @Published var currentUser: User?
    @Published var errorMessage: String?
    @Published var isLoading: Bool = false
    
    init() {
        if let token = KeychainService.shared.getToken(), !token.isEmpty {
            self.isAuthenticated = true
        }
    }
    
    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        do {
            let user = try await APIManager.shared.login(email: email, password: password)
            self.currentUser = user
            if let token = user.token {
                KeychainService.shared.saveToken(token)
            }
            self.isAuthenticated = true
        } catch {
            self.errorMessage = "Login failed. Please check your credentials."
        }
        isLoading = false
    }
    
    func logout() {
        KeychainService.shared.deleteToken()
        self.isAuthenticated = false
        self.currentUser = nil
    }
}
