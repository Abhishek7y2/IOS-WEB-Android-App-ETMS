import SwiftUI

/// Modern search bar with clear button and SF Symbol magnifier.
public struct SearchBar: View {
    @Binding var text: String
    private let placeholder: String
    
    public init(text: Binding<String>, placeholder: String = "Search...") {
        self._text = text
        self.placeholder = placeholder
    }
    
    public var body: some View {
        HStack(spacing: AppSpacing.xs) {
            Image(systemName: AppIcons.search)
                .foregroundColor(AppColors.textTertiary)
                .font(.system(size: 15, weight: .medium))
            
            TextField(placeholder, text: $text)
                .font(AppTypography.body)
                .foregroundColor(AppColors.textPrimary)
                .autocapitalization(.none)
                .disableAutocorrection(true)
            
            if !text.isEmpty {
                Button(action: {
                    text = ""
                }) {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(AppColors.textTertiary)
                        .font(.system(size: 15))
                }
            }
        }
        .padding(.horizontal, AppSpacing.md)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: AppRadius.md, style: .continuous)
                .fill(AppColors.cardSurface)
                .overlay(
                    RoundedRectangle(cornerRadius: AppRadius.md, style: .continuous)
                        .stroke(AppColors.border, lineWidth: 1)
                )
        )
    }
}
