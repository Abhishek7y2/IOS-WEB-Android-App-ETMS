import SwiftUI

/// Welcome Back / Login Screen matching Reference Mockup #1.
public struct LoginView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    
    public var body: some View {
        NavigationStack {
            ZStack {
                // Dark futuristic background
            AppGradients.authBackground
                .ignoresSafeArea()
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: AppSpacing.xl) {
                    Spacer(minLength: 40)
                    
                    // Brand Logo with glowing cyan/blue icon
                    VStack(spacing: AppSpacing.md) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 18, style: .continuous)
                                .fill(
                                    LinearGradient(
                                        colors: [AppColors.accentSky, AppColors.primary],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 64, height: 64)
                                .appGlowShadow(color: AppColors.accentSky)
                            
                            Image(systemName: "sparkles")
                                .font(.system(size: 30, weight: .bold))
                                .foregroundColor(.white)
                        }
                        
                        VStack(spacing: AppSpacing.xxs) {
                            Text("Welcome Back")
                                .font(AppTypography.largeTitle)
                                .foregroundColor(.white)
                            
                            Text("Sign in to continue to your workspace")
                                .font(AppTypography.subheadline)
                                .foregroundColor(Color.white.opacity(0.65))
                        }
                    }
                    
                    // Input Card Container
                    VStack(spacing: AppSpacing.md) {
                        // Email Field
                        HStack(spacing: AppSpacing.sm) {
                            Image(systemName: "envelope.fill")
                                .foregroundColor(Color.white.opacity(0.5))
                                .frame(width: 20)
                            
                            TextField("you@company.com", text: $authViewModel.email)
                                .font(AppTypography.body)
                                .foregroundColor(.white)
                                .autocapitalization(.none)
                                .keyboardType(.emailAddress)
                                .disableAutocorrection(true)
                        }
                        .padding(.horizontal, AppSpacing.md)
                        .padding(.vertical, 14)
                        .background(
                            RoundedRectangle(cornerRadius: AppRadius.md, style: .continuous)
                                .fill(Color.white.opacity(0.08))
                                .overlay(
                                    RoundedRectangle(cornerRadius: AppRadius.md, style: .continuous)
                                        .stroke(Color.white.opacity(0.12), lineWidth: 1)
                                )
                        )
                        
                        // Password Field
                        HStack(spacing: AppSpacing.sm) {
                            Image(systemName: "lock.fill")
                                .foregroundColor(Color.white.opacity(0.5))
                                .frame(width: 20)
                            
                            if authViewModel.isPasswordVisible {
                                TextField("Password", text: $authViewModel.password)
                                    .font(AppTypography.body)
                                    .foregroundColor(.white)
                                    .autocapitalization(.none)
                            } else {
                                SecureField("Password", text: $authViewModel.password)
                                    .font(AppTypography.body)
                                    .foregroundColor(.white)
                            }
                            
                            Button(action: {
                                authViewModel.isPasswordVisible.toggle()
                            }) {
                                Image(systemName: authViewModel.isPasswordVisible ? "eye.slash.fill" : "eye.fill")
                                    .foregroundColor(Color.white.opacity(0.5))
                            }
                        }
                        .padding(.horizontal, AppSpacing.md)
                        .padding(.vertical, 14)
                        .background(
                            RoundedRectangle(cornerRadius: AppRadius.md, style: .continuous)
                                .fill(Color.white.opacity(0.08))
                                .overlay(
                                    RoundedRectangle(cornerRadius: AppRadius.md, style: .continuous)
                                        .stroke(Color.white.opacity(0.12), lineWidth: 1)
                                )
                        )
                        
                        // Forgot Password Link
                        HStack {
                            Spacer()
                            NavigationLink(destination: ForgotPasswordView().environmentObject(authViewModel)) {
                                Text("Forgot password?")
                                    .font(AppTypography.footnote)
                                    .foregroundColor(Color.white.opacity(0.7))
                            }
                        }
                    }
                    .padding(.horizontal, AppSpacing.lg)
                    
                    // Sign In Button
                    VStack(spacing: AppSpacing.lg) {
                        AppButton("Sign In", isLoading: authViewModel.isLoading) {
                            Task {
                                await authViewModel.login()
                            }
                        }
                        .buttonStyle(PressableButtonStyle())
                        .padding(.horizontal, AppSpacing.lg)
                        

                    }
                    
                    // Don't have an account? Sign Up
                    HStack(spacing: AppSpacing.xxs) {
                        Text("Don't have an account?")
                            .font(AppTypography.subheadline)
                            .foregroundColor(Color.white.opacity(0.6))
                        
                        NavigationLink(destination: RegisterView().environmentObject(authViewModel)) {
                            Text("Sign Up")
                                .font(AppTypography.headline)
                                .foregroundColor(AppColors.accentSky)
                        }
                        .buttonStyle(PressableButtonStyle())
                    }
                    .padding(.top, AppSpacing.sm)
                    
                    Spacer(minLength: 40)
                }
            }
            }
        }
        .withToast()
    }
}
