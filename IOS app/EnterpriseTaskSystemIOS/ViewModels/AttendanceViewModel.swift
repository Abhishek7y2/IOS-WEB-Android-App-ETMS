import Foundation
import SwiftUI
import Combine

/// View Model for Attendance management, live clock, break tracking, and history timeline.
@MainActor
public final class AttendanceViewModel: ObservableObject {
    @Published public var todayRecord: Attendance?
    @Published public var attendanceHistory: [Attendance] = []
    
    // Live Clock timer
    @Published public var liveClockString: String = "09:14:32"
    @Published public var isCheckedIn: Bool = true
    @Published public var isOnBreak: Bool = false
    @Published public var totalWorkHoursString: String = "07:42"
    @Published public var totalBreakHoursString: String = "01:18"
    
    @Published public var selectedWorkMode: String = "Office"
    @Published public var isLoading: Bool = false
    @Published public var errorMessage: String?
    
    private var timer: Timer?
    private var cancellables = Set<AnyCancellable>()
    
    public init() {
        populateDefaultAttendance()
        startLiveTimer()
        setupRealtime()
    }
    
    private func populateDefaultAttendance() {
        self.todayRecord = Attendance(
            id: "att_01",
            employeeId: "user_01",
            employeeName: "Abhishek Yadav",
            department: "Executive",
            designation: "CEO & Full Stack Architect",
            attendanceDate: "2026-09-16",
            checkInTime: Calendar.current.date(byAdding: .hour, value: -7, to: Date()),
            totalWorkingHours: 7.7,
            breakDuration: 1.3,
            attendanceStatus: .present,
            location: "San Francisco HQ - Floor 4",
            workMode: .office
        )
        
        self.attendanceHistory = [
            Attendance(
                id: "att_01",
                employeeName: "Abhishek Yadav",
                attendanceDate: "2026-09-16",
                checkInTime: Calendar.current.date(byAdding: .hour, value: -7, to: Date()),
                totalWorkingHours: 7.7,
                breakDuration: 1.3,
                attendanceStatus: .present,
                location: "San Francisco HQ",
                workMode: .office
            ),
            Attendance(
                id: "att_02",
                employeeName: "Abhishek Yadav",
                attendanceDate: "2026-09-15",
                checkInTime: Calendar.current.date(byAdding: .day, value: -1, to: Date()),
                checkOutTime: Calendar.current.date(byAdding: .hour, value: -16, to: Date()),
                totalWorkingHours: 8.5,
                breakDuration: 1.0,
                attendanceStatus: .present,
                location: "Remote / Home",
                workMode: .workFromHome
            ),
            Attendance(
                id: "att_03",
                employeeName: "Abhishek Yadav",
                attendanceDate: "2026-09-14",
                checkInTime: Calendar.current.date(byAdding: .day, value: -2, to: Date()),
                checkOutTime: Calendar.current.date(byAdding: .hour, value: -40, to: Date()),
                totalWorkingHours: 8.2,
                breakDuration: 0.8,
                attendanceStatus: .present,
                location: "Client Office",
                workMode: .onSite
            ),
            Attendance(
                id: "att_04",
                employeeName: "Abhishek Yadav",
                attendanceDate: "2026-09-13",
                checkInTime: Calendar.current.date(byAdding: .day, value: -3, to: Date()),
                checkOutTime: Calendar.current.date(byAdding: .hour, value: -64, to: Date()),
                totalWorkingHours: 8.0,
                breakDuration: 1.0,
                attendanceStatus: .present,
                location: "San Francisco HQ",
                workMode: .office
            )
        ]
    }
    
    deinit {
        timer?.invalidate()
    }
    
    private func startLiveTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            let formatter = DateFormatter()
            formatter.dateFormat = "HH:mm:ss"
            let str = formatter.string(from: Date())
            DispatchQueue.main.async {
                self.liveClockString = str
            }
        }
    }
    
    private func setupRealtime() {
        SocketManager.shared.attendanceUpdatedSubject
            .receive(on: DispatchQueue.main)
            .sink { [weak self] record in
                self?.todayRecord = record
                self?.isCheckedIn = record.isCurrentlyCheckedIn
                self?.isOnBreak = record.isOnBreak
                self?.totalWorkHoursString = record.formattedWorkHours
                self?.totalBreakHoursString = record.formattedBreakHours
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Fetch Today & History
    public func fetchAttendance() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        
        do {
            let records: [Attendance] = try await APIClient.shared.request(endpoint: .attendance(date: nil, startDate: nil, endDate: nil, employeeId: nil))
            if !records.isEmpty {
                self.attendanceHistory = records
                if let first = records.first {
                    self.todayRecord = first
                    self.isCheckedIn = first.isCurrentlyCheckedIn
                    self.isOnBreak = first.isOnBreak
                    self.totalWorkHoursString = first.formattedWorkHours
                    self.totalBreakHoursString = first.formattedBreakHours
                }
            }
        } catch {
            print("Attendance fetch fallback: \(error)")
        }
    }
    
    // MARK: - Clock In / Clock Out
    public func toggleCheckInOut() async {
        let impact = UINotificationFeedbackGenerator()
        if isCheckedIn {
            do {
                let updated: Attendance = try await APIClient.shared.request(endpoint: .checkOut, body: ["remarks": "Checked out via WorkMate iOS"])
                self.todayRecord = updated
                self.isCheckedIn = false
                self.isOnBreak = false
                impact.notificationOccurred(.success)
            } catch {
                self.isCheckedIn = false
            }
        } else {
            do {
                let loc = LocationManager.shared.locationName
                let updated: Attendance = try await APIClient.shared.request(endpoint: .checkIn, body: ["location": loc, "workMode": selectedWorkMode])
                self.todayRecord = updated
                self.isCheckedIn = true
                impact.notificationOccurred(.success)
            } catch {
                self.isCheckedIn = true
            }
        }
    }
    
    // MARK: - Start / End Break
    public func toggleBreak() async {
        if isOnBreak {
            do {
                let updated: Attendance = try await APIClient.shared.request(endpoint: .breakEnd)
                self.todayRecord = updated
                self.isOnBreak = false
            } catch {
                self.isOnBreak = false
            }
        } else {
            do {
                let updated: Attendance = try await APIClient.shared.request(endpoint: .breakStart)
                self.todayRecord = updated
                self.isOnBreak = true
            } catch {
                self.isOnBreak = true
            }
        }
    }
}
