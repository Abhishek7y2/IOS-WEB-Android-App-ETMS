import SwiftUI

/// Apply for Leave Modal Form with native iOS DatePickers and validation.
public struct ApplyLeaveSheet: View {
    @ObservedObject var viewModel: LeaveViewModel
    @Environment(\.presentationMode) private var presentationMode
    
    @State private var selectedLeaveType: LeaveType = .annual
    @State private var startDate: Date = Date()
    @State private var endDate: Date = Date().addingTimeInterval(86400 * 2)
    @State private var isHalfDay: Bool = false
    @State private var halfDaySession: String = "Morning"
    @State private var reason: String = ""
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?
    
    private var totalDays: Double {
        if isHalfDay { return 0.5 }
        let calendar = Calendar.current
        let start = calendar.startOfDay(for: startDate)
        let end = calendar.startOfDay(for: endDate)
        let components = calendar.dateComponents([.day], from: start, to: end)
        return max(1.0, Double((components.day ?? 0) + 1))
    }
    
    private var availableBalance: Int {
        let matching = viewModel.leaveTypesBreakdown.first(where: { $0.name == selectedLeaveType.rawValue })
        return matching?.remaining ?? 0
    }
    
    private var validationError: String? {
        if availableBalance == 0 {
            return "You don't have remaining leaves for \(selectedLeaveType.rawValue)."
        }
        if totalDays > Double(availableBalance) {
            return "You have only \(availableBalance) leaves remaining. You are applying for \(String(format: "%.1f", totalDays)) days."
        }
        
        let calendar = Calendar.current
        if calendar.isDateInToday(startDate) {
            let hour = calendar.component(.hour, from: Date())
            let minute = calendar.component(.minute, from: Date())
            let timeInMinutes = (hour * 60) + minute
            
            if !isHalfDay {
                // Before 10 AM (10 * 60 = 600)
                if timeInMinutes >= 600 {
                    return "Full day leaves for today must be applied before 10:00 AM."
                }
            } else {
                if halfDaySession == "Morning" {
                    // Before 9 AM (9 * 60 = 540)
                    if timeInMinutes >= 540 {
                        return "Morning half-day leaves for today must be applied before 9:00 AM."
                    }
                } else {
                    // Before 1 PM (13 * 60 = 780)
                    if timeInMinutes >= 780 {
                        return "Afternoon half-day leaves for today must be applied before 1:00 PM."
                    }
                }
            }
        }
        
        return nil
    }
    
    public var body: some View {
        NavigationStack {
            Form {
                Section("Leave Type") {
                    Picker("Select Type", selection: $selectedLeaveType) {
                        ForEach(LeaveType.allCases, id: \.self) { type in
                            let balance = viewModel.leaveTypesBreakdown.first(where: { $0.name == type.rawValue })?.remaining ?? 0
                            Text("\(type.displayName) (\(balance) left)").tag(type)
                        }
                    }
                }
                
                Section("Duration") {
                    DatePicker("Start Date", selection: $startDate, in: Date()..., displayedComponents: [.date])
                    DatePicker("End Date", selection: $endDate, in: startDate..., displayedComponents: [.date])
                    
                    Toggle("Half Day", isOn: $isHalfDay)
                    
                    if isHalfDay {
                        Picker("Session", selection: $halfDaySession) {
                            Text("Morning").tag("Morning")
                            Text("Afternoon").tag("Afternoon")
                        }
                        .pickerStyle(.segmented)
                    }
                    
                    HStack {
                        Text("Total Days")
                        Spacer()
                        Text(String(format: "%.1f Days", totalDays))
                            .font(AppTypography.headline)
                            .foregroundColor(AppColors.primary)
                    }
                }
                
                Section("Reason") {
                    ZStack(alignment: .topLeading) {
                        if reason.isEmpty {
                            Text("Please provide a reason for your leave (min. 10 characters)...")
                                .foregroundColor(AppColors.textTertiary)
                                .padding(.top, 8)
                        }
                        TextEditor(text: $reason)
                            .frame(minHeight: 100)
                    }
                }
                
                if let err = errorMessage {
                    Section {
                        Text(err)
                            .font(AppTypography.caption)
                            .foregroundColor(AppColors.danger)
                    }
                } else if let err = validationError {
                    Section {
                        Text(err)
                            .font(AppTypography.caption)
                            .foregroundColor(AppColors.danger)
                    }
                }
            }
            .navigationTitle("Apply Leave")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Submit") {
                        Task {
                            guard reason.count >= 10 else {
                                errorMessage = "Reason must be at least 10 characters."
                                return
                            }
                            isLoading = true
                            let success = await viewModel.applyLeave(
                                leaveType: selectedLeaveType,
                                startDate: startDate,
                                endDate: endDate,
                                totalDays: totalDays,
                                halfDay: isHalfDay,
                                reason: reason
                            )
                            isLoading = false
                            if success {
                                presentationMode.wrappedValue.dismiss()
                            }
                        }
                    }
                    .font(AppTypography.headline)
                    .disabled(reason.count < 10 || isLoading || validationError != nil)
                }
            }
        }
    }
}
