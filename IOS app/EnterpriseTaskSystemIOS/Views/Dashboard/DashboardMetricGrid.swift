import SwiftUI

/// 2x2 Metric Cards Grid matching Mockup #2.
public struct DashboardMetricGrid: View {
    let totalTasks: Int
    let pendingTasks: Int
    let inProgressTasks: Int
    let completedTasks: Int
    
    @EnvironmentObject private var appRouter: AppRouter
    
    public var body: some View {
        LazyVGrid(columns: [GridItem(.flexible(), spacing: AppSpacing.md), GridItem(.flexible(), spacing: AppSpacing.md)], spacing: AppSpacing.md) {
            Button(action: {
                triggerHapticFeedback()
                appRouter.requestedTaskFilter = "All"
                appRouter.selectedTab = .tasks
            }) {
                MetricCard(
                    title: "Total Tasks",
                    value: "\(totalTasks)",
                    percentageChange: "12.4%",
                    isPositive: true,
                    themeColor: .blue
                )
            }
            .buttonStyle(DashboardCardButtonStyle())
            
            Button(action: {
                triggerHapticFeedback()
                appRouter.requestedTaskFilter = "Pending"
                appRouter.selectedTab = .tasks
            }) {
                MetricCard(
                    title: "Pending",
                    value: "\(pendingTasks)",
                    percentageChange: "7.2%",
                    isPositive: false,
                    themeColor: .green
                )
            }
            .buttonStyle(DashboardCardButtonStyle())
            
            Button(action: {
                triggerHapticFeedback()
                appRouter.requestedTaskFilter = "In Progress"
                appRouter.selectedTab = .tasks
            }) {
                MetricCard(
                    title: "In Progress",
                    value: "\(inProgressTasks)",
                    percentageChange: "12.4%",
                    isPositive: true,
                    themeColor: .orange
                )
            }
            .buttonStyle(DashboardCardButtonStyle())
            
            Button(action: {
                triggerHapticFeedback()
                appRouter.requestedTaskFilter = "Done"
                appRouter.selectedTab = .tasks
            }) {
                MetricCard(
                    title: "Completed",
                    value: "\(completedTasks)",
                    percentageChange: "5.4%",
                    isPositive: true,
                    themeColor: .red
                )
            }
            .buttonStyle(DashboardCardButtonStyle())
        }
    }
    
    private func triggerHapticFeedback() {
        let generator = UIImpactFeedbackGenerator(style: .light)
        generator.prepare()
        generator.impactOccurred()
    }
}

fileprivate struct DashboardCardButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}
