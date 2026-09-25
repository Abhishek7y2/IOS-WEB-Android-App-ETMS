import SwiftUI

public struct DonutSegmentData {
    public let value: Double
    public let color: Color
    public let isExploded: Bool
    
    public init(value: Double, color: Color, isExploded: Bool = false) {
        self.value = value
        self.color = color
        self.isExploded = isExploded
    }
}

public struct ExplodedDonutChart: View {
    public let segments: [DonutSegmentData]
    public let centerText: String
    
    public init(segments: [DonutSegmentData], centerText: String = "TASKS") {
        self.segments = segments
        self.centerText = centerText
    }
    
    public var body: some View {
        let total = segments.reduce(0) { $0 + $1.value }
        
        GeometryReader { geometry in
            let center = CGPoint(x: geometry.size.width / 2, y: geometry.size.height / 2)
            let radius = min(geometry.size.width, geometry.size.height) / 2
            let strokeWidth: CGFloat = radius * 0.4
            
            ZStack {
                if total == 0 {
                    Circle()
                        .stroke(Color.gray.opacity(0.2), lineWidth: strokeWidth)
                        .frame(width: radius * 2 - strokeWidth, height: radius * 2 - strokeWidth)
                } else {
                    ForEach(0..<segments.count, id: \.self) { index in
                        let segment = segments[index]
                        if segment.value > 0 {
                            let startAngle = getStartAngle(for: index, total: total)
                            let endAngle = startAngle + (segment.value / total) * 360
                            let midAngle = (startAngle + endAngle) / 2
                            
                            // Calculate explosion offset
                            let explosionOffset: CGFloat = segment.isExploded ? 8.0 : 0
                            let radians = midAngle * .pi / 180
                            let xOffset = explosionOffset * CGFloat(cos(radians))
                            let yOffset = explosionOffset * CGFloat(sin(radians))
                            
                            Circle()
                                .trim(from: startAngle / 360, to: endAngle / 360)
                                .stroke(segment.color, lineWidth: strokeWidth)
                                .frame(width: radius * 2 - strokeWidth, height: radius * 2 - strokeWidth)
                                .rotationEffect(.degrees(-90)) // Start at top instead of right
                                .offset(x: xOffset, y: yOffset)
                        }
                    }
                }
                
                // Center text
                Text(centerText)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(AppColors.textPrimary)
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
        }
    }
    
    private func getStartAngle(for index: Int, total: Double) -> Double {
        var start: Double = 0
        for i in 0..<index {
            start += (segments[i].value / total) * 360
        }
        return start
    }
}
