import SwiftUI

/// Messages Inbox Screen matching Reference Mockup #6.
public struct MessagesInboxView: View {
    @StateObject private var viewModel = CommunicationViewModel()
    @EnvironmentObject private var appRouter: AppRouter
    @State private var selectedConversation: Conversation?
    
    var initialCategory: MessageCategory?
    
    public init(initialCategory: MessageCategory? = nil) {
        self.initialCategory = initialCategory
    }
    
    public var body: some View {
        ZStack(alignment: .bottomTrailing) {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: AppSpacing.md) {
                        // Header Bar
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Messages")
                                    .font(AppTypography.title)
                                    .foregroundColor(AppColors.textPrimary)
                                
                                Text("Stay connected with your team")
                                    .font(AppTypography.subheadline)
                                    .foregroundColor(AppColors.textSecondary)
                            }
                            
                            Spacer()
                            
                            Button(action: {
                                appRouter.showNotificationsSheet = true
                            }) {
                                ZStack {
                                    Circle()
                                        .fill(AppColors.cardSurface)
                                        .frame(width: 40, height: 40)
                                        .overlay(Circle().stroke(AppColors.border, lineWidth: 1))
                                    
                                    Image(systemName: AppIcons.notificationBell)
                                        .font(.system(size: 16, weight: .medium))
                                        .foregroundColor(AppColors.textPrimary)
                                }
                            }
                        }
                        .padding(.horizontal, AppSpacing.md)
                        .padding(.top, AppSpacing.xs)
                        
                        // Category Segmented Control
                        Picker("Category", selection: $viewModel.selectedCategory) {
                            ForEach(MessageCategory.allCases, id: \.self) { category in
                                Text(category.rawValue).tag(category)
                            }
                        }
                        .pickerStyle(.segmented)
                        .padding(.horizontal, AppSpacing.md)
                        
                        // Search Bar
                        SearchBar(text: $viewModel.searchText, placeholder: "Search conversations...")
                            .padding(.horizontal, AppSpacing.md)
                        
                        // Conversation List
                        if viewModel.isLoading && viewModel.conversations.isEmpty {
                            LoadingView(message: "Loading messages...")
                                .padding(.top, 40)
                        } else if viewModel.filteredConversations.isEmpty {
                            EmptyStateView(
                                icon: "bubble.left.and.bubble.right",
                                title: "No Conversations",
                                message: "Start a conversation with your team members.",
                                actionTitle: "New Message"
                            ) {
                                viewModel.showComposeSheet = true
                            }
                            .padding(.top, 40)
                        } else {
                            LazyVStack(spacing: AppSpacing.sm) {
                                ForEach(viewModel.filteredConversations) { conv in
                                    Button(action: {
                                        self.selectedConversation = conv
                                    }) {
                                        ConversationRowItem(conversation: conv)
                                    }
                                }
                            }
                            .padding(.horizontal, AppSpacing.md)
                        }
                        
                        Spacer(minLength: 80)
                    }
                }
                
                // Floating Action Button (FAB)
                Button(action: {
                    let impact = UIImpactFeedbackGenerator(style: .medium)
                    impact.impactOccurred()
                    viewModel.showComposeSheet = true
                }) {
                    ZStack {
                        Circle()
                            .fill(AppColors.primary)
                            .frame(width: 58, height: 58)
                            .appGlowShadow(color: AppColors.primary)
                        
                        Image(systemName: "square.and.pencil")
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
                .padding(.trailing, AppSpacing.lg)
                .padding(.bottom, AppSpacing.xl)
            }
            .appScreenBackground()
            .refreshable {
                await viewModel.fetchConversations()
            }
            .task {
                if let cat = initialCategory {
                    viewModel.selectedCategory = cat
                }
                await viewModel.fetchConversations()
            }
            .sheet(item: $selectedConversation) { conv in
                NavigationStack {
                    ConversationThreadView(conversation: conv, viewModel: viewModel)
                }
            }
            .sheet(isPresented: $viewModel.showComposeSheet) {
                ComposeMessageSheet(viewModel: viewModel) { conversation in
                    viewModel.showComposeSheet = false
                    
                    // Delay to allow the sheet to dismiss before presenting the new one
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        selectedConversation = conversation
                    }
                }
            }
    }
}

private struct ConversationRowItem: View {
    let conversation: Conversation
    
    var body: some View {
        AppCard(padding: AppSpacing.md) {
            HStack(spacing: AppSpacing.md) {
                // Avatar
                ZStack {
                    Circle()
                        .fill(avatarColor.opacity(0.15))
                        .frame(width: 48, height: 48)
                    
                    Text(initials)
                        .font(AppTypography.headline)
                        .foregroundColor(avatarColor)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(conversation.displayTitle)
                            .font(AppTypography.headline)
                            .foregroundColor(AppColors.textPrimary)
                            .lineLimit(1)
                        
                        Spacer()
                        
                        Text(formattedTime)
                            .font(AppTypography.caption)
                            .foregroundColor(AppColors.textTertiary)
                    }
                    
                    HStack {
                        Text(conversation.lastMessage ?? "No messages yet")
                            .font(AppTypography.subheadline)
                            .foregroundColor(conversation.unreadCount ?? 0 > 0 ? AppColors.textPrimary : AppColors.textSecondary)
                            .fontWeight(conversation.unreadCount ?? 0 > 0 ? .semibold : .regular)
                            .lineLimit(1)
                        
                        Spacer()
                        
                        if let unread = conversation.unreadCount, unread > 0 {
                            ZStack {
                                Circle()
                                    .fill(AppColors.primary)
                                    .frame(width: 20, height: 20)
                                Text("\(unread)")
                                    .font(AppTypography.captionBold)
                                    .foregroundColor(.white)
                            }
                        }
                    }
                }
            }
        }
    }
    
    private var initials: String {
        let name = conversation.displayTitle
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return "\(parts[0].prefix(1))\(parts[1].prefix(1))".uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }
    
    private var avatarColor: Color {
        if conversation.type == .group { return AppColors.accentPurple }
        if conversation.type == .announcement { return AppColors.accentOrange }
        return AppColors.primary
    }
    
    private var formattedTime: String {
        guard let time = conversation.lastMessageTime else { return "" }
        let calendar = Calendar.current
        if calendar.isDateInToday(time) {
            let formatter = DateFormatter()
            formatter.dateFormat = "h:mm a"
            return formatter.string(from: time)
        }
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMM"
        return formatter.string(from: time)
    }
}
