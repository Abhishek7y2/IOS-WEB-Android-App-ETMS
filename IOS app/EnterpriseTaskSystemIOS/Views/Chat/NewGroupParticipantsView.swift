import SwiftUI

public struct NewGroupParticipantsView: View {
    @ObservedObject var viewModel: CommunicationViewModel
    var onConversationStarted: ((Conversation) -> Void)?
    
    @State private var selectedEmployeeIds: Set<String> = []
    @State private var navigateToDetails: Bool = false
    
    public var body: some View {
        List {
            Section("Select Participants (\(selectedEmployeeIds.count))") {
                ForEach(viewModel.employeeRoster) { employee in
                    let isSelected = selectedEmployeeIds.contains(employee.id)
                    Button(action: {
                        if isSelected {
                            selectedEmployeeIds.remove(employee.id)
                        } else {
                            selectedEmployeeIds.insert(employee.id)
                        }
                    }) {
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
                                .font(AppTypography.headline)
                                .foregroundColor(AppColors.textPrimary)
                            Spacer()
                            if isSelected {
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
