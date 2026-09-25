import SwiftUI

public struct TaskTrendsCard: View {
    @ObservedObject var viewModel: DashboardViewModel
    
    public var body: some View {
        AppCard(padding: AppSpacing.lg) {
            VStack(alignment: .leading, spacing: AppSpacing.lg) {
                // Header
                HStack {
                    Text("TASK TRENDS")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(AppColors.textPrimary)
                    
                    Spacer()
                    
                    Image(systemName: "line.3.horizontal")
                        .foregroundColor(AppColors.textTertiary)
                }
                
                // Tabs / Legend
                HStack {
                    HStack(spacing: 8) {
                        Text("DAY")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Capsule().fill(Color.green))
                        
                        Text("WEEK")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(AppColors.textSecondary)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Capsule().stroke(AppColors.border, lineWidth: 1))
                    }
                    
                    Spacer()
                    
                    HStack(spacing: 12) {
                        HStack(spacing: 4) {
                            Rectangle()
                                .fill(Color.blue)
                                .frame(width: 12, height: 2)
                            Text("TODAY")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(AppColors.textSecondary)
                        }
                        
                        HStack(spacing: 4) {
                            Rectangle()
                                .fill(Color.red)
                                .frame(width: 12, height: 2)
                            Text("YESTERDAY")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(AppColors.textSecondary)
                        }
                    }
                }
                
                // Mock Chart Area
                MockLineChart()
                    .frame(height: 180)
            }
        }
    }
}

public struct MockLineChart: View {
    public var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Horizontal grid lines
                VStack(spacing: 0) {
                    ForEach(0..<5) { i in
                        HStack {
                            Text("\(50 - i * 10)")
                                .font(.system(size: 10))
                                .foregroundColor(AppColors.textTertiary)
                                .frame(width: 20, alignment: .trailing)
                            
                            Rectangle()
                                .fill(AppColors.border.opacity(0.5))
                                .frame(height: 1)
                        }
                        if i < 4 { Spacer() }
                    }
                }
                
                let chartHeight = geometry.size.height
                let chartWidth = geometry.size.width - 28 // left padding for labels
                
                // Red Dashed Wave (Yesterday)
                MockWaveShape(seed: 1)
                    .stroke(Color.red, style: StrokeStyle(lineWidth: 1.5, dash: [4, 4]))
                    .frame(width: chartWidth, height: chartHeight)
                    .offset(x: 28)
                
                // Red Wave Fill
                MockWaveFillShape(seed: 1)
                    .fill(
                        LinearGradient(gradient: Gradient(colors: [Color.red.opacity(0.1), Color.red.opacity(0.0)]), startPoint: .top, endPoint: .bottom)
                    )
                    .frame(width: chartWidth, height: chartHeight)
                    .offset(x: 28)
                
                // Blue Solid Wave (Today)
                MockWaveShape(seed: 0)
                    .stroke(Color.blue, lineWidth: 1.5)
                    .frame(width: chartWidth, height: chartHeight)
                    .offset(x: 28)
                
                // Blue Wave Fill
                MockWaveFillShape(seed: 0)
                    .fill(
                        LinearGradient(gradient: Gradient(colors: [Color.blue.opacity(0.1), Color.blue.opacity(0.0)]), startPoint: .top, endPoint: .bottom)
                    )
                    .frame(width: chartWidth, height: chartHeight)
                    .offset(x: 28)
                
                // X-Axis Labels
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        Text("10:00 AM")
                        Spacer()
                        Text("12:00 PM")
                        Spacer()
                        Text("14:00 PM")
                        Spacer()
                    }
                    .font(.system(size: 9))
                    .foregroundColor(AppColors.textTertiary)
                    .offset(x: 14, y: 15)
                }
            }
        }
    }
}

public struct MockWaveShape: Shape {
    var seed: Int
    public func path(in rect: CGRect) -> Path {
        var path = Path()
        let w = rect.width
        let h = rect.height
        
        path.move(to: CGPoint(x: 0, y: h))
        
        if seed == 0 {
            // Blue Line
            path.addCurve(to: CGPoint(x: w * 0.3, y: h * 0.2), control1: CGPoint(x: w * 0.1, y: h * 0.1), control2: CGPoint(x: w * 0.2, y: h * 0.3))
            path.addCurve(to: CGPoint(x: w * 0.7, y: h * 0.8), control1: CGPoint(x: w * 0.5, y: h * 0.1), control2: CGPoint(x: w * 0.5, y: h * 1.0))
            path.addCurve(to: CGPoint(x: w, y: h * 0.5), control1: CGPoint(x: w * 0.85, y: h * 0.6), control2: CGPoint(x: w * 0.9, y: h * 0.5))
        } else {
            // Red Line
            path.addCurve(to: CGPoint(x: w * 0.4, y: h * 0.7), control1: CGPoint(x: w * 0.1, y: h * 0.8), control2: CGPoint(x: w * 0.2, y: h * 0.6))
            path.addCurve(to: CGPoint(x: w * 0.6, y: h * 0.1), control1: CGPoint(x: w * 0.5, y: h * 0.8), control2: CGPoint(x: w * 0.5, y: h * 0.1))
            path.addCurve(to: CGPoint(x: w, y: h * 0.9), control1: CGPoint(x: w * 0.8, y: h * 0.1), control2: CGPoint(x: w * 0.9, y: h * 0.9))
        }
        
        return path
    }
}

public struct MockWaveFillShape: Shape {
    var seed: Int
    public func path(in rect: CGRect) -> Path {
        var path = MockWaveShape(seed: seed).path(in: rect)
        path.addLine(to: CGPoint(x: rect.width, y: rect.height))
        path.addLine(to: CGPoint(x: 0, y: rect.height))
        path.closeSubpath()
        return path
    }
}
