import SwiftUI

/// Register Screen for WorkMate.
public struct RegisterView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @Environment(\.presentationMode) private var presentationMode
    
    public var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: AppSpacing.lg) {
                VStack(alignment: .leading, spacing: AppSpacing.xxs) {
                    Text("Create Account")
                        .font(AppTypography.title)
                        .foregroundColor(AppColors.textPrimary)
                    
                    Text("Join your organization workspace on WorkMate")
                        .font(AppTypography.subheadline)
                        .foregroundColor(AppColors.textSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.top, AppSpacing.md)
                
                VStack(spacing: AppSpacing.md) {
                    // First Name & Last Name
                    HStack(spacing: AppSpacing.md) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("First Name")
                                .font(AppTypography.footnote)
                                .foregroundColor(AppColors.textSecondary)
                            TextField("John", text: $authViewModel.firstName)
                                .padding()
                                .background(RoundedRectangle(cornerRadius: AppRadius.md).stroke(AppColors.border, lineWidth: 1))
                        }
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Last Name")
                                .font(AppTypography.footnote)
                                .foregroundColor(AppColors.textSecondary)
                            TextField("Doe", text: $authViewModel.lastName)
                                .padding()
                                .background(RoundedRectangle(cornerRadius: AppRadius.md).stroke(AppColors.border, lineWidth: 1))
                        }
                    }
                    
                    // Gender & Qualification
                    HStack(spacing: AppSpacing.md) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Gender")
                                .font(AppTypography.footnote)
                                .foregroundColor(AppColors.textSecondary)
                            
                            Menu {
                                Button("Male") { authViewModel.gender = "Male" }
                                Button("Female") { authViewModel.gender = "Female" }
                                Button("Other") { authViewModel.gender = "Other" }
                            } label: {
                                HStack {
                                    Text(authViewModel.gender.isEmpty ? "Select" : authViewModel.gender)
                                        .foregroundColor(authViewModel.gender.isEmpty ? .gray : AppColors.textPrimary)
                                    Spacer()
                                    Image(systemName: "chevron.down").foregroundColor(.gray)
                                }
                                .padding()
                                .background(RoundedRectangle(cornerRadius: AppRadius.md).stroke(AppColors.border, lineWidth: 1))
                            }
                        }
                        
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Qualification")
                                .font(AppTypography.footnote)
                                .foregroundColor(AppColors.textSecondary)
                            
                            Menu {
                                Button("10th") { authViewModel.qualification = "10th" }
                                Button("12th") { authViewModel.qualification = "12th" }
                                Button("Bachelor's") { authViewModel.qualification = "Bachelor's" }
                                Button("Master's") { authViewModel.qualification = "Master's" }
                                Button("PhD") { authViewModel.qualification = "PhD" }
                                Button("Other") { authViewModel.qualification = "Other" }
                            } label: {
                                HStack {
                                    Text(authViewModel.qualification.isEmpty ? "Select" : authViewModel.qualification)
                                        .foregroundColor(authViewModel.qualification.isEmpty ? .gray : AppColors.textPrimary)
                                        .lineLimit(1)
                                    Spacer()
                                    Image(systemName: "chevron.down").foregroundColor(.gray)
                                }
                                .padding()
                                .background(RoundedRectangle(cornerRadius: AppRadius.md).stroke(AppColors.border, lineWidth: 1))
                            }
                        }
                    }
                    
                    // Mobile Number
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Mobile Number")
                            .font(AppTypography.footnote)
                            .foregroundColor(AppColors.textSecondary)
                        HStack {
                            TextField("+91", text: $authViewModel.countryCode)
                                .frame(width: 55)
                                .padding()
                                .background(RoundedRectangle(cornerRadius: AppRadius.md).stroke(AppColors.border, lineWidth: 1))
                            
                            TextField("9876543210", text: $authViewModel.mobileNumber)
                                .keyboardType(.numberPad)
                                .disabled(authViewModel.isPhoneVerified)
                                .padding()
                                .background(RoundedRectangle(cornerRadius: AppRadius.md).stroke(AppColors.border, lineWidth: 1))
                            
                            if authViewModel.isPhoneVerified {
                                Image(systemName: "checkmark.circle.fill").foregroundColor(.green)
                            } else {
                                Button("Verify") {
                                    Task { await authViewModel.sendPhoneOtp() }
                                }
                                .padding(.horizontal, 16)
                                .padding(.vertical, 14)
                                .background(AppColors.primary)
                                .foregroundColor(.white)
                                .cornerRadius(AppRadius.md)
                                .disabled(authViewModel.isOtpSending || authViewModel.mobileNumber.count < 5)
                            }
                        }
                    }
                    
                    // Email
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Work Email")
                            .font(AppTypography.footnote)
                            .foregroundColor(AppColors.textSecondary)
                        HStack {
                            TextField("you@company.com", text: $authViewModel.email)
                                .autocapitalization(.none)
                                .keyboardType(.emailAddress)
                                .disabled(authViewModel.isEmailVerified)
                                .padding()
                                .background(RoundedRectangle(cornerRadius: AppRadius.md).stroke(AppColors.border, lineWidth: 1))
                            
                            if authViewModel.isEmailVerified {
                                Image(systemName: "checkmark.circle.fill").foregroundColor(.green)
                            } else {
                                Button("Verify") {
                                    Task { await authViewModel.sendEmailOtp() }
                                }
                                .padding(.horizontal, 16)
                                .padding(.vertical, 14)
                                .background(AppColors.primary)
                                .foregroundColor(.white)
                                .cornerRadius(AppRadius.md)
                                .disabled(authViewModel.isOtpSending || authViewModel.email.isEmpty)
                            }
                        }
                    }
                    
                    // Password
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Password")
                            .font(AppTypography.footnote)
                            .foregroundColor(AppColors.textSecondary)
                        SecureField("Min. 8 characters", text: $authViewModel.password)
                            .padding()
                            .background(RoundedRectangle(cornerRadius: AppRadius.md).stroke(AppColors.border, lineWidth: 1))
                    }
                    
                    // Confirm Password
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Confirm Password")
                            .font(AppTypography.footnote)
                            .foregroundColor(AppColors.textSecondary)
                        SecureField("Re-enter password", text: $authViewModel.confirmPassword)
                            .padding()
                            .background(RoundedRectangle(cornerRadius: AppRadius.md).stroke(AppColors.border, lineWidth: 1))
                    }
                }
                
                AppButton("Sign Up", isLoading: authViewModel.isLoading) {
                    Task {
                        await authViewModel.register()
                    }
                }
                .buttonStyle(PressableButtonStyle())
                .padding(.top, AppSpacing.sm)
            }
            .padding(.horizontal, AppSpacing.lg)
            .padding(.bottom, 50)
        }
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
                    .foregroundColor(AppColors.textPrimary)
                }
            }
        }
        .sheet(isPresented: $authViewModel.showPhoneOtpSheet) {
            OtpSheetView(
                title: "Verify Mobile",
                message: "Enter OTP sent to \(authViewModel.countryCode) \(authViewModel.mobileNumber)",
                otp: $authViewModel.phoneOtp,
                isVerifying: authViewModel.isOtpVerifying,
                lockoutTimeRemaining: authViewModel.lockoutTimeRemaining
            ) {
                Task { await authViewModel.verifyPhoneOtp() }
            }
        }
        .sheet(isPresented: $authViewModel.showEmailOtpSheet) {
            OtpSheetView(
                title: "Verify Email",
                message: "Enter OTP sent to \(authViewModel.email)",
                otp: $authViewModel.emailOtp,
                isVerifying: authViewModel.isOtpVerifying,
                lockoutTimeRemaining: authViewModel.lockoutTimeRemaining
            ) {
                Task { await authViewModel.verifyEmailOtp() }
            }
        }
    }
}

public struct OtpSheetView: View {
    let title: String
    let message: String
    @Binding var otp: String
    let isVerifying: Bool
    let lockoutTimeRemaining: Int
    let onVerify: () -> Void
    
    public var body: some View {
        VStack(spacing: 24) {
            Text(title)
                .font(AppTypography.title2)
                .fontWeight(.bold)
            Text(message)
                .font(AppTypography.subheadline)
                .multilineTextAlignment(.center)
            
            TextField("6-digit OTP", text: $otp)
                .keyboardType(.numberPad)
                .padding()
                .background(RoundedRectangle(cornerRadius: AppRadius.md).stroke(AppColors.border, lineWidth: 1))
            
            if lockoutTimeRemaining > 0 {
                let minutes = lockoutTimeRemaining / 60
                let seconds = lockoutTimeRemaining % 60
                Text(String(format: "Try again in %02d:%02d", minutes, seconds))
                    .font(AppTypography.footnote)
                    .foregroundColor(.red)
            }
            
            AppButton("Verify OTP", isLoading: isVerifying) {
                onVerify()
            }
            .buttonStyle(PressableButtonStyle())
            .disabled(lockoutTimeRemaining > 0)
            
            Spacer()
        }
        .padding()
        .padding(.top, 40)
        .presentationDetents([.height(300)])
        .appScreenBackground()
    }
}
