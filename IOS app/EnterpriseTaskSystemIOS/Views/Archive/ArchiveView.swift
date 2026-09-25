import SwiftUI

/// Archive Manager screen matching Web Frontend Archive page.
public struct ArchiveView: View {
    @EnvironmentObject private var authViewModel: AuthViewModel
    @State private var selectedTab: Int = 0 // 0: Tasks, 1: Employees
    
    @State private var archivedTasks: [TaskItem] = []
    @State private var archivedUsers: [User] = []
    @State private var isLoading: Bool = false
    @State private var errorMessage: String?
    
    @State private var deleteTargetTaskId: String?
    @State private var deleteTargetUserId: String?
    @State private var showDeleteAlert: Bool = false
    
    public init() {}
    
    public var body: some View {
        VStack(spacing: 0) {
                // Segmented Picker
                Picker("Archive Category", selection: $selectedTab) {
                    Text("Archived Tasks (\(archivedTasks.count))").tag(0)
                    Text("Archived Employees (\(archivedUsers.count))").tag(1)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, AppSpacing.md)
                .padding(.vertical, AppSpacing.sm)
                
                if isLoading && archivedTasks.isEmpty && archivedUsers.isEmpty {
                    Spacer()
                    LoadingView(message: "Loading archive...")
                    Spacer()
                } else if selectedTab == 0 {
                    // Tasks Archive List
                    if archivedTasks.isEmpty {
                        Spacer()
                        EmptyStateView(
                            icon: "archivebox",
                            title: "No Archived Tasks",
                            message: "Deleted tasks will be preserved here for restoration."
                        )
                        Spacer()
                    } else {
                        List {
                            ForEach(archivedTasks) { task in
                                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                                    HStack {
                                        Text(task.title)
                                            .font(AppTypography.headline)
                                            .foregroundColor(AppColors.textPrimary)
                                        Spacer()
                                        StatusBadge(status: task.status)
                                    }
                                    
                                    Text(task.description)
                                        .font(AppTypography.caption)
                                        .foregroundColor(AppColors.textSecondary)
                                        .lineLimit(2)
                                    
                                    HStack(spacing: AppSpacing.md) {
                                        Button(action: {
                                            restoreTask(task.id)
                                        }) {
                                            Label("Restore", systemImage: "arrow.counterclockwise")
                                                .font(AppTypography.captionBold)
                                                .foregroundColor(AppColors.primary)
                                                .padding(.horizontal, 12)
                                                .padding(.vertical, 8)
                                                .background(AppColors.primary.opacity(0.1))
                                                .cornerRadius(8)
                                        }
                                        .buttonStyle(PlainButtonStyle())
                                        
                                        Spacer()
                                        
                                        Button(role: .destructive, action: {
                                            self.deleteTargetTaskId = task.id
                                            self.showDeleteAlert = true
                                        }) {
                                            Label("Delete", systemImage: "trash")
                                                .font(AppTypography.captionBold)
                                                .foregroundColor(AppColors.danger)
                                                .padding(.horizontal, 12)
                                                .padding(.vertical, 8)
                                                .background(AppColors.danger.opacity(0.1))
                                                .cornerRadius(8)
                                        }
                                        .buttonStyle(PlainButtonStyle())
                                    }
                                    .padding(.top, 4)
                                }
                                .padding(.vertical, 4)
                            }
                        }
                        .listStyle(.plain)
                    }
                } else {
                    // Users Archive List
                    if archivedUsers.isEmpty {
                        Spacer()
                        EmptyStateView(
                            icon: "person.crop.circle.badge.xmark",
                            title: "No Archived Employees",
                            message: "Archived team members will appear here."
                        )
                        Spacer()
                    } else {
                        List {
                            ForEach(archivedUsers) { user in
                                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                                    HStack(spacing: AppSpacing.sm) {
                                        ZStack {
                                            Circle()
                                                .fill(AppColors.primary.opacity(0.15))
                                                .frame(width: 40, height: 40)
                                            Text(user.initials)
                                                .font(AppTypography.headline)
                                                .foregroundColor(AppColors.primary)
                                        }
                                        
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(user.name)
                                                .font(AppTypography.headline)
                                                .foregroundColor(AppColors.textPrimary)
                                            Text(user.email)
                                                .font(AppTypography.caption)
                                                .foregroundColor(AppColors.textSecondary)
                                        }
                                        Spacer()
                                        StatusBadge(user.role.displayName, color: AppColors.primary)
                                    }
                                    
                                    HStack(spacing: AppSpacing.md) {
                                        Button(action: {
                                            restoreUser(user.id)
                                        }) {
                                            Label("Restore", systemImage: "arrow.counterclockwise")
                                                .font(AppTypography.captionBold)
                                                .foregroundColor(AppColors.primary)
                                                .padding(.horizontal, 12)
                                                .padding(.vertical, 8)
                                                .background(AppColors.primary.opacity(0.1))
                                                .cornerRadius(8)
                                        }
                                        .buttonStyle(PlainButtonStyle())
                                        
                                        Spacer()
                                        
                                        Button(role: .destructive, action: {
                                            self.deleteTargetUserId = user.id
                                            self.showDeleteAlert = true
                                        }) {
                                            Label("Delete", systemImage: "trash")
                                                .font(AppTypography.captionBold)
                                                .foregroundColor(AppColors.danger)
                                                .padding(.horizontal, 12)
                                                .padding(.vertical, 8)
                                                .background(AppColors.danger.opacity(0.1))
                                                .cornerRadius(8)
                                        }
                                        .buttonStyle(PlainButtonStyle())
                                    }
                                    .padding(.top, 4)
                                }
                                .padding(.vertical, 4)
                            }
                        }
                        .listStyle(.plain)
                    }
                }
            }
            .navigationTitle("Archive Manager")
            .navigationBarTitleDisplayMode(.inline)
            .task {
                await loadArchive()
            }
            .refreshable {
                await loadArchive()
            }
            .alert("Permanent Delete", isPresented: $showDeleteAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Delete Forever", role: .destructive) {
                    if let taskId = deleteTargetTaskId {
                        permanentDeleteTask(taskId)
                    } else if let userId = deleteTargetUserId {
                        permanentDeleteUser(userId)
                    }
                }
            } message: {
                Text("This action cannot be undone. All related records will be permanently removed.")
            }
    }
    
    private func loadArchive() async {
        isLoading = true
        defer { isLoading = false }
        
        do {
            let tasks: [TaskItem] = try await APIClient.shared.request(endpoint: .archivedTasks)
            self.archivedTasks = tasks
        } catch {
            print("Failed to load archived tasks: \(error)")
            self.archivedTasks = []
        }
        
        do {
            let users: [User] = try await APIClient.shared.request(endpoint: .archivedUsers)
            self.archivedUsers = users
        } catch {
            print("Failed to load archived users: \(error)")
            self.archivedUsers = []
        }
    }
    
    private func restoreTask(_ taskId: String) {
        Task { @MainActor in
            _ = try? await APIClient.shared.request(endpoint: .restoreTask(id: taskId)) as EmptyData
            withAnimation {
                archivedTasks.removeAll(where: { $0.id == taskId })
            }
        }
    }
    
    private func restoreUser(_ userId: String) {
        Task { @MainActor in
            _ = try? await APIClient.shared.request(endpoint: .restoreUser(id: userId)) as EmptyData
            withAnimation {
                archivedUsers.removeAll(where: { $0.id == userId })
            }
        }
    }
    
    private func permanentDeleteTask(_ taskId: String) {
        Task { @MainActor in
            _ = try? await APIClient.shared.request(endpoint: .permanentDeleteTask(id: taskId)) as EmptyData
            withAnimation {
                archivedTasks.removeAll(where: { $0.id == taskId })
                deleteTargetTaskId = nil
            }
        }
    }
    
    private func permanentDeleteUser(_ userId: String) {
        Task { @MainActor in
            _ = try? await APIClient.shared.request(endpoint: .permanentDeleteUser(id: userId)) as EmptyData
            withAnimation {
                archivedUsers.removeAll(where: { $0.id == userId })
                deleteTargetUserId = nil
            }
        }
    }
}
