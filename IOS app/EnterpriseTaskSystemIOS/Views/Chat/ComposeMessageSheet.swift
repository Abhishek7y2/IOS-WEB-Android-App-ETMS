import SwiftUI

/// WhatsApp-style contact list for starting new chats or groups.
public struct ComposeMessageSheet: View {
    @ObservedObject var viewModel: CommunicationViewModel
    var onConversationStarted: ((Conversation) -> Void)?
    
    @Environment(\.presentationMode) private var presentationMode
    @State private var isLoading: Bool = false
    
    public init(viewModel: CommunicationViewModel, onConversationStarted: ((Conversation) -> Void)? = nil) {
        self.viewModel = viewModel
        self.onConversationStarted = onConversationStarted
    }
    
    public var body: some View {
        NavigationStack {
            List {
                if let user = AuthManager.shared.currentUser, user.role == .admin || user.role == .superadmin {
                    Section {
                        NavigationLink(destination: NewGroupParticipantsView(viewModel: viewModel, onConversationStarted: onConversationStarted)) {
                            HStack(spacing: AppSpacing.md) {
                                Circle()
                                    .fill(AppColors.primary.opacity(0.15))
                                    .frame(width: 44, height: 44)
                                    .overlay(
                                        Image(systemName: "person.2.fill")
                                            .foregroundColor(AppColors.primary)
                                    )
                                Text("New Group")
                                    .font(AppTypography.headline)
                                    .foregroundColor(AppColors.primary)
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }
                
                Section("Contacts on WorkMate") {
                    if viewModel.employeeRoster.isEmpty {
                        Text("Loading employee directory...")
                            .foregroundColor(AppColors.textSecondary)
                    } else {
                        ForEach(viewModel.employeeRoster) { employee in
                            Button(action: {
                                startDirectChat(with: employee)
                            }) {
                                HStack(spacing: AppSpacing.md) {
                                    Circle()
                                        .fill(Color.gray.opacity(0.15))
                                        .frame(width: 44, height: 44)
                                        .overlay(
                                            Text(initials(for: employee.name))
                                                .font(.system(size: 16, weight: .bold))
                                                .foregroundColor(AppColors.primary)
                                        )
                                    
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(employee.name)
                                            .font(AppTypography.headline)
                                            .foregroundColor(AppColors.textPrimary)
                                        if let designation = employee.designation {
                                            Text(designation)
                                                .font(AppTypography.caption)
                                                .foregroundColor(AppColors.textSecondary)
                                        }
                                    }
                                    Spacer()
                                }
                                .padding(.vertical, 4)
                            }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("New Chat")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        presentationMode.wrappedValue.dismiss()
                    }
                }
            }
            .overlay {
                if isLoading {
                    ZStack {
                        Color.black.opacity(0.2).ignoresSafeArea()
                        ProgressView()
                            .padding()
                            .background(Color.white)
                            .cornerRadius(8)
                    }
                }
            }
            .task {
                await viewModel.fetchEmployeesRoster()
            }
        }
    }
    
    private func startDirectChat(with employee: User) {
        Task {
            isLoading = true
            if let conversation = await viewModel.findOrCreateDirectConversation(with: employee.id) {
                isLoading = false
                presentationMode.wrappedValue.dismiss()
                
                // Slight delay to allow dismissal before presenting new sheet
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                    onConversationStarted?(conversation)
                }
            } else {
                isLoading = false
            }
        }
    }
    
    private func initials(for name: String) -> String {
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))".uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }
}

public struct NewGroupParticipantsView: View {
    @ObservedObject var viewModel: CommunicationViewModel
    var onConversationStarted: ((Conversation) -> Void)?
    
    @State private var selectedEmployeeIds: Set<String> = []
    @State private var navigateToDetails: Bool = false
    
    public var body: some View {
        List {
            Section("Select Participants (\(selectedEmployeeIds.count))") {
                ForEach(viewModel.employeeRoster) { employee in
                    Button(action: {
                        if selectedEmployeeIds.contains(employee.id) {
                            selectedEmployeeIds.remove(employee.id)
                        } else {
                            selectedEmployeeIds.insert(employee.id)
                        }
                    }) {
                        HStack(spacing: AppSpacing.md) {
                            Circle()
                                .fill(Color.gray.opacity(0.15))
                                .frame(width: 40, height: 40)
                                .overlay(
                                    Text(initials(for: employee.name))
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(AppColors.primary)
                                )
                            
                            Text(employee.name)
                                .font(AppTypography.headline)
                                .foregroundColor(AppColors.textPrimary)
                            Spacer()
                            if selectedEmployeeIds.contains(employee.id) {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(AppColors.primary)
                                    .font(.title3)
                            } else {
                                Image(systemName: "circle")
                                    .foregroundColor(AppColors.border)
                                    .font(.title3)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("New Group")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                NavigationLink(destination: NewGroupDetailsView(viewModel: viewModel, selectedEmployeeIds: Array(selectedEmployeeIds), onConversationStarted: onConversationStarted), isActive: $navigateToDetails) {
                    Text("Next")
                        .font(AppTypography.headline)
                }
                .disabled(selectedEmployeeIds.isEmpty)
            }
        }
    }
    
    private func initials(for name: String) -> String {
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))".uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }
}

public struct NewGroupDetailsView: View {
    @ObservedObject var viewModel: CommunicationViewModel
    let selectedEmployeeIds: [String]
    var onConversationStarted: ((Conversation) -> Void)?
    
    @Environment(\.presentationMode) private var presentationMode
    @State private var groupName: String = ""
    @State private var isLoading: Bool = false
    
    public var body: some View {
        Form {
            Section {
                HStack {
                    Circle()
                        .fill(Color.gray.opacity(0.15))
                        .frame(width: 60, height: 60)
                        .overlay(
                            Image(systemName: "camera.fill")
                                .foregroundColor(AppColors.textSecondary)
                        )
                    
                    TextField("Group Subject", text: $groupName)
                        .font(AppTypography.headline)
                        .padding(.leading, 8)
                }
                .padding(.vertical, 8)
            }
            
            Section("Participants (\(selectedEmployeeIds.count))") {
                let participants = viewModel.employeeRoster.filter { selectedEmployeeIds.contains($0.id) }
                ForEach(participants) { employee in
                    HStack(spacing: AppSpacing.md) {
                        Circle()
                            .fill(Color.gray.opacity(0.15))
                            .frame(width: 40, height: 40)
                            .overlay(
                                Text(initials(for: employee.name))
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(AppColors.primary)
                            )
                        
                        Text(employee.name)
                            .font(AppTypography.body)
                            .foregroundColor(AppColors.textPrimary)
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .navigationTitle("New Group")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button("Create") {
                    createGroup()
                }
                .font(AppTypography.headline)
                .disabled(groupName.trimmingCharacters(in: .whitespaces).isEmpty || isLoading)
            }
        }
        .overlay {
            if isLoading {
                ZStack {
                    Color.black.opacity(0.2).ignoresSafeArea()
                    ProgressView()
                        .padding()
                        .background(Color.white)
                        .cornerRadius(8)
                }
            }
        }
    }
    
    private func createGroup() {
        Task {
            isLoading = true
            let success = await viewModel.startConversation(
                subject: groupName,
                participantIds: selectedEmployeeIds,
                isGroup: true,
                groupName: groupName
            )
            isLoading = false
            if success {
                // Find the newly created conversation (it will be at index 0)
                if let newConv = viewModel.conversations.first {
                    onConversationStarted?(newConv)
                }
                NotificationCenter.default.post(name: NSNotification.Name("DismissComposeSheet"), object: nil)
            }
        }
    }
    
    private func initials(for name: String) -> String {
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))".uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }
}
