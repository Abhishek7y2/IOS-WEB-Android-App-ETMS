import SwiftUI

/// Soft diffused enterprise shadow modifiers.
public struct AppCardShadowModifier: ViewModifier {
    @Environment(\.colorScheme) private var colorScheme
    
    public func body(content: Content) -> some View {
        content
            .shadow(
                color: colorScheme == .dark
                    ? Color.black.opacity(0.3)
                    : Color.black.opacity(0.08),
                radius: 12,
                x: 0,
                y: 4
            )
            .shadow(
                color: colorScheme == .dark
                    ? Color.black.opacity(0.15)
                    : Color.black.opacity(0.02),
                radius: 4,
                x: 0,
                y: 1
            )
    }
}

public struct AppGlowShadowModifier: ViewModifier {
    var color: Color
    
    public func body(content: Content) -> some View {
        content
            .shadow(color: color.opacity(0.25), radius: 10, x: 0, y: 4)
    }
}

public extension View {
    func appCardShadow() -> some View {
        modifier(AppCardShadowModifier())
    }
    
    func appGlowShadow(color: Color = AppColors.primary) -> some View {
        modifier(AppGlowShadowModifier(color: color))
    }
}
