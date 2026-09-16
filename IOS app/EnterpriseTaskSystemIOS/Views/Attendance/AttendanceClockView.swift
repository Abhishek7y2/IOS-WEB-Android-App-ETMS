import SwiftUI
import CoreLocation

struct AttendanceClockView: View {
    @StateObject private var viewModel = AttendanceViewModel()
    @StateObject private var locationManager = LocationManager()
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 30) {
                Spacer()
                
                VStack(spacing: 8) {
                    Text(viewModel.durationString)
                        .font(.system(size: 48, weight: .bold, design: .monospaced))
                        .foregroundColor(.primary)
                    
                    Text(viewModel.isClockedIn ? "WORK SHIFT IN PROGRESS" : "NOT CLOCKED IN")
                        .font(.caption)
                        .fontWeight(.heavy)
                        .foregroundColor(viewModel.isClockedIn ? .green : .secondary)
                }
                
                Button(action: {
                    Task {
                        if viewModel.isClockedIn {
                            await viewModel.clockOut(coordinate: locationManager.userLocation)
                        } else {
                            await viewModel.clockIn(coordinate: locationManager.userLocation)
                        }
                    }
                }) {
                    ZStack {
                        Circle()
                            .fill(viewModel.isClockedIn ? Color.red : Color.green)
                            .frame(width: 180, height: 180)
                            .shadow(color: (viewModel.isClockedIn ? Color.red : Color.green).opacity(0.4), radius: 15, x: 0, y: 8)
                        
                        VStack(spacing: 6) {
                            Image(systemName: viewModel.isClockedIn ? "stop.fill" : "play.fill")
                                .font(.system(size: 40))
                                .foregroundColor(.white)
                            
                            Text(viewModel.isClockedIn ? "PUNCH OUT" : "PUNCH IN")
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                        }
                    }
                }
                .disabled(viewModel.isLoading)
                
                if let location = locationManager.userLocation {
                    HStack(spacing: 6) {
                        Image(systemName: "location.fill")
                            .foregroundColor(.blue)
                        Text(String(format: "Lat: %.4f, Lng: %.4f", location.latitude, location.longitude))
                            .font(.footnote)
                            .foregroundColor(.secondary)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(20)
                }
                
                if let msg = viewModel.statusMessage {
                    Text(msg)
                        .font(.subheadline)
                        .foregroundColor(msg.contains("Successfully") ? .green : .red)
                }
                
                Spacer()
            }
            .navigationTitle("Attendance Punch")
        }
    }
}
