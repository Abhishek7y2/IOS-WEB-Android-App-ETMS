import SwiftUI

struct TaskListView: View {
    @StateObject private var viewModel = TaskViewModel()
    @State private var selectedStatus: TaskStatus = .todo
    
    var body: some View {
        NavigationStack {
            VStack {
                Picker("Status", selection: $selectedStatus) {
                    ForEach(TaskStatus.allCases, id: \.self) { status in
                        Text(status.rawValue.replacingOccurrences(of: "_", with: " ").capitalized).tag(status)
                    }
                }
                .pickerStyle(.segmented)
                .padding()
                
                if viewModel.isLoading {
                    ProgressView("Loading Tasks...")
                        .padding()
                } else {
                    List(viewModel.filteredTasks(status: selectedStatus)) { task in
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text(task.title)
                                    .font(.headline)
                                Spacer()
                                Text(task.priority.rawValue.uppercased())
                                    .font(.caption2)
                                    .fontWeight(.bold)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(priorityColor(task.priority))
                                    .foregroundColor(.white)
                                    .cornerRadius(6)
                            }
                            if let desc = task.description, !desc.isEmpty {
                                Text(desc)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                    .refreshable {
                        await viewModel.loadTasks()
                    }
                }
            }
            .navigationTitle("Tasks Board")
            .task {
                await viewModel.loadTasks()
            }
        }
    }
    
    private func priorityColor(_ priority: TaskPriority) -> Color {
        switch priority {
        case .urgent: return .red
        case .high: return .orange
        case .medium: return .blue
        case .low: return .gray
        }
    }
}
