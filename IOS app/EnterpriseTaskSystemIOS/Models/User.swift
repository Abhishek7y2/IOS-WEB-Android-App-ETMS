import Foundation

/// Core User Model representing authenticated employees and admins.
public struct User: Identifiable, Codable, Equatable {
    public let id: String
    public var name: String
    public var firstName: String?
    public var lastName: String?
    public var email: String
    public var role: UserRole
    public var mobileNumber: String?
    public var countryCode: String?
    public var designation: String?
    public var department: String?
    public var profilePicture: String?
    public var coverPicture: String?
    public var isVerified: Bool?
    public var isBlocked: Bool?
    public var isArchived: Bool?
    public var lastLogin: Date?
    public var token: String?
    public var refreshToken: String?
    
    public enum CodingKeys: String, CodingKey {
        case id = "_id"
        case name, firstName, lastName, email, role, mobileNumber, countryCode
        case designation, department, profilePicture, coverPicture, isVerified, isBlocked, isArchived
        case lastLogin, token, refreshToken
    }
    
    public init(
        id: String,
        name: String,
        firstName: String? = nil,
        lastName: String? = nil,
        email: String,
        role: UserRole = .member,
        mobileNumber: String? = nil,
        countryCode: String? = nil,
        designation: String? = nil,
        department: String? = nil,
        profilePicture: String? = nil,
        coverPicture: String? = nil,
        isVerified: Bool? = true,
        isBlocked: Bool? = false,
        isArchived: Bool? = false,
        lastLogin: Date? = nil,
        token: String? = nil,
        refreshToken: String? = nil
    ) {
        self.id = id
        self.name = name
        self.firstName = firstName
        self.lastName = lastName
        self.email = email
        self.role = role
        self.mobileNumber = mobileNumber
        self.countryCode = countryCode
        self.designation = designation
        self.department = department
        self.profilePicture = profilePicture
        self.coverPicture = coverPicture
        self.isVerified = isVerified
        self.isBlocked = isBlocked
        self.isArchived = isArchived
        self.lastLogin = lastLogin
        self.token = token
        self.refreshToken = refreshToken
    }
    
    public var initials: String {
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))".uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }
}

public enum UserRole: String, Codable {
    case member = "member"
    case admin = "admin"
    case superadmin = "superadmin"
    
    public var displayName: String {
        switch self {
        case .member: return "Employee"
        case .admin: return "Admin"
        case .superadmin: return "Super Admin"
        }
    }
}

// MARK: - Centralized Role-Based Access Control (RBAC)
extension User {
    /// Returns true if the user's role is `.superadmin`
    public var isSuperAdmin: Bool {
        return self.role == .superadmin
    }
    
    /// Returns true if the user's role is `.admin` or `.superadmin`
    public var isAdmin: Bool {
        return self.role == .superadmin || self.role == .admin
    }
    
    /// Returns a clean UI-friendly string for the user's strict internal role
    public var displayRole: String {
        switch self.role {
        case .superadmin: return "Super Admin"
        case .admin: return "Admin"
        default: return "Employee"
        }
    }
}

/// Login response payload DTO
public struct AuthResponseData: Codable {
    public let user: User
    public let token: String
    public let refreshToken: String?
}
