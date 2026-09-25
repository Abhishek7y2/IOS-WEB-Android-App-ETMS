import SwiftUI

/// Animated circular progress ring for Attendance tracking (as seen in Mockup #4).
public struct CircularProgressRing: View {
    private let timeString: String
    private let statusString: String
    private let progress: Double // 0.0 to 1.0
    private let isWorking: Bool
    
    public init(
        timeString: String,
        statusString: String = "Working",
        progress: Double = 0.75,
        isWorking: Bool = true
    ) {
        self.timeString = timeString
        self.statusString = statusString
        self.progress = progress
        self.isWorking = isWorking
    }
    
    public var body: some View {
        ZStack {
            // Background track
            Circle()
                .stroke(
                    AppColors.border.opacity(0.8),
                    style: StrokeStyle(lineWidth: 14, lineCap: .round)
                )
                .frame(width: 220, height: 220)
            
            // Glowing animated active stroke
            Circle()
                .trim(from: 0.0, to: CGFloat(min(self.progress, 1.0)))
                .stroke(
                    AppGradients.progressRing,
                    style: StrokeStyle(lineWidth: 14, lineCap: .round)
                )
                .rotationEffect(Angle(degrees: -90))
                .frame(width: 220, height: 220)
                .animation(.easeInOut(duration: 0.8), value: progress)
            
            // Center content
            VStack(spacing: AppSpacing.xxs) {
                Text(timeString)
                    .font(AppTypography.digitalClock)
                    .foregroundColor(AppColors.textPrimary)
                
                HStack(spacing: AppSpacing.xxs) {
                    Circle()
                        .fill(isWorking ? AppColors.success : AppColors.warning)
                        .frame(width: 8, height: 8)
                    
                    Text(statusString)
                        .font(AppTypography.subheadline)
                        .foregroundColor(AppColors.textSecondary)
                }
            }
        }
        .padding(.vertical, AppSpacing.lg)
    }
}
