import SwiftUI

/// Semantic, modern Apple-inspired color tokens for WorkMate.
public enum AppColors {
    // MARK: - Brand & Accents
    /// Primary vibrant royal blue (#2563EB)
    public static let primary = Color(red: 37/255, green: 99/255, blue: 235/255)
    
    /// Vibrant secondary blue (#3B82F6)
    public static let primaryLight = Color(red: 59/255, green: 130/255, blue: 246/255)
    
    /// Sky blue accent (#38BDF8)
    public static let accentSky = Color(red: 56/255, green: 189/255, blue: 248/255)
    
    /// Cyan accent (#06B6D4)
    public static let accentCyan = Color(red: 6/255, green: 182/255, blue: 212/255)
    
    /// Soft purple accent (#8B5CF6)
    public static let accentPurple = Color(red: 139/255, green: 92/255, blue: 246/255)
    
    /// Warm orange accent (#F97316)
    public static let accentOrange = Color(red: 249/255, green: 115/255, blue: 22/255)
    
    // MARK: - Status Tokens
    /// Success green (#10B981)
    public static let success = Color(red: 16/255, green: 185/255, blue: 129/255)
    public static let successSoft = Color(red: 16/255, green: 185/255, blue: 129/255).opacity(0.12)
    
    /// Warning amber/orange (#F59E0B)
    public static let warning = Color(red: 245/255, green: 158/255, blue: 11/255)
    public static let warningSoft = Color(red: 245/255, green: 158/255, blue: 11/255).opacity(0.12)
    
    /// Danger / Error red (#EF4444)
    public static let danger = Color(red: 239/255, green: 68/255, blue: 68/255)
    public static let dangerSoft = Color(red: 239/255, green: 68/255, blue: 68/255).opacity(0.12)
    
    /// Info blue (#3B82F6)
    public static let info = Color(red: 59/255, green: 130/255, blue: 246/255)
    public static let infoSoft = Color(red: 59/255, green: 130/255, blue: 246/255).opacity(0.12)
    
    // MARK: - Semantic Surfaces & Backgrounds
    /// Adaptive background for screens
    public static let background = Color(UIColor { trait in
        trait.userInterfaceStyle == .dark
            ? UIColor(red: 11/255, green: 15/255, blue: 25/255, alpha: 1.0) // #0B0F19
            : UIColor(red: 248/255, green: 250/255, blue: 252/255, alpha: 1.0) // #F8FAFC
    })
    
    /// Adaptive card surface
    public static let cardSurface = Color(UIColor { trait in
        trait.userInterfaceStyle == .dark
            ? UIColor(red: 20/255, green: 26/255, blue: 40/255, alpha: 0.95)
            : UIColor.white
    })
    
    /// Elevated surface (modal, floaters, popovers)
    public static let elevatedSurface = Color(UIColor { trait in
        trait.userInterfaceStyle == .dark
            ? UIColor(red: 28/255, green: 36/255, blue: 54/255, alpha: 1.0)
            : UIColor.white
    })
    
    /// Subtle divider / border
    public static let border = Color(UIColor { trait in
        trait.userInterfaceStyle == .dark
            ? UIColor(white: 1.0, alpha: 0.08)
            : UIColor(red: 226/255, green: 232/255, blue: 240/255, alpha: 0.8) // #E2E8F0
    })
    
    // MARK: - Adaptive Typography Colors
    public static let textPrimary = Color(UIColor.label)
    public static let textSecondary = Color(UIColor.secondaryLabel)
    public static let textTertiary = Color(UIColor.tertiaryLabel)
    public static let textOnPrimary = Color.white
}
