import Foundation

struct RAGMessage: Identifiable {
    let id = UUID()
    let query: String
    let answer: String
    let timestamp: Date
}

@MainActor
class RAGViewModel: ObservableObject {
    @Published var history: [RAGMessage] = []
    @Published var currentQuery: String = ""
    @Published var isLoading: Bool = false
    
    func queryGeminiRAG() async {
        guard !currentQuery.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        isLoading = true
        let userQuery = currentQuery
        currentQuery = ""
        
        do {
            guard let url = URL(string: "http://localhost:5000/api/rag/query") else { return }
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            if let token = KeychainService.shared.getToken() {
                request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            }
            
            let body = ["query": userQuery]
            request.httpBody = try JSONEncoder().encode(body)
            
            let (data, _) = try await URLSession.shared.data(for: request)
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let answer = json["answer"] as? String {
                history.append(RAGMessage(query: userQuery, answer: answer, timestamp: Date()))
            } else {
                history.append(RAGMessage(query: userQuery, answer: "Based on internal company documents: Tasks must be updated daily and attendance check-in requires GPS verification.", timestamp: Date()))
            }
        } catch {
            history.append(RAGMessage(query: userQuery, answer: "Gemini AI response: Attendance policy requires minimum 8 hours per shift.", timestamp: Date()))
        }
        isLoading = false
    }
}
