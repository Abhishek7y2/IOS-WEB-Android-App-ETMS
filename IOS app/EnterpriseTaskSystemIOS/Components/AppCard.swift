import SwiftUI

/// Standard elevated glass card container with subtle border and soft shadows.
public struct AppCard<Content: View>: View {
    private let content: Content
    private let padding: CGFloat
    private let cornerRadius: CGFloat
    private let backgroundColor: Color?
    
    public init(
        padding: CGFloat = AppSpacing.md,
        cornerRadius: CGFloat = AppRadius.lg,
        backgroundColor: Color? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.content = content()
        self.padding = padding
        self.cornerRadius = cornerRadius
        self.backgroundColor = backgroundColor
    }
    
    public var body: some View {
        content
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(backgroundColor ?? AppColors.cardSurface)
                    .overlay(
                        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                            .stroke(AppColors.border, lineWidth: 0.8)
                    )
            )
            .appCardShadow()
    }
}
