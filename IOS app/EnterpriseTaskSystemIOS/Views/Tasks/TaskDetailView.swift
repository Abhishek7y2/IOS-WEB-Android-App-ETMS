import SwiftUI

/// Subtask item for task checklist.
public struct SubtaskItem: Identifiable, Codable, Equatable {
    public var id: String = UUID().uuidString
    public var title: String
    public var isCompleted: Bool
}

/// Polished native grouped Task Details screen with subtasks and audit history.
public struct TaskDetailView: View {
    @State var task: TaskItem
    @Environment(\.presentationMode) private var presentationMode
    
    @State private var subtasks: [SubtaskItem] = [
        SubtaskItem(title: "Initial Requirements & Architecture Review", isCompleted: true),
        SubtaskItem(title: "Implementation & Code Integration", isCompleted: false),
        SubtaskItem(title: "Quality Verification & End-to-End Testing", isCompleted: false)
    ]
    @State private var newSubtaskTitle: String = ""
    @State private var isUpdating: Bool = false
    
    public init(task: TaskItem) {
        self._task = State(initialValue: task)
    }
    
    public var body: some View {
        List {
            // Title & Description Section
            Section("Task Overview") {
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    Text(task.title)
                        .font(AppTypography.title2)
                        .foregroundColor(AppColors.textPrimary)
                    
                    Text(task.description)
                        .font(AppTypography.body)
                        .foregroundColor(AppColors.textSecondary)
                }
                .padding(.vertical, 4)
            }
            
            // Status & Priority Section
            Section("Status & Priority") {
                Picker("Status", selection: $task.status) {
                    ForEach(TaskStatus.allCases, id: \.self) { status in
                        Text(status.displayName).tag(status)
                    }
                }
                .pickerStyle(.menu)
                .onChange(of: task.status) { newStatus in
                    updateStatus(newStatus)
                }
                
                HStack {
                    Text("Priority")
                    Spacer()
                    PriorityBadge(priority: task.priority)
                }
                
                HStack {
                    Text("Completion")
                    Spacer()
                    Text("\(Int(task.progressPercent * 100))%")
                        .font(AppTypography.headline)
                        .foregroundColor(AppColors.primary)
                }
            }
            
            // Assignment & Due Date Section
            Section("Assignment & Schedule") {
                HStack {
                    Text("Assigned To")
                    Spacer()
                    Text(task.assignedTo?.name ?? "Abhishek Yadav")
                        .foregroundColor(AppColors.textSecondary)
                }
                
                HStack {
                    Text("Due Date")
                    Spacer()
                    Text(task.dueDate != nil ? DateFormatter.localizedString(from: task.dueDate!, dateStyle: .medium, timeStyle: .none) : "No deadline")
                        .foregroundColor(AppColors.textSecondary)
                }
            }
            
            // Subtasks Checklist Section
            Section("Subtasks (\(subtasks.filter { $0.isCompleted }.count)/\(subtasks.count))") {
                ForEach($subtasks) { $subtask in
                    HStack(spacing: AppSpacing.sm) {
                        Button(action: {
                            subtask.isCompleted.toggle()
                        }) {
                            Image(systemName: subtask.isCompleted ? "checkmark.circle.fill" : "circle")
                                .font(.system(size: 18))
                                .foregroundColor(subtask.isCompleted ? AppColors.success : AppColors.textTertiary)
                        }
                        .buttonStyle(.plain)
                        
                        Text(subtask.title)
                            .font(AppTypography.subheadline)
                            .strikethrough(subtask.isCompleted)
                            .foregroundColor(subtask.isCompleted ? AppColors.textTertiary : AppColors.textPrimary)
                    }
                    .padding(.vertical, 2)
                }
                
                HStack {
                    TextField("Add new subtask...", text: $newSubtaskTitle)
                        .font(AppTypography.caption)
                    
                    if !newSubtaskTitle.isEmpty {
                        Button("Add") {
                            subtasks.append(SubtaskItem(title: newSubtaskTitle, isCompleted: false))
                            newSubtaskTitle = ""
                        }
                        .font(AppTypography.captionBold)
                        .foregroundColor(AppColors.primary)
                    }
                }
            }
            
            // Audit History Timeline
            Section("Activity History") {
                VStack(alignment: .leading, spacing: AppSpacing.sm) {
                    HStack(alignment: .top, spacing: AppSpacing.sm) {
                        Circle()
                            .fill(AppColors.primary)
                            .frame(width: 8, height: 8)
                            .padding(.top, 4)
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Task Created")
                                .font(AppTypography.captionBold)
                                .foregroundColor(AppColors.textPrimary)
                            Text(task.createdAt != nil ? DateFormatter.localizedString(from: task.createdAt!, dateStyle: .short, timeStyle: .short) : "Recently")
                                .font(.system(size: 10))
                                .foregroundColor(AppColors.textSecondary)
                        }
                    }
                    
                    HStack(alignment: .top, spacing: AppSpacing.sm) {
                        Circle()
                            .fill(AppColors.success)
                            .frame(width: 8, height: 8)
                            .padding(.top, 4)
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Status set to \(task.status.displayName)")
                                .font(AppTypography.captionBold)
                                .foregroundColor(AppColors.textPrimary)
                            Text("Updated just now")
                                .font(.system(size: 10))
                                .foregroundColor(AppColors.textSecondary)
                        }
                    }
                }
                .padding(.vertical, 4)
            }
            
            // Attachments Section
            Section("Attachments (\(task.attachments?.count ?? 0))") {
                if let attachments = task.attachments, !attachments.isEmpty {
                    ForEach(attachments) { file in
                        HStack(spacing: AppSpacing.sm) {
                            Image(systemName: "doc.fill")
                                .foregroundColor(AppColors.primary)
                            Text(file.name)
                                .font(AppTypography.subheadline)
                            Spacer()
                            Image(systemName: "arrow.down.circle")
                                .foregroundColor(AppColors.textTertiary)
                        }
                    }
                } else {
                    Text("No attachments uploaded.")
                        .font(AppTypography.caption)
                        .foregroundColor(AppColors.textSecondary)
                }
            }
        }
        .navigationTitle("Task Details")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Done") {
                    presentationMode.wrappedValue.dismiss()
                }
            }
        }
    }
    
    private func updateStatus(_ newStatus: TaskStatus) {
        Task {
            isUpdating = true
            let body = ["status": newStatus.rawValue]
            _ = try? await APIClient.shared.request(endpoint: .updateTask(id: task.id), body: body) as TaskItem
            isUpdating = false
        }
    }
}
// Force recompilation
