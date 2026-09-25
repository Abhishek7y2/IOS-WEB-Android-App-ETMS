import Foundation
import SwiftUI
import Combine

/// View Model for managing tasks, filtering, searching, and CRUD operations.
@MainActor
public final class TaskViewModel: ObservableObject {
    @Published public var tasks: [TaskItem] = []
    @Published public var filteredTasks: [TaskItem] = []
    @Published public var employees: [User] = []
    
    @Published public var searchText: String = ""
    @Published public var selectedFilter: String = "Total Tasks" // "Total Tasks", "Pending", "In Progress", "Completed"
    @Published public var selectedPriority: TaskPriority? = nil
    @Published public var filterStartDate: Date? = nil
    @Published public var filterEndDate: Date? = nil
    
    @Published public var isLoading: Bool = false
    @Published public var errorMessage: String?
    @Published public var showCreateSheet: Bool = false
    
    private var cancellables = Set<AnyCancellable>()
    
    public init() {
        populateDefaultTasks()
        
        Publishers.CombineLatest3($tasks, $searchText, $selectedFilter)
            .combineLatest(Publishers.CombineLatest3($selectedPriority, $filterStartDate, $filterEndDate))
            .map { (base, advanced) -> [TaskItem] in
                let (tasks, search, filter) = base
                let (priority, startDate, endDate) = advanced
                var list = tasks
                
                // 1. Filter by Status chip
                switch filter {
                case "Pending":
                    list = list.filter { $0.status == .todo }
                case "In Progress":
                    list = list.filter { $0.status == .inProgress }
                case "Completed":
                    list = list.filter { $0.status == .completed }
                default:
                    break
                }
                
                // 2. Search query filter
                if !search.isEmpty {
                    list = list.filter {
                        $0.title.localizedCaseInsensitiveContains(search) ||
                        $0.description.localizedCaseInsensitiveContains(search)
                    }
                }
                
                // 3. Priority filter
                if let priority = priority {
                    list = list.filter { $0.priority == priority }
                }
                
                // 4. Date Range filter
                if let start = startDate {
                    list = list.filter { task in
                        guard let dueDate = task.dueDate else { return false }
                        return dueDate >= Calendar.current.startOfDay(for: start)
                    }
                }
                if let end = endDate {
                    list = list.filter { task in
                        guard let dueDate = task.dueDate else { return false }
                        let endOfDay = Calendar.current.date(byAdding: .day, value: 1, to: Calendar.current.startOfDay(for: end))!
                        return dueDate < endOfDay
                    }
                }
                
                return list
            }
            .assign(to: &$filteredTasks)
        
        setupRealtime()
    }
    
    private func populateDefaultTasks() {
        self.tasks = [
            TaskItem(
                id: "task_01",
                title: "Security Audit & JWT Hardening",
                description: "Enforce AES-256-GCM encryption and audit refresh token rotation on auth gateway.",
                status: .inProgress,
                priority: .high,
                dueDate: Calendar.current.date(byAdding: .day, value: 2, to: Date()),
                assignedTo: TaskUserRef(id: "user_01", name: "Abhishek Yadav")
            ),
            TaskItem(
                id: "task_02",
                title: "WorkMode Geo-Fence Verification",
                description: "Ensure GPS coordinate validation occurs only during punch-in/out events and battery drain is minimal.",
                status: .todo,
                priority: .high,
                dueDate: Calendar.current.date(byAdding: .day, value: 1, to: Date()),
                assignedTo: TaskUserRef(id: "user_02", name: "Sneha Patel")
            ),
            TaskItem(
                id: "task_03",
                title: "MongoDB Index Optimizations",
                description: "Analyze slow query logs on task collection and add compound indexes for assignee and status lookups.",
                status: .completed,
                priority: .medium,
                dueDate: Calendar.current.date(byAdding: .day, value: -1, to: Date()),
                assignedTo: TaskUserRef(id: "user_03", name: "Rahul Sharma")
            ),
            TaskItem(
                id: "task_04",
                title: "Workplace Leave Approval Workflow",
                description: "Connect multi-level management escalation triggers and push notification dispatchers.",
                status: .inProgress,
                priority: .high,
                dueDate: Calendar.current.date(byAdding: .day, value: 3, to: Date()),
                assignedTo: TaskUserRef(id: "user_04", name: "Pooja Verma")
            ),
            TaskItem(
                id: "task_05",
                title: "Realtime WebSocket Heartbeat Protocol",
                description: "Implement automated reconnection backoff and presence broadcast for connected iOS clients.",
                status: .todo,
                priority: .medium,
                dueDate: Calendar.current.date(byAdding: .day, value: 4, to: Date()),
                assignedTo: TaskUserRef(id: "user_05", name: "Amit Kumar")
            )
        ]
        
        self.employees = [
            User(id: "user_01", name: "Abhishek Yadav", email: "abhishek7y2@gmail.com", role: .superadmin, designation: "CEO & Full Stack Architect"),
            User(id: "user_02", name: "Sneha Patel", email: "sneha.patel@workmate.internal", role: .admin, designation: "Lead Mobile Architect"),
            User(id: "user_03", name: "Rahul Sharma", email: "rahul.s@workmate.internal", role: .member, designation: "Senior Backend Engineer"),
            User(id: "user_04", name: "Pooja Verma", email: "pooja.v@workmate.internal", role: .member, designation: "Senior Product Designer"),
            User(id: "user_05", name: "Amit Kumar", email: "amit.k@workmate.internal", role: .member, designation: "Lead QA Automation")
        ]
    }
    
    private func setupRealtime() {
        SocketManager.shared.taskUpdatedSubject
            .receive(on: DispatchQueue.main)
            .sink { [weak self] updatedTask in
                if let index = self?.tasks.firstIndex(where: { $0.id == updatedTask.id }) {
                    self?.tasks[index] = updatedTask
                } else {
                    self?.tasks.insert(updatedTask, at: 0)
                }
            }
            .store(in: &cancellables)
    }
    private var currentPage: Int = 1
    public var hasMorePages: Bool = true
    
    // MARK: - Fetch Tasks
    public func fetchTasks(reset: Bool = false) async {
        if reset {
            currentPage = 1
            hasMorePages = true
            tasks.removeAll()
        }
        
        guard hasMorePages else { return }
        
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        
        do {
            let paginated: PaginatedTasksData = try await APIClient.shared.request(
                endpoint: .tasks(status: nil, priority: nil, search: nil, page: currentPage, limit: 15)
            )
            
            if reset {
                self.tasks = paginated.tasks
            } else {
                self.tasks.append(contentsOf: paginated.tasks)
            }
            
            self.hasMorePages = currentPage < (paginated.pagination?.totalPages ?? 1)
            if hasMorePages {
                currentPage += 1
            }
            
            // Only fetch employees once during initial load
            if reset {
                let response: UsersListData = try await APIClient.shared.request(endpoint: .users(search: nil, role: nil))
                if !response.users.isEmpty {
                    self.employees = response.users
                }
            }
        } catch {
            print("Task fetch ERROR: \(error.localizedDescription)")
        }
    }
    
    public func loadMoreIfNeeded(currentTask: TaskItem) {
        guard let lastTask = tasks.last, lastTask.id == currentTask.id else { return }
        guard hasMorePages, !isLoading else { return }
        
        Task {
            await fetchTasks(reset: false)
        }
    }
    
    public func fetchEmployees() async {
        do {
            let response: UsersListData = try await APIClient.shared.request(endpoint: .users(search: nil, role: nil))
            self.employees = response.users
        } catch {
            print("Failed to fetch employees: \(error)")
        }
    }
    
    // MARK: - Create Task
    public func createTask(title: String, description: String, priority: TaskPriority, dueDate: Date, assignedTo: String) async -> Bool {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let body = CreateTaskRequest(
                title: title,
                description: description,
                priority: priority.rawValue,
                dueDate: ISO8601DateFormatter().string(from: dueDate),
                assignedTo: assignedTo
            )
            let created: SingleTaskData = try await APIClient.shared.request(endpoint: .createTask, body: body)
            self.tasks.insert(created.task, at: 0)
            return true
        } catch {
            self.errorMessage = error.localizedDescription
            return false
        }
    }
    
    // MARK: - Update Task Status
    public func updateTaskStatus(task: TaskItem, newStatus: TaskStatus) async {
        do {
            let body = ["status": newStatus.rawValue]
            let updated: SingleTaskData = try await APIClient.shared.request(endpoint: .updateTask(id: task.id), body: body)
            if let idx = tasks.firstIndex(where: { $0.id == task.id }) {
                tasks[idx] = updated.task
            }
        } catch {
            print("Failed to update task status: \(error)")
        }
    }
    
    // MARK: - Delete Task
    public func deleteTask(task: TaskItem) async {
        do {
            let _: EmptyData = try await APIClient.shared.request(endpoint: .deleteTask(id: task.id))
            tasks.removeAll(where: { $0.id == task.id })
        } catch {
            print("Failed to delete task: \(error)")
        }
    }
}
