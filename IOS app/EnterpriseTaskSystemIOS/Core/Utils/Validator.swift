import Foundation

class Validator {
    static let shared = Validator()
    
    // Strict Regex for valid characters (Protects against XSS, SQLi, Control Chars, Spaces, Emojis)
    private let emailRegex = "^(?!\\.)(?!.*\\.\\.)[a-zA-Z0-9._%+-]+(?<!\\.)@[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\\.[a-zA-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\\.[a-zA-Z]{2,4}$"
    
    private let phoneRegex = "^[0-9]{10,15}$"
    
    func isValidEmail(_ email: String) -> Bool {
        let trimmed = email.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.count > 254 { return false }
        
        let predicate = NSPredicate(format:"SELF MATCHES %@", emailRegex)
        guard predicate.evaluate(with: trimmed) else { return false }
        
        // Legacy typos
        let lower = trimmed.lowercased()
        if lower.hasSuffix("@gmail.co") || lower.hasSuffix("@yahoo.co") || lower.hasSuffix("@hotmail.co") { return false }
        
        return true
    }
    
    func getPasswordValidationError(_ password: String) -> String? {
        if password.isEmpty { return "Please enter your password." }
        if password.count < 8 { return "Password must be at least 8 characters long." }
        let hasUpperCase = password.range(of: "[A-Z]", options: .regularExpression) != nil
        if !hasUpperCase { return "Password must contain at least one uppercase letter." }
        let hasLowerCase = password.range(of: "[a-z]", options: .regularExpression) != nil
        if !hasLowerCase { return "Password must contain at least one lowercase letter." }
        let hasNumber = password.range(of: "[0-9]", options: .regularExpression) != nil
        if !hasNumber { return "Password must contain at least one number." }
        let hasSymbol = password.range(of: "[!@#$%^&*()]", options: .regularExpression) != nil
        if !hasSymbol { return "Password must contain at least one special character (!@#$%^&*())." }
        return nil
    }
    
    func isValidPhone(_ phone: String) -> Bool {
        let predicate = NSPredicate(format:"SELF MATCHES %@", phoneRegex)
        return predicate.evaluate(with: phone)
    }
}
