import SwiftUI

/// Available Balance Card on Leave screen matching Reference Mockup #5.
public struct LeaveBalanceCard: View {
    let daysRemaining: Int
    @Environment(\.colorScheme) private var colorScheme
    
    public var body: some View {
        ZStack(alignment: .trailing) {
            // Soft Blue gradient background
            RoundedRectangle(cornerRadius: AppRadius.xl, style: .continuous)
                .fill(colorScheme == .dark ? AppGradients.attendanceCardDark : AppGradients.leaveCard)
                .overlay(
                    RoundedRectangle(cornerRadius: AppRadius.xl, style: .continuous)
                        .stroke(colorScheme == .dark ? Color.white.opacity(0.1) : AppColors.primary.opacity(0.15), lineWidth: 1)
                )
            
            // Subtle calendar icon watermark
            Image(systemName: "calendar")
                .font(.system(size: 80, weight: .light))
                .foregroundColor(AppColors.primary.opacity(0.15))
                .padding(.trailing, AppSpacing.lg)
            
            // Content
            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                Text("Available Balance")
                    .font(AppTypography.subheadline)
                    .foregroundColor(AppColors.textSecondary)
                
                Text("\(daysRemaining)")
                    .font(AppTypography.metricBig)
                    .foregroundColor(AppColors.primary)
                
                Text("Days Remaining")
                    .font(AppTypography.footnote)
                    .foregroundColor(AppColors.textSecondary)
            }
            .padding(AppSpacing.lg)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(height: 140)
        .appCardShadow()
    }
}
