import SwiftUI

/// Dashboard 2x2 KPI metric card matching the reference mockup.
public struct MetricCard: View {
    private let title: String
    private let value: String
    private let percentageChange: String
    private let isPositive: Bool
    private let themeColor: Color
    
    public init(
        title: String,
        value: String,
        percentageChange: String,
        isPositive: Bool,
        themeColor: Color = AppColors.primary
    ) {
        self.title = title
        self.value = value
        self.percentageChange = percentageChange
        self.isPositive = isPositive
        self.themeColor = themeColor
    }
    
    public var body: some View {
        AppCard(padding: 0, cornerRadius: AppRadius.lg) {
            ZStack(alignment: .bottom) {
                // Background Sparkline
                VStack {
                    Spacer()
                    SparklineGraphView(themeColor: themeColor)
                        .frame(height: 50)
                }
                .clipShape(RoundedRectangle(cornerRadius: AppRadius.lg, style: .continuous))
                
                // Content overlay
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    HStack {
                        Text(title.uppercased())
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(AppColors.textSecondary)
                        
                        Spacer()
                        
                        HStack(spacing: 2) {
                            Image(systemName: isPositive ? "triangle.fill" : "arrowtriangle.down.fill")
                                .font(.system(size: 8))
                            Text(percentageChange)
                                .font(.system(size: 12, weight: .bold))
                        }
                        .foregroundColor(isPositive ? .green : .red)
                    }
                    
                    Text(value)
                        .font(.system(size: 24, weight: .bold))
                        .foregroundColor(AppColors.textPrimary)
                    
                    Spacer()
                }
                .padding(AppSpacing.md)
            }
            .frame(height: 100)
        }
        .contentShape(Rectangle())
    }
}
