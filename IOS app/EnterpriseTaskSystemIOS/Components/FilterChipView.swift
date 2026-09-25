import SwiftUI

/// Horizontal pill chip filter selector (as seen in Mockup #3: All, Todo, In Progress, Done).
public struct FilterChipView<T: Hashable>: View {
    let items: [T]
    @Binding var selectedItem: T
    let titleProvider: (T) -> String
    
    public init(
        items: [T],
        selectedItem: Binding<T>,
        titleProvider: @escaping (T) -> String
    ) {
        self.items = items
        self._selectedItem = selectedItem
        self.titleProvider = titleProvider
    }
    
    public var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: AppSpacing.xs) {
                ForEach(items, id: \.self) { item in
                    let isSelected = selectedItem == item
                    Button(action: {
                        let impact = UIImpactFeedbackGenerator(style: .light)
                        impact.impactOccurred()
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedItem = item
                        }
                    }) {
                        Text(titleProvider(item))
                            .font(AppTypography.footnote)
                            .fontWeight(isSelected ? .semibold : .medium)
                            .foregroundColor(isSelected ? .white : AppColors.textSecondary)
                            .padding(.horizontal, AppSpacing.md)
                            .padding(.vertical, 8)
                            .background(
                                Capsule()
                                    .fill(isSelected ? AppColors.primary : AppColors.cardSurface)
                                    .overlay(
                                        Capsule()
                                            .stroke(isSelected ? Color.clear : AppColors.border, lineWidth: 1)
                                    )
                            )
                    }
                }
            }
            .padding(.horizontal, AppSpacing.md)
        }
    }
}
