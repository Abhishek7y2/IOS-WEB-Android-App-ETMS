import SwiftUI

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
                        .fill(AppColors.surfaceHighlight)
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
                            .fill(AppColors.surfaceHighlight)
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
                
                // Dismiss the entire sheet stack (requires presentationMode of root or hack)
                // In iOS 16+, dismiss() on a root dismisses the whole stack, but since we are deep, 
                // we can rely on the callback to dismiss the root sheet in MessagesInboxView.
                // Or dismiss locally and the callback handles the rest.
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
