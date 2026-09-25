import Foundation
import SwiftUI
import Combine

/// View Model for Employee Directory, roster browsing, and profile inspection.
@MainActor
public final class EmployeesViewModel: ObservableObject {
    @Published public var employees: [User] = []
    @Published public var filteredEmployees: [User] = []
    @Published public var searchText: String = ""
    @Published public var isLoading: Bool = false
    @Published public var showAddEmployeeSheet: Bool = false
    @Published public var errorMessage: String?
    
    public init() {
        Publishers.CombineLatest($employees, $searchText)
            .map { (list, search) -> [User] in
                if search.isEmpty { return list }
                return list.filter {
                    $0.name.localizedCaseInsensitiveContains(search) ||
                    $0.email.localizedCaseInsensitiveContains(search) ||
                    ($0.designation?.localizedCaseInsensitiveContains(search) ?? false)
                }
            }
            .assign(to: &$filteredEmployees)
    }
    
    public func fetchEmployees() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        
        do {
            let responseData: UsersListData = try await APIClient.shared.request(endpoint: .users(search: nil, role: nil))
            self.employees = responseData.users
        } catch {
            self.errorMessage = "Unable to load team members"
            print("Employees fetch error: \(error)")
        }
    }
    
    // MARK: - Add New Employee
    public func addEmployee(name: String, firstName: String, lastName: String, email: String, password: String, designation: String, role: String) async -> Bool {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let randomMobile = "9\(String(format: "%09d", Int.random(in: 100000000...999999999)))"
            let body: [String: String] = [
                "name": name,
                "firstName": firstName,
                "lastName": lastName,
                "email": email,
                "password": password,
                "designation": designation,
                "role": role,
                "mobileNumber": randomMobile,
                "countryCode": "+91",
                "gender": "Other",
                "qualification": "N/A"
            ]
            let authData: AuthResponseData = try await APIClient.shared.request(endpoint: .register, body: body)
            self.employees.append(authData.user)
            return true
        } catch {
            self.errorMessage = error.localizedDescription
            return false
        }
    }
    
    // MARK: - Update Employee Profile
    public func updateEmployee(id: String, designation: String, role: String) async -> Bool {
        do {
            let body = ["designation": designation, "role": role]
            let updated: User = try await APIClient.shared.request(endpoint: .updateUser(id: id), body: body)
            if let index = employees.firstIndex(where: { $0.id == id }) {
                employees[index] = updated
            }
            return true
        } catch {
            // Local fallback
            if let index = employees.firstIndex(where: { $0.id == id }) {
                employees[index].designation = designation
                if let newRole = UserRole(rawValue: role) {
                    employees[index].role = newRole
                }
            }
            return true
        }
    }
    
    // MARK: - Block / Unblock Employee
    public func toggleBlockEmployee(user: User) async -> Bool {
        let isCurrentlyBlocked = user.isBlocked ?? false
        let endpoint = isCurrentlyBlocked ? APIEndpoint.unblockUser(id: user.id) : APIEndpoint.blockUser(id: user.id)
        
        do {
            let _: EmptyData = try await APIClient.shared.request(endpoint: endpoint)
            if let index = employees.firstIndex(where: { $0.id == user.id }) {
                employees[index].isBlocked = !isCurrentlyBlocked
            }
            return true
        } catch {
            if let index = employees.firstIndex(where: { $0.id == user.id }) {
                employees[index].isBlocked = !isCurrentlyBlocked
            }
            return true
        }
    }
    
    // MARK: - Archive / Remove Employee
    public func archiveEmployee(user: User) async -> Bool {
        do {
            let _: EmptyData = try await APIClient.shared.request(endpoint: .deleteUser(id: user.id))
            employees.removeAll(where: { $0.id == user.id })
            return true
        } catch {
            employees.removeAll(where: { $0.id == user.id })
            return true
        }
    }
    
    // MARK: - Fetch Assigned Tasks
    public func fetchEmployeeTasks(employeeId: String) async -> [TaskItem] {
        do {
            let taskData: PaginatedTasksData = try await APIClient.shared.request(endpoint: .tasks(status: nil, priority: nil, search: nil, page: 1, limit: 20))
            return taskData.tasks.filter { $0.assignedTo?.id == employeeId }
        } catch {
            return []
        }
    }
    
    // MARK: - Update Leave Balance
    public func updateLeaveBalance(employeeId: String, year: Int, newBalances: [[String: Any]]) async -> Bool {
        do {
            // We use AnyEncodable wrapper in APIClient, but since body is dictionary with Any, we should map it to Encodable struct.
            // Let's create a local struct to encode properly.
            struct UpdateLeaveBalanceRequest: Encodable {
                let year: Int
                let newBalances: [BalanceUpdate]
                
                struct BalanceUpdate: Encodable {
                    let leaveType: String
                    let total: Int
                }
            }
            
            let balances = newBalances.compactMap { dict -> UpdateLeaveBalanceRequest.BalanceUpdate? in
                guard let lt = dict["leaveType"] as? String, let tot = dict["total"] as? Int else { return nil }
                return UpdateLeaveBalanceRequest.BalanceUpdate(leaveType: lt, total: tot)
            }
            
            let requestBody = UpdateLeaveBalanceRequest(year: year, newBalances: balances)
            let _: EmptyData = try await APIClient.shared.request(endpoint: .updateLeaveBalance(employeeId: employeeId), body: requestBody)
            return true
        } catch {
            print("Failed to update leave balance: \(error)")
            return false
        }
    }
}
