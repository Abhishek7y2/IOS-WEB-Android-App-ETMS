import SwiftUI

/// Active Chat Message Thread with bubbles, timestamps, and composer matching native iOS messaging.
public struct ConversationThreadView: View {
    let conversation: Conversation
    @ObservedObject var viewModel: CommunicationViewModel
    @FocusState private var isInputFocused: Bool
    
    public var body: some View {
        VStack(spacing: 0) {
            // Message Bubbles ScrollView
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: AppSpacing.sm) {
                        ForEach(viewModel.activeConversationMessages) { msg in
                            MessageBubbleRow(message: msg)
                                .id(msg.id)
                        }
                    }
                    .padding(AppSpacing.md)
                }
                .onChange(of: viewModel.activeConversationMessages.count) {
                    if let last = viewModel.activeConversationMessages.last {
                        withAnimation {
                            proxy.scrollTo(last.id, anchor: .bottom)
                        }
                    }
                }
            }
            
            // Bottom Message Composer
            HStack(spacing: AppSpacing.sm) {
                Button(action: {}) {
                    Image(systemName: AppIcons.paperclip)
                        .font(.system(size: 20))
                        .foregroundColor(AppColors.textSecondary)
                }
                
                TextField("Write a message...", text: $viewModel.messageInputText)
                    .font(AppTypography.body)
                    .focused($isInputFocused)
                    .padding(.horizontal, AppSpacing.md)
                    .padding(.vertical, 10)
                    .background(
                        RoundedRectangle(cornerRadius: AppRadius.pill, style: .continuous)
                            .fill(AppColors.cardSurface)
                            .overlay(
                                RoundedRectangle(cornerRadius: AppRadius.pill, style: .continuous)
                                    .stroke(AppColors.border, lineWidth: 1)
                            )
                    )
                
                Button(action: {
                    Task {
                        await viewModel.sendMessage(conversationId: conversation.id)
                    }
                }) {
                    ZStack {
                        Circle()
                            .fill(viewModel.messageInputText.isEmpty ? AppColors.border : AppColors.primary)
                            .frame(width: 40, height: 40)
                        
                        Image(systemName: AppIcons.paperplane)
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
                .disabled(viewModel.messageInputText.isEmpty)
            }
            .padding(.horizontal, AppSpacing.md)
            .padding(.vertical, AppSpacing.sm)
            .background(AppColors.cardSurface)
            .overlay(
                Rectangle()
                    .fill(AppColors.border)
                    .frame(height: 1),
                alignment: .top
            )
        }
        .appScreenBackground()
        .navigationTitle(conversation.displayTitle)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.fetchMessages(conversationId: conversation.id)
        }
    }
}

private struct MessageBubbleRow: View {
    let message: MessageItem
    private var isMe: Bool {
        message.senderId == (KeychainService.shared.getUserId() ?? "me")
    }
    
    var body: some View {
        HStack {
            if isMe { Spacer(minLength: 48) }
            
            VStack(alignment: isMe ? .trailing : .leading, spacing: 3) {
                if !isMe {
                    Text(message.senderName)
                        .font(AppTypography.captionBold)
                        .foregroundColor(AppColors.primary)
                }
                
                Text(message.content)
                    .font(AppTypography.body)
                    .foregroundColor(isMe ? .white : AppColors.textPrimary)
                    .padding(.horizontal, AppSpacing.md)
                    .padding(.vertical, 10)
                    .background(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .fill(isMe ? AppColors.primary : AppColors.cardSurface)
                            .overlay(
                                RoundedRectangle(cornerRadius: 18, style: .continuous)
                                    .stroke(isMe ? Color.clear : AppColors.border, lineWidth: 1)
                            )
                    )
                
                Text(DateFormatter.localizedString(from: message.timestamp, dateStyle: .none, timeStyle: .short))
                    .font(AppTypography.caption)
                    .foregroundColor(AppColors.textTertiary)
                    .padding(.horizontal, 4)
            }
            
            if !isMe { Spacer(minLength: 48) }
        }
    }
}
