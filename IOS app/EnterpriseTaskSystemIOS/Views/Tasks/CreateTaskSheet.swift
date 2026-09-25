import SwiftUI

/// Create / Edit Task Modal Form with native Pickers & DatePickers.
public struct CreateTaskSheet: View {
    @ObservedObject var viewModel: TaskViewModel
    @Environment(\.presentationMode) private var presentationMode
    
    @State private var title: String = ""
    @State private var description: String = ""
    @State private var priority: TaskPriority = .medium
    @State private var dueDate: Date = Date().addingTimeInterval(86400 * 2)
    @State private var assignedTo: String = ""
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?
    
    private var maxDueDate: Date {
        let maxDays: Int
        switch priority {
        case .critical: maxDays = 7
        case .medium: maxDays = 30
        default: maxDays = 90
        }
        return Calendar.current.date(byAdding: .day, value: maxDays, to: Date()) ?? Date()
    }
    
    private var filteredEmployees: [User] {
        guard let currentUser = AuthManager.shared.currentUser else { return viewModel.employees }
        
        return viewModel.employees.filter { emp in
            if currentUser.role == .superadmin {
                return emp.id != currentUser.id
            } else if currentUser.role == .admin {
                if emp.id == currentUser.id { return false }
                if emp.role == .admin || emp.role == .superadmin { return false }
                return true
            }
            return true
        }
    }
    
    public var body: some View {
        NavigationStack {
            Form {
                Section("Task Information") {
                    TextField("Task Title (e.g. API Authentication)", text: $title)
                        .onChange(of: title) { newValue in
                            var val = newValue
                            if let first = val.first, String(first).range(of: "^[_\\-.,/]", options: .regularExpression) != nil {
                                val = ""
                            }
                            // Strip disallowed chars
                            val = val.replacingOccurrences(of: "[^a-zA-Z0-9\\s_/\\()&:,.]", with: "", options: .regularExpression)
                            // Capitalize first letter of words
                            if val.count > 120 { val = String(val.prefix(120)) }
                            if val != newValue { title = val }
                        }
                    
                    ZStack(alignment: .topLeading) {
                        if description.isEmpty {
                            Text("Detailed description...")
                                .foregroundColor(AppColors.textTertiary)
                                .padding(.top, 8)
                        }
                        TextEditor(text: $description)
                            .frame(minHeight: 90)
                            .onChange(of: description) { newValue in
                                var val = newValue
                                // Simple emoji stripping regex approximation for Swift
                                val = val.replacingOccurrences(of: "[\\p{Emoji}&&\\p{IsEmoji_Presentation}]", with: "", options: .regularExpression)
                                if val.count > 1000 { val = String(val.prefix(1000)) }
                                if val != newValue { description = val }
                            }
                    }
                }
                
                Section("Assignment & Schedule") {
                    Picker("Priority", selection: $priority) {
                        ForEach(TaskPriority.allCases, id: \.self) { p in
                            Text(p.displayName).tag(p)
                        }
                    }
                    
                    Picker("Assignee", selection: $assignedTo) {
                        Text("Select Employee").tag("")
                        ForEach(filteredEmployees) { emp in
                            Text("\(emp.name) (\(emp.designation ?? emp.role.displayName))").tag(emp.id)
                        }
                    }
                    
                    DatePicker("Due Date", selection: $dueDate, in: Date()...maxDueDate, displayedComponents: [.date])
                }
                
                if let err = errorMessage {
                    Section {
                        Text(err)
                            .font(AppTypography.caption)
                            .foregroundColor(AppColors.danger)
                    }
                }
            }
            .navigationTitle("New Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        Task {
                            guard !title.isEmpty, !description.isEmpty else {
                                errorMessage = "Please enter both title and description."
                                return
                            }
                            guard title.count >= 5 else {
                                errorMessage = "Title must be at least 5 characters."
                                return
                            }
                            guard description.count >= 20 else {
                                errorMessage = "Description must be at least 20 characters."
                                return
                            }
                            guard title.range(of: "<[a-z][\\s\\S]*>", options: [.regularExpression, .caseInsensitive]) == nil else {
                                errorMessage = "HTML or JavaScript code is not allowed in title."
                                return
                            }
                            guard description.range(of: "<[a-z][\\s\\S]*>", options: [.regularExpression, .caseInsensitive]) == nil else {
                                errorMessage = "HTML or JavaScript code is not allowed in description."
                                return
                            }
                            guard !assignedTo.isEmpty else {
                                errorMessage = "Please select an assignee."
                                return
                            }
                            
                            isLoading = true
                            let success = await viewModel.createTask(
                                title: title,
                                description: description,
                                priority: priority,
                                dueDate: dueDate,
                                assignedTo: assignedTo.isEmpty ? (KeychainService.shared.getUserId() ?? "") : assignedTo
                            )
                            isLoading = false
                            
                            if success {
                                presentationMode.wrappedValue.dismiss()
                            } else {
                                errorMessage = viewModel.errorMessage
                            }
                        }
                    }
                    .font(AppTypography.headline)
                    .disabled(title.isEmpty || isLoading)
                }
            }
        }
    }
}
