import Foundation

@MainActor
class TaskViewModel: ObservableObject {
    @Published var tasks: [TaskItem] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    func loadTasks() async {
        isLoading = true
        errorMessage = nil
        do {
            self.tasks = try await APIManager.shared.fetchTasks()
        } catch {
            self.errorMessage = "Failed to load tasks from server."
        }
        isLoading = false
    }
    
    func filteredTasks(status: TaskStatus) -> [TaskItem] {
        return tasks.filter { $0.status == status }
    }
    
    func updateTaskStatus(task: TaskItem, newStatus: TaskStatus) async {
        do {
            let updatedTask = try await APIManager.shared.updateTaskStatus(taskId: task.id, newStatus: newStatus.rawValue)
            if let index = tasks.firstIndex(where: { $0.id == task.id }) {
                tasks[index] = updatedTask
            }
        } catch {
            self.errorMessage = "Failed to update task status."
        }
    }
}
