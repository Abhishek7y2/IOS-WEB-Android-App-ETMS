import SwiftUI

/// Edit Personal Information Screen matching Web Frontend ProfileModal parity.
public struct PersonalInformationView: View {
    @ObservedObject var viewModel: ProfileViewModel
    @Environment(\.presentationMode) private var presentationMode
    
    @State private var showingOtpSheet = false
    
    // Designation options
    private let designations = [
        "CEO", "Employee", "Developer", "Designer", 
        "QA Engineer", "Project Manager", "Specialist", 
        "HR Specialist", "Analyst"
    ]
    
    // Check if user has permission to edit Employee Type
    private var canEditType: Bool {
        return viewModel.user?.isAdmin == true
    }
    
    public var body: some View {
        Form {
            Section(header: Text("Personal Details"), footer: Text("Name changes must be requested through HR. Email is tied to your account and cannot be edited.")) {
                // Name (Read-Only)
                HStack {
                    Text("Full Name")
                        .foregroundColor(AppColors.textSecondary)
                    Spacer()
                    Text(viewModel.name)
                        .foregroundColor(AppColors.textPrimary)
                }
                
                // Email (Read-Only)
                HStack {
                    Text("Email")
                        .foregroundColor(AppColors.textSecondary)
                    Spacer()
                    Text(viewModel.user?.email ?? "")
                        .foregroundColor(AppColors.textPrimary)
                    
                    if viewModel.user?.isVerified == true {
                        Image(systemName: "checkmark.seal.fill")
                            .foregroundColor(AppColors.success)
                            .font(.system(size: 14))
                    }
                }
                
                // Phone (Editable with OTP)
                HStack {
                    Text("Mobile")
                        .foregroundColor(AppColors.textSecondary)
                    Spacer()
                    
                    if viewModel.user?.isVerified == true {
                        Image(systemName: "checkmark.seal.fill")
                            .foregroundColor(AppColors.success)
                            .font(.system(size: 14))
                    }
                }
                
                HStack {
                    TextField("Country Code", text: $viewModel.countryCode)
                        .frame(width: 50)
                        .keyboardType(.phonePad)
                    
                    TextField("Mobile Number", text: $viewModel.mobileNumber)
                        .keyboardType(.phonePad)
                    
                    if viewModel.mobileNumber != (viewModel.user?.mobileNumber ?? "") {
                        Button("Verify") {
                            Task {
                                let success = await viewModel.requestPhoneChangeOtp()
                                if success {
                                    showingOtpSheet = true
                                }
                            }
                        }
                        .foregroundColor(AppColors.primary)
                        .font(AppTypography.caption)
                        .disabled(viewModel.isLoading)
                    }
                }
            }
            
            Section(header: Text("Work Information")) {
                // Designation (Role-based Edit)
                if canEditType {
                    Picker("Employee Type", selection: $viewModel.designation) {
                        ForEach(designations, id: \.self) { designation in
                            Text(designation).tag(designation)
                        }
                    }
                } else {
                    HStack {
                        Text("Employee Type")
                            .foregroundColor(AppColors.textSecondary)
                        Spacer()
                        Text(viewModel.designation)
                            .foregroundColor(AppColors.textPrimary)
                    }
                }
                
                HStack {
                    Text("Department")
                        .foregroundColor(AppColors.textSecondary)
                    Spacer()
                    Text(viewModel.department)
                        .foregroundColor(AppColors.textPrimary)
                }
            }
        }
        .navigationTitle("Personal Information")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Save") {
                    Task {
                        // Regular save (only updates designation/department if allowed)
                        let success = await viewModel.updateProfile()
                        if success {
                            presentationMode.wrappedValue.dismiss()
                        }
                    }
                }
                .font(AppTypography.headline)
                .disabled(viewModel.isLoading)
            }
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
    }
}
