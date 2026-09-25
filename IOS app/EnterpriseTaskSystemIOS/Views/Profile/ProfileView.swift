import SwiftUI
import PhotosUI

/// Profile & Settings Screen matching Web Frontend Unified Dashboard.
public struct ProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()
    @EnvironmentObject private var authViewModel: AuthViewModel
    
    @State private var showingOtpSheet = false
    
    // Photo Picker States
    @State private var selectedProfileItem: PhotosPickerItem?
    @State private var selectedCoverItem: PhotosPickerItem?
    
    // Designation options
    private let designations = [
        "CEO", "Employee", "Developer", "Designer", 
        "QA Engineer", "Project Manager", "Specialist", 
        "HR Specialist", "Analyst"
    ]
    
    // Department options
    private let departments = [
        "Engineering", "Design", "Product", "HR", 
        "Management", "QA", "Sales", "Marketing"
    ]
    
    private var canEditType: Bool {
        return authViewModel.currentUser?.isAdmin == true
    }
    
    private var hasUnsavedChanges: Bool {
        return viewModel.designation != (authViewModel.currentUser?.designation ?? "Full Stack Developer") ||
               viewModel.department != (authViewModel.currentUser?.department ?? "Engineering") ||
               viewModel.profilePicture != authViewModel.currentUser?.profilePicture ||
               viewModel.coverPicture != authViewModel.currentUser?.coverPicture
    }
    
    public var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: AppSpacing.md) {
                // Unified Header (Cover + Avatar + Info)
                ZStack(alignment: .top) {
                    // Cover Photo Area
                    PhotosPicker(selection: $selectedCoverItem, matching: .images, photoLibrary: .shared()) {
                        ZStack(alignment: .topTrailing) {
                            if let coverPicBase64 = viewModel.coverPicture?.components(separatedBy: ",").last,
                               let data = Data(base64Encoded: coverPicBase64),
                               let uiImage = UIImage(data: data) {
                                Image(uiImage: uiImage)
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .frame(height: 140)
                                    .clipped()
                                    .cornerRadius(16)
                            } else {
                                Rectangle()
                                    .fill(LinearGradient(gradient: Gradient(colors: [AppColors.primary.opacity(0.3), AppColors.primary.opacity(0.7)]), startPoint: .topLeading, endPoint: .bottomTrailing))
                                    .frame(height: 140)
                                    .cornerRadius(16)
                            }
                            
                            // Cover Camera Icon Overlay
                            Image(systemName: "camera.fill")
                                .font(.system(size: 14))
                                .foregroundColor(.white)
                                .padding(8)
                                .background(Color.black.opacity(0.5))
                                .clipShape(Circle())
                                .padding(12)
                        }
                    }
                    .onChange(of: selectedCoverItem) { _, newItem in
                        Task {
                            if let data = try? await newItem?.loadTransferable(type: Data.self) {
                                viewModel.handlePhotoSelection(data: data, isCover: true)
                            }
                        }
                    }
                    
                    VStack(spacing: AppSpacing.sm) {
                        // Profile Avatar
                        PhotosPicker(selection: $selectedProfileItem, matching: .images, photoLibrary: .shared()) {
                            ZStack(alignment: .bottomTrailing) {
                                if let profilePicBase64 = viewModel.profilePicture?.components(separatedBy: ",").last,
                                   let data = Data(base64Encoded: profilePicBase64),
                                   let uiImage = UIImage(data: data) {
                                    Image(uiImage: uiImage)
                                        .resizable()
                                        .aspectRatio(contentMode: .fill)
                                        .frame(width: 90, height: 90)
                                        .clipShape(Circle())
                                        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
                                        .overlay(Circle().stroke(AppColors.cardSurface, lineWidth: 3))
                                } else {
                                    Circle()
                                        .fill(AppColors.cardSurface)
                                        .frame(width: 90, height: 90)
                                        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
                                        .overlay(
                                            Circle()
                                                .fill(AppColors.primary.opacity(0.15))
                                                .frame(width: 84, height: 84)
                                        )
                                    
                                    Text(authViewModel.currentUser?.initials ?? "AY")
                                        .font(.system(size: 32, weight: .bold))
                                        .foregroundColor(AppColors.primary)
                                }
                                
                                // Avatar Camera Icon Overlay
                                Image(systemName: "camera.fill")
                                    .font(.system(size: 14))
                                    .foregroundColor(.white)
                                    .padding(6)
                                    .background(Color.black.opacity(0.5))
                                    .clipShape(Circle())
                                    .offset(x: 2, y: -16)
                                
                                // Online Green Dot
                                Circle()
                                    .fill(AppColors.success)
                                    .frame(width: 18, height: 18)
                                    .overlay(Circle().stroke(AppColors.cardSurface, lineWidth: 3))
                            }
                            .padding(.top, 95) // Push avatar down to overlap cover photo
                        }
                        .onChange(of: selectedProfileItem) { _, newItem in
                            Task {
                                if let data = try? await newItem?.loadTransferable(type: Data.self) {
                                    viewModel.handlePhotoSelection(data: data, isCover: false)
                                }
                            }
                        }
                        
                        Text(authViewModel.currentUser?.name ?? "Employee")
                            .font(AppTypography.title2)
                            .foregroundColor(AppColors.textPrimary)
                        
                        Text(authViewModel.currentUser?.displayRole ?? "Member")
                            .font(AppTypography.subheadline)
                            .foregroundColor(AppColors.textSecondary)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 4)
                            .background(AppColors.primary.opacity(0.1))
                            .cornerRadius(12)
                    }
                }
                .background(AppColors.cardSurface)
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 4)
                .padding(.horizontal, AppSpacing.md)
                .padding(.top, AppSpacing.sm)
                
                // Personal Details Card (Read-Only)
                AppCard(padding: AppSpacing.md) {
                    VStack(alignment: .leading, spacing: AppSpacing.md) {
                        Text("Personal Details")
                            .font(AppTypography.headline)
                            .foregroundColor(AppColors.textPrimary)
                        
                        Text("Name changes must be requested through HR. Email is tied to your account and cannot be edited.")
                            .font(AppTypography.caption)
                            .foregroundColor(AppColors.textSecondary)
                        
                        Divider()
                        
                        HStack {
                            Text("Full Name")
                                .foregroundColor(AppColors.textSecondary)
                                .font(AppTypography.body)
                            Spacer()
                            Text(viewModel.name)
                                .foregroundColor(AppColors.textPrimary)
                                .font(AppTypography.body)
                        }
                        
                        Divider()
                        
                        HStack {
                            Text("Email")
                                .foregroundColor(AppColors.textSecondary)
                                .font(AppTypography.body)
                            Spacer()
                            Text(authViewModel.currentUser?.email ?? "")
                                .foregroundColor(AppColors.textPrimary)
                                .font(AppTypography.body)
                            
                            if authViewModel.currentUser?.isVerified == true {
                                Image(systemName: "checkmark.seal.fill")
                                    .foregroundColor(AppColors.success)
                                    .font(.system(size: 14))
                            }
                        }
                    }
                }
                .padding(.horizontal, AppSpacing.md)
                
                // Contact & Work Information Card (Editable + OTP)
                AppCard(padding: AppSpacing.md) {
                    VStack(alignment: .leading, spacing: AppSpacing.md) {
                        Text("Contact & Work Information")
                            .font(AppTypography.headline)
                            .foregroundColor(AppColors.textPrimary)
                        
                        Divider()
                        
                        // Mobile Number
                        VStack(alignment: .leading, spacing: AppSpacing.xs) {
                            HStack {
                                Text("Mobile Number")
                                    .foregroundColor(AppColors.textSecondary)
                                    .font(AppTypography.body)
                                Spacer()
                                if authViewModel.currentUser?.isVerified == true {
                                    Image(systemName: "checkmark.seal.fill")
                                        .foregroundColor(AppColors.success)
                                        .font(.system(size: 14))
                                }
                            }
                            
                            HStack {
                                TextField("Code", text: $viewModel.countryCode)
                                    .frame(width: 50)
                                    .keyboardType(.phonePad)
                                    .padding(8)
                                    .background(AppColors.background)
                                    .cornerRadius(8)
                                
                                TextField("Enter Mobile Number", text: $viewModel.mobileNumber)
                                    .keyboardType(.phonePad)
                                    .padding(8)
                                    .background(AppColors.background)
                                    .cornerRadius(8)
                                
                                if viewModel.mobileNumber != (authViewModel.currentUser?.mobileNumber ?? "") {
                                    Button("Verify") {
                                        Task {
                                            let success = await viewModel.requestPhoneChangeOtp()
                                            if success {
                                                withAnimation {
                                                    showingOtpSheet = true
                                                }
                                            }
                                        }
                                    }
                                    .foregroundColor(Color.white)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 8)
                                    .background(viewModel.isLoading ? AppColors.textTertiary : AppColors.primary)
                                    .cornerRadius(8)
                                    .disabled(viewModel.isLoading)
                                }
                            }
                        }
                        
                        Divider()
                        
                        // Designation (Role-Based)
                        HStack {
                            Text("Designation")
                                .foregroundColor(AppColors.textSecondary)
                                .font(AppTypography.body)
                            Spacer()
                            
                            if canEditType {
                                Picker("Designation", selection: $viewModel.designation) {
                                    ForEach(designations, id: \.self) { designation in
                                        Text(designation).tag(designation)
                                    }
                                }
                                .pickerStyle(MenuPickerStyle())
                                .accentColor(AppColors.primary)
                            } else {
                                Text(viewModel.designation)
                                    .foregroundColor(AppColors.textPrimary)
                                    .font(AppTypography.body)
                            }
                        }
                        
                        Divider()
                        
                        // Department (Role-Based)
                        HStack {
                            Text("Department")
                                .foregroundColor(AppColors.textSecondary)
                                .font(AppTypography.body)
                            Spacer()
                            
                            if canEditType {
                                Picker("Department", selection: $viewModel.department) {
                                    ForEach(departments, id: \.self) { dept in
                                        Text(dept).tag(dept)
                                    }
                                }
                                .pickerStyle(MenuPickerStyle())
                                .accentColor(AppColors.primary)
                            } else {
                                Text(viewModel.department)
                                    .foregroundColor(AppColors.textPrimary)
                                    .font(AppTypography.body)
                            }
                        }
                        
                        if hasUnsavedChanges {
                            Button(action: {
                                Task {
                                    await viewModel.updateProfile()
                                }
                            }) {
                                Text("Save Changes")
                                    .font(AppTypography.headline)
                                    .foregroundColor(Color.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                                    .background(viewModel.isLoading ? AppColors.textTertiary : AppColors.primary)
                                    .cornerRadius(12)
                            }
                            .disabled(viewModel.isLoading)
                            .padding(.top, AppSpacing.sm)
                        }
                    }
                }
                .padding(.horizontal, AppSpacing.md)
                
                // Preferences & Settings List
                AppCard(padding: AppSpacing.xs) {
                    VStack(spacing: 0) {
                        NavigationLink(destination: NotificationsSettingsSubView(viewModel: viewModel)) {
                            ProfileRowItem(icon: AppIcons.notificationBell, title: "Notifications")
                        }
                        
                        Divider().padding(.leading, 52)
                        
                        NavigationLink(destination: AppearanceSettingsView(viewModel: viewModel)) {
                            ProfileRowItem(icon: AppIcons.appearance, title: "Appearance")
                        }
                        
                        Divider().padding(.leading, 52)
                        
                        NavigationLink(destination: HelpSupportView()) {
                            ProfileRowItem(icon: AppIcons.helpSupport, title: "Help & Support")
                        }
                        
                        Divider().padding(.leading, 52)
                        
                        NavigationLink(destination: SecuritySettingsView(viewModel: viewModel)) {
                            ProfileRowItem(icon: AppIcons.settings, title: "Settings")
                        }
                    }
                }
                .padding(.horizontal, AppSpacing.md)
                
                // Sign Out Action Button
                SecondaryButton("Sign Out", icon: AppIcons.signOut, isDestructive: true) {
                    viewModel.signOut()
                }
                .padding(.horizontal, AppSpacing.md)
                .padding(.top, AppSpacing.xs)
                
                Spacer(minLength: 40)
            }
        }
        .appScreenBackground()
        .navigationBarHidden(true)
        .alert(isPresented: $viewModel.showAlert) {
            Alert(title: Text("Profile"), message: Text(viewModel.alertMessage ?? ""), dismissButton: .default(Text("OK")))
        }
        .sheet(isPresented: $showingOtpSheet) {
            NavigationView {
                Form {
                    Section(header: Text("Enter the 6-digit OTP sent to your new mobile number")) {
                        TextField("OTP", text: $viewModel.otp)
                            .keyboardType(.numberPad)
                            .textContentType(.oneTimeCode)
                            .onChange(of: viewModel.otp) { _, newValue in
                                let filtered = newValue.filter { $0.isNumber }
                                if filtered.count > 6 {
                                    viewModel.otp = String(filtered.prefix(6))
                                } else {
                                    viewModel.otp = filtered
                                }
                            }
                        
                        Button("Verify & Save") {
                            Task {
                                let success = await viewModel.verifyPhoneChangeOtp()
                                if success {
                                    showingOtpSheet = false
                                }
                            }
                        }
                        .disabled(viewModel.otp.count != 6 || viewModel.isLoading)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .foregroundColor(viewModel.otp.count == 6 ? AppColors.primary : AppColors.textTertiary)
                    }
                }
                .navigationTitle("Verify Phone")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .navigationBarLeading) {
                        Button("Cancel") {
                            showingOtpSheet = false
                            viewModel.isVerifyingOtp = false
                        }
                    }
                }
            }
        }
        .onAppear {
            // Update local state when view appears
            viewModel.mobileNumber = authViewModel.currentUser?.mobileNumber ?? ""
            viewModel.designation = authViewModel.currentUser?.designation ?? "Full Stack Developer"
            viewModel.department = authViewModel.currentUser?.department ?? "Engineering"
            viewModel.profilePicture = authViewModel.currentUser?.profilePicture
            viewModel.coverPicture = authViewModel.currentUser?.coverPicture
        }
    }
}


private struct ProfileRowItem: View {
    let icon: String
    let title: String
    
    var body: some View {
        HStack(spacing: AppSpacing.md) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(AppColors.textSecondary)
                .frame(width: 24)
            
            Text(title)
                .font(AppTypography.body)
                .foregroundColor(AppColors.textPrimary)
            
            Spacer()
            
            Image(systemName: AppIcons.chevronRight)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(AppColors.textTertiary)
        }
        .padding(.horizontal, AppSpacing.md)
        .padding(.vertical, 14)
    }
}

private struct NotificationsSettingsSubView: View {
    @ObservedObject var viewModel: ProfileViewModel
    
    var body: some View {
        Form {
            Section("Notification Channels") {
                Toggle("In-App Push Alerts", isOn: $viewModel.notificationsEnabled)
                Toggle("Email Digest", isOn: .constant(true))
            }
        }
        .navigationTitle("Notifications")
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct HelpSupportView: View {
    var body: some View {
        List {
            Section("Documentation") {
                Text("WorkMate Enterprise Guide v1.0")
                Text("System Status: All systems operational")
            }
            Section("Support") {
                Text("Contact IT Helpdesk: support@company.com")
            }
        }
        .navigationTitle("Help & Support")
        .navigationBarTitleDisplayMode(.inline)
    }
}
