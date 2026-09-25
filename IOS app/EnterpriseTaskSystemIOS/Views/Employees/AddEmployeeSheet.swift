import SwiftUI

/// Modal sheet for creating a new employee account (matching web-frontend Add Employee Modal).
public struct AddEmployeeSheet: View {
    @ObservedObject var viewModel: EmployeesViewModel
    @Environment(\.presentationMode) private var presentationMode
    @EnvironmentObject private var authViewModel: AuthViewModel
    
    @State private var firstName: String = ""
    @State private var lastName: String = ""
    @State private var email: String = ""
    @State private var password: String = ""
    @State private var designation: String = "Software Developer"
    @State private var role: String = "member"
    @State private var isSubmitting: Bool = false
    @State private var errorMessage: String?
    @State private var showSuccessAlert: Bool = false
    
    private let designations = [
        "Admin",
        "Software Developer",
        "Senior Developer",
        "Product Designer",
        "QA Analyst",
        "Project Manager",
        "HR Specialist",
        "Intern"
    ]
    
    public init(viewModel: EmployeesViewModel) {
        self.viewModel = viewModel
    }
    
    public var body: some View {
        NavigationStack {
            Form {
                Section("Personal Details") {
                    TextField("First Name", text: $firstName)
                        .onChange(of: firstName) { _, newValue in
                            var val = newValue.replacingOccurrences(of: "[^a-zA-Z]", with: "", options: .regularExpression)
                            if !val.isEmpty { val = val.prefix(1).uppercased() + val.dropFirst() }
                            if val.count > 50 { val = String(val.prefix(50)) }
                            if val != newValue { firstName = val }
                        }
                    TextField("Last Name", text: $lastName)
                        .onChange(of: lastName) { _, newValue in
                            var val = newValue.replacingOccurrences(of: "[^a-zA-Z\\s'-]", with: "", options: .regularExpression)
                            // Basic capitalization of first letter
                            if !val.isEmpty { val = val.prefix(1).uppercased() + val.dropFirst() }
                            if val.count > 50 { val = String(val.prefix(50)) }
                            if val != newValue { lastName = val }
                        }
                    TextField("Email Address", text: $email)
                        .keyboardType(.emailAddress)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                        .onChange(of: email) { _, newValue in
                            let val = newValue.lowercased().replacingOccurrences(of: "\\s", with: "", options: .regularExpression)
                            if val != newValue { email = val }
                        }
                }
                
                Section("Account Credentials") {
                    HStack {
                        SecureField("Password", text: $password)
                        
                        Button(action: generateRandomPassword) {
                            Image(systemName: "dice.fill")
                                .foregroundColor(AppColors.primary)
                        }
                    }
                    
                    Text("Auto-generate a secure random password with 🎲")
                        .font(AppTypography.caption)
                        .foregroundColor(AppColors.textSecondary)
                }
                
                Section("Role & Designation") {
                    Picker("Designation", selection: $designation) {
                        ForEach(designations, id: \.self) { des in
                            Text(des).tag(des)
                        }
                    }
                    
                    Picker("Access Role", selection: $role) {
                        Text("Member").tag("member")
                        if authViewModel.currentUser?.isSuperAdmin == true {
                            Text("Admin").tag("admin")
                            Text("Super Admin").tag("superadmin")
                        }
                    }
                    .pickerStyle(.segmented)
                }
                
                if let err = errorMessage {
                    Section {
                        Text(err)
                            .font(AppTypography.caption)
                            .foregroundColor(AppColors.danger)
                    }
                }
            }
            .navigationTitle("Add Team Member")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") {
                        submit()
                    }
                    .font(AppTypography.headline)
                    .disabled(firstName.isEmpty || email.isEmpty || password.isEmpty || isSubmitting)
                }
            }
            .onAppear {
                generateRandomPassword()
            }
            .alert("Success", isPresented: $showSuccessAlert) {
                Button("OK", role: .cancel) {
                    presentationMode.wrappedValue.dismiss()
                }
            } message: {
                Text("Employee created successfully. An email has been sent to them with their login credentials.")
            }
        }
    }
    
    private func generateRandomPassword() {
        let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
        var pass = ""
        for _ in 0..<12 {
            if let randomChar = chars.randomElement() {
                pass.append(randomChar)
            }
        }
        self.password = pass
    }
    
    private func submit() {
        let fullName = "\(firstName.trimmingCharacters(in: .whitespacesAndNewlines)) \(lastName.trimmingCharacters(in: .whitespacesAndNewlines))".trimmingCharacters(in: .whitespacesAndNewlines)
        guard !fullName.isEmpty, !email.isEmpty, !password.isEmpty else {
            errorMessage = "Please fill in all required fields."
            return
        }
        
        if let nameError = ValidationUtils.getNameValidationError(firstName: firstName, lastName: lastName) {
            errorMessage = nameError
            return
        }
        
        if !ValidationUtils.isValidEmail(email) {
            errorMessage = "Please enter a valid email address."
            return
        }
        
        if let passError = ValidationUtils.getPasswordValidationError(password) {
            errorMessage = passError
            return
        }
        
        isSubmitting = true
        errorMessage = nil
        
        Task {
            let success = await viewModel.addEmployee(
                name: fullName,
                firstName: firstName.trimmingCharacters(in: .whitespacesAndNewlines),
                lastName: lastName.trimmingCharacters(in: .whitespacesAndNewlines),
                email: email,
                password: password,
                designation: designation,
                role: role
            )
            isSubmitting = false
            if success {
                showSuccessAlert = true
            } else {
                errorMessage = viewModel.errorMessage ?? "Failed to add employee."
            }
        }
    }
}

public struct ValidationUtils {
    
    // MARK: - Email Validation
    public static func isValidEmail(_ email: String) -> Bool {
        let trimmed = email.trimmingCharacters(in: .whitespacesAndNewlines)
        
        if trimmed.count > 254 || trimmed.isEmpty { return false }
        
        let parts = trimmed.split(separator: "@", omittingEmptySubsequences: false)
        if parts.count != 2 { return false }
        
        let localPart = parts[0]
        let domainPart = parts[1]
        
        if localPart.count > 64 || localPart.isEmpty { return false }
        if domainPart.isEmpty { return false }
        
        if trimmed.contains("..") { return false }
        if localPart.hasPrefix(".") || localPart.hasSuffix(".") { return false }
        if domainPart.hasPrefix("-") || domainPart.hasSuffix("-") { return false }
        if domainPart.hasPrefix(".") || domainPart.hasSuffix(".") { return false }
        
        let emailRegex = "^(?![\\.])(?!.*\\.\\.)[a-zA-Z0-9._%+-]+(?<!\\.)@[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\\.[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\\.[a-zA-Z]{2,4}$"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        if !emailPredicate.evaluate(with: trimmed) { return false }
        
        let lowerTrimmed = trimmed.lowercased()
        let invalidTLDs = [".cov", ".con", ".cm", ".cpm", ".co.n", ".comn", ".comm", ".co.uk.co", ".co.in.co"]
        for tld in invalidTLDs {
            if lowerTrimmed.hasSuffix(tld) { return false }
        }
        
        let domain = String(domainPart).lowercased()
        if domain.hasPrefix("gmail.") && domain != "gmail.com" { return false }
        if domain.hasPrefix("googlemail.") && domain != "googlemail.com" { return false }
        if domain.hasPrefix("yahoo.") && !["yahoo.com", "yahoo.co.in", "yahoo.co.uk", "yahoo.ca"].contains(domain) { return false }
        if domain.hasPrefix("hotmail.") && !["hotmail.com", "hotmail.co.uk"].contains(domain) { return false }
        if domain.hasPrefix("outlook.") && !["outlook.com", "outlook.co.in"].contains(domain) { return false }
        
        if lowerTrimmed.hasSuffix("@gmail.co") || lowerTrimmed.hasSuffix("@yahoo.co") || lowerTrimmed.hasSuffix("@hotmail.co") { return false }
        
        return true
    }
    
    // MARK: - Password Validation
    private static let commonPasswords = [
        "password", "password123", "qwerty", "admin123", "12345678", "welcome123"
    ]
    
    public static func getPasswordValidationError(_ password: String) -> String? {
        if password.isEmpty {
            return "Please enter your password."
        }
        if password.trimmingCharacters(in: .whitespaces).isEmpty {
            return "Password cannot consist only of spaces."
        }
        if commonPasswords.contains(password.lowercased()) {
            return "This password is too common and insecure. Please choose a different one."
        }
        
        if password.count < 8 || password.count > 64 {
            return "Password must be between 8 and 64 characters."
        }
        if password.rangeOfCharacter(from: CharacterSet.uppercaseLetters) == nil {
            return "Password must contain at least one uppercase letter."
        }
        if password.rangeOfCharacter(from: CharacterSet.lowercaseLetters) == nil {
            return "Password must contain at least one lowercase letter."
        }
        if password.rangeOfCharacter(from: CharacterSet.decimalDigits) == nil {
            return "Password must contain at least one number."
        }
        
        let specialChars = CharacterSet(charactersIn: "!@#$%^&*()_+=-[]{};:',.<>/?\\|`~")
        if password.rangeOfCharacter(from: specialChars) == nil {
            return "Password must contain at least one special character."
        }
        
        return nil
    }
    
    // MARK: - Name Validation
    public static func getNameValidationError(firstName: String, lastName: String) -> String? {
        if firstName.trimmingCharacters(in: .whitespaces).count < 2 {
            return "First name must be at least 2 characters long."
        }
        if lastName.trimmingCharacters(in: .whitespaces).count < 2 {
            return "Last name must be at least 2 characters long."
        }
        return nil
    }
}
