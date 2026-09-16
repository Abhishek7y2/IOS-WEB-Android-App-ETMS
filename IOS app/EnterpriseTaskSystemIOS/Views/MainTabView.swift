import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    
    var body: some View {
        TabView {
            TaskListView()
                .tabItem {
                    Label("Tasks", systemImage: "list.bullet.clipboard")
                }
            
            AttendanceClockView()
                .tabItem {
                    Label("Attendance", systemImage: "clock.fill")
                }
            
            DirectChatView()
                .tabItem {
                    Label("Chat", systemImage: "bubble.left.and.bubble.right.fill")
                }
            
            RAGChatbotView()
                .tabItem {
                    Label("AI Bot", systemImage: "sparkles")
                }
            
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.crop.circle.fill")
                }
        }
    }
}
