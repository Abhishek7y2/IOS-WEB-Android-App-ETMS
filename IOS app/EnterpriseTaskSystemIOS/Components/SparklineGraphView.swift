import SwiftUI

/// A shape that draws a smooth sine-like wave for the sparkline graph.
struct SparklineWaveShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        let width = rect.width
        let height = rect.height
        
        // Start at the left middle
        path.move(to: CGPoint(x: 0, y: height * 0.6))
        
        // Curve 1 (up)
        path.addQuadCurve(
            to: CGPoint(x: width * 0.33, y: height * 0.5),
            control: CGPoint(x: width * 0.16, y: height * 0.1)
        )
        
        // Curve 2 (down)
        path.addQuadCurve(
            to: CGPoint(x: width * 0.66, y: height * 0.7),
            control: CGPoint(x: width * 0.5, y: height * 0.9)
        )
        
        // Curve 3 (up to the peak point)
        path.addQuadCurve(
            to: CGPoint(x: width, y: height * 0.3),
            control: CGPoint(x: width * 0.83, y: height * 0.1)
        )
        
        return path
    }
}

/// A shape that returns the filled area underneath the wave.
struct SparklineWaveFillShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = SparklineWaveShape().path(in: rect)
        
        // Line down to bottom right, then bottom left, then close path
        path.addLine(to: CGPoint(x: rect.width, y: rect.height))
        path.addLine(to: CGPoint(x: 0, y: rect.height))
        path.closeSubpath()
        
        return path
    }
}

/// A reusable sparkline graph view featuring a dashed wave line, a gradient fill, and a dot at the end.
public struct SparklineGraphView: View {
    var themeColor: Color
    
    public init(themeColor: Color) {
        self.themeColor = themeColor
    }
    
    public var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background Fill
                SparklineWaveFillShape()
                    .fill(
                        LinearGradient(
                            gradient: Gradient(colors: [themeColor.opacity(0.2), themeColor.opacity(0.0)]),
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                
                // Dashed Line
                SparklineWaveShape()
                    .stroke(style: StrokeStyle(lineWidth: 1.5, dash: [4, 3]))
                    .foregroundColor(themeColor)
                
                // The Dot (at the end peak)
                Circle()
                    .fill(themeColor)
                    .frame(width: 8, height: 8)
                    .position(x: geometry.size.width, y: geometry.size.height * 0.3)
            }
        }
    }
}
