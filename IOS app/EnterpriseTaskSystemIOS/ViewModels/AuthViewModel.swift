import Foundation
import SwiftUI
import Combine

/// View model bridging Authentication views with AuthManager.
@MainActor
public final class AuthViewModel: ObservableObject {
    @Published public var email: String = "" {
        didSet {
            let f = AuthViewModel.formatEmail(email)
            if email != f { email = f }
        }
    }
    @Published public var password: String = ""
    @Published public var confirmPassword: String = ""
    @Published public var selectedRole: String = "member"
    @Published public var isPasswordVisible: Bool = false
    
    // New Registration Fields
    @Published public var firstName: String = "" {
        didSet {
            let f = AuthViewModel.formatFirstName(firstName)
            if firstName != f { firstName = f }
        }
    }
    @Published public var lastName: String = "" {
        didSet {
            let f = AuthViewModel.formatLastName(lastName)
            if lastName != f { lastName = f }
        }
    }
    @Published public var gender: String = ""
    @Published public var qualification: String = ""
    @Published public var countryCode: String = "+91"
    @Published public var mobileNumber: String = "" {
        didSet {
            let isIndia = countryCode.contains("91")
            let f = AuthViewModel.formatMobileNumber(mobileNumber, isIndia: isIndia)
            if mobileNumber != f { mobileNumber = f }
        }
    }
    @Published public var profilePicture: String = ""
    
    // OTP States
    @Published public var isPhoneVerified: Bool = false
    @Published public var isEmailVerified: Bool = false
    @Published public var showPhoneOtpSheet: Bool = false
    @Published public var showEmailOtpSheet: Bool = false
    @Published public var phoneOtp: String = ""
    @Published public var emailOtp: String = ""
    @Published public var isOtpSending: Bool = false
    @Published public var isOtpVerifying: Bool = false
    
    // Lockout Timer State
    @Published public var lockoutTimeRemaining: Int = 0
    private var lockoutTimer: Timer?
    
    @Published public var showForgotPassword: Bool = false
    @Published public var showRegister: Bool = false
    @Published public var alertMessage: String?
    @Published public var showAlert: Bool = false
    
    @Published public var isAuthenticated: Bool = AuthManager.shared.isAuthenticated
    @Published public var isLoading: Bool = AuthManager.shared.isLoading
    @Published public var currentUser: User? = AuthManager.shared.currentUser
    
    private var cancellables = Set<AnyCancellable>()
    
    public init() {
        let savedEmail = UserDefaultsService.shared.lastLoginEmail
        self.email = savedEmail.isEmpty ? "abhishek7y2@gmail.com" : savedEmail
        self.password = "@Abhi2419"
        
        // Reactively synchronize AuthManager state changes to this ViewModel
        AuthManager.shared.$isAuthenticated
            .receive(on: DispatchQueue.main)
            .sink { [weak self] auth in
                self?.isAuthenticated = auth
            }
            .store(in: &cancellables)
            
        AuthManager.shared.$isLoading
            .receive(on: DispatchQueue.main)
            .sink { [weak self] loading in
                self?.isLoading = loading
            }
            .store(in: &cancellables)
            
        AuthManager.shared.$currentUser
            .receive(on: DispatchQueue.main)
            .sink { [weak self] user in
                self?.currentUser = user
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Login Action
    public func login() async {
        guard !email.isEmpty, !password.isEmpty else {
            ToastManager.shared.showToast(message: "Please enter both email and password.", type: .error)
            return
        }
        
        if !isValidEmail(email) {
            ToastManager.shared.showToast(message: "Please enter a valid email address.", type: .error)
            return
        }
        
        let success = await AuthManager.shared.login(email: email, password: password)
        if !success {
            let errorMsg = AuthManager.shared.errorMessage ?? "Invalid email or password."
            ToastManager.shared.showToast(message: errorMsg, type: .error)
        } else {
            ToastManager.shared.showToast(message: "Welcome back!", type: .success)
        }
    }
    
    // MARK: - Input Formatters (Strict Filtering)
    public static func formatFirstName(_ value: String) -> String {
        let allowed = CharacterSet.letters
        var filtered = String(value.unicodeScalars.filter { allowed.contains($0) })
        if !filtered.isEmpty {
            filtered = filtered.prefix(1).uppercased() + filtered.dropFirst()
        }
        return filtered
    }

    public static func formatLastName(_ value: String) -> String {
        let allowed = CharacterSet.letters.union(CharacterSet(charactersIn: " "))
        var filtered = String(value.unicodeScalars.filter { allowed.contains($0) })
        
        while filtered.hasPrefix(" ") {
            filtered.removeFirst()
        }
        
        let parts = filtered.components(separatedBy: " ")
        if parts.count > 2 {
            filtered = parts[0] + " " + parts[1]
        }
        
        if !filtered.isEmpty {
            filtered = filtered.prefix(1).uppercased() + filtered.dropFirst()
        }
        return filtered
    }

    public static func formatMobileNumber(_ value: String, isIndia: Bool) -> String {
        let allowed = CharacterSet.decimalDigits
        var filtered = String(value.unicodeScalars.filter { allowed.contains($0) })
        
        if isIndia {
            while let first = filtered.first, ["0", "1", "2", "3", "4", "5"].contains(first) {
                filtered.removeFirst()
            }
            if filtered.count > 10 {
                filtered = String(filtered.prefix(10))
            }
        }
        return filtered
    }

    public static func formatEmail(_ value: String) -> String {
        let allowed = CharacterSet(charactersIn: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@._-+")
        return String(value.unicodeScalars.filter { allowed.contains($0) }).lowercased()
    }
    
    public func isValidEmail(_ email: String) -> Bool {
        return Validator.shared.isValidEmail(email)
    }

    // MARK: - Validation Utils
    public func validateNameField(_ value: String, fieldName: String, allowSpace: Bool = true) -> String? {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.isEmpty { return "Please enter your \(fieldName.lowercased())." }
        if trimmed.count < 2 { return "\(fieldName) must be at least 2 characters long" }
        if trimmed.count > 50 { return "\(fieldName) must be at most 50 characters long" }
        let firstChar = String(trimmed.prefix(1))
        if firstChar != firstChar.uppercased() { return "\(fieldName) must start with a capital letter" }
        if trimmed.rangeOfCharacter(from: CharacterSet(charactersIn: "0123456789@#$%^&*()")) != nil {
            return "\(fieldName) should only contain letters"
        }
        if !allowSpace && trimmed.contains(" ") { return "\(fieldName) cannot contain spaces" }
        return nil
    }

    // MARK: - Register Action
    public func register() async {
        if let fnError = validateNameField(firstName, fieldName: "First name", allowSpace: false) {
            ToastManager.shared.showToast(message: fnError, type: .error)
            return
        }
        if let lnError = validateNameField(lastName, fieldName: "Last name", allowSpace: true) {
            ToastManager.shared.showToast(message: lnError, type: .error)
            return
        }
        if gender.isEmpty {
            ToastManager.shared.showToast(message: "Please select your gender.", type: .error)
            return
        }
        if !isPhoneVerified {
            ToastManager.shared.showToast(message: "Please verify your mobile number before continuing.", type: .error)
            return
        }
        if !isEmailVerified {
            ToastManager.shared.showToast(message: "Please verify your email address before continuing.", type: .error)
            return
        }
        guard password == confirmPassword else {
            ToastManager.shared.showToast(message: "Passwords do not match.", type: .error)
            return
        }
        if let passError = Validator.shared.getPasswordValidationError(password) {
            ToastManager.shared.showToast(message: passError, type: .error)
            return
        }
        
        let success = await AuthManager.shared.register(
            firstName: firstName.trimmingCharacters(in: .whitespacesAndNewlines),
            lastName: lastName.trimmingCharacters(in: .whitespacesAndNewlines),
            gender: gender,
            qualification: qualification,
            countryCode: countryCode,
            mobileNumber: mobileNumber,
            email: email.trimmingCharacters(in: .whitespacesAndNewlines),
            password: password,
            profilePicture: profilePicture
        )
        
        if success {
            self.showRegister = false
            ToastManager.shared.showToast(message: "Registration successful!", type: .success)
        } else {
            let errorMsg = AuthManager.shared.errorMessage ?? "Registration failed."
            ToastManager.shared.showToast(message: errorMsg, type: .error)
        }
    }
    
    // MARK: - OTP Methods
    public func sendPhoneOtp() async {
        isOtpSending = true
        defer { isOtpSending = false }
        do {
            try await AuthManager.shared.requestMobileOtp(mobileNumber: mobileNumber, countryCode: countryCode)
            self.showPhoneOtpSheet = true
            ToastManager.shared.showToast(message: "OTP sent to \(countryCode)\(mobileNumber)", type: .success)
        } catch {
            ToastManager.shared.showToast(message: error.localizedDescription, type: .error)
        }
    }
    
    public func verifyPhoneOtp() async {
        isOtpVerifying = true
        defer { isOtpVerifying = false }
        do {
            try await AuthManager.shared.verifyMobileOtp(mobileNumber: mobileNumber, countryCode: countryCode, otp: phoneOtp)
            self.isPhoneVerified = true
            self.showPhoneOtpSheet = false
            ToastManager.shared.showToast(message: "Mobile verified successfully", type: .success)
        } catch {
            let errorMsg = error.localizedDescription
            ToastManager.shared.showToast(message: errorMsg, type: .error)
            if errorMsg.lowercased().contains("too many") || errorMsg.lowercased().contains("10 minutes") || errorMsg.lowercased().contains("limit") {
                startLockoutTimer()
            }
        }
    }
    
    public func sendEmailOtp() async {
        isOtpSending = true
        defer { isOtpSending = false }
        do {
            try await AuthManager.shared.requestEmailOtp(email: email)
            self.showEmailOtpSheet = true
            ToastManager.shared.showToast(message: "OTP sent to \(email)", type: .success)
        } catch {
            ToastManager.shared.showToast(message: error.localizedDescription, type: .error)
        }
    }
    
    public func verifyEmailOtp() async {
        isOtpVerifying = true
        defer { isOtpVerifying = false }
        do {
            try await AuthManager.shared.verifyEmailOtp(email: email, otp: emailOtp)
            self.isEmailVerified = true
            self.showEmailOtpSheet = false
            ToastManager.shared.showToast(message: "Email verified successfully", type: .success)
        } catch {
            let errorMsg = error.localizedDescription
            ToastManager.shared.showToast(message: errorMsg, type: .error)
            if errorMsg.lowercased().contains("too many") || errorMsg.lowercased().contains("10 minutes") || errorMsg.lowercased().contains("limit") {
                startLockoutTimer()
            }
        }
    }
    
    private func startLockoutTimer() {
        lockoutTimeRemaining = 600 // 10 minutes
        lockoutTimer?.invalidate()
        lockoutTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] timer in
            Task { @MainActor in
                guard let self = self else { return }
                if self.lockoutTimeRemaining > 0 {
                    self.lockoutTimeRemaining -= 1
                } else {
                    timer.invalidate()
                }
            }
        }
    }
    
    // MARK: - Forgot Password
    public func requestPasswordReset(email: String) async -> Bool {
        do {
            let body = ["email": email]
            let _: EmptyData = try await APIClient.shared.request(endpoint: .forgotPassword, body: body)
            ToastManager.shared.showToast(message: "Password reset link sent!", type: .success)
            return true
        } catch {
            ToastManager.shared.showToast(message: error.localizedDescription, type: .error)
            return false
        }
    }
    
    public func logout() {
        AuthManager.shared.logout()
    }
}
// Force recompilation
