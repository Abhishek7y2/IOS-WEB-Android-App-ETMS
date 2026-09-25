import SwiftUI

/// Security & Password change settings.
public struct SecuritySettingsView: View {
    @ObservedObject var viewModel: ProfileViewModel
    @State private var currentPassword: String = ""
    @State private var newPassword: String = ""
    @State private var confirmPassword: String = ""
    @State private var errorMessage: String?
    @Environment(\.presentationMode) private var presentationMode
    
    public var body: some View {
        Form {
            Section("Change Password") {
                SecureField("Current Password", text: $currentPassword)
                SecureField("New Password (min 8 chars)", text: $newPassword)
                SecureField("Confirm New Password", text: $confirmPassword)
            }
            
            if let err = errorMessage {
                Section {
                    Text(err)
                        .font(AppTypography.caption)
                        .foregroundColor(AppColors.danger)
                }
            }
        }
        .navigationTitle("Security")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Update") {
                    Task {
                        guard !currentPassword.isEmpty, !newPassword.isEmpty else {
                            errorMessage = "Please fill in all password fields."
                            return
                        }
                        guard newPassword == confirmPassword else {
                            errorMessage = "Passwords do not match."
                            return
                        }
                        let success = await viewModel.changePassword(current: currentPassword, new: newPassword)
                        if success {
                            presentationMode.wrappedValue.dismiss()
                        }
                    }
                }
                .font(AppTypography.headline)
            }
        }
    }
}
