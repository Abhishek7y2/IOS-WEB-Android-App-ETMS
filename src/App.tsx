// ─────────────────────────────────────────────
// App.tsx
//
// This is the ROOT of the app — it controls:
//   1. Which page is shown (Dashboard or Tasks)
//   2. Whether the mobile sidebar is open or closed
//
// Think of it as the "manager" that connects
// Header, Sidebar, and the current page together.
// ─────────────────────────────────────────────

import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';

function App() {
  // currentPage: tracks which page to show ('dashboard' or 'tasks')
  const [currentPage, setCurrentPage] = useState('dashboard');

  // isSidebarOpen: controls sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── Page switcher ─────────────────────────
  // Returns the correct page component based on currentPage
  function renderPage() {
    if (currentPage === 'tasks') return <TaskList />;
    return <Dashboard />; // default: show dashboard
  }

  return (
    // Full-height wrapper
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">

      {/* Header — passes onMenuClick to open the sidebar on mobile */}
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Content area: sidebar + main page side by side */}
      <div className="flex flex-1 relative">

        {/* Sidebar — receives state and handlers from here */}
        <Sidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main content area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {renderPage()}
          </div>
        </main>

      </div>
    </div>
  );
}

export default App;