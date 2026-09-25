import SwiftUI

/// Retryable Error view component.
public struct ErrorStateView: View {
    private let message: String
    private let retryAction: () -> Void
    
    public init(message: String, retryAction: @escaping () -> Void) {
        self.message = message
        self.retryAction = retryAction
    }
    
    public var body: some View {
        VStack(spacing: AppSpacing.md) {
            ZStack {
                Circle()
                    .fill(AppColors.dangerSoft)
                    .frame(width: 72, height: 72)
                
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 30))
                    .foregroundColor(AppColors.danger)
            }
            
            VStack(spacing: AppSpacing.xxs) {
                Text("Something went wrong")
                    .font(AppTypography.headline)
                    .foregroundColor(AppColors.textPrimary)
                
                Text(message)
                    .font(AppTypography.subheadline)
                    .foregroundColor(AppColors.textSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, AppSpacing.lg)
            }
            
            Button(action: retryAction) {
                HStack(spacing: AppSpacing.xs) {
                    Image(systemName: "arrow.clockwise")
                    Text("Try Again")
                }
                .font(AppTypography.headline)
                .foregroundColor(.white)
                .padding(.horizontal, AppSpacing.lg)
                .padding(.vertical, 10)
                .background(
                    Capsule()
                        .fill(AppColors.primary)
                )
            }
            .padding(.top, AppSpacing.xs)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
}
