import SwiftUI

struct DirectChatView: View {
    @StateObject private var viewModel = ChatViewModel()
    
    var body: some View {
        NavigationStack {
            VStack {
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(viewModel.messages) { msg in
                                HStack {
                                    if msg.isCurrentUser == true { Spacer() }
                                    
                                    VStack(alignment: msg.isCurrentUser == true ? .trailing : .leading, spacing: 4) {
                                        Text(msg.senderName)
                                            .font(.caption2)
                                            .foregroundColor(.gray)
                                        
                                        Text(msg.text)
                                            .padding(12)
                                            .background(msg.isCurrentUser == true ? Color.blue : Color.gray.opacity(0.2))
                                            .foregroundColor(msg.isCurrentUser == true ? .white : .primary)
                                            .cornerRadius(16)
                                        
                                        Text(msg.timestamp)
                                            .font(.caption2)
                                            .foregroundColor(.secondary)
                                    }
                                    
                                    if msg.isCurrentUser == false { Spacer() }
                                }
                                .padding(.horizontal)
                                .id(msg.id)
                            }
                        }
                    }
                    .onChange(of: viewModel.messages.count) { _ in
                        if let lastId = viewModel.messages.last?.id {
                            proxy.scrollTo(lastId, anchor: .bottom)
                        }
                    }
                }
                
                HStack(spacing: 8) {
                    TextField("Type a message...", text: $viewModel.newMessageText)
                        .textFieldStyle(.roundedBorder)
                    
                    Button(action: {
                        viewModel.sendMessage()
                    }) {
                        Image(systemName: "paperplane.fill")
                            .foregroundColor(.white)
                            .padding(10)
                            .background(Color.blue)
                            .clipShape(Circle())
                    }
                }
                .padding()
            }
            .navigationTitle("Team Chat")
            .task {
                await viewModel.fetchChatHistory()
            }
        }
    }
}
