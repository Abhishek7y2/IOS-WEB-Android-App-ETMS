import SwiftUI

/// Semantic status badge with soft background and colored text.
public struct StatusBadge: View {
    private let title: String
    private let color: Color
    private let backgroundColor: Color
    
    public init(_ title: String, color: Color = AppColors.primary) {
        self.title = title
        self.color = color
        self.backgroundColor = color.opacity(0.12)
    }
    
    public init(status: TaskStatus) {
        self.title = status.displayName
        switch status {
        case .todo:
            self.color = AppColors.info
        case .inProgress:
            self.color = AppColors.accentSky
        case .completed:
            self.color = AppColors.success
        }
        self.backgroundColor = self.color.opacity(0.12)
    }
    
    public init(leaveStatus: LeaveStatus) {
        self.title = leaveStatus.rawValue
        switch leaveStatus {
        case .pending:
            self.color = AppColors.warning
        case .approved:
            self.color = AppColors.success
        case .rejected:
            self.color = AppColors.danger
        case .cancelled, .withdrawn:
            self.color = AppColors.textSecondary
        }
        self.backgroundColor = self.color.opacity(0.12)
    }
    
    public var body: some View {
        Text(title)
            .font(AppTypography.captionBold)
            .foregroundColor(color)
            .padding(.horizontal, AppSpacing.sm)
            .padding(.vertical, AppSpacing.xxs)
            .background(
                Capsule(style: .continuous)
                    .fill(backgroundColor)
            )
    }
}
