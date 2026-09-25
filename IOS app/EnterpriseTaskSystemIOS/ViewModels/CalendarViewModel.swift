import Foundation
import SwiftUI

/// View Model for Calendar and Company Holidays.
@MainActor
public final class CalendarViewModel: ObservableObject {
    @Published public var holidays: [Holiday] = []
    @Published public var selectedDate: Date = Date()
    @Published public var isLoading: Bool = false
    
    public init() {
        populateDefaultHolidays()
    }
    
    private func populateDefaultHolidays() {
        self.holidays = [
            Holiday(
                id: "hol_01",
                holidayName: "Mahatma Gandhi Jayanti",
                holidayDate: Calendar.current.date(byAdding: .day, value: 16, to: Date())!,
                holidayType: "National Holiday",
                description: "National observance"
            ),
            Holiday(
                id: "hol_02",
                holidayName: "Diwali Festival of Lights",
                holidayDate: Calendar.current.date(byAdding: .day, value: 45, to: Date())!,
                holidayType: "Public Holiday",
                description: "Corporate office closed"
            ),
            Holiday(
                id: "hol_03",
                holidayName: "Christmas Day",
                holidayDate: Calendar.current.date(byAdding: .day, value: 100, to: Date())!,
                holidayType: "Public Holiday",
                description: "Winter holiday celebration"
            )
        ]
    }
    
    public func fetchHolidays() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let list: [Holiday] = try await APIClient.shared.request(endpoint: .holidays(year: Calendar.current.component(.year, from: selectedDate)))
            if !list.isEmpty {
                self.holidays = list
            }
        } catch {
            print("Holidays fallback: \(error)")
        }
    }
}
