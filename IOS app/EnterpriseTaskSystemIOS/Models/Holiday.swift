import Foundation

/// Core Company Holiday model matching backend Holiday schema.
public struct Holiday: Identifiable, Codable, Equatable {
    public let id: String
    public var holidayName: String
    public var holidayDate: Date
    public var holidayType: String
    public var description: String?
    public var location: String?
    public var isOptional: Bool?
    public var status: String?
    
    public enum CodingKeys: String, CodingKey {
        case id = "_id"
        case holidayName, holidayDate, holidayType, description, location, isOptional, status
    }
    
    public init(
        id: String,
        holidayName: String,
        holidayDate: Date,
        holidayType: String,
        description: String? = nil,
        location: String? = nil,
        isOptional: Bool? = false,
        status: String? = "Upcoming"
    ) {
        self.id = id
        self.holidayName = holidayName
        self.holidayDate = holidayDate
        self.holidayType = holidayType
        self.description = description
        self.location = location
        self.isOptional = isOptional
        self.status = status
    }
}
