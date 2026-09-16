import Foundation
import CoreLocation

@MainActor
class AttendanceViewModel: ObservableObject {
    @Published var isClockedIn: Bool = false
    @Published var clockInTime: Date?
    @Published var clockOutTime: Date?
    @Published var durationString: String = "00:00:00"
    @Published var isLoading: Bool = false
    @Published var statusMessage: String?
    
    private var timer: Timer?
    
    func clockIn(coordinate: CLLocationCoordinate2D?) async {
        isLoading = true
        statusMessage = nil
        let lat = coordinate?.latitude ?? 0.0
        let lng = coordinate?.longitude ?? 0.0
        
        do {
            // Send REST request to Node.js Backend: POST /api/attendance/check-in
            guard let url = URL(string: "http://localhost:5000/api/attendance/check-in") else { return }
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            if let token = KeychainService.shared.getToken() {
                request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            }
            
            let body: [String: Any] = ["latitude": lat, "longitude": lng]
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
            
            let (_, response) = try await URLSession.shared.data(for: request)
            if (response as? HTTPURLResponse)?.statusCode == 200 || (response as? HTTPURLResponse)?.statusCode == 201 {
                self.isClockedIn = true
                self.clockInTime = Date()
                self.startTimer()
                self.statusMessage = "Successfully Clocked In!"
            }
        } catch {
            self.statusMessage = "Failed to clock in."
        }
        isLoading = false
    }
    
    func clockOut(coordinate: CLLocationCoordinate2D?) async {
        isLoading = true
        statusMessage = nil
        let lat = coordinate?.latitude ?? 0.0
        let lng = coordinate?.longitude ?? 0.0
        
        do {
            guard let url = URL(string: "http://localhost:5000/api/attendance/check-out") else { return }
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            if let token = KeychainService.shared.getToken() {
                request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            }
            
            let body: [String: Any] = ["latitude": lat, "longitude": lng]
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
            
            let (_, response) = try await URLSession.shared.data(for: request)
            if (response as? HTTPURLResponse)?.statusCode == 200 {
                self.isClockedIn = false
                self.clockOutTime = Date()
                self.stopTimer()
                self.statusMessage = "Successfully Clocked Out!"
            }
        } catch {
            self.statusMessage = "Failed to clock out."
        }
        isLoading = false
    }
    
    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            guard let self = self, let startTime = self.clockInTime else { return }
            let elapsed = Int(Date().timeIntervalSince(startTime))
            let hours = elapsed / 3600
            let minutes = (elapsed % 3600) / 60
            let seconds = elapsed % 60
            DispatchQueue.main.async {
                self.durationString = String(format: "%02d:%02d:%02d", hours, minutes, seconds)
            }
        }
    }
    
    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }
}
