import SwiftUI

/// Calendar & Company Holidays Screen.
public struct CalendarView: View {
    @StateObject private var viewModel = CalendarViewModel()
    
    public var body: some View {
        ScrollView(showsIndicators: false) {
                VStack(spacing: AppSpacing.lg) {
                    // Header Bar
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Calendar")
                            .font(AppTypography.title)
                            .foregroundColor(AppColors.textPrimary)
                        
                        Text("Company events & holidays")
                            .font(AppTypography.subheadline)
                            .foregroundColor(AppColors.textSecondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, AppSpacing.md)
                    .padding(.top, AppSpacing.xs)
                    
                    // Native Calendar DatePicker
                    AppCard(padding: AppSpacing.sm) {
                        DatePicker(
                            "Select Date",
                            selection: $viewModel.selectedDate,
                            displayedComponents: [.date]
                        )
                        .datePickerStyle(GraphicalDatePickerStyle())
                        .accentColor(AppColors.primary)
                    }
                    .padding(.horizontal, AppSpacing.md)
                    
                    // Upcoming Holidays Section
                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                        Text("Upcoming Holidays")
                            .font(AppTypography.headline)
                            .foregroundColor(AppColors.textPrimary)
                            .padding(.horizontal, AppSpacing.md)
                        
                        if viewModel.holidays.isEmpty {
                            AppCard(padding: AppSpacing.md) {
                                HStack(spacing: AppSpacing.sm) {
                                    Image(systemName: "calendar")
                                        .foregroundColor(AppColors.primary)
                                    Text("No upcoming company holidays this month.")
                                        .font(AppTypography.subheadline)
                                        .foregroundColor(AppColors.textSecondary)
                                    Spacer()
                                }
                            }
                            .padding(.horizontal, AppSpacing.md)
                        } else {
                            LazyVStack(spacing: AppSpacing.sm) {
                                ForEach(viewModel.holidays) { holiday in
                                    AppCard(padding: AppSpacing.md) {
                                        HStack(spacing: AppSpacing.md) {
                                            ZStack {
                                                Circle()
                                                    .fill(AppColors.accentSky.opacity(0.15))
                                                    .frame(width: 40, height: 40)
                                                
                                                Image(systemName: "flag.fill")
                                                    .foregroundColor(AppColors.primary)
                                            }
                                            
                                            VStack(alignment: .leading, spacing: 2) {
                                                Text(holiday.holidayName)
                                                    .font(AppTypography.headline)
                                                    .foregroundColor(AppColors.textPrimary)
                                                
                                                Text(DateFormatter.localizedString(from: holiday.holidayDate, dateStyle: .medium, timeStyle: .none))
                                                    .font(AppTypography.caption)
                                                    .foregroundColor(AppColors.textSecondary)
                                            }
                                            
                                            Spacer()
                                            
                                            StatusBadge(holiday.holidayType, color: AppColors.accentPurple)
                                        }
                                    }
                                }
                            }
                            .padding(.horizontal, AppSpacing.md)
                        }
                    }
                    
                    Spacer(minLength: 40)
                }
            }
            .appScreenBackground()
            .task {
                await viewModel.fetchHolidays()
            }
    }
}
