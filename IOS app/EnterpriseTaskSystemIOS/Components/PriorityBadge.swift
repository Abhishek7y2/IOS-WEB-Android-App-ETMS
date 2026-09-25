import SwiftUI

/// Priority indicator pill with dot (as seen in Mockup #3: High, Medium, Low).
public struct PriorityBadge: View {
    private let priority: TaskPriority
    
    public init(priority: TaskPriority) {
        self.priority = priority
    }
    
    private var dotColor: Color {
        switch priority {
        case .high, .critical:
            return AppColors.danger
        case .medium:
            return AppColors.warning
        case .low:
            return AppColors.info
        }
    }
    
    private var textColor: Color {
        switch priority {
        case .high, .critical:
            return AppColors.danger
        case .medium:
            return AppColors.warning
        case .low:
            return AppColors.info
        }
    }
    
    public var body: some View {
        HStack(spacing: AppSpacing.xxs) {
            Circle()
                .fill(dotColor)
                .frame(width: 6, height: 6)
            
            Text(priority.displayName)
                .font(AppTypography.captionBold)
                .foregroundColor(textColor)
        }
        .padding(.horizontal, AppSpacing.sm)
        .padding(.vertical, 4)
        .background(
            Capsule()
                .fill(dotColor.opacity(0.12))
        )
    }
}
