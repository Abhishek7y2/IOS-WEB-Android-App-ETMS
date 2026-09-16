import SwiftUI

struct RAGChatbotView: View {
    @StateObject private var viewModel = RAGViewModel()
    
    var body: some View {
        NavigationStack {
            VStack {
                if viewModel.history.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 60))
                            .foregroundColor(.purple)
                        
                        Text("Gemini AI Document Bot")
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        Text("Ask anything based on uploaded company PDFs & HR policy documents.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                    .padding()
                    Spacer()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(viewModel.history) { item in
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack {
                                        Text("Q: \(item.query)")
                                            .font(.headline)
                                            .foregroundColor(.purple)
                                        Spacer()
                                    }
                                    Text(item.answer)
                                        .font(.body)
                                        .padding(12)
                                        .background(Color.purple.opacity(0.1))
                                        .cornerRadius(10)
                                }
                                .padding(.horizontal)
                            }
                        }
                    }
                }
                
                HStack(spacing: 8) {
                    TextField("Ask Gemini AI document assistant...", text: $viewModel.currentQuery)
                        .textFieldStyle(.roundedBorder)
                    
                    Button(action: {
                        Task {
                            await viewModel.queryGeminiRAG()
                        }
                    }) {
                        if viewModel.isLoading {
                            ProgressView()
                        } else {
                            Image(systemName: "arrow.up.circle.fill")
                                .font(.title2)
                                .foregroundColor(.purple)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Gemini RAG Assistant")
        }
    }
}
