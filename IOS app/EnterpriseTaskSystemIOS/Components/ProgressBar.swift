import SwiftUI

/// Rounded linear progress bar for task progress cards.
public struct ProgressBar: View {
    private let progress: Double // 0.0 to 1.0
    private let height: CGFloat
    private let barColor: Color
    
    public init(
        progress: Double,
        height: CGFloat = 6,
        barColor: Color = AppColors.primary
    ) {
        self.progress = progress
        self.height = height
        self.barColor = barColor
    }
    
    public var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                // Background track
                RoundedRectangle(cornerRadius: AppRadius.pill, style: .continuous)
                    .fill(AppColors.border)
                    .frame(height: height)
                
                // Progress fill
                RoundedRectangle(cornerRadius: AppRadius.pill, style: .continuous)
                    .fill(barColor)
                    .frame(width: max(0, min(CGFloat(progress) * geometry.size.width, geometry.size.width)), height: height)
                    .animation(.spring(response: 0.5, dampingFraction: 0.7), value: progress)
            }
        }
        .frame(height: height)
    }
}
