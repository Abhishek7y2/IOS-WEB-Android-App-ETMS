import SwiftUI

/// Appearance & Theme selection screen.
public struct AppearanceSettingsView: View {
    @ObservedObject var viewModel: ProfileViewModel
    
    public var body: some View {
        Form {
            Section("Color Scheme") {
                Button(action: { viewModel.setAppearance("system") }) {
                    HStack {
                        Text("System Default")
                            .foregroundColor(AppColors.textPrimary)
                        Spacer()
                        if viewModel.appearanceMode == "system" {
                            Image(systemName: "checkmark")
                                .foregroundColor(AppColors.primary)
                        }
                    }
                }
                
                Button(action: { viewModel.setAppearance("light") }) {
                    HStack {
                        Text("Light Mode")
                            .foregroundColor(AppColors.textPrimary)
                        Spacer()
                        if viewModel.appearanceMode == "light" {
                            Image(systemName: "checkmark")
                                .foregroundColor(AppColors.primary)
                        }
                    }
                }
                
                Button(action: { viewModel.setAppearance("dark") }) {
                    HStack {
                        Text("Dark Mode")
                            .foregroundColor(AppColors.textPrimary)
                        Spacer()
                        if viewModel.appearanceMode == "dark" {
                            Image(systemName: "checkmark")
                                .foregroundColor(AppColors.primary)
                        }
                    }
                }
            }
        }
        .navigationTitle("Appearance")
        .navigationBarTitleDisplayMode(.inline)
    }
}
