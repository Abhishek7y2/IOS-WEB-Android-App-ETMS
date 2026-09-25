import SwiftUI

/// Main Home / Dashboard View matching Reference Mockup #2.
public struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    @EnvironmentObject private var authViewModel: AuthViewModel
    @EnvironmentObject private var appRouter: AppRouter
    @EnvironmentObject private var notificationViewModel: NotificationViewModel
    @State private var selectedTask: TaskItem?
    @State private var showProfileSheet: Bool = false
    
    private var greetingMessage: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12: return "Good Morning,"
        case 12..<17: return "Good Afternoon,"
        case 17..<21: return "Good Evening,"
        default: return "Good Night,"
        }
    }
    
    public var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: AppSpacing.lg) {
                    // Top Greeting Bar
                    HStack(spacing: AppSpacing.md) {
                        // User Avatar
                        Button(action: {
                            showProfileSheet = true
                        }) {
                            ZStack {
                                if let profilePicBase64 = authViewModel.currentUser?.profilePicture?.components(separatedBy: ",").last,
                                   let data = Data(base64Encoded: profilePicBase64),
                                   let uiImage = UIImage(data: data) {
                                    Image(uiImage: uiImage)
                                        .resizable()
                                        .aspectRatio(contentMode: .fill)
                                        .frame(width: 44, height: 44)
                                        .clipShape(Circle())
                                } else {
                                    Circle()
                                        .fill(AppColors.primary.opacity(0.15))
                                        .frame(width: 44, height: 44)
                                    
                                    Text(authViewModel.currentUser?.initials ?? "AY")
                                        .font(AppTypography.headline)
                                        .foregroundColor(AppColors.primary)
                                }
                            }
                        }
                        
                        VStack(alignment: .leading, spacing: 2) {
                            HStack(spacing: AppSpacing.xxs) {
                                Text(greetingMessage)
                                    .font(AppTypography.subheadline)
                                    .foregroundColor(AppColors.textSecondary)
                                
                                Text(authViewModel.currentUser?.firstName ?? "Abhishek")
                                    .font(AppTypography.headline)
                                    .foregroundColor(AppColors.textPrimary)
                                
                                Text("👋")
                            }
                            
                            Text("Have a productive day!")
                                .font(AppTypography.caption)
                                .foregroundColor(AppColors.textSecondary)
                        }
                        
                        Spacer()
                        
                        // Notification Bell Button
                        Button(action: {
                            appRouter.showNotificationsSheet = true
                        }) {
                            ZStack {
                                Circle()
                                    .fill(AppColors.cardSurface)
                                    .frame(width: 40, height: 40)
                                    .overlay(Circle().stroke(AppColors.border, lineWidth: 1))
                                
                                Image(systemName: AppIcons.notificationBell)
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundColor(AppColors.textPrimary)
                                
                                // Unread red badge dot
                                if !notificationViewModel.notifications.isEmpty {
                                    Circle()
                                        .fill(AppColors.danger)
                                        .frame(width: 8, height: 8)
                                        .offset(x: 10, y: -10)
                                }
                            }
                        }
                    }
                    .padding(.top, AppSpacing.xs)
                    
                    // Productivity Summary Card
                    Group {
                        if viewModel.isLoading {
                            AttendanceQuickCard(viewModel: viewModel)
                                .shimmer()
                        } else {
                            AttendanceQuickCard(viewModel: viewModel)
                        }
                    }
                    
                    // 2x2 Metric KPI Grid
                    Group {
                        if viewModel.isLoading {
                            DashboardMetricGrid(
                                totalTasks: viewModel.totalTasksCount,
                                pendingTasks: viewModel.pendingTasksCount,
                                inProgressTasks: viewModel.inProgressTasksCount,
                                completedTasks: viewModel.completedTasksCount
                            )
                            .shimmer()
                        } else {
                            DashboardMetricGrid(
                                totalTasks: viewModel.totalTasksCount,
                                pendingTasks: viewModel.pendingTasksCount,
                                inProgressTasks: viewModel.inProgressTasksCount,
                                completedTasks: viewModel.completedTasksCount
                            )
                        }
                    }
                    
                    // Progress Reports
                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                        Text("Progress Reports")
                            .font(AppTypography.headline)
                            .foregroundColor(AppColors.textPrimary)
                        
                        if viewModel.isLoading {
                            TaskTrendsCard(viewModel: viewModel).shimmer()
                            TaskBreakdownCard(viewModel: viewModel).shimmer()
                        } else {
                            TaskTrendsCard(viewModel: viewModel)
                            TaskBreakdownCard(viewModel: viewModel)
                        }
                    }
                    
                    // Communication Quick Access Cards
                    HStack(spacing: AppSpacing.sm) {
                        NavigationLink(destination: MessagesInboxView(initialCategory: .inbox)) {
                            AppCard(padding: AppSpacing.md) {
                                HStack(spacing: AppSpacing.sm) {
                                    ZStack {
                                        Circle()
                                            .fill(AppColors.primary.opacity(0.12))
                                            .frame(width: 38, height: 38)
                                        Image(systemName: "tray.fill")
                                            .font(.system(size: 16))
                                            .foregroundColor(AppColors.primary)
                                    }
                                    
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("Team Inbox")
                                            .font(AppTypography.captionBold)
                                            .foregroundColor(AppColors.textPrimary)
                                        Text("\(viewModel.unreadMessagesCount) unread")
                                            .font(AppTypography.caption)
                                            .foregroundColor(AppColors.textSecondary)
                                    }
                                    Spacer()
                                }
                            }
                        }
                        
                        NavigationLink(destination: MessagesInboxView(initialCategory: .announcements)) {
                            AppCard(padding: AppSpacing.md) {
                                HStack(spacing: AppSpacing.sm) {
                                    ZStack {
                                        Circle()
                                            .fill(AppColors.accentOrange.opacity(0.12))
                                            .frame(width: 38, height: 38)
                                        Image(systemName: "megaphone.fill")
                                            .font(.system(size: 16))
                                            .foregroundColor(AppColors.accentOrange)
                                    }
                                    
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text("Announcements")
                                            .font(AppTypography.captionBold)
                                            .foregroundColor(AppColors.textPrimary)
                                            .lineLimit(1)
                                            .minimumScaleFactor(0.8)
                                        Text("\(viewModel.activeAnnouncementsCount) active")
                                            .font(AppTypography.caption)
                                            .foregroundColor(AppColors.textSecondary)
                                    }
                                    Spacer()
                                }
                            }
                        }
                    }
                    
                    // Today's Tasks Section
                    TodayTasksSection(
                        tasks: viewModel.todayTasks,
                        onViewAll: {
                            appRouter.selectedTab = .tasks
                        },
                        onSelectTask: { task in
                            self.selectedTask = task
                        }
                    )
                    
                    // Recent Activity Feed Timeline
                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                        HStack {
                            Text("Recent Activity")
                                .font(AppTypography.headline)
                                .foregroundColor(AppColors.textPrimary)
                            Spacer()
                            Text("Live Feed")
                                .font(AppTypography.captionBold)
                                .foregroundColor(AppColors.primary)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Capsule().fill(AppColors.primary.opacity(0.1)))
                        }
                        
                        AppCard(padding: AppSpacing.md) {
                            VStack(alignment: .leading, spacing: AppSpacing.md) {
                                ForEach(viewModel.recentActivities) { activity in
                                    HStack(alignment: .top, spacing: AppSpacing.sm) {
                                        Circle()
                                            .fill(AppColors.success)
                                            .frame(width: 8, height: 8)
                                            .padding(.top, 5)
                                        
                                        VStack(alignment: .leading, spacing: 2) {
                                            HStack {
                                                Text(activity.employeeName)
                                                    .font(AppTypography.captionBold)
                                                    .foregroundColor(AppColors.textPrimary)
                                                Text(activity.action)
                                                    .font(AppTypography.caption)
                                                    .foregroundColor(AppColors.textSecondary)
                                            }
                                            Text(activity.taskTitle)
                                                .font(AppTypography.caption)
                                                .foregroundColor(AppColors.textPrimary)
                                                .lineLimit(1)
                                        }
                                        Spacer()
                                    }
                                }
                            }
                        }
                    }
                    
                    // Team Members Spotlight
                    if !viewModel.teamMembers.isEmpty {
                        VStack(alignment: .leading, spacing: AppSpacing.sm) {
                            HStack {
                                Text("Team Members")
                                    .font(AppTypography.headline)
                                    .foregroundColor(AppColors.textPrimary)
                                Spacer()
                                Button("View All") {
                                    appRouter.selectedTab = .employees
                                }
                                .font(AppTypography.captionBold)
                                .foregroundColor(AppColors.primary)
                            }
                            
                            VStack(spacing: AppSpacing.sm) {
                                ForEach(viewModel.teamMembers) { member in
                                    Button(action: {
                                        appRouter.requestedEmployeeProfileId = member.id
                                        appRouter.selectedTab = .employees
                                    }) {
                                        AppCard(padding: AppSpacing.md) {
                                            HStack(spacing: AppSpacing.md) {
                                                // Avatar circle
                                                ZStack {
                                                    Circle()
                                                        .fill(AppColors.primary.opacity(0.15))
                                                        .frame(width: 36, height: 36)
                                                    Text(member.initials)
                                                        .font(.system(size: 14, weight: .bold))
                                                        .foregroundColor(AppColors.primary)
                                                }
                                                
                                                VStack(alignment: .leading, spacing: 3) {
                                                    Text(member.name)
                                                        .font(AppTypography.headline)
                                                        .foregroundColor(AppColors.textPrimary)
                                                        .lineLimit(1)
                                                    
                                                    Text(member.designation ?? member.role.displayName)
                                                        .font(AppTypography.caption)
                                                        .foregroundColor(AppColors.textSecondary)
                                                        .lineLimit(1)
                                                }
                                                
                                                Spacer()
                                                
                                                Image(systemName: AppIcons.chevronRight)
                                                    .font(.system(size: 14, weight: .semibold))
                                                    .foregroundColor(AppColors.textTertiary)
                                            }
                                        }
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                }
                            }
                        }
                    }
                    
                    Spacer(minLength: 32)
                }
                .padding(.horizontal, AppSpacing.md)
            }
            .appScreenBackground()
            .navigationBarHidden(true)
            .refreshable {
                await viewModel.fetchDashboardData()
            }
            .task {
                await viewModel.fetchDashboardData()
            }
            .sheet(item: $selectedTask) { task in
                NavigationStack {
                    TaskDetailView(task: task)
                }
            }
            .sheet(isPresented: $showProfileSheet) {
                NavigationStack {
                    ProfileView()
                }
            }
        }
    }
}

public struct TaskBreakdownCard: View {
    @ObservedObject var viewModel: DashboardViewModel
    @EnvironmentObject private var appRouter: AppRouter
    @State private var selectedSegment: String? = nil
    
    public var body: some View {
        let total = max(1, viewModel.totalTasksCount)
        let completed = viewModel.completedTasksCount
        let pending = viewModel.pendingTasksCount
        let inProgress = viewModel.inProgressTasksCount
        
        let completedPct = String(format: "%.1f%%", Double(completed) / Double(total) * 100)
        let pendingPct = String(format: "%.1f%%", Double(pending) / Double(total) * 100)
        let inProgressPct = String(format: "%.1f%%", Double(inProgress) / Double(total) * 100)
        
        AppCard(padding: AppSpacing.lg) {
            VStack(alignment: .leading, spacing: AppSpacing.md) {
                HStack {
                    Text("TASK BREAKDOWN")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(AppColors.textPrimary)
                    Spacer()
                }
                
                HStack {
                    Spacer()
                    ExplodedDonutChart(segments: [
                        DonutSegmentData(value: Double(completed), color: (selectedSegment == nil || selectedSegment == "COMPLETED") ? .red : .red.opacity(0.2), isExploded: selectedSegment == "COMPLETED"),
                        DonutSegmentData(value: Double(inProgress), color: (selectedSegment == nil || selectedSegment == "IN PROGRESS") ? .orange : .orange.opacity(0.2), isExploded: selectedSegment == "IN PROGRESS"),
                        DonutSegmentData(value: Double(pending), color: (selectedSegment == nil || selectedSegment == "PENDING") ? .green : .green.opacity(0.2), isExploded: selectedSegment == "PENDING")
                    ])
                    .frame(width: 140, height: 140)
                    Spacer()
                }
                .padding(.vertical, AppSpacing.sm)
                
                // Legend
                HStack {
                    Spacer()
                    BreakdownLegendItem(title: "COMPLETED", percentage: completedPct, color: .red, selectedSegment: $selectedSegment)
                    Spacer()
                    BreakdownLegendItem(title: "PENDING", percentage: pendingPct, color: .green, selectedSegment: $selectedSegment)
                    Spacer()
                    BreakdownLegendItem(title: "IN PROGRESS", percentage: inProgressPct, color: .orange, selectedSegment: $selectedSegment)
                    Spacer()
                }
                
                HStack {
                    Spacer()
                    Button(action: {
                        appRouter.selectedTab = .tasks
                    }) {
                        Text("VIEW FULL REPORT")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(AppColors.textPrimary)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(
                                Capsule().stroke(AppColors.border, lineWidth: 1)
                            )
                    }
                    Spacer()
                }
                .padding(.top, AppSpacing.sm)
            }
        }
    }
}

public struct BreakdownLegendItem: View {
    let title: String
    let percentage: String
    let color: Color
    @Binding var selectedSegment: String?
    
    public var body: some View {
        let isDimmed = selectedSegment != nil && selectedSegment != title
        
        Button(action: {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.75, blendDuration: 0)) {
                if selectedSegment == title {
                    selectedSegment = nil
                } else {
                    selectedSegment = title
                }
            }
        }) {
            VStack(spacing: 4) {
                RoundedRectangle(cornerRadius: 2)
                    .fill(isDimmed ? color.opacity(0.3) : color)
                    .frame(width: 12, height: 12)
                
                Text(title)
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundColor(isDimmed ? AppColors.textTertiary : AppColors.textSecondary)
                
                Text(percentage)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(isDimmed ? AppColors.textTertiary : AppColors.textPrimary)
            }
        }
        .buttonStyle(PlainButtonStyle())
    }
}

public struct TaskTrendsCard: View {
    @ObservedObject var viewModel: DashboardViewModel
    @State private var selectedTab: String = "DAY"
    @State private var selectedLine: String? = nil
    @State private var showFilterSheet: Bool = false
    
    // Custom dates moved to parent to display in the button
    @State private var customStartDate = Date()
    @State private var customEndDate = Date()
    
    private var filterDisplayText: String {
        if selectedTab == "CUSTOM" {
            let formatter = DateFormatter()
            formatter.dateFormat = "MMM d"
            return "\(formatter.string(from: customStartDate)) - \(formatter.string(from: customEndDate))"
        }
        return selectedTab
    }
    
    public var body: some View {
        AppCard(padding: AppSpacing.lg) {
            VStack(alignment: .leading, spacing: AppSpacing.lg) {
                // Header
                HStack {
                    Text("TASK TRENDS")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(AppColors.textPrimary)
                    
                    Spacer()
                    
                    Button(action: {
                        showFilterSheet = true
                    }) {
                        Image(systemName: "line.3.horizontal")
                            .foregroundColor(AppColors.textTertiary)
                            .padding(8)
                            .background(Circle().fill(Color.gray.opacity(0.1)))
                    }
                }
                
                // Filter Button
                HStack {
                    Button(action: {
                        showFilterSheet = true
                    }) {
                        HStack(spacing: 6) {
                            Image(systemName: "calendar")
                            Text(filterDisplayText)
                            Image(systemName: "chevron.down")
                        }
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Capsule().fill(Color.green))
                    }
                    Spacer()
                }
                
                // Legend Chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        LegendLine(color: .blue, text: "Total", selectedLine: $selectedLine)
                        LegendLine(color: .orange, text: "In Progress", selectedLine: $selectedLine)
                        LegendLine(color: .green, text: "Pending", selectedLine: $selectedLine)
                        LegendLine(color: .red, text: "Completed", selectedLine: $selectedLine)
                        
                        if selectedLine != nil {
                            Button(action: {
                                withAnimation(.spring(response: 0.35, dampingFraction: 0.75, blendDuration: 0)) { selectedLine = nil }
                            }) {
                                HStack(spacing: 4) {
                                    Image(systemName: "arrow.counterclockwise")
                                        .font(.system(size: 10, weight: .bold))
                                    Text("Reset")
                                        .font(.system(size: 11, weight: .semibold))
                                }
                                .foregroundColor(.white)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Capsule().fill(Color.gray))
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                }
                
                // Dynamic Chart Area
                DynamicLineChart(viewModel: viewModel, timeRange: selectedTab, selectedLine: selectedLine)
                    .frame(height: 180)
            }
        }
        .sheet(isPresented: $showFilterSheet) {
            TaskTrendsFilterSheet(
                selectedTab: $selectedTab,
                customStartDate: $customStartDate,
                customEndDate: $customEndDate
            )
        }
    }
}

// MARK: - Advanced Filter Sheet
public struct TaskTrendsFilterSheet: View {
    @Environment(\.presentationMode) var presentationMode
    @Binding var selectedTab: String
    @Binding var customStartDate: Date
    @Binding var customEndDate: Date
    
    @State private var isCustomDate = false
    
    public var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Predefined Ranges")) {
                    Button("1 Day") { select("DAY") }
                    Button("1 Week") { select("WEEK") }
                    Button("15 Days") { select("15 DAYS") }
                    Button("1 Month") { select("1 MONTH") }
                }
                
                Section(header: Text("Custom Range")) {
                    Toggle("Use Custom Dates", isOn: $isCustomDate)
                    
                    if isCustomDate {
                        DatePicker("Start Date", selection: $customStartDate, displayedComponents: .date)
                        DatePicker("End Date", selection: $customEndDate, displayedComponents: .date)
                        
                        Button(action: {
                            select("CUSTOM")
                        }) {
                            Text("Apply Custom Date")
                                .frame(maxWidth: .infinity)
                                .foregroundColor(.white)
                                .padding()
                                .background(Color.blue)
                                .cornerRadius(8)
                        }
                    }
                }
            }
            .navigationTitle("Filter Trends")
            .navigationBarItems(trailing: Button("Done") {
                presentationMode.wrappedValue.dismiss()
            })
        }
    }
    
    private func select(_ range: String) {
        selectedTab = range
        presentationMode.wrappedValue.dismiss()
    }
}

public struct LegendLine: View {
    let color: Color
    let text: String
    @Binding var selectedLine: String?
    
    public var body: some View {
        let isSelected = selectedLine == text
        let isDimmed = selectedLine != nil && selectedLine != text
        
        Button(action: {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.75, blendDuration: 0)) {
                if selectedLine == text {
                    selectedLine = nil // Toggle off (show all)
                } else {
                    selectedLine = text // Isolate this line
                }
            }
        }) {
            HStack(spacing: 6) {
                Circle()
                    .fill(isDimmed ? color.opacity(0.3) : color)
                    .frame(width: 8, height: 8)
                
                Text(text)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(isDimmed ? AppColors.textTertiary : AppColors.textPrimary)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(
                Capsule()
                    .fill(isSelected ? color.opacity(0.1) : Color.clear)
            )
            .overlay(
                Capsule()
                    .stroke(isSelected ? color.opacity(0.5) : AppColors.border, lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

public struct DynamicLineChart: View {
    @ObservedObject var viewModel: DashboardViewModel
    var timeRange: String
    var selectedLine: String?
    
    public var body: some View {
        let total = Double(viewModel.totalTasksCount)
        let inProgress = Double(viewModel.inProgressTasksCount)
        let pending = Double(viewModel.pendingTasksCount)
        let completed = Double(viewModel.completedTasksCount)
        
        // Calculate max Y grid line based on visible lines
        let maxY: Double = {
            var highestVisibleValue: Double = 0
            if selectedLine == nil || selectedLine == "Total" {
                highestVisibleValue = max(highestVisibleValue, total)
            }
            if selectedLine == nil || selectedLine == "In Progress" {
                highestVisibleValue = max(highestVisibleValue, inProgress)
            }
            if selectedLine == nil || selectedLine == "Pending" {
                highestVisibleValue = max(highestVisibleValue, pending)
            }
            if selectedLine == nil || selectedLine == "Completed" {
                highestVisibleValue = max(highestVisibleValue, completed)
            }
            return max(5, highestVisibleValue + 2)
        }()
        
        GeometryReader { geometry in
            ZStack {
                // Horizontal grid lines
                VStack(spacing: 0) {
                    ForEach(0..<5) { i in
                        HStack {
                            let val = Int(maxY - (maxY / 4) * Double(i))
                            Text("\(val)")
                                .font(.system(size: 10))
                                .foregroundColor(AppColors.textTertiary)
                                .frame(width: 20, alignment: .trailing)
                            
                            Rectangle()
                                .fill(AppColors.border.opacity(0.5))
                                .frame(height: 1)
                        }
                        if i < 4 { Spacer() }
                    }
                }
                
                let chartHeight = geometry.size.height
                let chartWidth = geometry.size.width - 28 // left padding for labels
                
                // Change seeds based on time range to make the waves look visually distinct
                let seedOffset = (timeRange == "DAY") ? 10 : 0
                
                // 1. Completed (Red)
                if selectedLine == nil || selectedLine == "Completed" {
                    DynamicWaveFillShape(targetValue: completed, maxValue: maxY, seed: 3 + seedOffset)
                        .fill(LinearGradient(gradient: Gradient(colors: [Color.red.opacity(0.2), Color.red.opacity(0.0)]), startPoint: .top, endPoint: .bottom))
                        .frame(width: chartWidth, height: chartHeight).offset(x: 28)
                    DynamicWaveShape(targetValue: completed, maxValue: maxY, seed: 3 + seedOffset)
                        .stroke(Color.red, style: StrokeStyle(lineWidth: 1.5, dash: [3, 3]))
                        .frame(width: chartWidth, height: chartHeight).offset(x: 28)
                }
                
                // 2. Pending (Green)
                if selectedLine == nil || selectedLine == "Pending" {
                    DynamicWaveFillShape(targetValue: pending, maxValue: maxY, seed: 2 + seedOffset)
                        .fill(LinearGradient(gradient: Gradient(colors: [Color.green.opacity(0.2), Color.green.opacity(0.0)]), startPoint: .top, endPoint: .bottom))
                        .frame(width: chartWidth, height: chartHeight).offset(x: 28)
                    DynamicWaveShape(targetValue: pending, maxValue: maxY, seed: 2 + seedOffset)
                        .stroke(Color.green, style: StrokeStyle(lineWidth: 1.5, dash: [4, 4]))
                        .frame(width: chartWidth, height: chartHeight).offset(x: 28)
                }
                
                // 3. In Progress (Orange)
                if selectedLine == nil || selectedLine == "In Progress" {
                    DynamicWaveFillShape(targetValue: inProgress, maxValue: maxY, seed: 1 + seedOffset)
                        .fill(LinearGradient(gradient: Gradient(colors: [Color.orange.opacity(0.2), Color.orange.opacity(0.0)]), startPoint: .top, endPoint: .bottom))
                        .frame(width: chartWidth, height: chartHeight).offset(x: 28)
                    DynamicWaveShape(targetValue: inProgress, maxValue: maxY, seed: 1 + seedOffset)
                        .stroke(Color.orange, style: StrokeStyle(lineWidth: 1.5))
                        .frame(width: chartWidth, height: chartHeight).offset(x: 28)
                }
                
                // 4. Total (Blue)
                if selectedLine == nil || selectedLine == "Total" {
                    DynamicWaveFillShape(targetValue: total, maxValue: maxY, seed: 0 + seedOffset)
                        .fill(LinearGradient(gradient: Gradient(colors: [Color.blue.opacity(0.2), Color.blue.opacity(0.0)]), startPoint: .top, endPoint: .bottom))
                        .frame(width: chartWidth, height: chartHeight).offset(x: 28)
                    DynamicWaveShape(targetValue: total, maxValue: maxY, seed: 0 + seedOffset)
                        .stroke(Color.blue, lineWidth: 2.0)
                        .frame(width: chartWidth, height: chartHeight).offset(x: 28)
                }
                
                // X-Axis Labels
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        Text(xAxisLabels(for: timeRange)[0])
                        Spacer()
                        Text(xAxisLabels(for: timeRange)[1])
                        Spacer()
                        Text(xAxisLabels(for: timeRange)[2])
                        Spacer()
                    }
                    .font(.system(size: 9))
                    .foregroundColor(AppColors.textTertiary)
                    .offset(x: 14, y: 15)
                }
            }
        }
    }
    
    private func xAxisLabels(for range: String) -> [String] {
        switch range {
        case "DAY": return ["10:00 AM", "12:00 PM", "14:00 PM"]
        case "WEEK": return ["Mon", "Wed", "Fri"]
        case "15 DAYS": return ["Day 1", "Day 7", "Day 15"]
        case "1 MONTH": return ["Week 1", "Week 2", "Week 4"]
        case "CUSTOM": return ["Start", "Mid", "End"]
        default: return ["Start", "Mid", "End"]
        }
    }
}

public struct DynamicWaveShape: Shape {
    var targetValue: Double
    var maxValue: Double
    var seed: Int
    
    public func path(in rect: CGRect) -> Path {
        var path = Path()
        let w = rect.width
        let h = rect.height
        
        let ratio = maxValue > 0 ? (targetValue / maxValue) : 0
        let targetY = h - (h * CGFloat(ratio))
        
        path.move(to: CGPoint(x: 0, y: h))
        
        let curveVariant = seed % 4
        
        if curveVariant == 0 { // Total: Steady rise, dip, rise
            path.addCurve(to: CGPoint(x: w * 0.4, y: h - (h - targetY) * 0.7), control1: CGPoint(x: w * 0.1, y: h * 0.8), control2: CGPoint(x: w * 0.3, y: h - (h - targetY) * 0.8))
            path.addCurve(to: CGPoint(x: w * 0.7, y: h - (h - targetY) * 0.5), control1: CGPoint(x: w * 0.5, y: h - (h - targetY) * 0.5), control2: CGPoint(x: w * 0.6, y: h - (h - targetY) * 0.3))
            path.addCurve(to: CGPoint(x: w, y: targetY), control1: CGPoint(x: w * 0.85, y: targetY), control2: CGPoint(x: w * 0.9, y: targetY))
        } else if curveVariant == 1 { // In Progress: Early spike, deep drop, rise
            path.addCurve(to: CGPoint(x: w * 0.3, y: h - (h - targetY) * 1.3), control1: CGPoint(x: w * 0.1, y: h * 0.5), control2: CGPoint(x: w * 0.2, y: h - (h - targetY) * 1.5))
            path.addCurve(to: CGPoint(x: w * 0.6, y: h - (h - targetY) * 0.2), control1: CGPoint(x: w * 0.4, y: h), control2: CGPoint(x: w * 0.5, y: h - (h - targetY) * 0.1))
            path.addCurve(to: CGPoint(x: w, y: targetY), control1: CGPoint(x: w * 0.8, y: targetY), control2: CGPoint(x: w * 0.9, y: targetY))
        } else if curveVariant == 2 { // Pending: Wavy up and down
            path.addCurve(to: CGPoint(x: w * 0.25, y: h - (h - targetY) * 0.8), control1: CGPoint(x: w * 0.1, y: h * 0.9), control2: CGPoint(x: w * 0.2, y: h - (h - targetY)))
            path.addCurve(to: CGPoint(x: w * 0.65, y: h - (h - targetY) * 0.4), control1: CGPoint(x: w * 0.4, y: h - (h - targetY) * 0.2), control2: CGPoint(x: w * 0.5, y: h - (h - targetY) * 0.6))
            path.addCurve(to: CGPoint(x: w, y: targetY), control1: CGPoint(x: w * 0.8, y: targetY * 1.1), control2: CGPoint(x: w * 0.9, y: targetY))
        } else { // Completed: Late surge
            path.addCurve(to: CGPoint(x: w * 0.5, y: h - (h - targetY) * 0.3), control1: CGPoint(x: w * 0.2, y: h * 0.95), control2: CGPoint(x: w * 0.4, y: h - (h - targetY) * 0.4))
            path.addCurve(to: CGPoint(x: w * 0.75, y: h - (h - targetY) * 0.9), control1: CGPoint(x: w * 0.6, y: h - (h - targetY) * 0.1), control2: CGPoint(x: w * 0.7, y: h - (h - targetY) * 1.1))
            path.addCurve(to: CGPoint(x: w, y: targetY), control1: CGPoint(x: w * 0.85, y: targetY), control2: CGPoint(x: w * 0.95, y: targetY))
        }
        
        return path
    }
}

public struct DynamicWaveFillShape: Shape {
    var targetValue: Double
    var maxValue: Double
    var seed: Int
    
    public func path(in rect: CGRect) -> Path {
        var path = DynamicWaveShape(targetValue: targetValue, maxValue: maxValue, seed: seed).path(in: rect)
        path.addLine(to: CGPoint(x: rect.width, y: rect.height))
        path.addLine(to: CGPoint(x: 0, y: rect.height))
        path.closeSubpath()
        return path
    }
}
