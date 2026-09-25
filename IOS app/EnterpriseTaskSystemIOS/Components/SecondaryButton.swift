import SwiftUI

/// Secondary / Outlined button for subtle actions.
public struct SecondaryButton: View {
    private let title: String
    private let icon: String?
    private let isDestructive: Bool
    private let isFullWidth: Bool
    private let action: () -> Void
    
    public init(
        _ title: String,
        icon: String? = nil,
        isDestructive: Bool = false,
        isFullWidth: Bool = true,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.isDestructive = isDestructive
        self.isFullWidth = isFullWidth
        self.action = action
    }
    
    public var body: some View {
        Button(action: {
            let impact = UIImpactFeedbackGenerator(style: .light)
            impact.impactOccurred()
            action()
        }) {
            HStack(spacing: AppSpacing.xs) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 15, weight: .medium))
                }
                Text(title)
                    .font(AppTypography.headline)
            }
            .foregroundColor(isDestructive ? AppColors.danger : AppColors.primary)
            .frame(maxWidth: isFullWidth ? .infinity : nil)
            .frame(height: 50)
            .padding(.horizontal, AppSpacing.lg)
            .background(
                RoundedRectangle(cornerRadius: AppRadius.md, style: .continuous)
                    .fill(isDestructive ? AppColors.dangerSoft : AppColors.cardSurface)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppRadius.md, style: .continuous)
                            .stroke(isDestructive ? AppColors.danger.opacity(0.3) : AppColors.border, lineWidth: 1)
                    )
            )
        }
    }
}
