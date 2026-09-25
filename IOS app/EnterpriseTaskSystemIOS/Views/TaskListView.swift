import SwiftUI

/// Tasks Screen matching Reference Mockup #3.
public struct TaskListView: View {
    @StateObject private var viewModel = TaskViewModel()
    @EnvironmentObject private var appRouter: AppRouter
    @State private var selectedTask: TaskItem?
    @State private var showFilterSheet: Bool = false
    
    private let filterOptions = ["Total Tasks", "Pending", "In Progress", "Completed"]
    
    public var body: some View {
        NavigationStack {
            ZStack(alignment: .bottomTrailing) {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: AppSpacing.md) {
                        // Header Bar
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Tasks")
                                    .font(AppTypography.title)
                                    .foregroundColor(AppColors.textPrimary)
                                
                                Text("Stay on track and get things done.")
                                    .font(AppTypography.subheadline)
                                    .foregroundColor(AppColors.textSecondary)
                            }
                            
                            Spacer()
                            
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
                                }
                            }
                        }
                        .padding(.horizontal, AppSpacing.md)
                        .padding(.top, AppSpacing.xs)
                        
                        // Search Bar + Filter Icon
                        HStack(spacing: AppSpacing.xs) {
                            SearchBar(text: $viewModel.searchText, placeholder: "Search tasks...")
                            
                            Button(action: {
                                showFilterSheet = true
                            }) {
                                ZStack {
                                    RoundedRectangle(cornerRadius: AppRadius.md, style: .continuous)
                                        .fill(AppColors.cardSurface)
                                        .frame(width: 48, height: 48)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: AppRadius.md, style: .continuous)
                                                .stroke(AppColors.border, lineWidth: 1)
                                        )
                                    
                                    Image(systemName: AppIcons.filter)
                                        .font(.system(size: 18))
                                        .foregroundColor(AppColors.textPrimary)
                                        
                                    if viewModel.selectedPriority != nil || viewModel.filterStartDate != nil || viewModel.filterEndDate != nil {
                                        Circle()
                                            .fill(AppColors.danger)
                                            .frame(width: 10, height: 10)
                                            .offset(x: 12, y: -12)
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, AppSpacing.md)
                        
                        // Horizontal Status Filter Chips (All, Todo, In Progress, Done)
                        FilterChipView(
                            items: filterOptions,
                            selectedItem: $viewModel.selectedFilter,
                            titleProvider: { $0 }
                        )
                        
                        // Task List
                        if viewModel.isLoading && viewModel.tasks.isEmpty {
                            LoadingView(message: "Loading tasks...")
                                .padding(.top, 40)
                        } else if viewModel.filteredTasks.isEmpty {
                            EmptyStateView(
                                icon: "checklist",
                                title: "No Tasks Found",
                                message: viewModel.searchText.isEmpty ? "You have no tasks matching this filter." : "No tasks match '\(viewModel.searchText)'",
                                actionTitle: "Create Task"
                            ) {
                                viewModel.showCreateSheet = true
                            }
                            .padding(.top, 40)
                        } else {
                            LazyVStack(spacing: AppSpacing.sm) {
                                ForEach(viewModel.filteredTasks) { task in
                                    NavigationLink(destination: TaskDetailView(task: task)) {
                                        TaskCardView(
                                            task: task,
                                            onStatusChange: { newStatus in
                                                Task {
                                                    await viewModel.updateTaskStatus(task: task, newStatus: newStatus)
                                                }
                                            },
                                            onDelete: {
                                                Task {
                                                    await viewModel.deleteTask(task: task)
                                                }
                                            }
                                        )
                                    }
                                    .buttonStyle(ScaleButtonStyle())
                                    .onAppear {
                                        viewModel.loadMoreIfNeeded(currentTask: task)
                                    }
                                }
                            }
                            .padding(.horizontal, AppSpacing.md)
                        }
                        
                        Spacer(minLength: 80)
                    }
                }
                
                // Floating Action Button (FAB)
                if let currentUser = AuthManager.shared.currentUser, currentUser.isAdmin {
                    Button(action: {
                        let impact = UIImpactFeedbackGenerator(style: .medium)
                        impact.impactOccurred()
                        viewModel.showCreateSheet = true
                    }) {
                        ZStack {
                            Circle()
                                .fill(AppColors.primary)
                                .frame(width: 58, height: 58)
                                .appGlowShadow(color: AppColors.primary)
                            
                            Image(systemName: AppIcons.add)
                                .font(.system(size: 24, weight: .bold))
                                .foregroundColor(.white)
                        }
                    }
                    .padding(.trailing, AppSpacing.lg)
                    .padding(.bottom, AppSpacing.xl)
                }
            }
            .appScreenBackground()
            .navigationBarHidden(true)
            .refreshable {
                await viewModel.fetchTasks(reset: true)
            }
            .task {
                if let requested = appRouter.requestedTaskFilter {
                    viewModel.selectedFilter = requested
                    // Let the onReceive handle nil-ing it out to avoid state modification during render
                }
                await viewModel.fetchTasks(reset: true)
            }
            .onReceive(appRouter.$requestedTaskFilter) { newFilter in
                if let filter = newFilter {
                    viewModel.selectedFilter = filter
                    DispatchQueue.main.async {
                        appRouter.requestedTaskFilter = nil
                    }
                }
            }
            // Removed sheet modifier because we are now using NavigationLink
            .background(
                EmptyView()
                    .sheet(isPresented: $viewModel.showCreateSheet) {
                        CreateTaskSheet(viewModel: viewModel)
                    }
            )
            .background(
                EmptyView()
                    .sheet(isPresented: $showFilterSheet) {
                        TaskFilterSheet(viewModel: viewModel)
                    }
            )
        }
    }
}

/// Advanced filter sheet for Tasks
public struct TaskFilterSheet: View {
    @ObservedObject var viewModel: TaskViewModel
    @Environment(\.presentationMode) var presentationMode
    
    // Local state for UI before applying
    @State private var tempPriority: TaskPriority?
    @State private var tempStartDate: Date?
    @State private var tempEndDate: Date?
    
    @State private var useStartDate = false
    @State private var useEndDate = false
    
    public init(viewModel: TaskViewModel) {
        self.viewModel = viewModel
        self._tempPriority = State(initialValue: viewModel.selectedPriority)
        self._tempStartDate = State(initialValue: viewModel.filterStartDate)
        self._tempEndDate = State(initialValue: viewModel.filterEndDate)
        self._useStartDate = State(initialValue: viewModel.filterStartDate != nil)
        self._useEndDate = State(initialValue: viewModel.filterEndDate != nil)
    }
    
    public var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("Priority")) {
                    Picker("Task Priority", selection: $tempPriority) {
                        Text("All").tag(TaskPriority?.none)
                        ForEach(TaskPriority.allCases, id: \.self) { priority in
                            Text(priority.rawValue.capitalized).tag(TaskPriority?.some(priority))
                        }
                    }
                    .pickerStyle(.menu)
                }
                
                Section(header: Text("Date Range"), footer: Text("Filter tasks by their due date.")) {
                    Toggle("Filter by Start Date", isOn: $useStartDate)
                    if useStartDate {
                        DatePicker(
                            "Start Date",
                            selection: Binding(
                                get: { tempStartDate ?? Date() },
                                set: { tempStartDate = $0 }
                            ),
                            displayedComponents: .date
                        )
                        .datePickerStyle(.compact)
                    }
                    
                    Toggle("Filter by End Date", isOn: $useEndDate)
                    if useEndDate {
                        DatePicker(
                            "End Date",
                            selection: Binding(
                                get: { tempEndDate ?? Date() },
                                set: { tempEndDate = $0 }
                            ),
                            displayedComponents: .date
                        )
                        .datePickerStyle(.compact)
                    }
                }
                
                Section {
                    Button(action: {
                        // Apply filters
                        viewModel.selectedPriority = tempPriority
                        viewModel.filterStartDate = useStartDate ? tempStartDate : nil
                        viewModel.filterEndDate = useEndDate ? tempEndDate : nil
                        presentationMode.wrappedValue.dismiss()
                    }) {
                        Text("Apply Filters")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(AppColors.primary)
                            .font(AppTypography.headline)
                    }
                    
                    Button(action: {
                        // Reset filters
                        tempPriority = nil
                        useStartDate = false
                        useEndDate = false
                        tempStartDate = nil
                        tempEndDate = nil
                        
                        viewModel.selectedPriority = nil
                        viewModel.filterStartDate = nil
                        viewModel.filterEndDate = nil
                        presentationMode.wrappedValue.dismiss()
                    }) {
                        Text("Reset All")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(AppColors.danger)
                            .font(AppTypography.headline)
                    }
                }
            }
            .navigationTitle("Advanced Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
        }
    }
}
