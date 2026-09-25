import SwiftUI

/// Semantic, scalable Apple typography tokens with Dynamic Type support.
public enum AppTypography {
    /// Screen Title (e.g. "WorkMate", "Welcome Back")
    public static let largeTitle = Font.system(size: 32, weight: .bold, design: .default)
    
    /// Primary section / modal title (e.g. "Abhishek", "Tasks", "Attendance")
    public static let title = Font.system(size: 24, weight: .bold, design: .default)
    
    /// Card headers / medium titles
    public static let title2 = Font.system(size: 20, weight: .semibold, design: .default)
    
    /// List item headers / prominent titles
    public static let headline = Font.system(size: 17, weight: .semibold, design: .default)
    
    /// Standard body text
    public static let body = Font.system(size: 16, weight: .regular, design: .default)
    
    /// Body medium emphasis
    public static let bodyMedium = Font.system(size: 16, weight: .medium, design: .default)
    
    /// Subheadline descriptions (e.g. "Stay on track and get things done.")
    public static let subheadline = Font.system(size: 14, weight: .regular, design: .default)
    
    /// Metadata, labels, chips, badges
    public static let footnote = Font.system(size: 13, weight: .medium, design: .default)
    
    /// Small timestamps, counter badges
    public static let caption = Font.system(size: 12, weight: .regular, design: .default)
    
    /// Micro captions / tiny badge text
    public static let captionBold = Font.system(size: 11, weight: .bold, design: .default)
    
    /// Monospaced numeric clock font (e.g. 09:14:32)
    public static let digitalClock = Font.system(size: 34, weight: .bold, design: .rounded).monospacedDigit()
    
    /// Big KPI metrics (e.g. "14", "12")
    public static let metricBig = Font.system(size: 36, weight: .semibold, design: .rounded)
}
