import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    
    var body: some View {
        NavigationStack {
            List {
                Section("User Information") {
                    HStack {
                        Image(systemName: "person.crop.circle.fill")
                            .font(.system(size: 50))
                            .foregroundColor(.blue)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(authViewModel.currentUser?.name ?? "Employee User")
                                .font(.headline)
                            Text(authViewModel.currentUser?.email ?? "user@enterprise.com")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                            Text("Role: \(authViewModel.currentUser?.role.uppercased() ?? "MEMBER")")
                                .font(.caption)
                                .foregroundColor(.blue)
                        }
                    }
                    .padding(.vertical, 4)
                }
                
                Section("Security & Storage") {
                    HStack {
                        Label("Token Storage", systemImage: "key.fill")
                        Spacer()
                        Text("iOS Keychain Encrypted")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                    HStack {
                        Label("Backend API", systemImage: "server.rack")
                        Spacer()
                        Text("Node.js Express TypeScript")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Section {
                    Button(action: {
                        authViewModel.logout()
                    }) {
                        HStack {
                            Spacer()
                            Text("Sign Out")
                                .fontWeight(.semibold)
                                .foregroundColor(.red)
                            Spacer()
                        }
                    }
                }
            }
            .navigationTitle("Profile & Settings")
        }
    }
}
