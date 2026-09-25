import Foundation
import SwiftUI
import Combine

/// View Model for Profile inspection, personal info updates, appearance, and security.
@MainActor
public final class ProfileViewModel: ObservableObject {
    @Published public var user: User?
    @Published public var name: String = ""
    @Published public var designation: String = ""
    @Published public var department: String = ""
    @Published public var profilePicture: String? = nil
    @Published public var coverPicture: String? = nil
    @Published public var mobileNumber: String = "" {
        didSet {
            let filtered = ProfileViewModel.formatMobileNumber(mobileNumber, countryCode: countryCode)
            if mobileNumber != filtered { mobileNumber = filtered }
        }
    }
    
    // Phone OTP State
    @Published public var countryCode: String = "+91"
    @Published public var isVerifyingOtp: Bool = false
    @Published public var otp: String = ""
    
    // Appearance
    @Published public var appearanceMode: String = "system"
    
    // Notifications toggle
    @Published public var notificationsEnabled: Bool = true
    
    @Published public var isLoading: Bool = false
    @Published public var alertMessage: String?
    @Published public var showAlert: Bool = false
    
    public init() {
        self.user = AuthManager.shared.currentUser
        self.name = user?.name ?? "Abhishek Yadav"
        self.designation = user?.designation ?? "Full Stack Developer"
        self.department = user?.department ?? "Engineering"
        self.profilePicture = user?.profilePicture
        self.coverPicture = user?.coverPicture
        self.mobileNumber = user?.mobileNumber ?? ""
        self.countryCode = user?.countryCode ?? "+91"
        self.appearanceMode = UserDefaultsService.shared.appearanceMode
        self.notificationsEnabled = UserDefaultsService.shared.notificationsEnabled
    }
    
    public func updateProfile() async -> Bool {
        guard let userId = user?.id else { return false }
        isLoading = true
        defer { isLoading = false }
        
        do {
            var body: [String: String] = [
                "name": name,
                "designation": designation,
                "department": department,
                "mobileNumber": mobileNumber
            ]
            
            if let profilePic = profilePicture, !profilePic.isEmpty {
                body["profilePicture"] = profilePic
            }
            if let coverPic = coverPicture, !coverPic.isEmpty {
                body["coverPicture"] = coverPic
            }
            let response: SingleUserData = try await APIClient.shared.request(endpoint: .updateUser(id: userId), body: body)
            let updated = response.user
            self.user = updated
            AuthManager.shared.currentUser = updated
            UserDefaultsService.shared.saveCachedUser(updated)
            self.alertMessage = "Profile updated successfully."
            self.showAlert = true
            return true
        } catch {
            self.alertMessage = error.localizedDescription
            self.showAlert = true
            return false
        }
    }
    
    // MARK: - Photo Upload Handling
    public func handlePhotoSelection(data: Data?, isCover: Bool) {
        guard let data = data else { return }
        // Compress the image before converting to base64
        guard let uiImage = UIImage(data: data),
              let compressedData = uiImage.jpegData(compressionQuality: 0.3) else { return }
              
        // Base64 encode the image
        let base64String = compressedData.base64EncodedString()
        let formattedString = "data:image/jpeg;base64,\(base64String)"
        
        if isCover {
            self.coverPicture = formattedString
        } else {
            self.profilePicture = formattedString
        }
        
        // Optionally trigger auto-save or require manual save
        // We will require manual save via the "Save Changes" button
    }
    
    // MARK: - Phone OTP Flow
    public func requestPhoneChangeOtp() async -> Bool {
        guard !mobileNumber.isEmpty else { return false }
        if countryCode == "+91" && mobileNumber.count != 10 {
            self.alertMessage = "Indian mobile numbers must be exactly 10 digits."
            self.showAlert = true
            return false
        }
        
        isLoading = true
        defer { isLoading = false }
        
        do {
            let msg = try await AuthManager.shared.requestPhoneChangeOtp(mobileNumber: mobileNumber, countryCode: countryCode)
            self.alertMessage = msg
            self.showAlert = true
            self.isVerifyingOtp = true
            return true
        } catch {
            self.alertMessage = error.localizedDescription
            self.showAlert = true
            return false
        }
    }
    
    public func verifyPhoneChangeOtp() async -> Bool {
        guard otp.count == 6 else {
            self.alertMessage = "OTP must be exactly 6 digits."
            self.showAlert = true
            return false
        }
        
        isLoading = true
        defer { isLoading = false }
        
        do {
            try await AuthManager.shared.verifyPhoneChangeOtp(otp: otp)
            self.alertMessage = "Phone number verified and updated successfully!"
            self.showAlert = true
            self.isVerifyingOtp = false
            self.otp = ""
            self.user = AuthManager.shared.currentUser
            return true
        } catch {
            self.alertMessage = error.localizedDescription
            self.showAlert = true
            return false
        }
    }
    
    // MARK: - Input Formatting
    public static func formatMobileNumber(_ value: String, countryCode: String) -> String {
        var filtered = String(value.unicodeScalars.filter { CharacterSet.decimalDigits.contains($0) })
        if countryCode == "+91" || countryCode == "91" {
            filtered = String(filtered.prefix(10))
            if let firstChar = filtered.first, "012345".contains(firstChar) {
                filtered.removeFirst()
            }
        }
        return filtered
    }
    
    public func changePassword(current: String, new: String) async -> Bool {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let body = ["currentPassword": current, "newPassword": new]
            let _: EmptyData = try await APIClient.shared.request(endpoint: .profilePassword, body: body)
            self.alertMessage = "Password changed successfully."
            self.showAlert = true
            return true
        } catch {
            self.alertMessage = error.localizedDescription
            self.showAlert = true
            return false
        }
    }
    
    public func setAppearance(_ mode: String) {
        self.appearanceMode = mode
        UserDefaultsService.shared.appearanceMode = mode
    }
    
    public func signOut() {
        AuthManager.shared.logout()
    }
}
