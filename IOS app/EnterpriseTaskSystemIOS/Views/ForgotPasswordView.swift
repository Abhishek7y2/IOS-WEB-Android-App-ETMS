import SwiftUI

/// Forgot Password / Password Reset Request Sheet.
public struct ForgotPasswordView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @Environment(\.presentationMode) private var presentationMode
    @State private var email: String = ""
    @State private var isSubmitted: Bool = false
    @State private var isLoading: Bool = false
    
    public var body: some View {
        VStack(spacing: AppSpacing.lg) {
                if isSubmitted {
                    EmptyStateView(
                        icon: "envelope.badge.checkmark",
                        title: "Reset Code Sent",
                        message: "If an account exists for \(email), a password reset OTP has been sent.",
                        actionTitle: "Done"
                    ) {
                        presentationMode.wrappedValue.dismiss()
                    }
                } else {
                    VStack(alignment: .leading, spacing: AppSpacing.xs) {
                        Text("Reset Password")
                            .font(AppTypography.title)
                            .foregroundColor(AppColors.textPrimary)
                        
                        Text("Enter your work email and we'll send you an OTP to reset your password.")
                            .font(AppTypography.subheadline)
                            .foregroundColor(AppColors.textSecondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Work Email")
                            .font(AppTypography.footnote)
                            .foregroundColor(AppColors.textSecondary)
                        
                        TextField("you@company.com", text: $email)
                            .autocapitalization(.none)
                            .keyboardType(.emailAddress)
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: AppRadius.md)
                                    .fill(AppColors.cardSurface)
                                    .overlay(RoundedRectangle(cornerRadius: AppRadius.md).stroke(AppColors.border, lineWidth: 1))
                            )
                    }
                    
                    AppButton("Send Reset OTP", isLoading: isLoading) {
                        Task {
                            isLoading = true
                            let success = await authViewModel.requestPasswordReset(email: email)
                            isLoading = false
                            if success {
                                isSubmitted = true
                            }
                        }
                    }
                    .buttonStyle(PressableButtonStyle())
                    
                    Spacer()
                }
            }
        .padding(AppSpacing.lg)
        .appScreenBackground()
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button(action: {
                    presentationMode.wrappedValue.dismiss()
                }) {
                    HStack(spacing: 4) {
                        Image(systemName: "chevron.left")
                        Text("Back")
                    }
                    .foregroundColor(.white)
                }
            }
        }
    }
}
