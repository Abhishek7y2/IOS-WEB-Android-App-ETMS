import SwiftUI

/// Employees Directory Screen with full parity to Web Frontend.
public struct EmployeesDirectoryView: View {
    @StateObject private var viewModel = EmployeesViewModel()
    @EnvironmentObject private var authViewModel: AuthViewModel
    @EnvironmentObject private var appRouter: AppRouter
    @State private var selectedEmployee: User?
    @State private var showAddSheet: Bool = false
    
    private var isAdmin: Bool {
        guard let role = authViewModel.currentUser?.role else { return false }
        return role == .admin || role == .superadmin
    }
    
    public var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: AppSpacing.md) {
                    // Header Bar
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Team Members")
                                .font(AppTypography.title)
                                .foregroundColor(AppColors.textPrimary)
                            
                            Text("Directory of all enterprise team members")
                                .font(AppTypography.subheadline)
                                .foregroundColor(AppColors.textSecondary)
                        }
                        
                        Spacer()
                        
                        if isAdmin {
                            Button(action: {
                                showAddSheet = true
                            }) {
                                HStack(spacing: 4) {
                                    Image(systemName: "person.badge.plus")
                                    Text("Add")
                                }
                                .font(AppTypography.captionBold)
                                .foregroundColor(.white)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                                .background(Capsule().fill(AppColors.primary))
                                .appGlowShadow(color: AppColors.primary)
                            }
                        }
                    }
                    .padding(.horizontal, AppSpacing.md)
                    .padding(.top, AppSpacing.xs)
                    
                    // Search Bar
                    SearchBar(text: $viewModel.searchText, placeholder: "Search by name, email, or designation...")
                        .padding(.horizontal, AppSpacing.md)
                    
                    // Directory List
                    if viewModel.isLoading && viewModel.employees.isEmpty {
                        LoadingView(message: "Loading directory...")
                            .padding(.top, 40)
                    } else if let errorMessage = viewModel.errorMessage {
                        VStack(spacing: 16) {
                            EmptyStateView(
                                icon: "exclamationmark.triangle",
                                title: "Error",
                                message: errorMessage
                            )
                            Button("Retry") {
                                Task { await viewModel.fetchEmployees() }
                            }
                            .font(AppTypography.headline)
                            .foregroundColor(AppColors.primary)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 12)
                            .background(AppColors.primary.opacity(0.1))
                            .cornerRadius(8)
                        }
                        .padding(.top, 40)
                    } else if viewModel.filteredEmployees.isEmpty {
                        EmptyStateView(
                            icon: "person.2.slash",
                            title: "No Employees Found",
                            message: "No team members matched your search criteria."
                        )
                        .padding(.top, 40)
                    } else {
                        LazyVStack(spacing: AppSpacing.sm) {
                            ForEach(viewModel.filteredEmployees) { employee in
                                Button(action: {
                                    self.selectedEmployee = employee
                                }) {
                                    AppCard(padding: AppSpacing.md) {
                                        HStack(spacing: AppSpacing.md) {
                                            // Avatar
                                            ZStack {
                                                Circle()
                                                    .fill(AppColors.primary.opacity(0.15))
                                                    .frame(width: 46, height: 46)
                                                
                                                Text(employee.initials)
                                                    .font(AppTypography.headline)
                                                    .foregroundColor(AppColors.primary)
                                            }
                                            
                                            VStack(alignment: .leading, spacing: 2) {
                                                HStack(spacing: 6) {
                                                    Text(employee.name)
                                                        .font(AppTypography.headline)
                                                        .foregroundColor(AppColors.textPrimary)
                                                    
                                                    if employee.isBlocked == true {
                                                        Text("BLOCKED")
                                                            .font(.system(size: 9, weight: .bold))
                                                            .foregroundColor(AppColors.danger)
                                                            .padding(.horizontal, 5)
                                                            .padding(.vertical, 2)
                                                            .background(Capsule().fill(AppColors.dangerSoft))
                                                    }
                                                }
                                                
                                                Text(employee.designation ?? employee.displayRole)
                                                    .font(AppTypography.caption)
                                                    .foregroundColor(AppColors.textSecondary)
                                                
                                                Text(employee.email)
                                                    .font(.system(size: 11))
                                                    .foregroundColor(AppColors.textTertiary)
                                                    .lineLimit(1)
                                            }
                                            
                                            Spacer()
                                            
                                            StatusBadge(employee.displayRole, color: employee.isSuperAdmin ? AppColors.accentOrange : (employee.isAdmin ? AppColors.accentPurple : AppColors.info))
                                        }
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, AppSpacing.md)
                    }
                    
                    Spacer(minLength: 40)
                }
            }
            .appScreenBackground()
            .navigationBarHidden(true)
            .refreshable {
                await viewModel.fetchEmployees()
            }
            .task {
                await viewModel.fetchEmployees()
                // Check if there is a pending request after fetching
                if let requestedId = appRouter.requestedEmployeeProfileId,
                   let emp = viewModel.employees.first(where: { $0.id == requestedId }) {
                    self.selectedEmployee = emp
                    appRouter.requestedEmployeeProfileId = nil
                }
            }
            .sheet(item: $selectedEmployee) { emp in
                NavigationStack {
                    EmployeeDetailModal(employee: emp, viewModel: viewModel)
                }
            }
            .sheet(isPresented: $showAddSheet) {
                AddEmployeeSheet(viewModel: viewModel)
            }
        }
        .onReceive(appRouter.$requestedEmployeeProfileId) { newId in
            if let newId = newId, let emp = viewModel.employees.first(where: { $0.id == newId }) {
                self.selectedEmployee = emp
                appRouter.requestedEmployeeProfileId = nil
            }
        }
    }
}

private struct EmployeeDetailModal: View {
    let employee: User
    @ObservedObject var viewModel: EmployeesViewModel
    @Environment(\.presentationMode) private var presentationMode
    @EnvironmentObject private var authViewModel: AuthViewModel
    
    @State private var assignedTasks: [TaskItem] = []
    @State private var isLoadingTasks: Bool = false
    @State private var showEditSheet: Bool = false
    @State private var showBlockAlert: Bool = false
    @State private var showArchiveAlert: Bool = false
    @State private var showEditLeaveSheet: Bool = false
    
    private var isSuperAdmin: Bool {
        authViewModel.currentUser?.isSuperAdmin == true
    }
    
    private var isAdmin: Bool {
        authViewModel.currentUser?.isAdmin == true
    }
    
    private var canManage: Bool {
        if isSuperAdmin {
            return employee.id != authViewModel.currentUser?.id && !employee.isSuperAdmin
        } else if isAdmin {
            return employee.id != authViewModel.currentUser?.id && !employee.isAdmin && !employee.isSuperAdmin
        }
        return false
    }
    
    var body: some View {
        List {
            // Profile Header
            Section {
                HStack(spacing: AppSpacing.md) {
                    ZStack {
                        Circle()
                            .fill(AppColors.primary.opacity(0.15))
                            .frame(width: 64, height: 64)
                        
                        Text(employee.initials)
                            .font(AppTypography.title)
                            .foregroundColor(AppColors.primary)
                    }
                    
                    VStack(alignment: .leading, spacing: 3) {
                        Text(employee.name)
                            .font(AppTypography.headline)
                        Text(employee.designation ?? "Team Member")
                            .font(AppTypography.subheadline)
                            .foregroundColor(AppColors.textSecondary)
                        
                        if employee.isBlocked == true {
                            Text("Account Suspended")
                                .font(AppTypography.captionBold)
                                .foregroundColor(AppColors.danger)
                        }
                    }
                }
                .padding(.vertical, 6)
                
                // Quick Contact Actions Bar
                HStack(spacing: AppSpacing.lg) {
                    Button(action: {
                        if let url = URL(string: "mailto:\(employee.email)") {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        VStack(spacing: 4) {
                            Image(systemName: "envelope.fill")
                                .font(.system(size: 18))
                            Text("Email")
                                .font(AppTypography.caption)
                        }
                        .frame(maxWidth: .infinity)
                    }
                    
                    if let mobile = employee.mobileNumber, !mobile.isEmpty {
                        Button(action: {
                            if let url = URL(string: "tel:\(mobile.filter { !" -()".contains($0) })") {
                                UIApplication.shared.open(url)
                            }
                        }) {
                            VStack(spacing: 4) {
                                Image(systemName: "phone.fill")
                                    .font(.system(size: 18))
                                Text("Call")
                                    .font(AppTypography.caption)
                            }
                            .frame(maxWidth: .infinity)
                        }
                    }
                }
                .foregroundColor(AppColors.primary)
                .padding(.vertical, 6)
            }
            
            // Info Fields
            Section("Contact & Department") {
                HStack {
                    Text("Email")
                    Spacer()
                    Text(employee.email)
                        .foregroundColor(AppColors.textSecondary)
                }
                
                if let mobile = employee.mobileNumber {
                    HStack {
                        Text("Mobile")
                        Spacer()
                        Text(mobile)
                            .foregroundColor(AppColors.textSecondary)
                    }
                }
                
                HStack {
                    Text("Department")
                    Spacer()
                    Text(employee.department ?? "General")
                        .foregroundColor(AppColors.textSecondary)
                }
                
                HStack {
                    Text("System Role")
                    Spacer()
                    StatusBadge(employee.role.displayName, color: AppColors.primary)
                }
            }
            
            // Workload (Assigned Tasks)
            Section("Assigned Workload (\(assignedTasks.count))") {
                if isLoadingTasks {
                    HStack {
                        Spacer()
                        ProgressView()
                        Spacer()
                    }
                } else if assignedTasks.isEmpty {
                    Text("No tasks currently assigned to this member.")
                        .font(AppTypography.caption)
                        .foregroundColor(AppColors.textSecondary)
                } else {
                    ForEach(assignedTasks) { task in
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(task.title)
                                    .font(AppTypography.captionBold)
                                Text("Due: \(task.dueDate != nil ? DateFormatter.localizedString(from: task.dueDate!, dateStyle: .short, timeStyle: .none) : "Open")")
                                    .font(.system(size: 10))
                                    .foregroundColor(AppColors.textSecondary)
                            }
                            Spacer()
                            StatusBadge(status: task.status)
                        }
                    }
                }
            }
            
            // Admin Actions
            if canManage {
                Section("Admin Controls") {
                    Button(action: {
                        showEditSheet = true
                    }) {
                        Label("Edit Designation & Role", systemImage: "pencil")
                    }
                    
                    if isSuperAdmin {
                        Button(action: {
                            showEditLeaveSheet = true
                        }) {
                            Label("Edit Leave Balance", systemImage: "calendar.badge.exclamationmark")
                        }
                    }
                    
                    Button(role: (employee.isBlocked == true ? nil : .destructive), action: {
                        showBlockAlert = true
                    }) {
                        Label(
                            employee.isBlocked == true ? "Unblock Employee" : "Block Employee Access",
                            systemImage: employee.isBlocked == true ? "checkmark.circle" : "nosign"
                        )
                    }
                    
                    Button(role: .destructive, action: {
                        showArchiveAlert = true
                    }) {
                        Label("Archive Employee Account", systemImage: "archivebox")
                    }
                }
            }
        }
        .navigationTitle("Member Profile")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Done") {
                    presentationMode.wrappedValue.dismiss()
                }
            }
        }
        .task {
            isLoadingTasks = true
            assignedTasks = await viewModel.fetchEmployeeTasks(employeeId: employee.id)
            isLoadingTasks = false
        }
        .alert("Block Account", isPresented: $showBlockAlert) {
            Button("Cancel", role: .cancel) {}
            Button(employee.isBlocked == true ? "Unblock" : "Block", role: .destructive) {
                Task {
                    _ = await viewModel.toggleBlockEmployee(user: employee)
                    presentationMode.wrappedValue.dismiss()
                }
            }
        } message: {
            Text(employee.isBlocked == true ? "Restore access for \(employee.name)?" : "Suspend access for \(employee.name)?")
        }
        .alert("Archive Employee", isPresented: $showArchiveAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Archive", role: .destructive) {
                Task {
                    _ = await viewModel.archiveEmployee(user: employee)
                    presentationMode.wrappedValue.dismiss()
                }
            }
        } message: {
            Text("Archive \(employee.name)? This user will be moved to the archive.")
        }
        .sheet(isPresented: $showEditSheet) {
            EditEmployeeSheet(employee: employee, viewModel: viewModel)
        }
        .sheet(isPresented: $showEditLeaveSheet) {
            EditLeaveBalanceSheet(employee: employee, viewModel: viewModel)
        }
    }
}

private struct EditEmployeeSheet: View {
    let employee: User
    @ObservedObject var viewModel: EmployeesViewModel
    @Environment(\.presentationMode) private var presentationMode
    @EnvironmentObject private var authViewModel: AuthViewModel
    
    @State private var designation: String = ""
    @State private var role: String = "member"
    
    private let designations = [
        "Admin", "Software Developer", "Senior Developer",
        "Product Designer", "QA Analyst", "Project Manager", "HR Specialist", "Intern"
    ]
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Designation") {
                    Picker("Designation", selection: $designation) {
                        ForEach(designations, id: \.self) { des in
                            Text(des).tag(des)
                        }
                    }
                }
                
                Section("Access Role") {
                    Picker("Role", selection: $role) {
                        Text("Employee (Member)").tag("member")
                        if authViewModel.currentUser?.role == .superadmin {
                            Text("Administrator").tag("admin")
                        }
                    }
                    .pickerStyle(.segmented)
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        Task {
                            _ = await viewModel.updateEmployee(id: employee.id, designation: designation, role: role)
                            presentationMode.wrappedValue.dismiss()
                        }
                    }
                    .font(AppTypography.headline)
                }
            }
            .onAppear {
                self.designation = employee.designation ?? "Software Developer"
                self.role = employee.role.rawValue
            }
        }
    }
}

public struct EditLeaveBalanceSheet: View {
    let employee: User
    @ObservedObject var viewModel: EmployeesViewModel
    @Environment(\.dismiss) var dismiss
    
    @State private var isLoading = true
    @State private var saving = false
    @State private var errorMessage: String? = nil
    
    // We'll store balances as an array of structs so we can easily bind to TextFields
    struct EditableBalance: Identifiable {
        let id = UUID()
        var leaveType: String
        var total: String
        var used: Int
        var remaining: Int
    }
    
    @State private var editableBalances: [EditableBalance] = []
    
    public init(employee: User, viewModel: EmployeesViewModel) {
        self.employee = employee
        self.viewModel = viewModel
    }
    
    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if isLoading {
                    ProgressView("Loading balances...")
                        .padding()
                } else if let error = errorMessage {
                    Text(error)
                        .foregroundColor(AppColors.danger)
                        .padding()
                } else {
                    Form {
                        Section(header: Text("Balances for \(employee.name)")) {
                            ForEach($editableBalances) { $balance in
                                VStack(alignment: .leading, spacing: AppSpacing.sm) {
                                    HStack {
                                        Text(balance.leaveType)
                                            .font(AppTypography.headline)
                                        Spacer()
                                        Text("Used: \(balance.used)")
                                            .font(AppTypography.caption)
                                            .foregroundColor(AppColors.textSecondary)
                                    }
                                    
                                    HStack {
                                        VStack(alignment: .leading) {
                                            Text("Total Allowance")
                                                .font(AppTypography.captionBold)
                                                .foregroundColor(AppColors.textSecondary)
                                            TextField("Total", text: $balance.total)
                                                .keyboardType(.numberPad)
                                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                                .onChange(of: balance.total) { newValue in
                                                    let t = Int(newValue) ?? 0
                                                    balance.remaining = t - balance.used
                                                }
                                        }
                                        
                                        VStack(alignment: .leading) {
                                            Text("Remaining")
                                                .font(AppTypography.captionBold)
                                                .foregroundColor(AppColors.textSecondary)
                                            Text("\(balance.remaining)")
                                                .font(AppTypography.body)
                                                .foregroundColor(balance.remaining < 0 ? AppColors.danger : AppColors.textPrimary)
                                                .padding(.vertical, 8)
                                        }
                                        .frame(width: 80)
                                    }
                                }
                                .padding(.vertical, AppSpacing.xs)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Edit Leave Balance")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        Task { await saveBalances() }
                    }
                    .disabled(isLoading || saving || errorMessage != nil)
                }
            }
            .onAppear {
                Task { await fetchBalances() }
            }
            .overlay {
                if saving {
                    ZStack {
                        Color.black.opacity(0.3).ignoresSafeArea()
                        ProgressView()
                            .padding()
                            .background(Color(UIColor.systemBackground))
                            .cornerRadius(10)
                    }
                }
            }
        }
    }
    
    private func fetchBalances() async {
        isLoading = true
        errorMessage = nil
        do {
            let year = Calendar.current.component(.year, from: Date())
            let response: LeaveBalance = try await APIClient.shared.request(
                endpoint: .leaveBalance(year: year),
                queryItemsOverride: [URLQueryItem(name: "employeeId", value: employee.id)]
            )
            
            if let items = response.balances, !items.isEmpty {
                self.editableBalances = items.map {
                    EditableBalance(
                        leaveType: $0.leaveType,
                        total: "\($0.total)",
                        used: Int($0.used),
                        remaining: Int($0.remaining)
                    )
                }
            } else {
                self.editableBalances = [
                    EditableBalance(leaveType: "Annual Leave", total: "10", used: 0, remaining: 10),
                    EditableBalance(leaveType: "Sick Leave", total: "10", used: 0, remaining: 10),
                    EditableBalance(leaveType: "Casual Leave", total: "10", used: 0, remaining: 10)
                ]
            }
        } catch {
            self.errorMessage = error.localizedDescription
        }
        isLoading = false
    }
    
    private func saveBalances() async {
        saving = true
        let year = Calendar.current.component(.year, from: Date())
        let array = editableBalances.map { item -> [String: Any] in
            return [
                "leaveType": item.leaveType,
                "total": Int(item.total) ?? 0
            ]
        }
        
        let success = await viewModel.updateLeaveBalance(employeeId: employee.id, year: year, newBalances: array)
        saving = false
        if success {
            dismiss()
        } else {
            self.errorMessage = "Failed to save balances."
        }
    }
}

// Quick extension to allow query overrides for this specific call since endpoint is defined differently in APIEndpoint
extension APIEndpoint {
    func withQueryItem(name: String, value: String) -> [URLQueryItem]? {
        var items = self.queryItems ?? []
        items.append(URLQueryItem(name: name, value: value))
        return items
    }
}

// Add a custom request method to APIClient extension in this file for simplicity
extension APIClient {
    func request<T: Decodable>(endpoint: APIEndpoint, queryItemsOverride: [URLQueryItem]) async throws -> T {
        // Build URL
        guard var components = URLComponents(string: "\(baseURLString)\(endpoint.path)") else {
            throw APIError.invalidURL
        }
        
        var allQueryItems = endpoint.queryItems ?? []
        allQueryItems.append(contentsOf: queryItemsOverride)
        components.queryItems = allQueryItems
        
        guard let url = components.url else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        if let token = KeychainService.shared.getAccessToken(), !token.isEmpty {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.networkFailure("Invalid HTTP response.")
        }
        
        if (200...299).contains(httpResponse.statusCode) {
            let decoder = JSONDecoder()
            if let envelope = try? decoder.decode(APIResponse<T>.self, from: data), let resultData = envelope.data {
                return resultData
            }
            if let directResult = try? decoder.decode(T.self, from: data) {
                return directResult
            }
            throw APIError.decodingError("Unable to decode response.")
        } else {
            throw APIError.serverError(statusCode: httpResponse.statusCode, message: "Error")
        }
    }
}
