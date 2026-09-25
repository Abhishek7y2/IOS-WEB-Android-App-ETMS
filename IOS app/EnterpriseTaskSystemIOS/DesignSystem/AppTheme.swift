import SwiftUI

/// Global styling and view modifiers for WorkMate.
public struct AppTheme {
    /// Applies the standard application screen background
    public struct ScreenBackgroundModifier: ViewModifier {
        public func body(content: Content) -> some View {
            ZStack {
                AppColors.background
                    .ignoresSafeArea()
                content
            }
        }
    }
}

public extension View {
    func appScreenBackground() -> some View {
        modifier(AppTheme.ScreenBackgroundModifier())
    }
}
