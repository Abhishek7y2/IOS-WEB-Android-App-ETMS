import SwiftUI

/// Semantic gradients matching the WorkMate visual design language.
public enum AppGradients {
    /// Sky-blue soft gradient for the Dashboard Attendance Quick Card (as seen in Mockup #2)
    public static let attendanceCard = LinearGradient(
        colors: [
            Color(red: 219/255, green: 234/255, blue: 254/255), // Light blue (#DBEAFE)
            Color(red: 224/255, green: 242/255, blue: 254/255), // Cyan tint (#E0F2FE)
            Color(red: 240/255, green: 249/255, blue: 255/255)  // Soft white/blue
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    /// Dark version of Attendance Card
    public static let attendanceCardDark = LinearGradient(
        colors: [
            Color(red: 23/255, green: 37/255, blue: 84/255), // Deep navy
            Color(red: 15/255, green: 23/255, blue: 42/255)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    /// Primary vibrant button gradient
    public static let primaryButton = LinearGradient(
        colors: [
            AppColors.primaryLight,
            AppColors.primary
        ],
        startPoint: .top,
        endPoint: .bottom
    )
    
    /// Auth background deep dark gradient (as seen in Mockup #1)
    public static let authBackground = LinearGradient(
        colors: [
            Color(red: 8/255, green: 14/255, blue: 30/255),
            Color(red: 11/255, green: 20/255, blue: 44/255),
            Color(red: 4/255, green: 8/255, blue: 18/255)
        ],
        startPoint: .top,
        endPoint: .bottom
    )
    
    /// Leave Balance card gradient (as seen in Mockup #5)
    public static let leaveCard = LinearGradient(
        colors: [
            Color(red: 239/255, green: 246/255, blue: 255/255),
            Color(red: 219/255, green: 234/255, blue: 254/255)
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    /// Circular progress attendance ring gradient (as seen in Mockup #4)
    public static let progressRing = AngularGradient(
        gradient: Gradient(colors: [
            AppColors.accentSky,
            AppColors.primary,
            AppColors.accentCyan,
            AppColors.accentSky
        ]),
        center: .center
    )
}
