import Foundation
import Network
import Combine

/// Realtime network path monitoring using NWPathMonitor
public final class NetworkMonitor: ObservableObject {
    public static let shared = NetworkMonitor()
    
    @Published public private(set) var isConnected: Bool = true
    @Published public private(set) var isCellular: Bool = false
    
    private let monitor: NWPathMonitor
    private let queue = DispatchQueue(label: "com.workmate.networkmonitor")
    
    private init() {
        self.monitor = NWPathMonitor()
        self.monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isConnected = path.status == .satisfied
                self?.isCellular = path.isExpensive
            }
        }
        self.monitor.start(queue: queue)
    }
    
    deinit {
        monitor.cancel()
    }
}
